import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { telegramAuthMiddleware } from '../lib/telegramAuth';

export const orderRouter = Router();

// Validation schema for order creation
const CreateOrderSchema = z.object({
  telegramUserId: z.string().optional(),
  telegramUsername: z.string().optional(),
  firstName: z.string().optional(),
  items: z.array(
    z.object({
      menuItemId: z.string(),
      quantity: z.number().int().positive(),
    })
  ).min(1, 'Order must have at least one item'),
  notes: z.string().optional(),
  paymentMethod: z.enum(['card', 'cash']).default('cash'),
});

/**
 * POST /api/order
 * Creates a new pending order.
 * Uses verified Telegram user identity from initData when available.
 */
orderRouter.post('/', telegramAuthMiddleware, async (req: Request, res: Response) => {
  const parsed = CreateOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  // Prefer cryptographically verified user from initData, fallback to body
  const tgUser = (req as any).tgUser;
  const telegramUserId = tgUser?.id ?? parsed.data.telegramUserId ?? 'anonymous';
  const telegramUsername = tgUser?.username ?? parsed.data.telegramUsername;
  const firstName = tgUser?.firstName ?? parsed.data.firstName;

  const { items, notes, paymentMethod } = parsed.data;

  try {
    // Fetch menu items to get current prices
    const menuItemIds = items.map((i) => i.menuItemId);
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: menuItemIds }, available: true },
    });

    if (menuItems.length !== menuItemIds.length) {
      return res.status(400).json({ error: 'One or more items are unavailable' });
    }

    // Build order items with price snapshots
    const orderItems = items.map((item) => {
      const menuItem = menuItems.find((m) => m.id === item.menuItemId)!;
      return {
        menuItemId: item.menuItemId,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
      };
    });

    const total = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const order = await prisma.order.create({
      data: {
        telegramUserId,
        telegramUsername,
        firstName,
        total,
        notes,
        paymentMethod: paymentMethod as any,
        items: {
          create: orderItems,
        },
      },
      include: { items: true },
    });

    return res.status(201).json({ order });
  } catch (err) {
    console.error('POST /api/order error:', err);
    return res.status(500).json({ error: 'Failed to create order' });
  }
});

/**
 * GET /api/order/:id
 * Returns a single order by ID.
 */
orderRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { items: true },
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    return res.json({ order });
  } catch (err) {
    console.error('GET /api/order/:id error:', err);
    return res.status(500).json({ error: 'Failed to fetch order' });
  }
});

/**
 * GET /api/order/user/:telegramUserId
 * Returns all orders for a specific Telegram user.
 */
orderRouter.get('/user/:telegramUserId', async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      where: { telegramUserId: req.params.telegramUserId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ orders });
  } catch (err) {
    console.error('GET /api/order/user/:id error:', err);
    return res.status(500).json({ error: 'Failed to fetch orders' });
  }
});
