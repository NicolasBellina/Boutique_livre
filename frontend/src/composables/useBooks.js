import { ref, computed } from 'vue';
import { bookService } from '../services/api.js';

export function useBooks() {
  const books = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const currentPage = ref(1);
  const limit = ref(20);
  const total = ref(0);
  const searchFilters = ref({});

  /**
   * Charger liste des livres
   */
  const loadBooks = async (page = 1) => {
    loading.value = true;
    error.value = null;
    try {
      currentPage.value = page;
      const response = await bookService.getBooks(page, limit.value);
      books.value = response.data;
      total.value = response.pagination.total;
    } catch (err) {
      error.value = err.message || 'Erreur lors du chargement des livres';
    } finally {
      loading.value = false;
    }
  };

  /**
   * Rechercher des livres
   */
  const searchBooks = async (filters, page = 1) => {
    loading.value = true;
    error.value = null;
    try {
      searchFilters.value = filters;
      currentPage.value = page;
      const response = await bookService.searchBooks({
        ...filters,
        page,
        limit: limit.value,
      });
      books.value = response.data;
      total.value = response.pagination.total;
    } catch (err) {
      error.value = err.message || 'Erreur lors de la recherche';
    } finally {
      loading.value = false;
    }
  };

  /**
   * Récupérer détails d'un livre
   */
  const getBook = async (id) => {
    try {
      return await bookService.getBook(id);
    } catch (err) {
      error.value = err.message;
      return null;
    }
  };

  const totalPages = computed(() => Math.ceil(total.value / limit.value));

  return {
    books: computed(() => books.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    currentPage: computed(() => currentPage.value),
    totalPages,
    total: computed(() => total.value),
    loadBooks,
    searchBooks,
    getBook,
  };
}
