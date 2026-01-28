<template>
  <div class="books-page">
    <!-- CartSidebar Component -->
    <CartSidebar @order-created="onOrderCreated" />

    <!-- Barre de recherche -->
    <div class="search-section">
      <div class="search-form">
        <div class="form-group">
          <label>Titre</label>
          <input
            v-model="filters.title"
            type="text"
            placeholder="Rechercher par titre..."
            @keyup.enter="handleSearch"
          />
        </div>

        <div class="form-group">
          <label>Auteur</label>
          <input
            v-model="filters.author"
            type="text"
            placeholder="Rechercher par auteur..."
            @keyup.enter="handleSearch"
          />
        </div>

        <div class="form-group">
          <label>Année</label>
          <input
            v-model="filters.year"
            type="number"
            placeholder="Ex: 1997"
            @keyup.enter="handleSearch"
          />
        </div>

        <div class="form-group">
          <label>
            <input v-model="filters.inStock" type="checkbox" />
            En stock uniquement
          </label>
        </div>

        <button class="btn btn-primary" @click="handleSearch">Rechercher</button>
        <button class="btn btn-secondary" @click="handleReset">Réinitialiser</button>
      </div>
    </div>

    <!-- Loading & Error States -->
    <div v-if="loading" class="loading">Chargement...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <!-- Books Grid -->
    <div v-if="!loading && books.length > 0" class="books-grid">
      <div v-for="book in books" :key="book.id" class="book-card">
        <div class="book-title">{{ book.title }}</div>
        <div class="book-author">{{ book.author }}</div>
        <div class="book-year" v-if="book.year">{{ book.year }}</div>
        <div class="book-isbn">ISBN: {{ book.isbn }}</div>
        <div class="book-price">{{ formatPrice(book.price) }}</div>
        <div class="book-stock" :class="{ 'out-of-stock': book.quantity === 0 }">
          Stock: {{ book.quantity }}
        </div>
        <button
          v-if="book.quantity > 0"
          class="btn btn-success"
          @click="addToCart(book)"
        >
          Ajouter au panier
        </button>
        <button v-else class="btn btn-disabled" disabled>Rupture de stock</button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && books.length === 0" class="empty-state">
      <p>Aucun livre trouvé. Essayez d'autres critères de recherche.</p>
    </div>

    <!-- Pagination -->
    <div v-if="!loading && totalPages > 1" class="pagination">
      <button
        v-if="currentPage > 1"
        class="btn btn-secondary"
        @click="loadBooks(currentPage - 1)"
      >
        ← Précédent
      </button>
      <span class="pagination-info">
        Page {{ currentPage }} sur {{ totalPages }}
      </span>
      <button
        v-if="currentPage < totalPages"
        class="btn btn-secondary"
        @click="loadBooks(currentPage + 1)"
      >
        Suivant →
      </button>
    </div>

    <!-- Notification -->
    <div v-if="notification" class="notification" :class="notification.type">
      {{ notification.message }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useBooks } from '../composables/useBooks.js';
import { useCart } from '../composables/useCart.js';
import CartSidebar from '../components/CartSidebar.vue';

const { books, loading, error, currentPage, totalPages, loadBooks, searchBooks } = useBooks();
const { addToCart: addToCartFn, formatPrice } = useCart();

const filters = ref({
  title: '',
  author: '',
  year: '',
  inStock: true,
});

const notification = ref(null);

const handleSearch = async () => {
  const searchParams = {
    ...filters.value,
    page: 1,
  };
  // Nettoyer les valeurs vides
  Object.keys(searchParams).forEach(key => {
    if (searchParams[key] === '' || searchParams[key] === null) {
      delete searchParams[key];
    }
  });

  await searchBooks(searchParams);
};

const handleReset = async () => {
  filters.value = {
    title: '',
    author: '',
    year: '',
    inStock: true,
  };
  await loadBooks(1);
};

const addToCart = (book) => {
  addToCartFn(book);
  notification.value = {
    type: 'success',
    message: `"${book.title}" ajouté au panier!`,
  };
  setTimeout(() => {
    notification.value = null;
  }, 3000);
};

onMounted(async () => {
  await loadBooks(1);
});
</script>

<style scoped>
.books-page {
  padding: 2rem 0;
}

/* Search Form */
.search-section {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.search-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  align-items: flex-end;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input[type='text'],
.form-group input[type='number'] {
  padding: 0.75rem;
  border: 1px solid #bdc3c7;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input[type='checkbox'] {
  margin-right: 0.5rem;
}

/* Books Grid */
.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.book-card {
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  display: flex;
  flex-direction: column;
}

.book-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.book-title {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  min-height: 2.4rem;
}

.book-author {
  color: #7f8c8d;
  margin-bottom: 0.5rem;
  font-style: italic;
}

.book-year {
  color: #95a5a6;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.book-isbn {
  color: #95a5a6;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
  font-family: monospace;
}

.book-price {
  font-size: 1.3rem;
  font-weight: bold;
  color: #27ae60;
  margin-bottom: 0.5rem;
}

.book-stock {
  margin-bottom: 1rem;
  font-weight: 500;
  color: #27ae60;
}

.book-stock.out-of-stock {
  color: #e74c3c;
}

.book-card button {
  margin-top: auto;
}

/* Buttons */
.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
  font-weight: 500;
}

.btn-primary {
  background-color: #3498db;
  color: white;
}

.btn-primary:hover {
  background-color: #2980b9;
}

.btn-secondary {
  background-color: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background-color: #7f8c8d;
}

.btn-success {
  background-color: #27ae60;
  color: white;
  width: 100%;
}

.btn-success:hover {
  background-color: #229954;
}

.btn-disabled {
  background-color: #bdc3c7;
  color: white;
  cursor: not-allowed;
  width: 100%;
}

/* States */
.loading,
.error {
  padding: 2rem;
  text-align: center;
  font-size: 1.1rem;
}

.error {
  background-color: #fadbd8;
  color: #c0392b;
  border-radius: 4px;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #7f8c8d;
  font-size: 1.1rem;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  margin-top: 2rem;
}

.pagination-info {
  font-weight: 500;
}

/* Notification */
.notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 1rem 1.5rem;
  border-radius: 4px;
  animation: slideIn 0.3s ease-out;
}

.notification.success {
  background-color: #d5f4e6;
  color: #27ae60;
  border: 1px solid #27ae60;
}

@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .search-form {
    grid-template-columns: 1fr;
  }

  .books-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1rem;
  }

  .pagination {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
