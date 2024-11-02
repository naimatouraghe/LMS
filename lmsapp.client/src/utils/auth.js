export class AuthService {
    constructor() {
        this.token = localStorage.getItem('token');
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('token', token);
    }

    getToken() {
        return this.token;
    }

    logout() {
        this.token = null;
        localStorage.removeItem('token');
        localStorage.clear();
    }
}

const authService = new AuthService();
export default authService;