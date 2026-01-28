# API Documentation - LibrairiePro

## Base URL

```
http://localhost:3000/api
```

## Format des Réponses

### Succès (2xx)

```json
{
  "success": true,
  "data": { /* ressource(s) */ },
  "message": "Opération réussie"
}
```

### Erreur (4xx, 5xx)

```json
{
  "success": false,
  "error": "Description de l'erreur",
  "details": { /* détails optionnels */ }
}
```

## Codes HTTP Standards

| Code | Signification |
|------|--------------|
| 200 | OK - Requête réussie |
| 201 | Created - Ressource créée |
| 400 | Bad Request - Données invalides |
| 404 | Not Found - Ressource introuvable |
| 409 | Conflict - Violation de contrainte (ex: stock insuffisant) |
| 500 | Server Error - Erreur serveur |

---

## 📚 BOOKS - Gestion des Livres

### GET /books

**Description:** Récupérer la liste paginée des livres en stock.

**Query Parameters:**
```
page      (number, optional, default: 1)      - Numéro de page
limit     (number, optional, default: 20)     - Livres par page (max: 100)
sort      (string, optional)                  - Champ de tri: title|author|year
order     (string, optional, default: asc)    - Ordre: asc|desc
```

**Request:**
```bash
GET /books?page=1&limit=20&sort=title&order=asc
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Harry Potter and the Philosopher's Stone",
      "author": "J.K. Rowling",
      "year": 1997,
      "isbn": "9780747532699",
      "quantity": 5,
      "price": 15.99,
      "createdAt": "2024-01-01T10:00:00Z"
    },
    {
      "id": 2,
      "title": "Dune",
      "author": "Frank Herbert",
      "year": 1965,
      "isbn": "9780441173571",
      "quantity": 3,
      "price": 18.99,
      "createdAt": "2024-01-01T10:05:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Invalid page number",
  "details": {
    "page": "must be >= 1"
  }
}
```

---

### GET /books/:id

**Description:** Récupérer les détails d'un livre spécifique.

**Request:**
```bash
GET /books/1
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Harry Potter and the Philosopher's Stone",
    "author": "J.K. Rowling",
    "year": 1997,
    "isbn": "9780747532699",
    "quantity": 5,
    "price": 15.99,
    "description": "Optional long description",
    "createdAt": "2024-01-01T10:00:00Z"
  }
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "error": "Book not found"
}
```

---

### POST /books/search

**Description:** Recherche multi-critères de livres (en stock ou non).

**Request Body:**
```json
{
  "title": "Harry",                 // optional, partial match, case-insensitive
  "author": "Rowling",              // optional
  "year": 1997,                     // optional, exact year
  "isbn": "9780747532699",          // optional, exact
  "inStock": true,                  // optional, default: true
  "page": 1,                        // optional
  "limit": 20                       // optional
}
```

**Request:**
```bash
POST /books/search
Content-Type: application/json

{
  "title": "Harry",
  "author": "Rowling",
  "inStock": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Harry Potter and the Philosopher's Stone",
      "author": "J.K. Rowling",
      "year": 1997,
      "isbn": "9780747532699",
      "quantity": 5,
      "price": 15.99
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 7,
    "pages": 1
  }
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Invalid search criteria",
  "details": {
    "year": "must be a valid number"
  }
}
```

---

### POST /books/batch

**Description:** Importer plusieurs livres en une seule requête (admin only).

**Request Body:**
```json
[
  {
    "title": "Le Seigneur des Anneaux: La Communauté de l'Anneau",
    "author": "J.R.R. Tolkien",
    "year": 1954,
    "isbn": "9782253048473",
    "quantity": 10,
    "price": 25.99
  },
  {
    "title": "Les Misérables",
    "author": "Victor Hugo",
    "year": 1862,
    "isbn": "9782823104455",
    "quantity": 5,
    "price": 22.00
  }
]
```

**Request:**
```bash
POST /books/batch
Content-Type: application/json

[ { ... }, { ... } ]
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "inserted": 2,
    "failed": 0,
    "details": [
      {
        "title": "Le Seigneur des Anneaux...",
        "status": "success",
        "id": 150
      },
      {
        "title": "Les Misérables",
        "status": "success",
        "id": 151
      }
    ]
  }
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Batch validation failed",
  "details": [
    {
      "index": 0,
      "title": "Le Seigneur des Anneaux...",
      "errors": [
        {
          "field": "isbn",
          "message": "ISBN must be unique, duplicate found"
        }
      ]
    },
    {
      "index": 1,
      "title": "Les Misérables",
      "errors": [
        {
          "field": "price",
          "message": "price must be > 0"
        }
      ]
    }
  ]
}
```

