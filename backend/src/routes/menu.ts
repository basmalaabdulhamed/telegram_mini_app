import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const menuRouter = Router();

/**
 * GET /api/menu
 * Returns all available menu items grouped by category.
 */
menuRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const items = await prisma.menuItem.findMany({
      where: { available: true },
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
    });

    // Group by category
    const grouped = items.reduce<Record<string, typeof items>>((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});

    // Convert to ordered array of { category, items }
    const categories = Object.entries(grouped).map(([category, items]) => ({
      category,
      items,
    }));

    res.json({ categories });
  } catch (err) {
    console.error('GET /api/menu error:', err);
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
});
