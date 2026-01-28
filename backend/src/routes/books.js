import express from 'express';
import { bookService } from '../services/bookService.js';

const router = express.Router();

/**
 * GET /api/books
 * Liste paginée des livres en stock
 */
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    if (page < 1) throw new Error('Page must be >= 1');
    if (limit < 1 || limit > 100) throw new Error('Limit must be between 1 and 100');

    const result = await bookService.getBooks(page, limit);

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
 * GET /api/books/:id
 * Récupérer détails d'un livre
 */
router.get('/:id', async (req, res, next) => {
  try {
    const book = await bookService.getBook(req.params.id);
    res.json({
      success: true,
      data: book,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/books/search
 * Recherche multi-critères
 */
router.post('/search', async (req, res, next) => {
  try {
    const result = await bookService.searchBooks(req.body);
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
 * POST /api/books
 * Créer un nouveau livre
 */
router.post('/', async (req, res, next) => {
  try {
    const book = await bookService.createBook(req.body);
    res.status(201).json({
      success: true,
      data: book,
      message: 'Book created successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/books/batch
 * Importer plusieurs livres
 */
router.post('/batch', async (req, res, next) => {
  try {
    const result = await bookService.createBatchBooks(req.body);
    const statusCode = result.failed === 0 ? 201 : 207; // 207 Multi-Status si erreurs partielles
    res.status(statusCode).json({
      success: result.failed === 0,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/books/:id
 * Modifier un livre
 */
router.put('/:id', async (req, res, next) => {
  try {
    const book = await bookService.updateBook(req.params.id, req.body);
    res.json({
      success: true,
      data: book,
      message: 'Book updated successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/books/:id
 * Supprimer (archiver) un livre
 */
router.delete('/:id', async (req, res, next) => {
  try {
    await bookService.deleteBook(req.params.id);
    res.json({
      success: true,
      message: 'Book archived successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
