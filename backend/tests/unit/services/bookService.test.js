import { describe, it, expect, beforeEach, vi } from 'vitest';
import { bookService } from '../../src/services/bookService.js';
import { PrismaClient } from '@prisma/client';

// Mock Prisma
vi.mock('@prisma/client', () => {
  const mockPrisma = {
    book: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
  };
  return { PrismaClient: vi.fn(() => mockPrisma) };
});

const prisma = new PrismaClient();

describe('bookService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createBook', () => {
    it('devrait créer un livre avec données valides', async () => {
      const bookData = {
        title: 'Harry Potter',
        author: 'J.K. Rowling',
        isbn: '9780747532699',
        year: 1997,
        price: 15.99,
        quantity: 10,
        description: 'Un jeune magicien',
      };

      const expectedBook = { id: 1, ...bookData, isArchived: false };
      prisma.book.create.mockResolvedValue(expectedBook);

      const result = await bookService.createBook(bookData);

      expect(result).toEqual(expectedBook);
      expect(prisma.book.create).toHaveBeenCalledWith({
        data: expect.objectContaining(bookData),
      });
    });

    it('devrait rejeter avec titre manquant', async () => {
      const bookData = {
        author: 'Author',
        price: 15.99,
        quantity: 10,
      };

      await expect(bookService.createBook(bookData))
        .rejects.toThrow('Title is required');
    });

    it('devrait rejeter avec prix invalide', async () => {
      const bookData = {
        title: 'Book',
        author: 'Author',
        price: -5,
        quantity: 10,
      };

      await expect(bookService.createBook(bookData))
        .rejects.toThrow('Price must be positive');
    });

    it('devrait rejeter avec quantité invalide', async () => {
      const bookData = {
        title: 'Book',
        author: 'Author',
        price: 15.99,
        quantity: -1,
      };

      await expect(bookService.createBook(bookData))
        .rejects.toThrow('Quantity must be non-negative');
    });
  });

  describe('getBook', () => {
    it('devrait retourner un livre existant', async () => {
      const book = {
        id: 1,
        title: 'Harry Potter',
        author: 'J.K. Rowling',
        price: 15.99,
        quantity: 10,
      };

      prisma.book.findUnique.mockResolvedValue(book);

      const result = await bookService.getBook(1);

      expect(result).toEqual(book);
      expect(prisma.book.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('devrait lever une erreur si livre non trouvé', async () => {
      prisma.book.findUnique.mockResolvedValue(null);

      await expect(bookService.getBook(999))
        .rejects.toThrow('Book not found');
    });
  });

  describe('searchBooks', () => {
    it('devrait chercher par titre', async () => {
      const books = [
        { id: 1, title: 'Harry Potter', author: 'Rowling' },
      ];

      prisma.book.findMany.mockResolvedValue(books);
      prisma.book.count.mockResolvedValue(1);

      const result = await bookService.searchBooks({ title: 'Harry' });

      expect(result.data).toEqual(books);
      expect(result.pagination.total).toBe(1);
    });

    it('devrait chercher par auteur', async () => {
      const books = [
        { id: 1, title: 'Harry Potter', author: 'Rowling' },
        { id: 2, title: 'Chamber of Secrets', author: 'Rowling' },
      ];

      prisma.book.findMany.mockResolvedValue(books);
      prisma.book.count.mockResolvedValue(2);

      const result = await bookService.searchBooks({ author: 'Rowling' });

      expect(result.data.length).toBe(2);
      expect(result.pagination.total).toBe(2);
    });

    it('devrait filtrer par stock disponible', async () => {
      const books = [
        { id: 1, title: 'Harry Potter', quantity: 5 },
      ];

      prisma.book.findMany.mockResolvedValue(books);
      prisma.book.count.mockResolvedValue(1);

      const result = await bookService.searchBooks({ inStock: true });

      expect(result.data[0].quantity).toBeGreaterThan(0);
    });
  });

  describe('updateBook', () => {
    it('devrait mettre à jour un livre', async () => {
      const updatedBook = {
        id: 1,
        title: 'Harry Potter (Updated)',
        price: 19.99,
      };

      prisma.book.update.mockResolvedValue(updatedBook);

      const result = await bookService.updateBook(1, { title: 'Harry Potter (Updated)' });

      expect(result.title).toBe('Harry Potter (Updated)');
      expect(prisma.book.update).toHaveBeenCalled();
    });

    it('devrait rejeter avec prix invalide', async () => {
      await expect(bookService.updateBook(1, { price: -5 }))
        .rejects.toThrow('Price must be positive');
    });
  });

  describe('archiveBook', () => {
    it('devrait archiver un livre', async () => {
      const archivedBook = {
        id: 1,
        title: 'Harry Potter',
        isArchived: true,
      };

      prisma.book.update.mockResolvedValue(archivedBook);

      const result = await bookService.archiveBook(1);

      expect(result.isArchived).toBe(true);
      expect(prisma.book.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { isArchived: true },
      });
    });
  });
});
