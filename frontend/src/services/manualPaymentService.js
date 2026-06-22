import api from '../api/axiosInstance';

export const manualPaymentAdminService = {
  getPayments: async (page = 1, status = 'all') => {
    const response = await api.get(`/admin/manual-payments?page=${page}&status=${status}`);
    return response.data;
  },

  approvePayment: async (id) => {
    const response = await api.post(`/admin/manual-payments/${id}/approve`);
    return response.data;
  },

  rejectPayment: async (id, notes) => {
    const response = await api.post(`/admin/manual-payments/${id}/reject`, { notes });
    return response.data;
  }
};

export const manualPaymentUserService = {
  submitPayment: async (formData) => {
    const response = await api.post('/manual-payment', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};
