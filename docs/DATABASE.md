# Database Documentation - LibrairiePro

## Aperçu

Base de données PostgreSQL normalisée (3NF) avec 3 tables principales et relations claires.

```
┌─────────────────┐
│     books       │
├─────────────────┤
│ id (PK)         │
│ title           │
│ author          │
│ year            │
│ isbn (UNIQUE)   │
│ quantity        │
│ price           │
│ isArchived      │
│ createdAt       │
│ updatedAt       │
└────────┬────────┘
         │ 1
         │
         │ N
         │
    ┌────┴─────────┐
    │  (has_many)  │
    │              │
    │              │
┌───┴──────────┐  ┌────────────────┐
│    orders    │  │   order_items  │
├───────────���──┤  ├────────────────┤
│ id (PK)      │  │ id (PK)        │
│ orderNumber  │  │ orderId (FK)   │
��� status       │  │ bookId (FK)    │
│ total        │  │ quantity       │
│ email        │  │ unitPrice      │
│ name         │  │ subtotal       │
│ address      │  │ createdAt      │
│ createdAt    │  │ updatedAt      │
│ updatedAt    │  └────────────────┘
└──────────────┘

┌──────────────┐
│    events    │
├──────────────┤
│ id (PK)      │
│ name         │
│ date         │
│ location     │
│ description  │
│ capacity     │
│ status       │
│ createdAt    │
│ updatedAt    │
└──────────────┘
```

---

## Table: books

Stocke le catalogue de livres disponibles.

### Schéma

| Colonne | Type | Null | Unique | Default | Indices |
|---------|------|------|--------|---------|---------|
| **id** | INT | ✗ | ✓ | auto | PK |
| **title** | VARCHAR(255) | ✗ | ✗ | - | IDX |
| **author** | VARCHAR(255) | ✗ | ✗ | - | IDX |
| **year** | INT | ✓ | ✗ | - | - |
| **isbn** | VARCHAR(13) | ✗ | ✓ | - | IDX |
| **quantity** | INT | ✓ | ✗ | 0 | - |
| **price** | DECIMAL(10,2) | ✗ | ✗ | - | - |
| **description** | TEXT | ✓ | ✗ | NULL | - |
| **isArchived** | BOOLEAN | ✓ | ✗ | false | - |
| **createdAt** | TIMESTAMP | ✗ | ✗ | now() | - |
| **updatedAt** | TIMESTAMP | ✗ | ✗ | now() | - |

### SQL

```sql
CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  year INT,
  isbn VARCHAR(13) NOT NULL UNIQUE,
  quantity INT DEFAULT 0,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  isArchived BOOLEAN DEFAULT false,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Indices pour recherches rapides
CREATE INDEX idx_books_title ON books(title);
CREATE INDEX idx_books_author ON books(author);
CREATE INDEX idx_books_isbn ON books(isbn);
CREATE INDEX idx_books_year ON books(year);
CREATE INDEX idx_books_archived ON books(isArchived);
```

### Contraintes

- **title**: Non-vide, longueur < 255 caractères
- **author**: Non-vide, longueur < 255 caractères
- **year**: 1000 ≤ year ≤ 2099 (si spécifié)
- **isbn**: Format ISBN-13 valide, unique
- **quantity**: ≥ 0
- **price**: > 0

### Exemples de Données

```sql
INSERT INTO books (title, author, year, isbn, quantity, price) VALUES
  ('Harry Potter and the Philosopher''s Stone', 'J.K. Rowling', 1997, '9780747532699', 5, 15.99),
  ('Dune', 'Frank Herbert', 1965, '9780441173571', 3, 18.99),
  ('The Lord of the Rings: The Fellowship of the Ring', 'J.R.R. Tolkien', 1954, '9780547928227', 2, 25.00),
  ('1984', 'George Orwell', 1949, '9780451524935', 7, 13.99),
  ('Les Misérables', 'Victor Hugo', 1862, '9782823104455', 4, 22.00);
```

---

## Table: orders

Enregistre les commandes passées par les clients.

### Schéma

| Colonne | Type | Null | Unique | Default | Indices |
|---------|------|------|--------|---------|---------|
| **id** | INT | ✗ | ✓ | auto | PK |
| **orderNumber** | VARCHAR(50) | ✗ | ✓ | - | IDX |
| **status** | ENUM | ✓ | ✗ | 'confirmed' | IDX |
| **total** | DECIMAL(12,2) | ✗ | ✗ | 0 | - |
| **customerEmail** | VARCHAR(255) | ✓ | ✗ | - | IDX |
| **customerName** | VARCHAR(255) | ✓ | ✗ | - | - |
| **shippingAddress** | TEXT | ✓ | ✗ | - | - |
| **createdAt** | TIMESTAMP | ✗ | ✗ | now() | IDX |
| **updatedAt** | TIMESTAMP | ✗ | ✗ | now() | - |

