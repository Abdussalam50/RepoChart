import api from './axiosInstance';

export const generateInsight = (reportId, payload = {}) =>
  api.post(`/reports/${reportId}/insight`, payload);

export const getInsight = (reportId) =>
  api.get(`/reports/${reportId}/insight`);
