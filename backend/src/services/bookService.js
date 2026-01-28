import { PrismaClient } from '@prisma/client';
import { validateBook } from '../utils/validators.js';

const prisma = new PrismaClient();

export const bookService = {
  /**
   * Récupérer liste paginée des livres en stock
   */
  async getBooks(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where: { isArchived: false },
        skip,
        take: limit,
        orderBy: { title: 'asc' },
      }),
      prisma.book.count({ where: { isArchived: false } }),
    ]);

    return {
      data: books,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Récupérer détails d'un livre
   */
  async getBook(id) {
    const book = await prisma.book.findUnique({
      where: { id: parseInt(id) },
    });

    if (!book || book.isArchived) {
      const err = new Error('Book not found');
      err.name = 'NotFoundError';
      err.statusCode = 404;
      throw err;
    }

    return book;
  },

  /**
   * Recherche multi-critères de livres
   */
  async searchBooks(filters = {}) {
    const {
      title,
      author,
      year,
      isbn,
      inStock = true,
      page = 1,
      limit = 20,
    } = filters;

    const where = {
      isArchived: false,
    };

    // Ajouter critères dynamiques
    if (title) {
      where.title = { contains: title, mode: 'insensitive' };
    }
    if (author) {
      where.author = { contains: author, mode: 'insensitive' };
    }
    if (year) {
      where.year = parseInt(year);
    }
    if (isbn) {
      where.isbn = isbn;
    }
    if (inStock) {
      where.quantity = { gt: 0 };
    }

    const skip = (page - 1) * limit;

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        skip,
        take: limit,
        orderBy: { title: 'asc' },
      }),
      prisma.book.count({ where }),
    ]);

    return {
      data: books,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Créer un nouveau livre
   */
  async createBook(bookData) {
    validateBook(bookData);

    // Vérifier ISBN n'existe pas déjà
    const existing = await prisma.book.findUnique({
      where: { isbn: bookData.isbn },
    });
    if (existing && !existing.isArchived) {
      const err = new Error('ISBN already exists');
      err.name = 'ConflictError';
      err.statusCode = 409;
      throw err;
    }

    const book = await prisma.book.create({
      data: {
        title: bookData.title,
        author: bookData.author,
        year: bookData.year || null,
        isbn: bookData.isbn,
        quantity: bookData.quantity || 0,
        price: parseFloat(bookData.price),
        description: bookData.description || null,
      },
    });

    return book;
  },

  /**
   * Ajouter plusieurs livres en batch
   */
  async createBatchBooks(booksData) {
    if (!Array.isArray(booksData) || booksData.length === 0) {
      const err = new Error('Books array is required');
      err.name = 'ValidationError';
      throw err;
    }

    const results = {
      inserted: 0,
      failed: 0,
      details: [],
    };

    // Vérifier tous les ISBNs uniques
    const isbns = booksData.map(b => b.isbn);
    const existingBooks = await prisma.book.findMany({
      where: {
        isbn: { in: isbns },
        isArchived: false,
      },
    });
    const existingISBNs = new Set(existingBooks.map(b => b.isbn));

    for (let i = 0; i < booksData.length; i++) {
      const bookData = booksData[i];
      try {
        if (existingISBNs.has(bookData.isbn)) {
          throw new Error('ISBN already exists');
        }

        validateBook(bookData);

        const book = await prisma.book.create({
          data: {
            title: bookData.title,
            author: bookData.author,
            year: bookData.year || null,
            isbn: bookData.isbn,
            quantity: bookData.quantity || 0,
            price: parseFloat(bookData.price),
            description: bookData.description || null,
          },
        });

        results.inserted += 1;
        results.details.push({
          title: bookData.title,
          isbn: bookData.isbn,
          status: 'success',
          id: book.id,
        });
      } catch (error) {
        results.failed += 1;
        results.details.push({
          index: i,
          title: bookData.title,
          isbn: bookData.isbn,
          status: 'error',
          error: error.message,
        });
      }
    }

    return results;
  },

  /**
   * Modifier un livre
   */
  async updateBook(id, bookData) {
    const book = await prisma.book.findUnique({
      where: { id: parseInt(id) },
    });

    if (!book || book.isArchived) {
      const err = new Error('Book not found');
      err.name = 'NotFoundError';
      err.statusCode = 404;
      throw err;
    }

    // Valider les données fournies
    if (bookData.title || bookData.author || bookData.isbn) {
      const fullData = {
        title: bookData.title || book.title,
        author: bookData.author || book.author,
        isbn: bookData.isbn || book.isbn,
        price: bookData.price || book.price,
      };
      validateBook(fullData);
    }

    // Vérifier ISBN unique (si modifié)
    if (bookData.isbn && bookData.isbn !== book.isbn) {
      const existing = await prisma.book.findUnique({
        where: { isbn: bookData.isbn },
      });
      if (existing && !existing.isArchived) {
        const err = new Error('ISBN already exists');
        err.name = 'ConflictError';
        err.statusCode = 409;
        throw err;
      }
    }

    const updated = await prisma.book.update({
      where: { id: parseInt(id) },
      data: {
        ...(bookData.title && { title: bookData.title }),
        ...(bookData.author && { author: bookData.author }),
        ...(bookData.year && { year: bookData.year }),
        ...(bookData.isbn && { isbn: bookData.isbn }),
        ...(bookData.quantity !== undefined && { quantity: bookData.quantity }),
        ...(bookData.price && { price: parseFloat(bookData.price) }),
        ...(bookData.description !== undefined && { description: bookData.description }),
      },
    });

    return updated;
  },

  /**
   * Supprimer (archiver) un livre
   */
  async deleteBook(id) {
    const book = await prisma.book.findUnique({
      where: { id: parseInt(id) },
    });

    if (!book) {
      const err = new Error('Book not found');
      err.name = 'NotFoundError';
      err.statusCode = 404;
      throw err;
    }

    await prisma.book.update({
      where: { id: parseInt(id) },
      data: { isArchived: true },
    });

    return { success: true };
  },
};
