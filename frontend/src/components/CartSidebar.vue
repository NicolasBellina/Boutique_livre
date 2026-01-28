<template>
  <div class="cart-container" :class="{ 'is-open': isOpen }">
    <!-- Bouton flottant du panier -->
    <button
      class="cart-button"
      @click="toggleCart"
      type="button"
      aria-haspopup="dialog"
      aria-controls="cart-sidebar"
      :aria-expanded="isOpen"
      :aria-hidden="isOpen"
      :tabindex="isOpen ? -1 : 0"
    >
      🛒 Panier
      <span v-if="totalItems > 0" class="cart-badge" aria-live="polite">{{ totalItems }}</span>
    </button>

    <!-- Sidebar du panier -->
    <div
      v-if="isOpen"
      id="cart-sidebar"
      class="cart-sidebar"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-title"
    >
      <!-- Header -->
      <div class="cart-header">
        <h2 id="cart-title">Mon Panier</h2>
        <button class="close-btn" @click="toggleCart" type="button" aria-label="Fermer le panier">✕</button>
      </div>

      <!-- Contenu du panier -->
      <div class="cart-content">
        <!-- Panier vide -->
        <div v-if="cart.length === 0" class="empty-cart">
          <p>📚 Votre panier est vide</p>
          <p class="empty-text">Ajoutez des livres pour commencer!</p>
        </div>

        <!-- Articles du panier -->
        <div v-else class="cart-items">
          <div v-for="item in cart" :key="item.id" class="cart-item">
            <!-- Infos du livre -->
            <div class="item-info">
              <h3>{{ item.title }}</h3>
              <p class="author">{{ item.author }}</p>
              <p class="price">{{ formatPrice(item.price) }}</p>
            </div>

            <!-- Contrôles de quantité -->
            <div class="quantity-controls">
              <button
                class="qty-btn"
                @click="decreaseQuantity(item.id)"
                :disabled="item.cartQuantity <= 1"
                :aria-disabled="item.cartQuantity <= 1"
                :aria-label="'Diminuer la quantité de ' + item.title"
                type="button"
              >
                −
              </button>
              <input
                type="number"
                v-model.number="item.cartQuantity"
                min="1"
                :max="item.quantity"
                class="qty-input"
                :aria-label="'Quantité de ' + item.title"
              />
              <button
                class="qty-btn"
                @click="increaseQuantity(item.id)"
                :disabled="item.cartQuantity >= item.quantity"
                :aria-disabled="item.cartQuantity >= item.quantity"
                :aria-label="'Augmenter la quantité de ' + item.title"
                type="button"
              >
                +
              </button>
            </div>

            <!-- Sous-total -->
            <div class="item-subtotal">
              {{ formatPrice(item.price * item.cartQuantity) }}
            </div>

            <!-- Bouton supprimer -->
            <button
              class="remove-btn"
              @click="removeFromCart(item.id)"
              title="Supprimer"
              :aria-label="'Supprimer ' + item.title"
              type="button"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>

      <!-- Footer du panier -->
      <div v-if="cart.length > 0" class="cart-footer">
        <!-- Total -->
        <div class="cart-summary">
          <div class="summary-row">
            <span>Nombre d'articles:</span>
            <strong>{{ totalItems }}</strong>
          </div>
          <div class="summary-row total">
            <span>Total:</span>
            <strong>{{ formatPrice(cartTotal) }}</strong>
          </div>
        </div>

        <!-- Boutons d'action -->
        <div class="cart-actions">
          <button class="btn btn-secondary" @click="toggleCart" type="button" aria-label="Continuer les achats">
            Continuer les achats
          </button>
          <button class="btn btn-primary" @click="handleCheckout" type="button" aria-label="Passer la commande">
            Passer la commande
          </button>
        </div>
      </div>
    </div>

    <!-- Overlay (fermer le panier au clic) -->
    <div v-if="isOpen" class="cart-overlay" @click="toggleCart" role="presentation" aria-hidden="true"></div>

    <!-- Notification -->
    <div v-if="notification" :class="`notification notification--${notification.type}`" role="status" aria-live="polite">
      {{ notification.message }}
    </div>
  </div>
</template>

<script setup>
import { ref, defineEmits, nextTick, watch, onBeforeUnmount } from 'vue';
import { useCart } from '../composables/useCart.js';
import { orderService } from '../services/api.js';

const emit = defineEmits(['order-created']);

const {
  cart,
  totalItems,
  cartTotal,
  removeFromCart,
  clearCart,
  increaseQuantity,
  decreaseQuantity,
  formatPrice,
} = useCart();

