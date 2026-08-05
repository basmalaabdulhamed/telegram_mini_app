import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

export const staffRouter = Router();

// Simple PIN auth middleware
function requireStaffPin(req: Request, res: Response, next: Function) {
  const pin = req.headers['x-staff-pin'] as string;
  const staffPin = process.env.STAFF_PIN || '1234';
  if (pin !== staffPin) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

/**
 * GET /api/staff/orders
 * Returns all active orders grouped by status (for the queue).
 */
staffRouter.get('/orders', requireStaffPin, async (_req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        status: { in: ['pending', 'paid', 'preparing', 'ready'] },
      },
      include: { items: true },
      orderBy: { createdAt: 'asc' },
    });
    return res.json({ orders });
  } catch (err) {
    console.error('GET /api/staff/orders error:', err);
    return res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

/**
 * PATCH /api/staff/orders/:id/status
 * Advances order status.
 */
const UpdateStatusSchema = z.object({
  status: z.enum(['pending', 'paid', 'preparing', 'ready', 'completed', 'cancelled']),
});

staffRouter.patch('/orders/:id/status', requireStaffPin, async (req: Request, res: Response) => {
  const parsed = UpdateStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  try {
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status: parsed.data.status as any },
      include: { items: true },
    });

    // TODO Phase 5+: Send bot notification to user when status changes to 'ready'

    return res.json({ order });
  } catch (err: any) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Order not found' });
    }
    console.error('PATCH /api/staff/orders/:id/status error:', err);
    return res.status(500).json({ error: 'Failed to update status' });
  }
});
