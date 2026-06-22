import api from './axiosInstance';
import axios from 'axios';

export const getReports = () =>
  api.get('/reports');                            // GET /api/v1/reports

export const getReport = (id) =>
  api.get(`/reports/${id}`);                     // GET /api/v1/reports/:id

export const createReport = (data) =>
  api.post('/reports', data);                    // POST /api/v1/reports

export const updateReport = (id, data) =>
  api.put(`/reports/${id}`, data);               // PUT /api/v1/reports/:id

export const deleteReport = (id) =>
  api.delete(`/reports/${id}`);                  // DELETE /api/v1/reports/:id

// CSV Operations
export const uploadCsv = (reportId, file) => {
  const form = new FormData();
  form.append('file', file);
  form.append('report_id', reportId);
  return api.post('/csv/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });                                             // POST /api/v1/csv/upload
};

export const getCsvColumns = (reportId) =>
  api.get(`/csv/${reportId}/columns`);           // GET /api/v1/csv/:reportId/columns

export const getCsvPreview = (reportId) =>
  api.get(`/csv/${reportId}/preview`);           // GET /api/v1/csv/:reportId/preview

export const getCsvData = (reportId, limit = 2000) =>
  api.get(`/csv/${reportId}/data`, { params: { limit } }); // GET /api/v1/csv/:reportId/data

// Calculations
export const calculateSummary = (reportId, payload) =>
  api.post(`/reports/${reportId}/calculate`, payload); // POST /api/v1/reports/:id/calculate

export const getSummary = (reportId) =>
  api.get(`/reports/${reportId}/summary`);       // GET /api/v1/reports/:id/summary

// PDF Export
export const exportPdf = (reportId) =>
  api.post(`/reports/${reportId}/export`);       // POST /api/v1/reports/:id/export

export const downloadPdf = (reportId) =>
  api.get(`/reports/${reportId}/pdf`, {
    responseType: 'blob',
  });                                             // GET /api/v1/reports/:id/pdf

export const getPreviewToken = (reportId) =>
  api.get(`/reports/${reportId}/preview-token`); // GET /api/v1/reports/:id/preview-token

export const getReportPreviewData = (reportId, token) =>
  api.get(`/reports/${reportId}/preview-data`, { params: { token } }); // GET /api/v1/reports/:id/preview-data

// Shared Dashboards
export const createShareLink = (reportId) =>
  api.post(`/reports/${reportId}/share`);

export const getActiveShareLink = (reportId) =>
  api.get(`/reports/${reportId}/share`);

export const revokeShareLink = (reportId) =>
  api.delete(`/reports/${reportId}/share`);

// Public endpoint — no auth needed
export const getPublicDashboard = (token) =>
  axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'}/dashboard/${token}`);
