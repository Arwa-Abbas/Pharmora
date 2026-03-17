
import { useState, useEffect } from 'react';
import authService from '../services/authService';
import { useNotification } from '../contexts/NotificationContext';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  useEffect(() => {
    const loadUser = () => {
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password);
      setUser(data.user);
      showNotification('Login successful!', 'success');
      return data;
    } catch (err) {
      showNotification(err.message || 'Login failed', 'error');
      throw err;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    showNotification('Logged out successfully', 'info');
  };

  const signup = async (role, formData) => {
    try {
      const data = await authService.signup(role, formData);
      showNotification('Account created successfully! Please login.', 'success');
      return data;
    } catch (err) {
      showNotification(err.message || 'Signup failed', 'error');
      throw err;
    }
  };

  return {
    user,
    loading,
    login,
    logout,
    signup,
    isAuthenticated: !!user,
    hasRole: (role) => user?.role === role
  };
};
