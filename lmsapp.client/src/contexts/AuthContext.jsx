import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../utils/auth';
import axiosInstance from '../utils/axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUserInfo = async () => {
    try {
      const token = authService.getToken();
      if (token) {
        const decodedToken = jwtDecode(token);
        console.log('Decoded token:', decodedToken);

        const userId =
          decodedToken['userId'] ||
          decodedToken[
            'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
          ] ||
          decodedToken['nameid'];

        if (!userId) {
          console.error('Decoded token content:', decodedToken);
          throw new Error('Invalid token structure');
        }

        const response = await axiosInstance.get(`/Auth/users/${userId}`);
        console.log('User info response:', response.data);

        if (response.data && (response.data.value || response.data)) {
          const userData = response.data.value || response.data;
          setUser(userData);
          setIsAuthenticated(true);
          localStorage.setItem('user', JSON.stringify(userData));
        } else {
          console.error('Invalid response structure:', response.data);
          throw new Error('Invalid user data');
        }
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      if (
        error.response?.status === 401 ||
        error.message === 'Invalid token structure'
      ) {
        logout();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (token) => {
    try {
      const decodedToken = jwtDecode(token);
      if (!decodedToken) {
        throw new Error('Invalid token');
      }

      authService.setToken(token);

      axiosInstance.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${token}`;

      await fetchUserInfo();
    } catch (error) {
      console.error('Login error:', error);
      logout();
    }
  };

  const logout = () => {
    try {
      const token = authService.getToken();
      if (token) {
        axiosInstance.post('/Auth/logout').catch(console.error);
      }
    } finally {
      authService.logout();
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem('user');
      delete axiosInstance.defaults.headers.common['Authorization'];
      navigate('/login');
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-700"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        user,
        isLoading,
        refreshUser: fetchUserInfo,
      }}
    >
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
