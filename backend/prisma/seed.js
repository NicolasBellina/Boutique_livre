import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Nettoyer les données existantes
  console.log('Cleaning up existing data...');
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.book.deleteMany();
  await prisma.event.deleteMany();

  // Créer des livres
  console.log('Creating books...');
  const books = await prisma.book.createMany({
    data: [
      {
        title: "Harry Potter and the Philosopher's Stone",
        author: 'J.K. Rowling',
        year: 1997,
        isbn: '9780747532699',
        quantity: 5,
        price: new Decimal('15.99'),
      },
      {
        title: 'Harry Potter and the Chamber of Secrets',
        author: 'J.K. Rowling',
        year: 1998,
        isbn: '9780747538494',
        quantity: 3,
        price: new Decimal('15.99'),
      },
      {
        title: 'Dune',
        author: 'Frank Herbert',
        year: 1965,
        isbn: '9780441173571',
        quantity: 7,
        price: new Decimal('18.99'),
      },
      {
        title: 'The Lord of the Rings: The Fellowship of the Ring',
        author: 'J.R.R. Tolkien',
        year: 1954,
        isbn: '9780547928227',
        quantity: 2,
        price: new Decimal('25.00'),
      },
      {
        title: '1984',
        author: 'George Orwell',
        year: 1949,
        isbn: '9780451524935',
        quantity: 8,
        price: new Decimal('13.99'),
      },
      {
        title: 'Les Misérables',
        author: 'Victor Hugo',
        year: 1862,
        isbn: '9782823104455',
        quantity: 4,
        price: new Decimal('22.00'),
      },
      {
        title: 'The Hobbit',
        author: 'J.R.R. Tolkien',
        year: 1937,
        isbn: '9780547928684',
        quantity: 6,
        price: new Decimal('14.99'),
      },
      {
        title: 'Jane Eyre',
        author: 'Charlotte Brontë',
        year: 1847,
        isbn: '9780199232765',
        quantity: 3,
        price: new Decimal('12.99'),
      },
      {
        title: 'Pride and Prejudice',
        author: 'Jane Austen',
        year: 1813,
        isbn: '9780141439518',
        quantity: 9,
        price: new Decimal('11.99'),
      },
      {
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        year: 1925,
        isbn: '9780743273565',
        quantity: 4,
        price: new Decimal('10.99'),
      },
    ],
  });

  console.log(`✅ Created ${books.count} books`);

  // Créer un événement
  console.log('Creating events...');
  await prisma.event.create({
    data: {
      name: "Signature de l'auteur J.K. Rowling",
      date: new Date('2024-06-15T18:00:00Z'),
      location: 'Librairie du Centre',
      description: "Venez rencontrer l'auteur de Harry Potter pour une session de signature exclusive.",
      capacity: 50,
      status: 'planned',
    },
  });

  await prisma.event.create({
    data: {
      name: 'Club de lecture mensuel',
      date: new Date('2024-02-20T19:00:00Z'),
      location: 'Librairie du Centre',
      description: 'Discussions autour du livre du mois : Les Misérables.',
      capacity: 30,
      status: 'planned',
    },
  });

  console.log('✅ Created 2 events');

  // Créer une commande exemple en utilisant un bookId existant
  console.log('Creating sample order...');

  const sampleBook = await prisma.book.findFirst();
  if (!sampleBook) {
    console.warn('No book found to create sample order. Skipping sample order.');
  } else {
    // Créer d'abord l'ordre sans items
    const createdOrder = await prisma.order.create({
      data: {
        orderNumber: 'ORD-20240101-0001',
        status: 'confirmed',
        customerEmail: 'john@example.com',
        customerName: 'John Doe',
        total: new Decimal('31.98'),
      },
    });

    // Puis créer l'order item en se reposant sur les IDs existants
    await prisma.orderItem.create({
      data: {
        orderId: createdOrder.id,
        bookId: sampleBook.id,
        quantity: 2,
        unitPrice: new Decimal('15.99'),
        subtotal: new Decimal('31.98'),
      },
    });

    console.log('✅ Created sample order');
  }

  console.log('\n🌱 Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
