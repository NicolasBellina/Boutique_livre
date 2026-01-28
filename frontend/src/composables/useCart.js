import { ref, computed } from 'vue';

// Store global pour le panier (simule un state management)
const cart = ref([]);

export function useCart() {
  /**
   * Ajouter un livre au panier
   */
  const addToCart = (book) => {
    const existingItem = cart.value.find(item => item.id === book.id);

    if (existingItem) {
      // Si le livre est déjà dans le panier, augmenter la quantité (cartQuantity) si le stock le permet
      existingItem.cartQuantity = existingItem.cartQuantity || 1;
      if (existingItem.cartQuantity < (book.quantity ?? existingItem.quantity ?? Infinity)) {
        existingItem.cartQuantity += 1;
      }
    } else {
      // Sinon, ajouter le livre au panier
      cart.value.push({
        ...book,
        cartQuantity: 1, // Quantité commandée
      });
    }
  };

  /**
   * Augmenter la quantité d'un article
   */
  const increaseQuantity = (bookId) => {
    const item = cart.value.find(item => item.id === bookId);
    if (item && item.cartQuantity < item.quantity) {
      item.cartQuantity += 1;
    }
  };

  /**
   * Diminuer la quantité d'un article
   */
  const decreaseQuantity = (bookId) => {
    const item = cart.value.find(item => item.id === bookId);
    if (item && item.cartQuantity > 1) {
      item.cartQuantity -= 1;
    }
  };

  /**
   * Supprimer un article du panier
   */
  const removeFromCart = (bookId) => {
    cart.value = cart.value.filter(item => item.id !== bookId);
  };

  /**
   * Vider le panier
   */
  const clearCart = () => {
    cart.value = [];
  };

  /**
   * Obtenir le nombre total d'articles
   */
  const totalItems = computed(() => {
    return cart.value.reduce((total, item) => total + (item.cartQuantity || 0), 0);
  });

  /**
   * Obtenir le total du panier
   */
  const cartTotal = computed(() => {
    return cart.value.reduce((total, item) => {
      return total + Number(item.price) * (item.cartQuantity || 0);
    }, 0);
  });

  /**
   * Formater le prix
   */
  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  return {
    cart: computed(() => cart.value),
    totalItems,
    cartTotal,
    addToCart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    formatPrice,
  };
}
