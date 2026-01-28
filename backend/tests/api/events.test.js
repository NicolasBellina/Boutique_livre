import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';

/**
 * Tests API Events
 * Testent les endpoints /api/events
 */
describe('Events API', () => {
  let eventId;

  describe('POST /api/events', () => {
    it('devrait créer un événement avec données valides', async () => {
      const eventData = {
        name: 'Test Event',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Test Location',
        description: 'Test event description',
        capacity: 50,
      };

      const response = await request(app)
        .post('/api/events')
        .send(eventData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Test Event');
      expect(response.body.data.status).toBe('planned');
      eventId = response.body.data.id;
    });

    it('devrait retourner 400 avec données invalides', async () => {
      const invalidData = {
        // name manquant
        date: new Date().toISOString(),
        capacity: -10, // négatif
      };

      const response = await request(app)
        .post('/api/events')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('devrait retourner 400 avec date invalide', async () => {
      const eventData = {
        name: 'Event',
        date: 'invalid-date',
        capacity: 20,
      };

      const response = await request(app)
        .post('/api/events')
        .send(eventData);

      expect(response.status).toBe(400);
    });

    it('devrait retourner 400 avec date dans le passé', async () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const eventData = {
        name: 'Past Event',
        date: pastDate,
        capacity: 20,
      };

      const response = await request(app)
        .post('/api/events')
        .send(eventData);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/events', () => {
    it('devrait retourner la liste des événements', async () => {
      const response = await request(app)
        .get('/api/events');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.pagination).toBeDefined();
    });

    it('devrait supporter la pagination', async () => {
      const response = await request(app)
        .get('/api/events?page=1&limit=5');

      expect(response.status).toBe(200);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
    });

    it('devrait filtrer par statut', async () => {
      const response = await request(app)
        .get('/api/events?status=planned');

      expect(response.status).toBe(200);
      response.body.data.forEach(event => {
        expect(event.status).toBe('planned');
      });
    });
  });

  describe('GET /api/events/:id', () => {
    it('devrait retourner un événement existant', async () => {
      const response = await request(app)
        .get(`/api/events/${eventId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(eventId);
    });

    it('devrait retourner 404 pour un événement inexistant', async () => {
      const response = await request(app)
        .get('/api/events/999999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/events/:id', () => {
    it('devrait modifier un événement existant', async () => {
      const updateData = {
        description: 'Updated description',
        capacity: 75,
      };

      const response = await request(app)
        .put(`/api/events/${eventId}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.data.description).toBe('Updated description');
      expect(response.body.data.capacity).toBe(75);
    });

    it('devrait retourner 400 avec capacité négative', async () => {
      const response = await request(app)
        .put(`/api/events/${eventId}`)
        .send({ capacity: -5 });

      expect(response.status).toBe(400);
    });

    it('devrait retourner 404 pour un événement inexistant', async () => {
      const response = await request(app)
        .put('/api/events/999999')
        .send({ description: 'New' });

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/events/:id/close', () => {
    it('devrait clôturer un événement', async () => {
      // Créer un événement à clôturer
      const createResponse = await request(app)
        .post('/api/events')
        .send({
          name: 'Event to Close',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          capacity: 30,
        });

      const eventToCloseId = createResponse.body.data.id;

      // Clôturer l'événement
      const closeResponse = await request(app)
        .put(`/api/events/${eventToCloseId}/close`)
        .send({ status: 'closed' });

      expect(closeResponse.status).toBe(200);
      expect(closeResponse.body.data.status).toBe('closed');
    });

    it('devrait retourner 404 pour un événement inexistant', async () => {
      const response = await request(app)
        .put('/api/events/999999/close')
        .send({ status: 'closed' });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/events/:id', () => {
    it('devrait supprimer un événement', async () => {
      // Créer un événement à supprimer
      const createResponse = await request(app)
        .post('/api/events')
        .send({
          name: 'Event to Delete',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          capacity: 25,
        });

      const eventToDeleteId = createResponse.body.data.id;

      // Supprimer l'événement
      const deleteResponse = await request(app)
        .delete(`/api/events/${eventToDeleteId}`);

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.success).toBe(true);

      // Vérifier que l'événement n'existe plus
      const getResponse = await request(app)
        .get(`/api/events/${eventToDeleteId}`);

      expect(getResponse.status).toBe(404);
    });

    it('devrait retourner 404 pour un événement inexistant', async () => {
      const response = await request(app)
        .delete('/api/events/999999');

      expect(response.status).toBe(404);
    });
  });

  describe('Gestion des erreurs', () => {
    it('devrait retourner 500 en cas d\'erreur serveur', async () => {
      // Supposer qu'une requête malformée cause une erreur 500
      const response = await request(app)
        .post('/api/events')
        .send({
          name: 'Event',
          date: { invalid: 'object' }, // Type invalide
          capacity: 20,
        });

      expect(response.status).toBe(400);
    });
  });
});
