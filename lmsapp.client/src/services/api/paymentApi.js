import axios from '../axios';

export const paymentApi = {
  // Gestion des clients Stripe
  createStripeCustomer: async () => {
    const response = await axios.post('/Payment/customers');
    return response.data;
  },

  getStripeCustomer: async () => {
    const response = await axios.get('/Payment/customers');
    return response.data;
  },

  updateStripeCustomer: async (stripeCustomerId) => {
    const response = await axios.put(
      '/Payment/customers',
      JSON.stringify(stripeCustomerId),
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  },

  // Gestion des achats
  createPurchase: async (courseId) => {
    const response = await axios.post(`/Payment/purchases/${courseId}`);
    return response.data;
  },

  getUserPurchases: async (userId) => {
    const response = await axios.get(`/Payment/${userId}/purchases`);
    return response.data;
  },

  getCoursePurchases: async (courseId) => {
    const response = await axios.get(`/Payment/courses/${courseId}/purchases`);
    return response.data;
  },

  // Session de paiement
  createCheckoutSession: async (courseId) => {
    const response = await axios.post(
      `/Payment/create-checkout-session/${courseId}`
    );
    return response.data;
  },

  // Utilitaires pour Stripe
  redirectToCheckout: async (sessionId) => {
    const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
    return stripe.redirectToCheckout({ sessionId });
  },

  handlePaymentSuccess: async (sessionId) => {
    try {
      // Logique post-paiement réussi
      // Par exemple, redirection vers la page du cours
      return true;
    } catch (error) {
      console.error('Payment success handling error:', error);
      return false;
    }
  },

  handlePaymentError: async (error) => {
    console.error('Payment error:', error);
    // Logique de gestion d'erreur de paiement
  },
};