const isOpen = ref(false);
const notification = ref(null);
let previousFocused = null;

const focusableSelector = 'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

const toggleCart = () => {
  isOpen.value = !isOpen.value;
};

function handleKeydown(e) {
  if (e.key === 'Escape') {
    isOpen.value = false;
  }
  if (e.key === 'Tab') {
    const sidebar = document.getElementById('cart-sidebar');
    if (!sidebar) return;
    const focusable = Array.from(sidebar.querySelectorAll(focusableSelector));
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    }
  }
}

watch(isOpen, async (open) => {
  const sidebar = document.getElementById('cart-sidebar');
  if (open) {
    previousFocused = document.activeElement;
    await nextTick();
    const focusable = sidebar ? sidebar.querySelectorAll(focusableSelector) : null;
    if (focusable && focusable.length) {
      focusable[0].focus();
    }
    document.addEventListener('keydown', handleKeydown);
    document.body.style.overflow = 'hidden';
  } else {
    document.removeEventListener('keydown', handleKeydown);
    if (previousFocused && previousFocused.focus) previousFocused.focus();
    document.body.style.overflow = '';
  }
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown);
  document.body.style.overflow = '';
});

const handleCheckout = async () => {
  if (cart.value.length === 0) {
    showNotification('Veuillez ajouter des livres au panier', 'error');
    return;
  }

  try {
    // Préparer les données de la commande
    const orderData = {
      items: cart.value.map(item => ({
        bookId: item.id,
        quantity: item.cartQuantity,
      })),
      customerEmail: 'client@example.com', // À personnaliser avec formulaire
      customerName: 'Client', // À personnaliser
    };

    // Créer la commande via l'API
    const response = await orderService.createOrder(orderData);

    showNotification(
      `✅ Commande créée! Numéro: ${response.data.orderNumber}`,
      'success'
    );

    // Vider le panier
    clearCart();
    isOpen.value = false;

    // Émettre un événement pour notifier que la commande a été créée
    emit('order-created', response.data);
  } catch (error) {
    console.error('Erreur checkout:', error);
    showNotification(
      `❌ Erreur: ${error.message || 'Impossible de créer la commande'}`,
      'error'
    );
  }
};

const showNotification = (message, type = 'info') => {
  notification.value = { message, type };
  setTimeout(() => {
    notification.value = null;
  }, 3000);
};
</script>

<style scoped>
:root {
  --primary: #2d6cdf; /* bleu principal amélioré */
  --primary-dark: #2359a6;
  --primary-text: #ffffff;
  --danger: #e74c3c;
  --danger-dark: #c0392b;
  --success: #27ae60;
  --light-bg: #ecf0f1;
  --text-dark: #2c3e50;
  --border-color: #bdc3c7;
  --muted: #7f8c8d;
}

/* Bouton du panier (flottant) */
.cart-button {
  position: fixed;
  bottom: 30px;
  right: 30px;
  padding: 12px 20px;
  background-color: var(--primary);
  color: var(--primary-text);
  border: none;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
  transition: transform 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease, opacity 0.15s ease;
  z-index: 100;
}

/* Quand le panier est ouvert, masquer le bouton flottant pour éviter qu'il recouvre le footer */
.cart-button[aria-expanded="true"] {
  opacity: 0;
  pointer-events: none;
  transform: scale(0.96) translateY(6px);
}

/* plus strict: masquer complètement lorsqu'on est en état ouvert */
.cart-container.is-open .cart-button {
  display: none !important;
  visibility: hidden !important;
}

.cart-badge {
  display: inline-block;
  background-color: var(--danger);
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  font-size: 0.8rem;
  margin-left: 8px;
}

/* Sidebar du panier */
.cart-sidebar {
  position: fixed;
  right: 0;
  top: 0;
  width: 400px;
  height: 100vh;
  background-color: white;
  box-shadow: -2px 0 14px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  z-index: 200; /* s'assurer que la sidebar est au-dessus de l'overlay et du bouton */
  padding-bottom: 120px; /* laisser de la place pour le footer/action buttons */
}

/* Overlay sits below the sidebar but above the page content */
.cart-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 150;
}

/* Footer du panier : ajouter du padding-bottom pour éviter que les boutons soient collés au bord et recouverts */
.cart-footer {
  position: relative; /* pour pouvoir z-indexer le footer au-dessus */
  z-index: 220; /* au-dessus de l'overlay */
  padding: 16px 18px 26px 18px; /* bottom padding plus large */
  border-top: 1px solid var(--border-color);
  background: #fafafa;
}

.cart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: var(--muted);
  padding: 6px;
  border-radius: 6px;
  transition: background-color 0.12s ease, color 0.12s ease;
}

