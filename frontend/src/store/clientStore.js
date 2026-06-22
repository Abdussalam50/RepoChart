import { create } from 'zustand';
import * as clientService from '../api/clientService';

export const useClientStore = create((set, get) => ({
  clients: [],
  currentClient: null,
  isLoading: false,
  error: null,

  fetchClients: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await clientService.getClients();
      set({ clients: response.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: error.message });
    }
  },

  fetchClient: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await clientService.getClient(id);
      set({ currentClient: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  createClient: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await clientService.createClient(data);
      set({ 
        clients: [response.data, ...get().clients], 
        isLoading: false 
      });
      return response.data;
    } catch (error) {
      set({ isLoading: false, error: error.response?.data?.message || error.message });
      throw error;
    }
  },

  updateClient: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await clientService.updateClient(id, data);
      set({ 
        clients: get().clients.map(c => c.id === id ? response.data : c),
        currentClient: response.data,
        isLoading: false 
      });
      return response.data;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  deleteClient: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await clientService.deleteClient(id);
      set({ 
        clients: get().clients.filter(c => c.id !== id),
        isLoading: false 
      });
    } catch (error) {
      set({ isLoading: false, error: error.message });
    }
  },

  uploadLogo: async (id, file) => {
    set({ isLoading: true, error: null });
    try {
      const response = await clientService.uploadClientLogo(id, file);
      set({ 
        currentClient: response.data,
        clients: get().clients.map(c => c.id === Number(id) ? response.data : c),
        isLoading: false 
      });
      return response.data;
    } catch (error) {
      set({ isLoading: false, error: error.response?.data?.message || error.message });
      throw error;
    }
  }
}));
