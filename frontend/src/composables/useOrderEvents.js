import { ref } from 'vue';

// Store global pour les événements de commande
const orderCreatedEvent = ref(null);

export function useOrderEvents() {
  /**
   * Notifier que une commande a été créée
   */
  const notifyOrderCreated = (order) => {
    orderCreatedEvent.value = {
      timestamp: Date.now(),
      order,
    };
  };

  /**
   * Obtenir le dernier événement de création de commande
   */
  const getLastOrderEvent = () => {
    return orderCreatedEvent.value;
  };

  /**
   * Réinitialiser l'événement
   */
  const resetOrderEvent = () => {
    orderCreatedEvent.value = null;
  };

  return {
    notifyOrderCreated,
    getLastOrderEvent,
    resetOrderEvent,
    orderCreatedEvent,
  };
}
