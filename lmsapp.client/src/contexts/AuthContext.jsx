import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api/authApi';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // 1. Vérifier le token
        const token = localStorage.getItem('token');
        console.log('Token found:', !!token);

        if (!token) {
          console.log('No token, clearing auth state');
          authApi.setToken(null);
          authApi.setUser(null);
          setUser(null);
          setIsAuthenticated(false);
          return;
        }

        // 2. Vérifier la validité du token
        if (!authApi.isTokenValid()) {
          console.log('Invalid token, clearing auth state');
          throw new Error('Token invalide');
        }

        // 3. Configurer le token pour Axios
        authApi.setToken(token);

        // 4. Récupérer l'utilisateur du localStorage de manière synchrone
        const storedUser = JSON.parse(localStorage.getItem('user'));
        console.log('Stored user:', storedUser);

        if (!storedUser || !storedUser.id) {
          console.log('Invalid user data, clearing auth state');
          throw new Error('Données utilisateur invalides');
        }

        // 5. Mettre à jour l'état
        setUser(storedUser);
        setIsAuthenticated(true);

        // 6. Optionnel : Mise à jour depuis l'API en arrière-plan
        try {
          const apiUser = await authApi.getUser(storedUser.id);
          if (apiUser?.value) {
            setUser(apiUser.value);
            authApi.setUser(apiUser.value);
          }
        } catch (error) {
          console.warn('Could not refresh user data from API:', error);
          // Continue with localStorage data
        }
      } catch (error) {
        console.error("Erreur d'initialisation de l'auth:", error);
        // Nettoyer en cas d'erreur
        localStorage.removeItem('token');
        authApi.setToken(null);
        authApi.setUser(null);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authApi.login(credentials);
      console.log('Réponse login:', response);

      if (!response || !response.token || !response.user) {
        throw new Error('Format de réponse invalide');
      }

      const { token, user: userData } = response;

      if (!token || !userData?.id) {
        throw new Error('Données de connexion invalides');
      }

      // Sauvegarder le token dans le localStorage
      localStorage.setItem('token', token);

      // Mettre à jour l'état
      authApi.setToken(token);
      authApi.setUser(userData);
      setUser(userData);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      console.error('Erreur de connexion:', error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          'Erreur de connexion',
      };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
      // Forcer la déconnexion locale même en cas d'erreur
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateUser = (userData) => {
    if (!userData?.id) {
      console.error(
        'Tentative de mise à jour avec des données utilisateur invalides'
      );
      return;
    }
    setUser(userData);
    authApi.setUser(userData);
  };

  const register = async (formData) => {
    try {
      const result = await authApi.register(formData);
      return result;
    } catch (error) {
      // Propager l'erreur pour que le composant Register puisse la gérer
      throw error;
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUser,
    register,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="xl" color="primary" />
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};
