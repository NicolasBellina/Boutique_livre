<template>
  <div class="events-page">
    <!-- Bouton Créer événement -->
    <div class="header-section">
      <div class="header-info">
        <p>Gérez les événements de votre librairie</p>
      </div>
    </div>

    <!-- Modal Formulaire -->
    <EventForm
      v-model="showForm"
      :initial-data="editingEvent"
      :is-editing="isEditing"
      @submit="handleSubmitForm"
    />

    <!-- Filtres -->
    <div class="filters">
      <button
        v-for="statusFilter in statusFilters"
        :key="statusFilter.value"
        :class="['filter-btn', { active: selectedStatus === statusFilter.value }]"
        @click="handleStatusFilter(statusFilter.value)"
      >
        {{ statusFilter.label }}
      </button>
    </div>

    <!-- Loading & Error -->
    <div v-if="loading" class="loading">⏳ Chargement des événements...</div>
    <div v-if="error" class="error">❌ {{ error }}</div>

    <!-- Notification -->
    <div v-if="notification" class="notification" :class="notification.type">
      {{ notification.message }}
    </div>

    <!-- Événements -->
    <div v-if="!loading && !error">
      <!-- Pas d'événements -->
      <div v-if="events.length === 0" class="empty-state">
        <p>📭 Aucun événement pour le moment</p>
        <p class="empty-text">Cliquez sur "➕ Créer un événement" pour en ajouter un!</p>
      </div>

      <!-- Grille d'événements -->
      <div v-else class="events-grid">
        <div v-for="event in events" :key="event.id" class="event-card">
          <!-- Statut -->
          <div class="event-badge" :class="`status-${event.status}`">
            {{ getStatusLabel(event.status) }}
          </div>

          <!-- Contenu -->
          <div class="event-content">
            <h2 class="event-title">{{ event.name }}</h2>

            <!-- Date -->
            <div class="event-meta">
              <span class="meta-item">
                📅 {{ formatDate(event.date) }}
              </span>
              <span v-if="event.location" class="meta-item">
                📍 {{ event.location }}
              </span>
              <span v-if="event.capacity" class="meta-item">
                👥 {{ event.capacity }} places
              </span>
            </div>

            <!-- Description -->
            <p v-if="event.description" class="event-description">
              {{ event.description }}
            </p>

            <!-- Boutons d'action -->
            <div class="event-actions">
              <button class="btn btn-edit" @click="handleEditEvent(event)" title="Modifier l'événement">
                <span class="btn-icon">✏️</span>
                <span class="btn-text">Modifier</span>
              </button>
              <button
                v-if="event.status !== 'closed'"
                class="btn btn-close"
                @click="handleCloseEvent(event.id)"
                title="Clôturer l'événement"
              >
                <span class="btn-icon">���</span>
                <span class="btn-text">Clôturer</span>
              </button>
              <button
                class="btn btn-delete"
                @click="handleDeleteEvent(event.id)"
                title="Supprimer l'événement"
              >
                <span class="btn-icon">🗑️</span>
                <span class="btn-text">Supprimer</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useEvents } from '../composables/useEvents.js';
import EventForm from '../components/EventForm.vue';

const {
  events,
  loading,
  error,
  loadEvents,
  createEvent,
  updateEvent,
  closeEvent,
  deleteEvent,
} = useEvents();

const selectedStatus = ref('upcoming');
const showForm = ref(false);
const isEditing = ref(false);
const editingEvent = ref(null);
const notification = ref(null);

const statusFilters = [
  { label: '📅 À venir', value: 'upcoming' },
  { label: '✅ Tous', value: null },
  { label: '🏁 Passés', value: 'past' },
];

const handleStatusFilter = (status) => {
  selectedStatus.value = status;
  loadEvents(1, status);
};

const openCreateForm = () => {
  isEditing.value = false;
  editingEvent.value = null;
  showForm.value = true;
};

const handleSubmitForm = async (eventData) => {
  try {
    if (isEditing.value && editingEvent.value) {
      // Modifier un événement existant
      await updateEvent(editingEvent.value.id, eventData);
      showNotification('✅ Événement modifié avec succès!', 'success');
    } else {
      // Créer un nouvel événement
      await createEvent(eventData);
      showNotification('✅ Événement créé avec succès!', 'success');
    }
    showForm.value = false;
    isEditing.value = false;
    editingEvent.value = null;
    await loadEvents(1, selectedStatus.value);
  } catch (err) {
    showNotification(`❌ ${err.message}`, 'error');
  }
};

const handleEditEvent = (event) => {
  isEditing.value = true;
  editingEvent.value = { ...event };
  showForm.value = true;
};

const handleCloseEvent = async (eventId) => {
  if (!confirm('Êtes-vous sûr de vouloir clôturer cet événement?')) {
    return;
  }

  try {
    await closeEvent(eventId, 'closed');
    showNotification('✅ Événement clôturé!', 'success');
    await loadEvents(1, selectedStatus.value);
  } catch (err) {
    showNotification(`❌ ${err.message}`, 'error');
  }
};

