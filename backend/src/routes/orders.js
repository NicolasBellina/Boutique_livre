import express from 'express';
import { orderService } from '../services/orderService.js';

const router = express.Router();

/**
 * POST /api/orders
 * Créer une nouvelle commande
 */
router.post('/', async (req, res, next) => {
  try {
    const order = await orderService.createOrder(req.body);
    res.status(201).json({
      success: true,
      data: order,
      message: 'Order created successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/orders/:id
 * Récupérer détails d'une commande
 */
router.get('/:id', async (req, res, next) => {
  try {
    const order = await orderService.getOrder(req.params.id);
    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/orders
 * Lister les commandes (admin)
 */
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status || undefined;

    if (page < 1) throw new Error('Page must be >= 1');

    const result = await orderService.listOrders({ status, page, limit });

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/orders/:id
 * Modifier le statut d'une commande
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status) {
      const err = new Error('Status is required');
      err.name = 'ValidationError';
      throw err;
    }

    const order = await orderService.updateOrderStatus(req.params.id, status);

    res.json({
      success: true,
      data: order,
      message: `Order status updated to ${status}`,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
