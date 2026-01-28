<template>
  <div v-if="isOpen" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>📦 Détails de la Commande</h2>
        <button class="close-btn" @click="closeModal">✕</button>
      </div>

      <div class="modal-body">
        <!-- Header Info -->
        <div class="order-info-section">
          <div class="info-row">
            <span class="label">Numéro de commande:</span>
            <span class="value">{{ order.orderNumber }}</span>
          </div>
          <div class="info-row">
            <span class="label">Statut:</span>
            <span class="value status" :class="`status-${order.status}`">
              {{ getStatusLabel(order.status) }}
            </span>
          </div>
          <div class="info-row">
            <span class="label">Date:</span>
            <span class="value">{{ formatDate(order.createdAt) }}</span>
          </div>
        </div>

        <!-- Customer Info -->
        <div class="customer-section">
          <h3>👤 Informations Client</h3>
          <div class="info-row">
            <span class="label">Nom:</span>
            <span class="value">{{ order.customerName || 'Non spécifié' }}</span>
          </div>
          <div class="info-row">
            <span class="label">Email:</span>
            <span class="value">{{ order.customerEmail || 'Non spécifié' }}</span>
          </div>
          <div v-if="order.shippingAddress" class="info-row">
            <span class="label">Adresse:</span>
            <span class="value">{{ order.shippingAddress }}</span>
          </div>
        </div>

        <!-- Items -->
        <div class="items-section">
          <h3>📚 Articles Commandés</h3>
          <div class="items-table">
            <div class="table-header">
              <div class="col-title">Titre</div>
              <div class="col-qty">Quantité</div>
              <div class="col-price">Prix Unitaire</div>
              <div class="col-total">Total</div>
            </div>
            <div v-for="item in order.items" :key="item.id || item.bookId" class="table-row">
              <div class="col-title">
                <strong>{{ item.book?.title || 'Titre inconnu' }}</strong>
                <p class="author">{{ item.book?.author || 'Auteur inconnu' }}</p>
              </div>
              <div class="col-qty">{{ item.quantity }}</div>
              <div class="col-price">{{ formatPrice(parseFloat(item.unitPrice)) }}</div>
              <div class="col-total">{{ formatPrice(parseFloat(item.unitPrice) * item.quantity) }}</div>
            </div>
          </div>
        </div>

        <!-- Summary -->
        <div class="summary-section">
          <div class="summary-row">
            <span class="label">Nombre d'articles:</span>
            <span class="value">{{ getTotalItems() }}</span>
          </div>
          <div class="summary-row total-row">
            <span class="label">Montant Total:</span>
            <span class="value total-value">{{ formatPrice(parseFloat(order.total)) }}</span>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" @click="closeModal">Fermer</button>
        <button class="btn btn-primary" @click="downloadInvoice">
          📄 Télécharger Facture
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  isOpen: Boolean,
  order: Object,
});

const emit = defineEmits(['close', 'download-invoice']);

const closeModal = () => {
  emit('close');
};

const downloadInvoice = () => {
  emit('download-invoice', props.order);
};

const getStatusLabel = (status) => {
  const labels = {
    pending: '⏳ En attente',
    confirmed: '✅ Confirmée',
    cancelled: '❌ Annulée',
  };
  return labels[status] || status;
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(price);
};

const getTotalItems = () => {
  return props.order?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 700px;
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

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 2px solid #ecf0f1;
  background: linear-gradient(135deg, #ecf0f1 0%, #d5dbdb 100%);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #2c3e50;
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

.modal-body {
  padding: 20px;
}

/* Sections */
.order-info-section,
.customer-section,
.items-section,
.summary-section {
  margin-bottom: 2rem;
}

.order-info-section,
.customer-section,
.summary-section {
  background-color: #f9f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 4px solid #3498db;
}

.items-section h3,
.customer-section h3 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #ecf0f1;
}

.info-row:last-child {
  border-bottom: none;
}

.label {
  font-weight: 600;
  color: #2c3e50;
}

.value {
  color: #7f8c8d;
  text-align: right;
}

.status {
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.85rem;
}

.status-pending {
  background-color: #fff9e6;
  color: #f39c12;
}

.status-confirmed {
  background-color: #e6f9f0;
  color: #27ae60;
}

.status-cancelled {
  background-color: #f9e6e6;
  color: #e74c3c;
}

/* Items Table */
.items-table {
  margin-top: 1rem;
}

.table-header {
  display: grid;
  grid-template-columns: 2fr 80px 100px 100px;
  gap: 1rem;
  font-weight: 700;
  padding: 1rem;
  background-color: #ecf0f1;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 80px 100px 100px;
  gap: 1rem;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #ecf0f1;
}

.table-row:last-child {
  border-bottom: none;
}

.col-title strong {
  display: block;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.col-title .author {
  margin: 0;
  color: #7f8c8d;
  font-size: 0.85rem;
  font-style: italic;
}

.col-qty,
.col-price,
.col-total {
  text-align: right;
  color: #2c3e50;
}

.col-total {
  font-weight: 600;
  color: #27ae60;
}

/* Summary */
.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  font-size: 1rem;
}

.total-row {
  padding-top: 1rem;
  border-top: 2px solid #3498db;
  font-size: 1.2rem;
  font-weight: 700;
}

.total-value {
  color: #27ae60;
  font-size: 1.3rem;
}

/* Footer */
.modal-footer {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 20px;
  border-top: 2px solid #ecf0f1;
  background-color: #f9f9fa;
}

.btn {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary {
  background-color: #ecf0f1;
  color: #2c3e50;
  border: 1px solid #bdc3c7;
}

.btn-secondary:hover {
  background-color: #bdc3c7;
  transform: translateY(-2px);
}

.btn-primary {
  background-color: #3498db;
  color: white;
}

.btn-primary:hover {
  background-color: #2980b9;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(52, 152, 219, 0.4);
}

/* Responsive */
@media (max-width: 600px) {
  .modal-content {
    width: 95%;
  }

  .table-header,
  .table-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .col-qty,
  .col-price,
  .col-total {
    text-align: left;
    display: inline;
    margin-left: 1rem;
  }
}
</style>
