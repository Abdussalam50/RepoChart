import axiosInstance from './axiosInstance';

const adminService = {
  // Dashboard
  getOverview: () => axiosInstance.get('/admin/overview'),
  getGrowth: (period = '6m') => axiosInstance.get(`/admin/growth?period=${period}`),
  getRetention: () => axiosInstance.get('/admin/retention'),
  getAlerts: () => axiosInstance.get('/admin/alerts'),

  // User Management
  getUsers: (params) => axiosInstance.get('/admin/users', { params }),
  getUser: (id) => axiosInstance.get(`/admin/users/${id}`),
  updateUserPlan: (id, data) => axiosInstance.patch(`/admin/users/${id}/plan`, data),
  deleteUser: (id, confirmation) => axiosInstance.delete(`/admin/users/${id}`, { data: { confirmation } }),
  
  // Transactions
  getTransactions: (params) => axiosInstance.get('/admin/invoices', { params }),
  markAsPaid: (id, data) => axiosInstance.patch(`/admin/invoices/${id}/mark-paid`, data),

  // Subscriptions
  getSubscriptions: (params) => axiosInstance.get('/admin/subs', { params }),
  getExpiringSubscriptions: (days) => axiosInstance.get(`/admin/subs/expiring?days=${days}`),
  createSubscription: (data) => axiosInstance.post('/admin/subs', data),
  extendSubscription: (id, data) => axiosInstance.patch(`/admin/subs/${id}/extend`, data),
  cancelSubscription: (id, data) => axiosInstance.patch(`/admin/subs/${id}/cancel`, data),

  // Broadcast
  sendBroadcast: (data) => axiosInstance.post('/admin/broadcast', data),
};

export default adminService;
