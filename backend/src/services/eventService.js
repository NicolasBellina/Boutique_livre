import { PrismaClient } from '@prisma/client';
import { validateEvent } from '../utils/validators.js';

const prisma = new PrismaClient();

export const eventService = {
  /**
   * Lister les événements avec filtres
   */
  async listEvents(filters = {}) {
    const { status, page = 1, limit = 20 } = filters;

    const where = {};

    if (status === 'upcoming') {
      where.date = { gte: new Date() };
      where.status = { notIn: ['cancelled'] };
    } else if (status === 'past') {
      where.date = { lt: new Date() };
    } else if (status) {
      where.status = status;
    }

    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'asc' },
      }),
      prisma.event.count({ where }),
    ]);

    return {
      data: events,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Récupérer détails d'un événement
   */
  async getEvent(id) {
    const event = await prisma.event.findUnique({
      where: { id: parseInt(id) },
    });

    if (!event) {
      const err = new Error('Event not found');
      err.name = 'NotFoundError';
      err.statusCode = 404;
      throw err;
    }

    return event;
  },

  /**
   * Créer un nouvel événement
   */
  async createEvent(eventData) {
    validateEvent(eventData);

    const event = await prisma.event.create({
      data: {
        name: eventData.name,
        date: new Date(eventData.date),
        location: eventData.location || null,
        description: eventData.description || null,
        capacity: eventData.capacity || null,
        status: 'planned',
      },
    });

    return event;
  },

  /**
   * Modifier un événement
   */
  async updateEvent(id, eventData) {
    const event = await prisma.event.findUnique({
      where: { id: parseInt(id) },
    });

    if (!event) {
      const err = new Error('Event not found');
      err.name = 'NotFoundError';
      err.statusCode = 404;
      throw err;
    }

    // Valider les données fournies
    if (eventData.name || eventData.date || eventData.description) {
      const fullData = {
        name: eventData.name || event.name,
        date: eventData.date || event.date.toISOString(),
        description: eventData.description !== undefined ? eventData.description : event.description,
      };
      validateEvent(fullData);
    }

    const updated = await prisma.event.update({
      where: { id: parseInt(id) },
      data: {
        ...(eventData.name && { name: eventData.name }),
        ...(eventData.date && { date: new Date(eventData.date) }),
        ...(eventData.location !== undefined && { location: eventData.location }),
        ...(eventData.description !== undefined && { description: eventData.description }),
        ...(eventData.capacity !== undefined && { capacity: eventData.capacity }),
      },
    });

    return updated;
  },

  /**
   * Clôturer ou annuler un événement
   */
  async closeEvent(id, status = 'closed') {
    const validStatuses = ['closed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      const err = new Error('Invalid status');
      err.name = 'ValidationError';
      throw err;
    }

    const event = await prisma.event.findUnique({
      where: { id: parseInt(id) },
    });

    if (!event) {
      const err = new Error('Event not found');
      err.name = 'NotFoundError';
      err.statusCode = 404;
      throw err;
    }

    const updated = await prisma.event.update({
      where: { id: parseInt(id) },
      data: { status },
    });

    return updated;
  },

  /**
   * Supprimer un événement
   */
  async deleteEvent(id) {
    const event = await prisma.event.findUnique({
      where: { id: parseInt(id) },
    });

    if (!event) {
      const err = new Error('Event not found');
      err.name = 'NotFoundError';
      err.statusCode = 404;
      throw err;
    }

    await prisma.event.delete({
      where: { id: parseInt(id) },
    });

    return { success: true };
  },
};