### SQL

```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  orderNumber VARCHAR(50) NOT NULL UNIQUE,
  status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'confirmed',
  total DECIMAL(12, 2) NOT NULL DEFAULT 0,
  customerEmail VARCHAR(255),
  customerName VARCHAR(255),
  shippingAddress TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Indices pour requêtes fréquentes
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_email ON orders(customerEmail);
CREATE INDEX idx_orders_createdAt ON orders(createdAt);
CREATE INDEX idx_orders_orderNumber ON orders(orderNumber);
```

### Contraintes

- **orderNumber**: Non-vide, unique (ex: `ORD-20240101-001`)
- **status**: Valeur ENUM parmi: `pending`, `confirmed`, `cancelled`
- **total**: ≥ 0
- **customerEmail**: Format email valide (si fourni)

### Exemples de Données

```sql
INSERT INTO orders (orderNumber, status, total, customerEmail, customerName) VALUES
  ('ORD-20240101-001', 'confirmed', 31.98, 'john@example.com', 'John Doe'),
  ('ORD-20240101-002', 'confirmed', 45.50, 'jane@example.com', 'Jane Smith'),
  ('ORD-20240102-001', 'pending', 54.99, 'bob@example.com', 'Bob Wilson');
```

---

## Table: order_items

Détails des articles dans chaque commande (relation N:N entre orders et books).

### Schéma

| Colonne | Type | Null | Unique | Default | Indices |
|---------|------|------|--------|---------|---------|
| **id** | INT | ✗ | ✓ | auto | PK |
| **orderId** | INT | ✗ | ✗ | - | IDX, FK |
| **bookId** | INT | ✗ | ✗ | - | IDX, FK |
| **quantity** | INT | ✗ | ✗ | 1 | - |
| **unitPrice** | DECIMAL(10,2) | ✗ | ✗ | - | - |
| **subtotal** | DECIMAL(12,2) | ✗ | ✗ | - | - |
| **createdAt** | TIMESTAMP | ✗ | ✗ | now() | - |
| **updatedAt** | TIMESTAMP | ✗ | ✗ | now() | - |

### SQL

```sql
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  orderId INT NOT NULL,
  bookId INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unitPrice DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(12, 2) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Clés étrangères
  FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (bookId) REFERENCES books(id) ON DELETE RESTRICT,
  
  -- Index pour requêtes fréquentes
  UNIQUE KEY unique_order_book (orderId, bookId)
);

-- Indices
CREATE INDEX idx_order_items_orderId ON order_items(orderId);
CREATE INDEX idx_order_items_bookId ON order_items(bookId);
```

### Contraintes

- **orderId**: Référence valide dans `orders` (FK)
- **bookId**: Référence valide dans `books` (FK)
- **quantity**: > 0
- **unitPrice**: > 0
- **subtotal**: = quantity × unitPrice
- Clé composée `(orderId, bookId)`: Un livre ne peut apparaître qu'une fois par commande

### Exemples de Données

```sql
INSERT INTO order_items (orderId, bookId, quantity, unitPrice, subtotal) VALUES
  (1, 1, 2, 15.99, 31.98),      -- ORD-20240101-001: 2x Harry Potter
  (2, 1, 1, 15.99, 15.99),      -- ORD-20240101-002: 1x Harry Potter
  (2, 3, 2, 25.00, 50.00),      -- ORD-20240101-002: 2x LOTR (Note: subtotal > order.total, erreur dans exemple)
  (3, 4, 3, 13.99, 41.97);      -- ORD-20240102-001: 3x 1984
```

---

## Table: events

Événements organisés par la librairie.

### Schéma

| Colonne | Type | Null | Unique | Default | Indices |
|---------|------|------|--------|---------|---------|
| **id** | INT | ✗ | ✓ | auto | PK |
| **name** | VARCHAR(255) | ✗ | ✗ | - | IDX |
| **date** | TIMESTAMP | ✗ | ✗ | - | IDX |
| **location** | VARCHAR(255) | ✓ | ✗ | - | - |
| **description** | TEXT | ✓ | ✗ | - | - |
| **capacity** | INT | ✓ | ✗ | NULL | - |
| **status** | ENUM | ✓ | ✗ | 'planned' | IDX |
| **createdAt** | TIMESTAMP | ✗ | ✗ | now() | - |
| **updatedAt** | TIMESTAMP | ✗ | ✗ | now() | - |

