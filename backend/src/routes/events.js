import express from 'express';
import { eventService } from '../services/eventService.js';

const router = express.Router();

/**
 * GET /api/events
 * Lister les événements avec filtres
 */
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status || undefined; // upcoming|past|planned|closed|cancelled

    if (page < 1) throw new Error('Page must be >= 1');

    const result = await eventService.listEvents({ status, page, limit });

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
 * GET /api/events/:id
 * Récupérer détails d'un événement
 */
router.get('/:id', async (req, res, next) => {
  try {
    const event = await eventService.getEvent(req.params.id);
    res.json({
      success: true,
      data: event,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/events
 * Créer un nouvel événement
 */
router.post('/', async (req, res, next) => {
  try {
    const event = await eventService.createEvent(req.body);
    res.status(201).json({
      success: true,
      data: event,
      message: 'Event created successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/events/:id
 * Modifier un événement
 */
router.put('/:id', async (req, res, next) => {
  try {
    const event = await eventService.updateEvent(req.params.id, req.body);
    res.json({
      success: true,
      data: event,
      message: 'Event updated successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/events/:id/close
 * Clôturer ou annuler un événement
 */
router.put('/:id/close', async (req, res, next) => {
  try {
    const { status } = req.body || { status: 'closed' };
    const event = await eventService.closeEvent(req.params.id, status);
    res.json({
      success: true,
      data: event,
      message: `Event closed with status: ${status}`,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/events/:id
 * Supprimer un événement
 */
router.delete('/:id', async (req, res, next) => {
  try {
    await eventService.deleteEvent(req.params.id);
    res.json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
