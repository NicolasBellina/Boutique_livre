import { describe, it, expect, beforeEach, vi } from 'vitest';
import { orderService } from '../../src/services/orderService.js';

vi.mock('@prisma/client', () => {
  const mockPrisma = {
    order: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    orderItem: {
      createMany: vi.fn(),
    },
    book: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(async (callback) => callback(mockPrisma)),
  };
  return { PrismaClient: vi.fn(() => mockPrisma) };
});

const prisma = new (await import('@prisma/client')).PrismaClient();

describe('orderService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createOrder', () => {
    it('devrait créer une commande avec articles valides', async () => {
      const orderData = {
        items: [
          { bookId: 1, quantity: 2 },
          { bookId: 2, quantity: 1 },
        ],
        customerEmail: 'client@example.com',
        customerName: 'John Doe',
      };

      const mockBook1 = { id: 1, title: 'Book 1', price: 15.99, quantity: 10 };
      const mockBook2 = { id: 2, title: 'Book 2', price: 12.99, quantity: 5 };

      prisma.book.findUnique
        .mockResolvedValueOnce(mockBook1)
        .mockResolvedValueOnce(mockBook2);

      prisma.$transaction.mockImplementation(async (cb) => {
        return cb(prisma);
      });

      prisma.order.create.mockResolvedValue({
        id: 1,
        orderNumber: 'ORD-20260128-1234',
        status: 'confirmed',
        total: '44.97',
      });

      const result = await orderService.createOrder(orderData);

      expect(result.orderNumber).toBeDefined();
      expect(result.status).toBe('confirmed');
    });

    it('devrait rejeter si livre non trouvé', async () => {
      const orderData = {
        items: [{ bookId: 999, quantity: 1 }],
        customerEmail: 'client@example.com',
      };

      prisma.book.findUnique.mockResolvedValue(null);

      await expect(orderService.createOrder(orderData))
        .rejects.toThrow('Book not found');
    });

    it('devrait rejeter si stock insuffisant', async () => {
      const orderData = {
        items: [{ bookId: 1, quantity: 100 }],
        customerEmail: 'client@example.com',
      };

      const mockBook = { id: 1, quantity: 5 };
      prisma.book.findUnique.mockResolvedValue(mockBook);

      await expect(orderService.createOrder(orderData))
        .rejects.toThrow('Insufficient stock');
    });

    it('devrait décrémenter le stock automatiquement', async () => {
      const orderData = {
        items: [{ bookId: 1, quantity: 2 }],
        customerEmail: 'client@example.com',
      };

      const mockBook = { id: 1, quantity: 10, price: 15.99 };
      prisma.book.findUnique.mockResolvedValue(mockBook);

      prisma.$transaction.mockImplementation(async (cb) => {
        return cb(prisma);
      });

      prisma.order.create.mockResolvedValue({
        id: 1,
        orderNumber: 'ORD-20260128-1234',
      });

      await orderService.createOrder(orderData);

      expect(prisma.book.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { quantity: 8 },
      });
    });
  });

  describe('getOrder', () => {
    it('devrait retourner une commande existante', async () => {
      const order = {
        id: 1,
        orderNumber: 'ORD-20260128-1234',
        items: [
          {
            id: 1,
            quantity: 2,
            unitPrice: '15.99',
            book: { title: 'Book 1', author: 'Author' },
          },
        ],
      };

      prisma.order.findUnique.mockResolvedValue(order);

      const result = await orderService.getOrder(1);

      expect(result.orderNumber).toBe('ORD-20260128-1234');
      expect(result.items.length).toBe(1);
    });

    it('devrait lever une erreur si commande non trouvée', async () => {
      prisma.order.findUnique.mockResolvedValue(null);

      await expect(orderService.getOrder(999))
        .rejects.toThrow('Order not found');
    });
  });

  describe('listOrders', () => {
    it('devrait lister les commandes', async () => {
      const orders = [
        {
          id: 1,
          orderNumber: 'ORD-1',
          status: 'confirmed',
          total: '31.98',
        },
        {
          id: 2,
          orderNumber: 'ORD-2',
          status: 'pending',
          total: '15.99',
        },
      ];

      prisma.order.findMany.mockResolvedValue(orders);
      prisma.order.count.mockResolvedValue(2);

      const result = await orderService.listOrders({});

      expect(result.data.length).toBe(2);
      expect(result.pagination.total).toBe(2);
    });

    it('devrait filtrer par statut', async () => {
      const orders = [
        { id: 1, status: 'confirmed' },
      ];

      prisma.order.findMany.mockResolvedValue(orders);
      prisma.order.count.mockResolvedValue(1);

      const result = await orderService.listOrders({ status: 'confirmed' });

      expect(result.data[0].status).toBe('confirmed');
      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'confirmed' },
        })
      );
    });
  });

  describe('updateOrderStatus', () => {
    it('devrait mettre à jour le statut de la commande', async () => {
      const updatedOrder = {
        id: 1,
        status: 'confirmed',
      };

      prisma.order.update.mockResolvedValue(updatedOrder);

      const result = await orderService.updateOrderStatus(1, 'confirmed');

      expect(result.status).toBe('confirmed');
    });
  });
});