.close-btn:hover,
.close-btn:focus {
  background-color: var(--light-bg);
  color: var(--text-dark);
  outline: none;
}

.cart-content {
  padding: 16px 20px;
  overflow-y: auto;
  flex: 1 1 auto;
}

.cart-item {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 8px;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px dashed #eee;
}

.item-info h3 {
  margin: 0 0 4px 0;
  font-size: 1rem;
  color: var(--text-dark);
}

.author {
  margin: 0;
  color: var(--muted);
  font-size: 0.9rem;
}

.price {
  color: var(--text-dark);
  font-weight: 600;
}

/* Contrôles de quantité */
.quantity-controls {
  display: flex;
  align-items: center;
  gap: 6px;
}

.qty-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: #fff;
  color: var(--text-dark);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.12s ease, border-color 0.12s ease, transform 0.08s ease;
}

.qty-btn:hover,
.qty-btn:focus {
  background-color: var(--light-bg);
  border-color: var(--primary);
  transform: translateY(-1px);
}

.qty-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  background: #fbfbfb;
  pointer-events: none;
}

.qty-input {
  width: 56px;
  padding: 6px 8px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  text-align: center;
}

.item-subtotal {
  text-align: right;
  font-weight: 600;
  color: var(--text-dark);
}

.remove-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--muted);
  padding: 6px;
  border-radius: 6px;
  transition: color 0.12s ease, background-color 0.12s ease;
}

.remove-btn:hover {
  color: var(--danger);
  background-color: rgba(231, 76, 60, 0.06);
}

/* Footer du panier */
.cart-footer {
  padding: 16px 18px 26px 18px; /* bottom padding plus large */
  border-top: 1px solid var(--border-color);
  background: #fafafa;
}

.cart-summary .summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.cart-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  align-items: center;
}

/* Boutons génériques */
.btn {
  padding: 8px 12px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.95rem;
  border: 1px solid transparent;
  cursor: pointer;
  transition: background-color 0.12s ease, color 0.12s ease, transform 0.08s ease, box-shadow 0.12s ease;
}

.btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(45, 108, 223, 0.12);
}

.btn[disabled],
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  pointer-events: none;
}

/* Primary */
.btn-primary {
  background-color: var(--primary);
  color: var(--primary-text);
  border-color: var(--primary);
}

.btn-primary:hover {
  background-color: var(--primary-dark);
  border-color: var(--primary-dark);
  transform: translateY(-1px);
}
.btn-primary:focus {
  background-color: var(--primary-dark);
  border-color: var(--primary-dark);
  transform: translateY(-1px);
}

/* Secondary */
.btn-secondary {
  background-color: #f7f7f7;
  color: #1f2937; /* presque noir */
  border-color: var(--border-color);
}

.btn-secondary:hover {
  background-color: var(--light-bg);
  transform: translateY(-1px);
}
.btn-secondary:focus {
  background-color: var(--light-bg);
  transform: translateY(-1px);
}

/* Danger */
.btn-danger {
  background-color: var(--danger);
  color: #fff;
  border-color: var(--danger);
}

.btn-danger:hover {
  background-color: var(--danger-dark);
  border-color: var(--danger-dark);
  transform: translateY(-1px);
}
.btn-danger:focus {
  background-color: var(--danger-dark);
  border-color: var(--danger-dark);
  transform: translateY(-1px);
}

/* Overlay */
.cart-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 150;
}

/* Notification */
.notification {
  position: fixed;
  bottom: 100px;
  right: 30px;
  padding: 12px 16px;
  border-radius: 8px;
  color: white;
}

.notification--info { background: var(--primary); }
.notification--success { background: var(--success); }
.notification--error { background: var(--danger); }

/* petits ajustements responsifs */
@media (max-width: 600px) {
  .cart-sidebar {
    width: 100%;
  }
  .cart-button {
    right: 16px;
    padding: 10px 16px;
  }
}

/* Focus plus visible pour accessibilité clavier */
.btn:focus,
.qty-btn:focus,
.close-btn:focus,
.cart-button:focus,
.remove-btn:focus {
  outline: 3px solid rgba(0, 0, 0, 0.9);
  outline-offset: 2px;
}

/* Disabled plus explicite */
.btn[disabled],
.btn:disabled,
.qty-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
  pointer-events: none;
}

/* Petite classe pour lecteurs d'écran (si besoin) */
.sr-only {
  position: absolute !important;
  height: 1px;
  width: 1px;
  overflow: hidden;
  clip: rect(1px, 1px, 1px, 1px);
  white-space: nowrap;
}
</style>