---

### PUT /books/:id

**Description:** Modifier un livre (admin only).

**Request Body:**
```json
{
  "title": "Harry Potter - Updated Title",
  "author": "J.K. Rowling",
  "year": 1997,
  "quantity": 7,
  "price": 16.99
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Harry Potter - Updated Title",
    ...
  }
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "error": "Book not found"
}
```

---

### DELETE /books/:id

**Description:** Supprimer un livre (admin only). L'archivage est préféré (soft delete).

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Book archived successfully"
}
```

---

## 🛒 ORDERS - Gestion des Commandes

### POST /orders

**Description:** Créer une nouvelle commande. Décrémente automatiquement le stock.

**Request Body:**
```json
{
  "items": [
    {
      "bookId": 1,
      "quantity": 2
    },
    {
      "bookId": 5,
      "quantity": 1
    }
  ],
  "customerEmail": "john@example.com",  // optional
  "customerName": "John Doe",           // optional
  "shippingAddress": "123 Main St..."   // optional
}
```

**Request:**
```bash
POST /orders
Content-Type: application/json

{
  "items": [
    { "bookId": 1, "quantity": 2 }
  ],
  "customerEmail": "john@example.com"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 1001,
    "orderNumber": "ORD-20240101-001",
    "status": "confirmed",
    "items": [
      {
        "bookId": 1,
        "title": "Harry Potter...",
        "quantity": 2,
        "unitPrice": 15.99,
        "subtotal": 31.98
      }
    ],
    "total": 31.98,
    "customerEmail": "john@example.com",
    "createdAt": "2024-01-01T15:30:00Z"
  }
}
```

**Response (400 Bad Request - Données invalides):**
```json
{
  "success": false,
  "error": "Invalid order data",
  "details": {
    "items": "must contain at least 1 item"
  }
}
```

**Response (409 Conflict - Stock insuffisant):**
```json
{
  "success": false,
  "error": "Insufficient stock",
  "details": {
    "bookId": 1,
    "title": "Harry Potter...",
    "requested": 10,
    "available": 5
  }
}
```

---

### GET /orders/:id

**Description:** Récupérer les détails d'une commande.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1001,
    "orderNumber": "ORD-20240101-001",
    "status": "confirmed",
    "items": [
      {
        "bookId": 1,
        "title": "Harry Potter and the Philosopher's Stone",
        "author": "J.K. Rowling",
        "quantity": 2,
        "unitPrice": 15.99,
        "subtotal": 31.98
      }
    ],
    "total": 31.98,
    "customerEmail": "john@example.com",
    "customerName": "John Doe",
    "shippingAddress": "123 Main St, City",
    "createdAt": "2024-01-01T15:30:00Z",
    "updatedAt": "2024-01-01T15:30:00Z"
  }
}
```

---

### GET /orders

**Description:** Lister toutes les commandes (pagination).

**Query Parameters:**
```
status  (string, optional)  - Filter: pending|confirmed|cancelled
page    (number, optional)  - Page number
limit   (number, optional)  - Items per page
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1001,
      "orderNumber": "ORD-20240101-001",
      "status": "confirmed",
      "total": 31.98,
      "customerEmail": "john@example.com",
      "createdAt": "2024-01-01T15:30:00Z"
    },
    {
      "id": 1002,
      "orderNumber": "ORD-20240101-002",
      "status": "confirmed",
      "total": 45.50,
      "customerEmail": "jane@example.com",
      "createdAt": "2024-01-01T16:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 42,
    "pages": 3
  }
}
```

---

### PUT /orders/:id

**Description:** Modifier le statut d'une commande.

**Request Body:**
```json
{
  "status": "cancelled"  // pending|confirmed|cancelled
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1001,
    "status": "cancelled",
    "message": "Order cancelled and stock restored"
  }
}
```

---

## 🎉 EVENTS - Gestion des Événements

### GET /events

**Description:** Récupérer la liste des événements.

