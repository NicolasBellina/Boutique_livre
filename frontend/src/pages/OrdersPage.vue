<template>
  <div class="orders-page">
    <!-- Modal Détails Commande -->
    <OrderDetailModal
      :is-open="showDetailModal"
      :order="selectedOrder"
      @close="closeDetailModal"
      @download-invoice="handleDownloadInvoice"
    />

    <!-- Header -->
    <div class="header-section">
      <h2>📦 Mes Commandes</h2>
      <p>Historique de vos commandes</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>⏳ Chargement de vos commandes...</p>
    </div>

    <!-- Error -->
    <div v-if="error" class="error">
      <p>❌ {{ error }}</p>
      <button class="btn-retry" @click="loadOrders">Réessayer</button>
    </div>

    <!-- Content -->
    <div v-if="!loading && !error">
      <!-- Info -->
      <div v-if="orders.length > 0" class="info-box">
        ✅ {{ orders.length }} commande(s) trouvée(s)
      </div>

      <!-- Empty State -->
      <div v-if="orders.length === 0" class="empty-state">
        <div class="empty-icon">📭</div>
        <h3>Aucune commande</h3>
        <p>Vous n'avez pas encore passé de commandes.</p>
        <a href="#/books" class="btn-primary">🛍️ Commencer les achats</a>
      </div>

      <!-- Orders List -->
      <div v-else class="orders-list">
        <div v-for="order in orders" :key="order.id" class="order-card">
          <!-- Header -->
          <div class="order-header">
            <div>
              <h3>{{ order.orderNumber }}</h3>
              <p class="date">📅 {{ formatDate(order.createdAt) }}</p>
            </div>
            <div class="status" :class="`status-${order.status}`">
              {{ getStatusLabel(order.status) }}
            </div>
          </div>

          <!-- Items -->
          <div class="order-items">
            <div v-for="item in order.items" :key="item.id || item.bookId" class="order-item">
              <div class="item-info">
                <h4>{{ item.book?.title || 'Livre inconnu' }}</h4>
                <p>par {{ item.book?.author || 'Auteur inconnu' }}</p>
              </div>
              <div class="item-qty">{{ item.quantity }}x</div>
              <div class="item-price">{{ formatPrice(parseFloat(item.unitPrice)) }}</div>
              <div class="item-total">{{ formatPrice(parseFloat(item.unitPrice) * item.quantity) }}</div>
            </div>
          </div>

          <!-- Footer -->
          <div class="order-footer">
            <div class="total">
              <span>💰 Total:</span>
              <strong>{{ formatPrice(parseFloat(order.total)) }}</strong>
            </div>
            <div class="actions">
              <button class="btn btn-view" title="Voir détails" @click="handleViewOrder(order.id)">👁️ <span>Voir</span></button>
              <button class="btn btn-download" title="Télécharger facture" @click="handleDownloadInvoice(order.orderNumber)">📄 <span>Facture</span></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { orderService } from '../services/api.js';
import { useOrderEvents } from '../composables/useOrderEvents.js';
import OrderDetailModal from '../components/OrderDetailModal.vue';
import { downloadInvoice, printInvoice } from '../utils/invoiceGenerator.js';

const orders = ref([]);
const loading = ref(false);
const error = ref(null);
const showDetailModal = ref(false);
const selectedOrder = ref(null);

const { orderCreatedEvent } = useOrderEvents();

const loadOrders = async () => {
  loading.value = true;
  error.value = null;
  try {
    console.log('📦 Appel API listOrders...');
    const response = await orderService.listOrders();
    console.log('📦 Réponse reçue:', response);
    orders.value = response.data || [];
    console.log('📦 Commandes mises à jour:', orders.value);
  } catch (err) {
    console.error('❌ Erreur loadOrders:', err);
    error.value = err.message || 'Erreur lors du chargement des commandes';
  } finally {
    loading.value = false;
  }
};

// Recharger quand une commande est créée
watch(orderCreatedEvent, (newEvent) => {
  if (newEvent) {
    console.log('Nouvelle commande détectée, rechargement...');
    loadOrders();
  }
});

const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(price);
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

const getStatusLabel = (status) => {
  const labels = {
    pending: '⏳ En attente',
    confirmed: '✅ Confirmée',
    cancelled: '❌ Annulée',
  };
  return labels[status] || status;
};

const handleViewOrder = (orderId) => {
  console.log('👁️ Voir détails commande:', orderId);
  const order = orders.value.find(o => o.id === orderId);
  if (order) {
    selectedOrder.value = order;
    showDetailModal.value = true;
  }
};

const closeDetailModal = () => {
  showDetailModal.value = false;
  selectedOrder.value = null;
};

const handleDownloadInvoice = (order) => {
  console.log('📄 Télécharger facture:', order.orderNumber);
  downloadInvoice(order);
};