### SQL

```sql
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  date TIMESTAMP NOT NULL,
  location VARCHAR(255),
  description TEXT,
  capacity INT,
  status ENUM('planned', 'ongoing', 'closed', 'cancelled') DEFAULT 'planned',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Indices pour requêtes fréquentes
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_name ON events(name);
```

### Contraintes

- **name**: Non-vide, longueur < 255 caractères
- **date**: Valide et généralement future (ou non-strict en modification)
- **description**: < 500 caractères (si fourni)
- **capacity**: > 0 (si fourni)
- **status**: Valeur ENUM parmi: `planned`, `ongoing`, `closed`, `cancelled`

### Exemples de Données

```sql
INSERT INTO events (name, date, location, description, capacity, status) VALUES
  ('Signature de l''auteur J.K. Rowling', '2024-06-15 18:00:00', 'Librairie du Centre', 'Venez rencontrer l''auteur de Harry Potter pour une session de signature exclusive.', 50, 'planned'),
  ('Club de lecture mensuel', '2024-02-20 19:00:00', 'Librairie du Centre', 'Discussions autour du livre du mois : Les Misérables.', 30, 'planned'),
  ('Salon du livre jeunesse', '2024-03-10 10:00:00', 'Parc central', 'Grand événement avec 20+ auteurs jeunesse.', 200, 'planned');
```

---

## Schéma Prisma

Équivalent ORM pour le projet (utilisé en backend):

```prisma
// prisma/schema.prisma

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Book {
  id          Int       @id @default(autoincrement())
  title       String    @db.VarChar(255)
  author      String    @db.VarChar(255)
  year        Int?
  isbn        String    @unique @db.VarChar(13)
  quantity    Int       @default(0)
  price       Decimal   @db.Decimal(10, 2)
  description String?   @db.Text
  isArchived  Boolean   @default(false)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  // Relations
  orderItems  OrderItem[]

  // Indices
  @@index([title])
  @@index([author])
  @@index([year])
  @@index([isbn])
  @@index([isArchived])
}

model Order {
  id               Int       @id @default(autoincrement())
  orderNumber      String    @unique
  status           String    @default("confirmed") // pending|confirmed|cancelled
  total            Decimal   @default(0) @db.Decimal(12, 2)
  customerEmail    String?   @db.VarChar(255)
  customerName     String?   @db.VarChar(255)
  shippingAddress  String?   @db.Text
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  // Relations
  items            OrderItem[]

  // Indices
  @@index([status])
  @@index([customerEmail])
  @@index([createdAt])
  @@index([orderNumber])
}

model OrderItem {
  id       Int       @id @default(autoincrement())
  orderId  Int
  bookId   Int
  quantity Int       @default(1)
  unitPrice Decimal  @db.Decimal(10, 2)
  subtotal Decimal   @db.Decimal(12, 2)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  order    Order     @relation(fields: [orderId], references: [id], onDelete: Cascade)
  book     Book      @relation(fields: [bookId], references: [id], onDelete: Restrict)

  // Index & Contraintes
  @@unique([orderId, bookId])
  @@index([orderId])
  @@index([bookId])
}

model Event {
  id          Int       @id @default(autoincrement())
  name        String    @db.VarChar(255)
  date        DateTime
  location    String?   @db.VarChar(255)
  description String?   @db.Text
  capacity    Int?
  status      String    @default("planned") // planned|ongoing|closed|cancelled
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  // Indices
  @@index([date])
  @@index([status])
  @@index([name])
}
```

---

## Migrations

Les migrations Prisma sont versionnées et trackées dans `prisma/migrations/`.

### Exemple: Création initiale

