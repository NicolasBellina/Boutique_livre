<template>
  <div id="app" class="app">
    <!-- Header/Navigation -->
    <header class="header">
      <div class="container">
        <div class="header-content">
          <h1 class="logo">📚 LibrairiePro</h1>
          <nav class="nav">
            <a href="#/books" class="nav-link" @click="currentPage = 'books'">Catalogue</a>
            <a href="#/orders" class="nav-link" @click="currentPage = 'orders'">Mes Commandes</a>
            <a href="#/events" class="nav-link" @click="currentPage = 'events'">Événements</a>
          </nav>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="main">
      <div class="container">
        <!-- Books Page -->
        <div v-if="currentPage === 'books'" class="page">
          <h2>Catalogue des Livres</h2>
          <BooksPage />
        </div>

        <!-- Orders Page -->
        <div v-if="currentPage === 'orders'" class="page">
          <h2>Mes Commandes</h2>
          <OrdersPage />
        </div>

        <!-- Events Page -->
        <div v-if="currentPage === 'events'" class="page">
          <h2>Événements</h2>
          <EventsPage />
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="footer">
      <div class="container">
        <p>&copy; 2024 LibrairiePro - Gestion de Librairie. Tous droits réservés.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import BooksPage from './pages/BooksPage.vue';
import OrdersPage from './pages/OrdersPage.vue';
import EventsPage from './pages/EventsPage.vue';

const currentPage = ref('books');
</script>

<style scoped>
:root {
  --primary-color: #2c3e50;
  --secondary-color: #3498db;
  --success-color: #27ae60;
  --danger-color: #e74c3c;
  --light-bg: #ecf0f1;
  --border-color: #bdc3c7;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f8f9fa;
  color: var(--primary-color);
}

.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* Header */
.header {
  background-color: var(--primary-color);
  color: black;
  padding: 1rem 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
}

.nav {
  display: flex;
  gap: 2rem;
}

.nav-link {
  color: black;
  text-decoration: none;
  cursor: pointer;
  transition: opacity 0.3s;
  padding: 0.5rem 1rem;
  border-radius: 4px;
}

.nav-link:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

/* Container */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Main */
.main {
  flex: 1;
  padding: 2rem 0;
}

.page {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.page h2 {
  margin-bottom: 2rem;
  color: var(--primary-color);
  font-size: 2rem;
  border-bottom: 3px solid var(--secondary-color);
  padding-bottom: 1rem;
}

/* Footer */
.footer {
  background-color: var(--primary-color);
  color: black;
  text-align: center;
  padding: 2rem 0;
  margin-top: 4rem;
}

/* Responsive */
@media (max-width: 768px) {
  .nav {
    gap: 1rem;
  }

  .nav-link {
    padding: 0.5rem;
    font-size: 0.9rem;
  }

  .logo {
    font-size: 1.2rem;
  }

  .page h2 {
    font-size: 1.5rem;
  }
}
</style>
