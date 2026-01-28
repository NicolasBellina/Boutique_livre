import { describe, it, expect, beforeEach, vi } from 'vitest';
import { eventService } from '../../src/services/eventService.js';

vi.mock('@prisma/client', () => {
  const mockPrisma = {
    event: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
  };
  return { PrismaClient: vi.fn(() => mockPrisma) };
});

const prisma = new (await import('@prisma/client')).PrismaClient();

describe('eventService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createEvent', () => {
    it('devrait créer un événement avec données valides', async () => {
      const eventData = {
        name: 'Rencontre avec l\'auteur',
        date: '2026-02-15T18:00:00Z',
        location: 'Librairie du Centre',
        description: 'Une rencontre spéciale',
        capacity: 50,
      };

      const expectedEvent = { id: 1, ...eventData, status: 'planned' };
      prisma.event.create.mockResolvedValue(expectedEvent);

      const result = await eventService.createEvent(eventData);

      expect(result).toEqual(expectedEvent);
      expect(result.status).toBe('planned');
    });

    it('devrait rejeter avec nom manquant', async () => {
      const eventData = {
        date: '2026-02-15T18:00:00Z',
        location: 'Librairie',
      };

      await expect(eventService.createEvent(eventData))
        .rejects.toThrow('Event name is required');
    });

    it('devrait rejeter avec date manquante', async () => {
      const eventData = {
        name: 'Événement',
        location: 'Librairie',
      };

      await expect(eventService.createEvent(eventData))
        .rejects.toThrow('Event date is required');
    });

    it('devrait rejeter avec capacité négative', async () => {
      const eventData = {
        name: 'Événement',
        date: '2026-02-15T18:00:00Z',
        capacity: -10,
      };

      await expect(eventService.createEvent(eventData))
        .rejects.toThrow('Capacity must be positive');
    });
  });

  describe('getEvent', () => {
    it('devrait retourner un événement existant', async () => {
      const event = {
        id: 1,
        name: 'Rencontre',
        date: '2026-02-15T18:00:00Z',
        status: 'planned',
      };

      prisma.event.findUnique.mockResolvedValue(event);

      const result = await eventService.getEvent(1);

      expect(result).toEqual(event);
      expect(prisma.event.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('devrait lever une erreur si événement non trouvé', async () => {
      prisma.event.findUnique.mockResolvedValue(null);

      await expect(eventService.getEvent(999))
        .rejects.toThrow('Event not found');
    });
  });

  describe('listEvents', () => {
    it('devrait lister les événements', async () => {
      const events = [
        { id: 1, name: 'Event 1', status: 'planned' },
        { id: 2, name: 'Event 2', status: 'closed' },
      ];

      prisma.event.findMany.mockResolvedValue(events);
      prisma.event.count.mockResolvedValue(2);

      const result = await eventService.listEvents({});

      expect(result.data.length).toBe(2);
      expect(result.pagination.total).toBe(2);
    });

    it('devrait filtrer par statut', async () => {
      const events = [
        { id: 1, name: 'Event 1', status: 'planned' },
      ];

      prisma.event.findMany.mockResolvedValue(events);
      prisma.event.count.mockResolvedValue(1);

      const result = await eventService.listEvents({ status: 'planned' });

      expect(result.data[0].status).toBe('planned');
    });

    it('devrait paginer les résultats', async () => {
      const events = [{ id: 1 }, { id: 2 }];

      prisma.event.findMany.mockResolvedValue(events);
      prisma.event.count.mockResolvedValue(50);

      const result = await eventService.listEvents({ page: 2, limit: 20 });

      expect(result.pagination.page).toBe(2);
      expect(result.pagination.pages).toBe(3);
    });
  });

  describe('updateEvent', () => {
    it('devrait mettre à jour un événement', async () => {
      const updatedEvent = {
        id: 1,
        name: 'Event Updated',
        date: '2026-02-15T19:00:00Z',
      };

      prisma.event.update.mockResolvedValue(updatedEvent);

      const result = await eventService.updateEvent(1, {
        name: 'Event Updated',
      });

      expect(result.name).toBe('Event Updated');
      expect(prisma.event.update).toHaveBeenCalled();
    });

    it('devrait rejeter avec capacité négative', async () => {
      await expect(eventService.updateEvent(1, { capacity: -5 }))
        .rejects.toThrow('Capacity must be positive');
    });
  });

  describe('closeEvent', () => {
    it('devrait clôturer un événement', async () => {
      const closedEvent = {
        id: 1,
        status: 'closed',
      };

      prisma.event.update.mockResolvedValue(closedEvent);

      const result = await eventService.closeEvent(1);

      expect(result.status).toBe('closed');
      expect(prisma.event.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'closed' },
      });
    });
  });

  describe('deleteEvent', () => {
    it('devrait supprimer un événement', async () => {
      const deletedEvent = { id: 1, name: 'Event' };

      prisma.event.delete.mockResolvedValue(deletedEvent);

      const result = await eventService.deleteEvent(1);

      expect(result.id).toBe(1);
      expect(prisma.event.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });
});
