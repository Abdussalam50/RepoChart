import api from '../api/axiosInstance';

export const settingsService = {
  getPublicSettings: async () => {
    const response = await api.get('/settings/public');
    return response.data;
  },

  getAdminSettings: async () => {
    const response = await api.get('/admin/settings');
    return response.data;
  },

  updateAdminSettings: async (settings) => {
    const response = await api.post('/admin/settings', { settings });
    return response.data;
  }
};
