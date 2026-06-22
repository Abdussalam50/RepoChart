import { create } from 'zustand';
import * as authService from '../api/authService';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login({ email, password });
      const { user, token } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      set({ user, token, isLoading: false });
      return true;
    } catch (error) {
      let errorMsg = 'Login failed';
      if (error.response?.data) {
        if (error.response.data.messages) {
          errorMsg = Object.values(error.response.data.messages).flat().join(', ');
        } else if (error.response.data.message) {
          errorMsg = error.response.data.message;
        } else if (error.response.data.error) {
          errorMsg = error.response.data.error;
        }
      }
      set({ 
        isLoading: false, 
        error: errorMsg 
      });
      return false;
    }
  },

  register: async (name, email, password, password_confirmation) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.register({ 
        name, email, password, password_confirmation 
      });
      const { user, token } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      set({ user, token, isLoading: false });
      return true;
    } catch (error) {
      let errorMsg = 'Registration failed';
      if (error.response?.data) {
        if (error.response.data.messages) {
          errorMsg = Object.values(error.response.data.messages).flat().join(', ');
        } else if (error.response.data.message) {
          errorMsg = error.response.data.message;
        } else if (error.response.data.error) {
          errorMsg = error.response.data.error;
        }
      }
      set({ 
        isLoading: false, 
        error: errorMsg 
      });
      return false;
    }
  },

  fetchMe: async () => {
    try {
      const response = await authService.getMe();
      const user = response.data;
      localStorage.setItem('user', JSON.stringify(user));
      set({ user });
      return user;
    } catch (error) {
      console.error('fetchMe error', error);
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ user: null, token: null });
    }
  },
  
  clearError: () => set({ error: null })
}));