const handleDeleteEvent = async (eventId) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement? Cette action est irréversible.')) {
    return;
  }

  try {
    await deleteEvent(eventId);
    showNotification('✅ Événement supprimé!', 'success');
    await loadEvents(1, selectedStatus.value);
  } catch (err) {
    showNotification(`❌ ${err.message}`, 'error');
  }
};

const showNotification = (message, type = 'info') => {
  notification.value = { message, type };
  setTimeout(() => {
    notification.value = null;
  }, 3000);
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStatusLabel = (status) => {
  const labels = {
    planned: '📋 Planifié',
    ongoing: '🎉 En cours',
    closed: '✅ Terminé',
    cancelled: '❌ Annulé',
  };
  return labels[status] || status;
};

onMounted(async () => {
  await loadEvents(1, 'upcoming');
});
</script>

<style scoped>
:root {
  --primary: #3498db;
  --success: #27ae60;
  --danger: #e74c3c;
  --warning: #f39c12;
  --light-bg: #ecf0f1;
  --text-dark: #2c3e50;
  --border-color: #bdc3c7;
}

.events-page {
  padding: 2rem 0;
}

/* Header Section */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
  flex-wrap: wrap;
  gap: 2rem;
}

.header-info {
  flex: 1;
  min-width: 200px;
}

.header-info p {
  margin: 0;
  color: #7f8c8d;
  font-size: 1rem;
  font-weight: 500;
}

.btn-create {
  padding: 12px 24px;
  background-color: var(--primary);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.3);
  white-space: nowrap;
}

.btn-create:hover {
  background-color: #2980b9;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.4);
}

/* Filtres */
.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 10px 20px;
  border: 2px solid var(--border-color);
  background-color: white;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
  color: var(--text-dark);
}

.filter-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.filter-btn.active {
  background-color: var(--primary);
  border-color: var(--primary);
  color: white;
}

/* Loading & Error */
.loading,
.error {
  padding: 2rem;
  text-align: center;
  font-size: 1.1rem;
  border-radius: 4px;
}

.error {
  background-color: #fadbd8;
  color: #c0392b;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #7f8c8d;
  font-size: 1.1rem;
}

.empty-text {
  margin-top: 0.5rem;
  font-size: 0.95rem;
  color: #95a5a6;
}

/* Grille d'événements */
.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
}

/* Carte d'événement */
.event-card {
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  flex-direction: column;
}

.event-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.event-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  z-index: 10;
}

.status-planned {
  background-color: #d6eaf8;
  color: var(--primary);
}

.status-ongoing {
  background-color: #d5f4e6;
  color: var(--success);
}

.status-closed {
  background-color: #e8daef;
  color: #8e44ad;
}

.status-cancelled {
  background-color: #fadbd8;
  color: var(--danger);
}

.event-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.event-title {
  margin: 0 0 1rem 0;
  font-size: 1.3rem;
  color: var(--text-dark);
  line-height: 1.3;
}

.event-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: #7f8c8d;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.event-description {
  margin: 0 0 1rem 0;
  color: #555;
  font-size: 0.95rem;
  line-height: 1.5;
  flex: 1;
}

/* Boutons d'action */
.event-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: auto;
}

.btn {
  flex: 1;
  padding: 10px 12px;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.85rem;
}

.btn-icon {
  font-size: 1rem;
}

.btn-text {
  display: none;
}

.btn-edit {
  background-color: #ecf0f1;
  color: var(--text-dark);
  border: 1px solid var(--border-color);
}

.btn-edit:hover {
  background-color: #bdc3c7;
  color: white;
}

.btn-close {
  background-color: #d5f4e6;
  color: var(--success);
  border: 1px solid var(--success);
}

.btn-close:hover {
  background-color: var(--success);
  color: white;
}

.btn-delete {
  background-color: #fadbd8;
  color: var(--danger);
  border: 1px solid var(--danger);
}

.btn-delete:hover {
  background-color: var(--danger);
  color: white;
}

/* Notification */
.notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 15px 20px;
  border-radius: 4px;
  font-weight: 600;
  animation: slideIn 0.3s ease-out;
  z-index: 250;
}

.notification.success {
  background-color: #d5f4e6;
  color: var(--success);
  border: 1px solid var(--success);
}

.notification.error {
  background-color: #fadbd8;
  color: var(--danger);
  border: 1px solid var(--danger);
}

.notification.info {
  background-color: #d6eaf8;
  color: var(--primary);
  border: 1px solid var(--primary);
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
@media (max-width: 1024px) {
  .btn-text {
    display: inline;
  }
}

@media (max-width: 768px) {
  .events-grid {
    grid-template-columns: 1fr;
  }

  .filter-btn {
    flex: 1;
    min-width: auto;
  }

  .header-section {
    flex-direction: column;
    margin-bottom: 2rem;
  }

  .btn-create {
    width: 100%;
  }

  .event-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }

  .btn-text {
    display: inline;
  }
}
</style>


