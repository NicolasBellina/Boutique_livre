import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';

/**
 * Tests API Orders
 * Testent les endpoints /api/orders
 */
describe('Orders API', () => {
  let orderId;
  let bookId = 1; // Supposé existant à partir du seed

  describe('POST /api/orders', () => {
    it('devrait créer une commande avec articles valides', async () => {
      const orderData = {
        items: [
          { bookId: 1, quantity: 2 },
          { bookId: 2, quantity: 1 },
        ],
        customerEmail: 'customer@example.com',
        customerName: 'John Doe',
        shippingAddress: '123 Rue Test, 75001 Paris',
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.orderNumber).toBeDefined();
      expect(response.body.data.status).toBe('confirmed');
      expect(response.body.data.total).toBeDefined();
      orderId = response.body.data.id;
    });

    it('devrait retourner 400 avec données invalides', async () => {
      const invalidData = {
        items: [], // Array vide
        customerEmail: 'invalid-email',
      };

      const response = await request(app)
        .post('/api/orders')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('devrait retourner 404 si livre n\'existe pas', async () => {
      const orderData = {
        items: [
          { bookId: 999999, quantity: 1 },
        ],
        customerEmail: 'customer@example.com',
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('devrait retourner 409 si stock insuffisant', async () => {
      const orderData = {
        items: [
          { bookId: 1, quantity: 10000 }, // Quantité très grande
        ],
        customerEmail: 'customer@example.com',
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData);

      expect(response.status).toBe(409);
      expect(response.body.details?.bookId).toBe(1);
    });

    it('devrait décrémenter le stock après création', async () => {
      // Créer une commande
      const orderData = {
        items: [{ bookId: 2, quantity: 1 }],
        customerEmail: 'customer@example.com',
      };

      const orderResponse = await request(app)
        .post('/api/orders')
        .send(orderData);

      expect(orderResponse.status).toBe(201);

      // Vérifier que le stock est décrémenté
      const bookResponse = await request(app)
        .get('/api/books/2');

      expect(bookResponse.body.data.quantity).toBeLessThan(10); // Avant était 10
    });
  });

  describe('GET /api/orders', () => {
    it('devrait retourner la liste des commandes', async () => {
      const response = await request(app)
        .get('/api/orders');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.pagination).toBeDefined();
    });

    it('devrait supporter la pagination', async () => {
      const response = await request(app)
        .get('/api/orders?page=1&limit=5');

      expect(response.status).toBe(200);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
    });

    it('devrait retourner les articles avec détails du livre', async () => {
      const response = await request(app)
        .get('/api/orders');

      expect(response.status).toBe(200);

      if (response.body.data.length > 0) {
        const order = response.body.data[0];
        expect(order.items).toBeDefined();

        if (order.items.length > 0) {
          const item = order.items[0];
          expect(item.book).toBeDefined();
          expect(item.book.title).toBeDefined();
          expect(item.book.author).toBeDefined();
        }
      }
    });
  });

  describe('GET /api/orders/:id', () => {
    it('devrait retourner une commande existante', async () => {
      const response = await request(app)
        .get(`/api/orders/${orderId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(orderId);
      expect(response.body.data.items).toBeDefined();
    });

    it('devrait retourner 404 pour une commande inexistante', async () => {
      const response = await request(app)
        .get('/api/orders/999999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/orders/:id', () => {
    it('devrait mettre à jour le statut', async () => {
      const response = await request(app)
        .put(`/api/orders/${orderId}`)
        .send({ status: 'confirmed' });

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('confirmed');
    });

    it('devrait retourner 400 avec statut invalide', async () => {
      const response = await request(app)
        .put(`/api/orders/${orderId}`)
        .send({ status: 'invalid_status' });

      expect(response.status).toBe(400);
    });
  });

  describe('Vérification transactionnel', () => {
    it('devrait rollback si une erreur survient', async () => {
      // Test conceptuel - le backend gère les transactions
      const stockAvant = (await request(app).get('/api/books/3')).body.data.quantity;

      const orderData = {
        items: [
          { bookId: 3, quantity: stockAvant + 10 }, // Stock insuffisant
        ],
        customerEmail: 'customer@example.com',
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData);

      expect(response.status).toBe(409);

      // Vérifier que le stock n'a pas changé
      const stockApres = (await request(app).get('/api/books/3')).body.data.quantity;
      expect(stockApres).toBe(stockAvant);
    });
  });
});
