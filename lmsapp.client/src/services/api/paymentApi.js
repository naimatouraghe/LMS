import axios from '../axios';
import { loadStripe } from '@stripe/stripe-js';

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
  createCheckoutSession: async (userId, courseId) => {
    const response = await axios.post(
      `/Payment/create-checkout-session/${courseId}`,
      { userId }
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
      // Fetch session details from your API
      const sessionResponse = await axios.get(`/Payment/session/${sessionId}`);

      // Ensure the response contains the necessary data
      const courseId = sessionResponse.data.courseId; // Adjust based on your API response
      const userId = sessionResponse.data.userId; // Adjust based on your API response

      // Call the API to create the purchase
      const purchaseResponse = await paymentApi.createPurchase(courseId);

      if (purchaseResponse) {
        // Redirect to the course page after successful purchase creation
        window.location.href = `https://localhost:5173/courses/${courseId}`;
        return true;
      } else {
        console.error('Failed to create purchase');
        return false;
      }
    } catch (error) {
      console.error('Payment success handling error:', error);
      if (error.response) {
        // The request was made and the server responded with a status code
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Request data:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
      }
      return false;
    }
  },

  handlePaymentError: async (error) => {
    console.error('Payment error:', error);
    // Logique de gestion d'erreur de paiement
  },
};
