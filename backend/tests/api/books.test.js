import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';

/**
 * Tests API Books
 * Testent les endpoints /api/books
 */
describe('Books API', () => {
  let bookId;

  describe('POST /api/books', () => {
    it('devrait créer un livre avec données valides', async () => {
      const bookData = {
        title: 'Test Book',
        author: 'Test Author',
        isbn: '9780000000000',
        price: 15.99,
        quantity: 10,
        description: 'Test book description',
      };

      const response = await request(app)
        .post('/api/books')
        .send(bookData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Test Book');
      bookId = response.body.data.id;
    });

    it('devrait retourner 400 avec données invalides', async () => {
      const invalidData = {
        // title manquant
        author: 'Author',
        price: -10, // prix négatif
      };

      const response = await request(app)
        .post('/api/books')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('devrait retourner 409 avec ISBN en doublon', async () => {
      const bookData = {
        title: 'Duplicate Book',
        author: 'Author',
        isbn: '9780000000000', // ISBN déjà existant
        price: 12.99,
        quantity: 5,
      };

      const response = await request(app)
        .post('/api/books')
        .send(bookData);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/books', () => {
    it('devrait retourner la liste des livres', async () => {
      const response = await request(app)
        .get('/api/books');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.pagination).toBeDefined();
    });

    it('devrait supporter la pagination', async () => {
      const response = await request(app)
        .get('/api/books?page=1&limit=5');

      expect(response.status).toBe(200);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
    });
  });

  describe('POST /api/books/search', () => {
    it('devrait chercher par titre', async () => {
      const response = await request(app)
        .post('/api/books/search')
        .send({ title: 'Test' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('devrait chercher par auteur', async () => {
      const response = await request(app)
        .post('/api/books/search')
        .send({ author: 'Author' });

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThanOrEqual(0);
    });

    it('devrait filtrer par stock', async () => {
      const response = await request(app)
        .post('/api/books/search')
        .send({ inStock: true });

      expect(response.status).toBe(200);
      // Tous les livres retournés ont quantity > 0
      response.body.data.forEach(book => {
        expect(book.quantity).toBeGreaterThan(0);
      });
    });
  });

  describe('GET /api/books/:id', () => {
    it('devrait retourner un livre existant', async () => {
      const response = await request(app)
        .get(`/api/books/${bookId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(bookId);
    });

    it('devrait retourner 404 pour un livre inexistant', async () => {
      const response = await request(app)
        .get('/api/books/999999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/books/:id', () => {
    it('devrait modifier un livre existant', async () => {
      const updateData = {
        price: 19.99,
        quantity: 15,
      };

      const response = await request(app)
        .put(`/api/books/${bookId}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.data.price).toBe(19.99);
      expect(response.body.data.quantity).toBe(15);
    });

    it('devrait retourner 400 avec données invalides', async () => {
      const response = await request(app)
        .put(`/api/books/${bookId}`)
        .send({ price: -5 });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/books/:id', () => {
    it('devrait archiver un livre', async () => {
      const response = await request(app)
        .delete(`/api/books/${bookId}`);

      expect(response.status).toBe(200);
      expect(response.body.data.isArchived).toBe(true);
    });

    it('devrait retourner 404 pour un livre inexistant', async () => {
      const response = await request(app)
        .delete('/api/books/999999');

      expect(response.status).toBe(404);
    });
  });
});
