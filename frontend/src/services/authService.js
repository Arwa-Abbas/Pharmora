// services/authService.js
import api from './api';

class AuthService {
  async signup(role, formData) {
    const data = await api.post('/api/signup', { role, formData });
    return data;
  }

  async login(email, password) {
    const data = await api.post('/api/login', { email, password });

    if (data.token) {
      localStorage.setItem('token', data.token);
    }

    if (data.user) {
      const userForStorage = {
        id: data.user.id,
        name: data.user.name || `${data.user.firstName || ''} ${data.user.lastName || ''}`.trim(),
        firstName: data.user.firstName || '',
        lastName: data.user.lastName || '',
        email: data.user.email,
        role: data.user.role,
        roleData: data.user.roleData || {}
      };
      localStorage.setItem('user', JSON.stringify(userForStorage));
      return { ...data, user: userForStorage };
    }
    return data;
  }

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch (e) {
      return null;
    }
  }

  isAuthenticated() {
    return !!this.getCurrentUser() && !!localStorage.getItem('token');
  }

  hasRole(role) {
    const user = this.getCurrentUser();
    return user && user.role === role;
  }
}

export default new AuthService();
