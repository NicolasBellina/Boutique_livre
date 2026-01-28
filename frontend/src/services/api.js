const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

/**
 * Helper pour faire des requêtes HTTP
 */
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const response = await fetch(url, {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.error || 'API Error');
    error.statusCode = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

/**
 * Service pour les livres
 */
export const bookService = {
  // Récupérer liste paginée des livres
  getBooks: (page = 1, limit = 20) =>
    fetchAPI(`/books?page=${page}&limit=${limit}`),

  // Récupérer détails d'un livre
  getBook: (id) =>
    fetchAPI(`/books/${id}`),

  // Recherche multi-critères
  searchBooks: (filters) =>
    fetchAPI('/books/search', {
      method: 'POST',
      body: JSON.stringify(filters),
    }),

  // Créer un livre (admin)
  createBook: (bookData) =>
    fetchAPI('/books', {
      method: 'POST',
      body: JSON.stringify(bookData),
    }),

  // Ajouter plusieurs livres (admin)
  createBatchBooks: (booksData) =>
    fetchAPI('/books/batch', {
      method: 'POST',
      body: JSON.stringify(booksData),
    }),

  // Modifier un livre (admin)
  updateBook: (id, bookData) =>
    fetchAPI(`/books/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bookData),
    }),

  // Supprimer un livre (admin)
  deleteBook: (id) =>
    fetchAPI(`/books/${id}`, {
      method: 'DELETE',
    }),
};

/**
 * Service pour les commandes
 */
export const orderService = {
  // Créer une commande
  createOrder: (orderData) =>
    fetchAPI('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    }),

  // Récupérer détails d'une commande
  getOrder: (id) =>
    fetchAPI(`/orders/${id}`),

  // Lister les commandes (admin)
  listOrders: (page = 1, limit = 20, status) => {
    let url = `/orders?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    return fetchAPI(url);
  },

  // Modifier le statut d'une commande
  updateOrderStatus: (id, status) =>
    fetchAPI(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
};

/**
 * Service pour les événements
 */
export const eventService = {
  // Lister les événements
  listEvents: (page = 1, limit = 20, status) => {
    let url = `/events?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    return fetchAPI(url);
  },

  // Récupérer détails d'un événement
  getEvent: (id) =>
    fetchAPI(`/events/${id}`),

  // Créer un événement
  createEvent: (eventData) =>
    fetchAPI('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    }),

  // Modifier un événement
  updateEvent: (id, eventData) =>
    fetchAPI(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    }),

  // Clôturer un événement
  closeEvent: (id, status = 'closed') =>
    fetchAPI(`/events/${id}/close`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  // Supprimer un événement
  deleteEvent: (id) =>
    fetchAPI(`/events/${id}`, {
      method: 'DELETE',
    }),
};