onMounted(() => {
  loadOrders();
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

.orders-page {
  padding: 2rem 0;
}

/* Header */
.header-section {
  margin-bottom: 2rem;
}

.header-section h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.8rem;
  color: var(--text-dark);
}

.header-section p {
  margin: 0;
  color: #7f8c8d;
  font-size: 0.9rem;
}

/* Loading */
.loading {
  text-align: center;
  padding: 3rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #ecf0f1 100%);
  border-radius: 8px;
}

.spinner {
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 4px solid var(--light-bg);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Error */
.error {
  background-color: #fadbd8;
  color: #c0392b;
  padding: 2rem;
  border-radius: 8px;
  border-left: 4px solid var(--danger);
}

.error p {
  margin: 0 0 1rem 0;
  font-weight: 600;
}

.btn-retry {
  background-color: var(--danger);
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-retry:hover {
  background-color: #c0392b;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.4);
}

/* Info Box */
.info-box {
  background: linear-gradient(135deg, #d6eaf8 0%, #c5e1f5 100%);
  color: var(--primary);
  padding: 1.2rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  font-weight: 600;
  border-left: 4px solid var(--primary);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin: 1rem 0 0.5rem 0;
  color: var(--text-dark);
  font-size: 1.3rem;
}

.empty-state p {
  margin: 0 0 2rem 0;
  color: #7f8c8d;
}

.btn-primary {
  display: inline-block;
  background-color: var(--primary);
  color: white;
  padding: 12px 24px;
  text-decoration: none;
  border-radius: 6px;
  transition: all 0.3s;
  font-weight: 600;
}

.btn-primary:hover {
  background-color: #2980b9;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(52, 152, 219, 0.4);
}

/* Orders List */
.orders-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Order Card */
.order-card {
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.order-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
  border-color: var(--primary);
}

/* Order Header */
.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: linear-gradient(135deg, var(--light-bg) 0%, #d5dbdb 100%);
  border-bottom: 2px solid var(--border-color);
}

.order-header h3 {
  margin: 0 0 0.3rem 0;
  color: var(--text-dark);
  font-weight: 700;
  font-family: 'Courier New', monospace;
}

.order-header .date {
  margin: 0;
  color: #7f8c8d;
  font-size: 0.85rem;
}

.status {
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 0.85rem;
  white-space: nowrap;
  margin-left: 1rem;
}

.status-pending {
  background-color: #fff9e6;
  color: var(--warning);
  border: 1px solid var(--warning);
}

.status-confirmed {
  background-color: #e6f9f0;
  color: var(--success);
  border: 1px solid var(--success);
}

.status-cancelled {
  background-color: #f9e6e6;
  color: var(--danger);
  border: 1px solid var(--danger);
}

/* Order Items */
.order-items {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.order-item {
  display: grid;
  grid-template-columns: 2fr 80px 80px 100px;
  gap: 1rem;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.order-item:last-child {
  border-bottom: none;
}

.item-info h4 {
  margin: 0 0 0.3rem 0;
  color: var(--text-dark);
  font-size: 0.95rem;
  font-weight: 600;
}

.item-info p {
  margin: 0;
  color: #7f8c8d;
  font-size: 0.8rem;
  font-style: italic;
}

.item-qty {
  text-align: center;
  font-weight: 700;
}

.item-price {
  text-align: right;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.item-total {
  text-align: right;
  font-weight: 700;
  color: var(--success);
}

/* Order Footer */
.order-footer {
  padding: 1.5rem;
  background-color: #f9f9fa;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.total {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
}

.total strong {
  color: var(--success);
  font-size: 1.3rem;
}

/* Buttons */
.actions {
  display: flex;
  gap: 0.5rem;
}

.btn {
  padding: 10px 14px;
  border: 2px solid var(--border-color);
  background-color: white;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  white-space: nowrap;
}

.btn span {
  display: none;
}

.btn-view {
  color: var(--text-dark);
}

.btn-view:hover {
  background-color: var(--primary);
  color: white;
  border-color: var(--primary);
  transform: scale(1.15);
  box-shadow: 0 8px 24px rgba(52, 152, 219, 0.5);
}

.btn-download {
  color: var(--text-dark);
}

.btn-download:hover {
  background-color: var(--success);
  color: white;
  border-color: var(--success);
  transform: scale(1.15);
  box-shadow: 0 8px 24px rgba(39, 174, 96, 0.5);
}

/* Responsive */
@media (max-width: 1024px) {
  .btn span {
    display: inline;
  }
}

@media (max-width: 768px) {
  .order-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .status {
    margin-left: 0;
  }

  .order-footer {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .actions {
    width: 100%;
  }

  .btn {
    flex: 1;
    padding: 12px;
  }

  .btn span {
    display: inline;
  }

  .order-item {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .item-qty,
  .item-price,
  .item-total {
    display: inline;
    margin-left: 1rem;
  }
}
</style>
