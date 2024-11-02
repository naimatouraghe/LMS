import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../utils/auth';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Fonction pour récupérer les informations de l'utilisateur
  const fetchUserInfo = async () => {
    try {
      const token = authService.getToken();
      if (token) {
        const response = await axios.get('https://localhost:7001/api/users/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUser(response.data);
        console.log(response.data)
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  // Vérifier l'authentification au chargement
  useEffect(() => {
    fetchUserInfo();
  }, []);

  const login = async (token) => {
    authService.setToken(token);
    await fetchUserInfo();
  };

  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
    navigate('/login');
  };

  if (isLoading) {
    return null; // ou un composant de chargement
  }

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      login, 
      logout,
      user,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};