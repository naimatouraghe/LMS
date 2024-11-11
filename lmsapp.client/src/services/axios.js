import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://localhost:7001/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json', // Ajout de l'en-tête Accept
  },
  // Ajout de la configuration pour gérer les erreurs CORS
  withCredentials: true,
});

// Intercepteur pour les requêtes
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour les réponses
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 404) {
      console.error('API endpoint not found:', error.config.url);
    }
    return Promise.reject(error);
  }
);

export default instance;
