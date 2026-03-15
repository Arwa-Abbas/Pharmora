// services/authService.js
import api from './api';

class AuthService {
  async login(email, password) {
    try {
      console.log('🔵 Login attempt for:', email);
      const data = await api.post('/api/login', { email, password });
      console.log('🟢 Login response:', data);
      
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
        
        console.log('💾 Storing user:', userForStorage);
        localStorage.setItem('user', JSON.stringify(userForStorage));

        const stored = localStorage.getItem('user');
        console.log('✅ Verified stored user:', JSON.parse(stored));
        
        return { ...data, user: userForStorage };
      }
      return data;
    } catch (error) {
      console.error('🔴 Login error:', error);
      throw error;
    }
  }

  logout() {
    console.log('🔵 Logging out');
    localStorage.removeItem('user');
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      console.log('👤 No user in storage');
      return null;
    }
    
    try {
      const user = JSON.parse(userStr);
      console.log('👤 Current user from storage:', user);
      return user;
    } catch (e) {
      console.error('🔴 Error parsing user:', e);
      return null;
    }
  }

  isAuthenticated() {
    const user = this.getCurrentUser();
    console.log('🔍 Is authenticated?', !!user);
    return !!user;
  }

  hasRole(role) {
    const user = this.getCurrentUser();
    const hasRole = user && user.role === role;
    console.log(`🔍 Has role ${role}?`, hasRole);
    return hasRole;
  }
}

export default new AuthService();