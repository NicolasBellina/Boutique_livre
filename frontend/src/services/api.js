import { getAccessToken } from '../lib/supabase'

// Si VITE_API_BASE_URL est défini (préféré), l'utiliser. Sinon utiliser Supabase REST v1 si VITE_SUPABASE_URL est disponible.
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || null;
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || null;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (SUPABASE_URL ? `${SUPABASE_URL}/rest/v1` : '/api');

/**
 * Helper pour faire des requêtes HTTP
 */
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      // Fournir la clé publishable pour Supabase REST si définie
      ...(SUPABASE_ANON_KEY ? { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } : {}),
    },
  };

  // Récupérer token Supabase si connecté et l'ajouter aux headers
  const token = await getAccessToken();
  if (token) {
    options.headers = {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    };
  }

  let response;
  try {
    response = await fetch(url, {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    });
  } catch (err) {
    // Erreur réseau (CORS bloqué, DNS inconnu, serveur offline...)
    const error = new Error(`Network error when fetching ${url}: ${err.message}`);
    error.cause = err;
    throw error;
  }

  // Lire la réponse en fonction du Content-Type pour éviter les erreurs de parsing JSON
  const contentType = (response.headers.get('content-type') || '').toLowerCase();
  let data;
  try {
    if (contentType.includes('application/json')) {
      // tentative normale pour JSON
      data = await response.json();
    } else {
      // fallback : lire en texte (utile si le serveur renvoie une page HTML d'erreur)
      data = await response.text();
    }
  } catch (parseErr) {
    // Erreur lors du parsing JSON (contenu invalide)
    const text = await response.text().catch(() => null);
    const error = new Error(`Invalid JSON response from ${url}`);
    error.statusCode = response.status;
    error.data = text ?? String(parseErr.message);
    throw error;
  }

  if (!response.ok) {
    const message = (data && typeof data === 'object' && (data.error || data.message)) ||
      (typeof data === 'string' && data) ||
      `API Error ${response.status} ${response.statusText}`;
    const error = new Error(message);
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
