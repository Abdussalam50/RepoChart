import api from './axiosInstance';

export const uploadCsvFull = (reportId, file, onProgress) => {
  const form = new FormData();
  form.append('file', file);
  form.append('report_id', reportId);
  return api.post('/csv/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: onProgress,
  });
};

export const getInsightStatus = (reportId) =>
  api.get(`/reports/${reportId}/insight-status`);
