import api from './axiosInstance';

export const getCharts = (reportId) =>
  api.get(`/reports/${reportId}/charts`);

export const createChart = (reportId, data) =>
  api.post(`/reports/${reportId}/charts`, data);

export const updateChart = (reportId, chartId, data) =>
  api.put(`/reports/${reportId}/charts/${chartId}`, data);

export const deleteChart = (reportId, chartId) =>
  api.delete(`/reports/${reportId}/charts/${chartId}`);

export const reorderCharts = (reportId, items) =>
  api.patch(`/reports/${reportId}/charts/reorder`, { items });
