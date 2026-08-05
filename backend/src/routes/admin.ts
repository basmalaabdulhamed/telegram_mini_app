import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

export const adminRouter = Router();

// Simple password auth middleware
function requireAdmin(req: Request, res: Response, next: Function) {
  const password = req.headers['x-admin-password'] as string;
  const adminPassword = process.env.ADMIN_PASSWORD || 'changeme123';
  if (password !== adminPassword) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// ── Menu Management ──────────────────────────────────────────────

const MenuItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  imageUrl: z.string().url().optional(),
  category: z.string().min(1),
  available: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

/** GET /api/admin/menu — all items (including unavailable) */
adminRouter.get('/menu', requireAdmin, async (_req, res) => {
  try {
    const items = await prisma.menuItem.findMany({
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
    });
    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
});

/** POST /api/admin/menu — create item */
adminRouter.post('/menu', requireAdmin, async (req, res) => {
  const parsed = MenuItemSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  try {
    const item = await prisma.menuItem.create({ data: parsed.data });
    res.status(201).json({ item });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create item' });
  }
});

/** PUT /api/admin/menu/:id — update item */
adminRouter.put('/menu/:id', requireAdmin, async (req, res) => {
  const parsed = MenuItemSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  try {
    const item = await prisma.menuItem.update({
      where: { id: req.params.id },
      data: parsed.data,
    });
    res.json({ item });
  } catch (err: any) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Item not found' });
    res.status(500).json({ error: 'Failed to update item' });
  }
});

/** DELETE /api/admin/menu/:id — delete item */
adminRouter.delete('/menu/:id', requireAdmin, async (req, res) => {
  try {
    await prisma.menuItem.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err: any) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Item not found' });
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

// ── Analytics ──────────────────────────────────────────────────

/** GET /api/admin/analytics — today's summary */
adminRouter.get('/analytics', requireAdmin, async (_req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [todayOrders, totalRevenue, topItems] = await Promise.all([
      prisma.order.findMany({
        where: {
          createdAt: { gte: todayStart },
          status: { notIn: ['cancelled'] },
        },
        include: { items: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.aggregate({
        where: { status: { notIn: ['cancelled', 'pending'] } },
        _sum: { total: true },
      }),
      prisma.orderItem.groupBy({
        by: ['menuItemId', 'name'],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),
    ]);

    const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0);

    res.json({
      todayOrders: todayOrders.length,
      todayRevenue,
      allTimeRevenue: totalRevenue._sum.total ?? 0,
      topItems: topItems.map((i) => ({ name: i.name, sold: i._sum.quantity ?? 0 })),
      recentOrders: todayOrders.slice(0, 10),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});
