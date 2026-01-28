<template>
  <div class="event-form-container">
    <!-- Modal de formulaire -->
    <div v-if="isOpen" class="form-modal">
      <div class="form-overlay" @click="closeForm"></div>

      <div class="form-content">
        <div class="form-header">
          <h2>{{ isEditing ? 'Modifier l\'événement' : 'Créer un événement' }}</h2>
          <button class="close-btn" @click="closeForm">✕</button>
        </div>

        <form @submit.prevent="handleSubmit" class="form">
          <!-- Nom de l'événement -->
          <div class="form-group">
            <label for="name">Nom de l'événement *</label>
            <input
              id="name"
              v-model="formData.name"
              type="text"
              placeholder="Ex: Signature de l'auteur"
              required
            />
            <span v-if="errors.name" class="error-text">{{ errors.name }}</span>
          </div>

          <!-- Date et heure -->
          <div class="form-group">
            <label for="date">Date et heure *</label>
            <input
              id="date"
              v-model="formData.date"
              type="datetime-local"
              required
            />
            <span v-if="errors.date" class="error-text">{{ errors.date }}</span>
          </div>

          <!-- Lieu -->
          <div class="form-group">
            <label for="location">Lieu</label>
            <input
              id="location"
              v-model="formData.location"
              type="text"
              placeholder="Ex: Librairie du Centre"
            />
          </div>

          <!-- Description -->
          <div class="form-group">
            <label for="description">Description</label>
            <textarea
              id="description"
              v-model="formData.description"
              placeholder="Décrivez l'événement..."
              rows="4"
            ></textarea>
            <small>{{ formData.description?.length || 0 }} / 500 caractères</small>
          </div>

          <!-- Capacité -->
          <div class="form-group">
            <label for="capacity">Nombre de places</label>
            <input
              id="capacity"
              v-model.number="formData.capacity"
              type="number"
              min="1"
              placeholder="Ex: 50"
            />
          </div>

          <!-- Boutons d'action -->
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" @click="closeForm">
              Annuler
            </button>
            <button type="submit" class="btn btn-primary" :disabled="submitting">
              {{ submitting ? 'Enregistrement...' : (isEditing ? 'Modifier' : 'Créer') }}
            </button>
          </div>
        </form>

        <!-- Erreur globale -->
        <div v-if="formError" class="form-error">
          {{ formError }}
        </div>
      </div>
    </div>

    <!-- Bouton pour ouvrir le formulaire -->
    <button v-if="!isOpen" class="btn btn-primary btn-large" @click="openForm">
      ➕ Créer un événement
    </button>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch } from 'vue';

const props = defineProps({
  modelValue: Boolean,
  initialData: Object,
  isEditing: Boolean,
});

const emit = defineEmits(['update:modelValue', 'submit']);

const isOpen = ref(props.modelValue);
const submitting = ref(false);
const formError = ref(null);

const formData = ref({
  name: '',
  date: '',
  location: '',
  description: '',
  capacity: null,
});

const errors = ref({});

// Watcher pour mettre à jour les données initiales
watch(() => props.initialData, (newData) => {
  if (newData) {
    formData.value = {
      name: newData.name || '',
      date: newData.date ? formatDateForInput(newData.date) : '',
      location: newData.location || '',
      description: newData.description || '',
      capacity: newData.capacity || null,
    };
  }
}, { deep: true });

// Watcher pour synchroniser isOpen
watch(() => props.modelValue, (newVal) => {
  isOpen.value = newVal;
  if (!newVal) {
    resetForm();
  }
});

function formatDateForInput(dateString) {
  const date = new Date(dateString);
  return date.toISOString().slice(0, 16);
}

const openForm = () => {
  isOpen.value = true;
  emit('update:modelValue', true);
};

const closeForm = () => {
  isOpen.value = false;
  emit('update:modelValue', false);
  resetForm();
};

const resetForm = () => {
  formData.value = {
    name: '',
    date: '',
    location: '',
    description: '',
    capacity: null,
  };
  errors.value = {};
  formError.value = null;
};

const handleSubmit = async () => {
  errors.value = {};
  formError.value = null;

  // Validation
  if (!formData.value.name?.trim()) {
    errors.value.name = 'Le nom est requis';
  }
  if (!formData.value.date) {
    errors.value.date = 'La date est requise';
  }
  if (formData.value.description?.length > 500) {
    errors.value.description = 'Max 500 caractères';
  }

  if (Object.keys(errors.value).length > 0) {
    return;
  }

  submitting.value = true;
  try {
    emit('submit', {
      ...formData.value,
      date: new Date(formData.value.date).toISOString(),
    });
  } catch (error) {
    formError.value = error.message;
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.event-form-container {
  position: relative;
}

/* Modal */
.form-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
}

.form-content {
  position: relative;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateY(-50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 2px solid #ecf0f1;
  background-color: #f8f9fa;
}

.form-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.3rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #7f8c8d;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

/* Formulaire */
.form {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 8px;
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.95rem;
}

.form-group input,
.form-group textarea {
  padding: 10px 12px;
  border: 1px solid #bdc3c7;
  border-radius: 4px;
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.form-group small {
  margin-top: 4px;
  color: #7f8c8d;
  font-size: 0.85rem;
}

.error-text {
  color: #e74c3c;
  font-size: 0.85rem;
  margin-top: 4px;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #ecf0f1;
}

.btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary {
  background-color: #3498db;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2980b9;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #ecf0f1;
  color: #2c3e50;
  border: 1px solid #bdc3c7;
}

.btn-secondary:hover {
  background-color: #d5dbdb;
}

.btn-large {
  padding: 12px 24px;
  font-size: 1rem;
  width: auto;
}

.form-error {
  background-color: #fadbd8;
  color: #c0392b;
  padding: 12px;
  border-radius: 4px;
  margin-top: 12px;
  font-size: 0.9rem;
}
</style>
