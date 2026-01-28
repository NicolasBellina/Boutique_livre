import { ref, computed } from 'vue';
import { eventService } from '../services/api.js';

export function useEvents() {
  const events = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const currentPage = ref(1);
  const limit = ref(20);
  const total = ref(0);

  /**
   * Charger la liste des événements
   */
  const loadEvents = async (page = 1, status = null) => {
    loading.value = true;
    error.value = null;
    try {
      currentPage.value = page;
      const response = await eventService.listEvents(page, limit.value, status);
      events.value = response.data || [];
      total.value = response.pagination?.total || 0;
    } catch (err) {
      error.value = err.message || 'Erreur lors du chargement des événements';
    } finally {
      loading.value = false;
    }
  };

  /**
   * Créer un nouvel événement
   */
  const createEvent = async (eventData) => {
    try {
      const response = await eventService.createEvent(eventData);
      // Ajouter l'événement à la liste
      events.value.unshift(response.data);
      return response.data;
    } catch (err) {
      throw new Error(err.message || 'Erreur lors de la création de l\'événement');
    }
  };

  /**
   * Modifier un événement
   */
  const updateEvent = async (id, eventData) => {
    try {
      const response = await eventService.updateEvent(id, eventData);
      const index = events.value.findIndex(e => e.id === id);
      if (index !== -1) {
        events.value[index] = response.data;
      }
      return response.data;
    } catch (err) {
      throw new Error(err.message || 'Erreur lors de la modification de l\'événement');
    }
  };

  /**
   * Clôturer un événement
   */
  const closeEvent = async (id, status = 'closed') => {
    try {
      const response = await eventService.closeEvent(id, status);
      const index = events.value.findIndex(e => e.id === id);
      if (index !== -1) {
        events.value[index] = response.data;
      }
      return response.data;
    } catch (err) {
      throw new Error(err.message || 'Erreur lors de la clôture de l\'événement');
    }
  };

  /**
   * Supprimer un événement
   */
  const deleteEvent = async (id) => {
    try {
      await eventService.deleteEvent(id);
      events.value = events.value.filter(e => e.id !== id);
    } catch (err) {
      throw new Error(err.message || 'Erreur lors de la suppression de l\'événement');
    }
  };

  const totalPages = computed(() => Math.ceil(total.value / limit.value));

  return {
    events: computed(() => events.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    currentPage: computed(() => currentPage.value),
    totalPages,
    total: computed(() => total.value),
    loadEvents,
    createEvent,
    updateEvent,
    closeEvent,
    deleteEvent,
  };
}
