import { Router } from 'express';
import { menuRouter } from './menu';
import { orderRouter } from './order';
import { staffRouter } from './staff';
import { adminRouter } from './admin';

export const router = Router();

// API info
router.get('/', (_req, res) => {
  res.json({
    message: 'Cafe Bot API',
    version: '1.0.0',
    endpoints: {
      menu: 'GET /api/menu',
      order: 'POST /api/order',
      orderById: 'GET /api/order/:id',
      ordersByUser: 'GET /api/order/user/:telegramUserId',
      staff: 'GET /api/staff/orders (x-staff-pin header required)',
      admin: 'GET /api/admin/menu (x-admin-password header required)',
      analytics: 'GET /api/admin/analytics (x-admin-password header required)',
    },
  });
});

router.use('/menu', menuRouter);
router.use('/order', orderRouter);
router.use('/staff', staffRouter);
router.use('/admin', adminRouter);