**Query Parameters:**
```
status    (string, optional) - Filter: upcoming|past|all
page      (number, optional)
limit     (number, optional)
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Signature de l'auteur J.K. Rowling",
      "date": "2024-06-15T18:00:00Z",
      "location": "Librairie du Centre",
      "description": "Venez rencontrer l'auteur de Harry Potter...",
      "capacity": 50,
      "registeredCount": 25,
      "status": "planned",
      "createdAt": "2024-01-01T10:00:00Z"
    },
    {
      "id": 2,
      "name": "Club de lecture mensuel",
      "date": "2024-02-20T19:00:00Z",
      "location": "Librairie du Centre",
      "description": "Discussions autour du livre du mois...",
      "capacity": 30,
      "registeredCount": 12,
      "status": "planned",
      "createdAt": "2024-01-05T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 2,
    "pages": 1
  }
}
```

---

### GET /events/:id

**Description:** Récupérer les détails d'un événement.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Signature de l'auteur J.K. Rowling",
    "date": "2024-06-15T18:00:00Z",
    "location": "Librairie du Centre",
    "description": "Venez rencontrer l'auteur de Harry Potter pour une session de signature exclusive. Gratuit, places limitées à 50 personnes.",
    "capacity": 50,
    "registeredCount": 25,
    "status": "planned",
    "createdAt": "2024-01-01T10:00:00Z",
    "updatedAt": "2024-01-15T14:30:00Z"
  }
}
```

---

### POST /events

**Description:** Créer un nouvel événement (admin only).

**Request Body:**
```json
{
  "name": "Signature de l'auteur J.K. Rowling",
  "date": "2024-06-15T18:00:00Z",
  "location": "Librairie du Centre",
  "description": "Venez rencontrer l'auteur de Harry Potter...",
  "capacity": 50
}
```

**Validations:**
- `name`: non-vide, < 255 caractères
- `date`: future (ou aujourd'hui)
- `description`: < 500 caractères
- `capacity`: optionnel, > 0

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 3,
    "name": "Signature de l'auteur J.K. Rowling",
    "date": "2024-06-15T18:00:00Z",
    "location": "Librairie du Centre",
    "description": "Venez rencontrer l'auteur de Harry Potter...",
    "capacity": 50,
    "registeredCount": 0,
    "status": "planned",
    "createdAt": "2024-01-20T10:00:00Z"
  }
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Invalid event data",
  "details": {
    "date": "must be a future date",
    "description": "must be < 500 characters"
  }
}
```

---

### PUT /events/:id

**Description:** Modifier un événement (admin only).

**Request Body:**
```json
{
  "name": "Signature de l'auteur J.K. Rowling - Updated",
  "date": "2024-06-15T19:00:00Z",
  "description": "Updated description..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Signature de l'auteur J.K. Rowling - Updated",
    "date": "2024-06-15T19:00:00Z",
    "location": "Librairie du Centre",
    "description": "Updated description...",
    "capacity": 50,
    "status": "planned",
    "updatedAt": "2024-01-20T11:30:00Z"
  }
}
```

---

### PUT /events/:id/close

**Description:** Clôturer un événement (admin only).

**Request Body:**
```json
{
  "status": "closed"  // closed|cancelled
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Signature de l'auteur J.K. Rowling",
    "status": "closed",
    "message": "Event closed successfully"
  }
}
```

---

### DELETE /events/:id

**Description:** Supprimer un événement (admin only).

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Event deleted successfully"
}
```

---

## 🔑 Status Values

### Order Status
```
pending    - En attente de confirmation
confirmed  - Confirmée et traitée
cancelled  - Annulée (stock restauré)
```

### Event Status
```
planned    - À venir
ongoing    - En cours
closed     - Terminé
cancelled  - Annulé
```

---

## 🛡️ Error Handling

### Erreurs Courantes

**Invalid JSON:**
```json
{
  "success": false,
  "error": "Invalid JSON format"
}
```

**Missing Required Field:**
```json
{
  "success": false,
  "error": "Missing required field",
  "details": {
    "title": "field is required"
  }
}
```

**Database Error (Generic):**
```json
{
  "success": false,
  "error": "Server error occurred"
}
```

---

## 📊 Rate Limiting (Future)

*À implémenter:*
- 100 requêtes/minute par IP
- 10 requêtes/seconde par endpoint

---

## 📝 Exemple d'Utilisation Complète

### Scénario: Client recherche et passe commande

```bash
# 1. Chercher des livres
curl -X POST http://localhost:3000/api/books/search \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Harry",
    "author": "Rowling"
  }'

# 2. Récupérer détails du livre
curl http://localhost:3000/api/books/1

# 3. Passer commande
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "bookId": 1, "quantity": 2 }
    ],
    "customerEmail": "john@example.com"
  }'

# 4. Vérifier commande
curl http://localhost:3000/api/orders/1001
```

---

**Dernière mise à jour:** Janvier 2026
