import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

export class AuthService {
  constructor() {
    this.token = localStorage.getItem('token');
    this.tokenKey = 'token';
    this.userKey = 'user';
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem(this.tokenKey, token);

    // Configurer Axios avec le nouveau token
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }

  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  setUser(user) {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  getUser() {
    const userStr = localStorage.getItem(this.userKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  isTokenValid() {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch (error) {
      return false;
    }
  }

  logout() {
    this.token = null;
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.clear();
    delete axios.defaults.headers.common['Authorization'];
  }
}

const authService = new AuthService();
export default authService;