```sql
-- prisma/migrations/001_initial_schema/migration.sql

-- CreateTable books
CREATE TABLE "books" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "title" VARCHAR(255) NOT NULL,
  "author" VARCHAR(255) NOT NULL,
  "year" INTEGER,
  "isbn" VARCHAR(13) NOT NULL UNIQUE,
  "quantity" INTEGER NOT NULL DEFAULT 0,
  "price" DECIMAL(10,2) NOT NULL,
  "description" TEXT,
  "isArchived" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable orders
CREATE TABLE "orders" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "orderNumber" VARCHAR(50) NOT NULL UNIQUE,
  "status" VARCHAR(20) NOT NULL DEFAULT 'confirmed',
  "total" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "customerEmail" VARCHAR(255),
  "customerName" VARCHAR(255),
  "shippingAddress" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable order_items
CREATE TABLE "order_items" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "orderId" INTEGER NOT NULL,
  "bookId" INTEGER NOT NULL,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "unitPrice" DECIMAL(10,2) NOT NULL,
  "subtotal" DECIMAL(12,2) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "order_items_orderId_bookId_key" UNIQUE("orderId","bookId"),
  CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "order_items_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "books"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable events
CREATE TABLE "events" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "location" VARCHAR(255),
  "description" TEXT,
  "capacity" INTEGER,
  "status" VARCHAR(20) NOT NULL DEFAULT 'planned',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "books_title_idx" ON "books"("title");
CREATE INDEX "books_author_idx" ON "books"("author");
CREATE INDEX "books_isbn_idx" ON "books"("isbn");
CREATE INDEX "books_year_idx" ON "books"("year");
CREATE INDEX "books_isArchived_idx" ON "books"("isArchived");

CREATE INDEX "orders_status_idx" ON "orders"("status");
CREATE INDEX "orders_customerEmail_idx" ON "orders"("customerEmail");
CREATE INDEX "orders_createdAt_idx" ON "orders"("createdAt");
CREATE INDEX "orders_orderNumber_idx" ON "orders"("orderNumber");

CREATE INDEX "order_items_orderId_idx" ON "order_items"("orderId");
CREATE INDEX "order_items_bookId_idx" ON "order_items"("bookId");

CREATE INDEX "events_date_idx" ON "events"("date");
CREATE INDEX "events_status_idx" ON "events"("status");
CREATE INDEX "events_name_idx" ON "events"("name");
```

---

## Requêtes Courantes

### Rechercher des livres

```sql
-- Par titre (case-insensitive)
SELECT * FROM books
WHERE title ILIKE '%Harry%'
  AND isArchived = false
ORDER BY title ASC;

-- Par auteur et année
SELECT * FROM books
WHERE author = 'J.K. Rowling'
  AND year = 1997
  AND isArchived = false;

-- En stock seulement
SELECT * FROM books
WHERE quantity > 0
  AND isArchived = false
LIMIT 20;
```

### Récupérer une commande avec détails

```sql
SELECT 
  o.id,
  o.orderNumber,
  o.status,
  o.total,
  o.customerEmail,
  oi.id as item_id,
  b.title,
  b.author,
  oi.quantity,
  oi.unitPrice,
  oi.subtotal
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.orderId
LEFT JOIN books b ON oi.bookId = b.id
WHERE o.id = 1001
ORDER BY oi.id;
```

### Statistiques: Livres les plus vendus

```sql
SELECT 
  b.id,
  b.title,
  b.author,
  SUM(oi.quantity) as total_sold,
  COUNT(DISTINCT oi.orderId) as order_count
FROM books b
JOIN order_items oi ON b.id = oi.bookId
JOIN orders o ON oi.orderId = o.id
WHERE o.status = 'confirmed'
GROUP BY b.id, b.title, b.author
ORDER BY total_sold DESC
LIMIT 10;
```

### Événements à venir

```sql
SELECT *
FROM events
WHERE date >= NOW()
  AND status = 'planned'
ORDER BY date ASC;
```

---

## Backup & Recovery

### Backup complet

```bash
pg_dump -U postgres -h localhost livre_db > backup_2024-01-20.sql
```

### Restauration

```bash
psql -U postgres -h localhost livre_db < backup_2024-01-20.sql
```

---

## Performance & Optimisation

### Indices Critiques

1. **books**: `idx_books_title`, `idx_books_author`, `idx_books_isbn`
   - Utilisés fréquemment dans les recherches

2. **orders**: `idx_orders_status`, `idx_orders_email`
   - Filtrage dans listes et recherches client

3. **order_items**: Clé étrangère + `unique (orderId, bookId)`
   - Intégrité référentielle garantie

### Éviter N+1 Queries

**❌ Mauvais:**
```javascript
const orders = await prisma.order.findMany();
// Puis pour chaque order:
for (const order of orders) {
  const items = await prisma.orderItem.findMany({
    where: { orderId: order.id }
  }); // N requêtes supplémentaires!
}
```

**✅ Bon:**
```javascript
const orders = await prisma.order.findMany({
  include: {
    items: {
      include: {
        book: true
      }
    }
  }
}); // 1 seule requête!
```

---

**Dernière mise à jour:** Janvier 2026
