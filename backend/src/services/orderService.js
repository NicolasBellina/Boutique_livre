import { PrismaClient } from '@prisma/client';
import { validateOrder, generateOrderNumber } from '../utils/validators.js';

const prisma = new PrismaClient();

export const orderService = {
  /**
   * Créer une nouvelle commande avec gestion du stock
   */
  async createOrder(orderData) {
    validateOrder(orderData);

    // Vérifier stock pour tous les livres
    for (const item of orderData.items) {
      const book = await prisma.book.findUnique({
        where: { id: parseInt(item.bookId) },
      });

      if (!book || book.isArchived) {
        const err = new Error('Book not found');
        err.name = 'NotFoundError';
        err.statusCode = 404;
        throw err;
      }

      if (book.quantity < item.quantity) {
        const err = new Error('Insufficient stock');
        err.name = 'ConflictError';
        err.statusCode = 409;
        err.details = {
          bookId: item.bookId,
          title: book.title,
          requested: item.quantity,
          available: book.quantity,
        };
        throw err;
      }
    }

    // Transaction: créer commande et décrémenter stock atomiquement
    const order = await prisma.$transaction(async (tx) => {
      // Créer la commande
      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          status: 'confirmed',
          total: 0, // Calculé plus bas
          customerEmail: orderData.customerEmail || null,
          customerName: orderData.customerName || null,
          shippingAddress: orderData.shippingAddress || null,
        },
      });

      let total = 0;

      // Créer items et décrémenter stock
      for (const item of orderData.items) {
        const book = await tx.book.findUnique({
          where: { id: parseInt(item.bookId) },
        });

        const subtotal = book.price * item.quantity;
        total += subtotal;

        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            bookId: parseInt(item.bookId),
            quantity: item.quantity,
            unitPrice: book.price,
            subtotal: parseFloat(subtotal.toFixed(2)),
          },
        });

        // Décrémenter stock
        await tx.book.update({
          where: { id: parseInt(item.bookId) },
          data: {
            quantity: {
              decrement: item.quantity,
            },
          },
        });
      }

      // Mettre à jour total de la commande
      const updatedOrder = await tx.order.update({
        where: { id: newOrder.id },
        data: { total: parseFloat(total.toFixed(2)) },
        include: {
          items: {
            include: {
              book: {
                select: {
                  id: true,
                  title: true,
                  author: true,
                },
              },
            },
          },
        },
      });

      return updatedOrder;
    });

    return order;
  },

  /**
   * Récupérer détails d'une commande
   */
  async getOrder(id) {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        items: {
          include: {
            book: {
              select: {
                id: true,
                title: true,
                author: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      const err = new Error('Order not found');
      err.name = 'NotFoundError';
      err.statusCode = 404;
      throw err;
    }

    return order;
  },

  /**
   * Lister les commandes avec filtres
   */
  async listOrders(filters = {}) {
    const { status, page = 1, limit = 20 } = filters;

    const where = {};
    if (status) {
      where.status = status;
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        include: {
          items: {
            include: {
              book: {
                select: {
                  id: true,
                  title: true,
                  author: true,
                  isbn: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      data: orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Modifier le statut d'une commande
   */
  async updateOrderStatus(id, status) {
    const validStatuses = ['pending', 'confirmed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      const err = new Error('Invalid status');
      err.name = 'ValidationError';
      throw err;
    }

    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: { items: true },
    });

    if (!order) {
      const err = new Error('Order not found');
      err.name = 'NotFoundError';
      err.statusCode = 404;
      throw err;
    }

    // Si annulation, restaurer le stock
    if (status === 'cancelled' && order.status !== 'cancelled') {
      await prisma.$transaction(async (tx) => {
        for (const item of order.items) {
          await tx.book.update({
            where: { id: item.bookId },
            data: {
              quantity: {
                increment: item.quantity,
              },
            },
          });
        }

        await tx.order.update({
          where: { id: parseInt(id) },
          data: { status },
        });
      });
    } else {
      await prisma.order.update({
        where: { id: parseInt(id) },
        data: { status },
      });
    }

    return await this.getOrder(id);
  },
};
