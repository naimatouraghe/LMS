import axios from '../axios';
import { jwtDecode } from 'jwt-decode';

class AuthApi {
  constructor() {
    this.tokenKey = 'token';
    this.userKey = 'user';
    this.token = localStorage.getItem(this.tokenKey);
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem(this.tokenKey, token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem(this.tokenKey);
      delete axios.defaults.headers.common['Authorization'];
    }
  }

  setUser(user) {
    if (user) {
      localStorage.setItem(this.userKey, JSON.stringify(user));
    } else {
      localStorage.removeItem(this.userKey);
    }
  }

  getUser() {
    try {
      const userStr = localStorage.getItem(this.userKey);
      if (!userStr) return null;

      const user = JSON.parse(userStr);

      if (!user || !user.id) {
        return null;
      }

      return {
        id: user.id,
        email: user.email || '',
        userName: user.userName || '',
        role: user.role || 'Student',
        roles: Array.isArray(user.roles)
          ? user.roles
          : [user.role || 'Student'],
      };
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  }

  // Nouvelle méthode pour l'API
  async getUserFromApi(userId) {
    try {
      const response = await axios.get(`/Auth/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('API Error:', error.response?.data);
      throw error;
    }
  }

  setUser(user) {
    console.log('Setting user:', user); // Nouveau log
    if (user) {
      // S'assurer que l'utilisateur a la bonne structure avant de le stocker
      const userToStore = {
        id: user.id || '',
        email: user.email || '',
        userName: user.userName || '',
        roles: Array.isArray(user.roles)
          ? user.roles
          : [user.role || 'Student'],
      };
      console.log('Storing user:', userToStore); // Nouveau log
      localStorage.setItem(this.userKey, JSON.stringify(userToStore));
    } else {
      console.log('Removing user from localStorage');
      localStorage.removeItem(this.userKey);
    }
  }

  isTokenValid() {
    const token = this.token;
    if (!token) return false;

    try {
      const decoded = jwtDecode(token);
      return decoded.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  }

  async register(registerDto) {
    try {
      const response = await axios.post('/Auth/register', registerDto);
      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      // Propager directement les erreurs du serveur
      if (error.response?.data?.errors) {
        throw {
          response: {
            data: {
              errors: error.response.data.errors,
            },
          },
        };
      }
      throw error;
    }
  }

  async login(credentials) {
    try {
      // Ajout d'un log pour vérifier l'URL complète
      console.log('Login URL:', '/Auth/login');
      console.log('Credentials:', credentials);

      const response = await axios.post('/Auth/login', credentials);
      console.log('Response from API:', response);

      // Vérifier si la réponse est HTML
      if (response.headers['content-type']?.includes('text/html')) {
        console.error('Received HTML response instead of JSON');
        throw new Error('Réponse invalide du serveur');
      }

      // Le reste du code reste inchangé
      if (!response?.data) {
        console.error('Invalid response structure:', response);
        throw new Error('Format de réponse invalide');
      }

      const { token, user } = response.data;

      if (!token || !user) {
        console.error('Missing token or user data:', response.data);
        throw new Error('Données de connexion incomplètes');
      }

      this.setToken(token);
      this.setUser(user);

      return {
        token,
        user,
      };
    } catch (error) {
      if (error.response?.status === 400) {
        throw new Error(
          error.response.data?.message || 'Identifiants invalides'
        );
      }
      console.error('API Error:', error.response?.data || error);
      throw error;
    }
  }

  async logout() {
    try {
      // Vérifier si nous avons un token valide
      const token = localStorage.getItem(this.tokenKey);
      if (token) {
        // S'assurer que le token est dans les headers
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Faire l'appel API
        await axios.post('/Auth/logout');
      }
    } catch (error) {
      console.warn('Erreur lors de la déconnexion côté serveur:', error);
    } finally {
      // Nettoyer les données locales dans tous les cas
      this.setToken(null);
      this.setUser(null);
      localStorage.clear();
      delete axios.defaults.headers.common['Authorization'];
    }
  }

  async getAllUsers(params = {}) {
    try {
      const { role, searchTerm } = params;
      const response = await axios.get('/Auth/users', {
        params: { role, searchTerm },
      });

      if (!response?.data?.value) {
        throw new Error('Format de réponse invalide');
      }

      return response.data;
    } catch (error) {
      console.error('API Error:', error.response?.data);
      throw error;
    }
  }

  async getUser(userId) {
    try {
      const response = await axios.get(`/Auth/users/${userId}`);

      if (!response?.data?.value) {
        throw new Error('Format de réponse invalide');
      }

      return response.data;
    } catch (error) {
      console.error('API Error:', error.response?.data);
      throw error;
    }
  }

  async updateUser(userId, updateUserDto) {
    try {
      // Vérifier si nous avons un ID valide
      if (!userId) {
        const currentUser = this.getUser(); // Utiliser la méthode synchrone
        if (!currentUser || !currentUser.id) {
          throw new Error('No user ID available for update');
        }
        userId = currentUser.id;
      }

      let data;
      let headers = {};

      if (updateUserDto instanceof FormData) {
        data = updateUserDto;
        headers = {
          'Content-Type': 'multipart/form-data',
        };
      } else {
        data = new FormData();
        Object.entries(updateUserDto).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            data.append(key, value);
          }
        });
      }

      console.log('Updating user with ID:', userId); // Debug log

      const response = await axios.put(`/Auth/users/${userId}`, data, {
        headers,
      });

      if (!response?.data?.value) {
        throw new Error('Format de réponse invalide');
      }

      // Mettre à jour le localStorage avec les nouvelles données
      const updatedUser = response.data.value;
      this.setUser(updatedUser);

      return response.data;
    } catch (error) {
      console.error('API Error:', error.response?.data || error.message);
      throw error;
    }
  }

  async deleteUser(userId) {
    try {
      const response = await axios.delete(`/Auth/users/${userId}`);

      if (!response?.data?.value) {
        throw new Error('Format de réponse invalide');
      }

      return response.data;
    } catch (error) {
      console.error('API Error:', error.response?.data);
      throw error;
    }
  }

  async assignRole(userId, role) {
    try {
      const response = await axios.post(
        `/Auth/users/${userId}/role`,
        JSON.stringify(role),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response?.data?.value) {
        throw new Error('Format de réponse invalide');
      }

      return response.data;
    } catch (error) {
      console.error('API Error:', error.response?.data);
      throw error;
    }
  }

  async getUserStatistics() {
    try {
      const response = await axios.get('/Auth/statistics');

      if (!response?.data?.value) {
        throw new Error('Format de réponse invalide');
      }

      return response.data;
    } catch (error) {
      console.error('API Error:', error.response?.data);
      throw error;
    }
  }

  async deactivateUser(userId) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      console.log('Deactivating user with ID:', userId);

      const response = await axios.put(`/Auth/users/${userId}/deactivate`);

      if (!response?.data) {
        throw new Error('Invalid server response');
      }

      this.setToken(null);
      this.setUser(null);
      localStorage.clear();

      return response.data;
    } catch (error) {
      console.error(
        'API Error:',
        error.response?.data?.message || error.message
      );
      throw new Error(
        error.response?.data?.message || 'Error deactivating account'
      );
    }
  }

  isAuthenticated() {
    return this.isTokenValid() && this.getUser() !== null;
  }

  isAdmin() {
    const user = this.getUser();
    return user?.role === 'Admin';
  }
}

export const authApi = new AuthApi();
