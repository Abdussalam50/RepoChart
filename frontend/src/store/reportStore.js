import { create } from 'zustand';
import * as reportService from '../api/reportService';
import * as insightService from '../api/insightService';
import * as chartService from '../api/chartService';
import { buildDefaultCharts } from '../utils/reportTypeConfig';
import * as csvService from '../api/csvService';

export const useReportStore = create((set, get) => ({

  reports: [],
  currentReport: null,
  isLoading: false,
  error: null,
  charts: [],
  activeChartId: null,
  detectedPlatform: null,
  detectionConfidence: 0,
  defaultCharts: [],
  insightStatus: 'none',
  reportType: 'monthly',
  audienceMode: 'client',

  setDetectedPlatform: (platform, confidence) => set({ detectedPlatform: platform, detectionConfidence: confidence }),
  setDefaultCharts: (charts) => set({ charts: charts, defaultCharts: charts }),
  setActiveChart: (chartId) => set({ activeChartId: chartId }),
  setInsightStatus: (status) => set({ insightStatus: status }),

  setReportType: (type) => set({ reportType: type }),
  setAudienceMode: (mode) => set({ audienceMode: mode }),

  applyDefaultChartsForType: async (reportId, reportType, columns) => {
    const templates = buildDefaultCharts(reportType, columns);
    const existing = get().charts;

    for (const chart of existing) {
      try {
        await chartService.deleteChart(reportId, chart.id);
      } catch (e) {
        console.warn('Failed to delete chart during type switch', e);
      }
    }

    const created = [];
    for (const template of templates) {
      const response = await chartService.createChart(reportId, template);
      created.push(response.data);
    }

    set({
      charts: created,
      activeChartId: created[0]?.id ?? null,
    });

    return created;
  },

  fetchCharts: async (reportId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await chartService.getCharts(reportId);
      set({ charts: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  createChart: async (reportId, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await chartService.createChart(reportId, data);
      set({ charts: [...get().charts, response.data], isLoading: false });
      return response.data;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  updateChart: async (reportId, chartId, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await chartService.updateChart(reportId, chartId, data);
      set({ 
        charts: get().charts.map(c => c.id === chartId ? response.data : c), 
        isLoading: false 
      });
      return response.data;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  deleteChart: async (reportId, chartId) => {
    set({ isLoading: true, error: null });
    try {
      await chartService.deleteChart(reportId, chartId);
      set({ 
        charts: get().charts.filter(c => c.id !== chartId), 
        activeChartId: get().activeChartId === chartId ? null : get().activeChartId,
        isLoading: false 
      });
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  reorderCharts: async (reportId, items) => {
    set({ isLoading: true, error: null });
    try {
      const response = await chartService.reorderCharts(reportId, items);
      set({ charts: response.data.charts, isLoading: false });
      return response.data;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  uploadCsvFull: async (reportId, file, onProgress) => {
    set({ isLoading: true, error: null });
    try {
      const response = await csvService.uploadCsvFull(reportId, file, onProgress);
      set({ 
        detectedPlatform: response.data.platform || null,
        detectionConfidence: response.data.confidence || 0,
        defaultCharts: response.data.default_charts || [],
        charts: response.data.default_charts || [],
        sanitizationPreview: response.data.sanitization_preview || [],
        wasSanitized: response.data.was_sanitized || false,
        isLoading: false 
      });
      return response.data;
    } catch (error) {
      set({ isLoading: false, error: error.response?.data?.message || error.message });
      throw error;
    }
  },

  fetchInsightStatus: async (reportId) => {
    try {
      const response = await csvService.getInsightStatus(reportId);
      set({ insightStatus: response.data.insight_status });
      return response.data;
    } catch (error) {
      console.error('Error fetching insight status', error);
      throw error;
    }
  },


  fetchReports: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await reportService.getReports();
      set({ reports: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  fetchReport: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await reportService.getReport(id);
      set({
        currentReport: response.data,
        reportType: response.data.report_type || 'monthly',
        audienceMode: response.data.audience_mode || 'client',
        isLoading: false,
      });
      return response.data;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  createReport: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await reportService.createReport(data);
      set({ 
        reports: [response.data, ...get().reports], 
        isLoading: false 
      });
      return response.data;
    } catch (error) {
      set({ isLoading: false, error: error.response?.data?.message || error.message });
      throw error;
    }
  },

  updateReport: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await reportService.updateReport(id, data);
      set({
        reports: get().reports.map(r => r.id === id ? response.data : r),
        currentReport: response.data,
        reportType: response.data.report_type || get().reportType,
        audienceMode: response.data.audience_mode || get().audienceMode,
        isLoading: false,
      });
      return response.data;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  deleteReport: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await reportService.deleteReport(id);
      set({ 
        reports: get().reports.filter(r => r.id !== id),
        currentReport: get().currentReport?.id === id ? null : get().currentReport,
        isLoading: false 
      });
    } catch (error) {
      set({ isLoading: false, error: error.message });
    }
  },
  
  uploadCsv: async (reportId, file) => {
    set({ isLoading: true, error: null });
    try {
      const response = await reportService.uploadCsv(reportId, file);
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      set({ isLoading: false, error: error.response?.data?.message || error.message });
      throw error;
    }
  },

  getCsvColumns: async (reportId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await reportService.getCsvColumns(reportId);
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      set({ isLoading: false, error: error.response?.data?.message || error.message });
      throw error;
    }
  },

  getCsvPreview: async (reportId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await reportService.getCsvPreview(reportId);
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      set({ isLoading: false, error: error.response?.data?.message || error.message });
      throw error;
    }
  },

  getCsvData: async (reportId, limit = 2000) => {
    set({ isLoading: true, error: null });
    try {
      const response = await reportService.getCsvData(reportId, limit);
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      set({ isLoading: false, error: error.response?.data?.message || error.message });
      throw error;
    }
  },

  calculateSummary: async (reportId, payload) => {
    set({ isLoading: true, error: null });
    try {
      const response = await reportService.calculateSummary(reportId, payload);
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      set({ isLoading: false, error: error.response?.data?.message || error.message });
      throw error;
    }
  },
  
  getSummary: async (reportId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await reportService.getSummary(reportId);
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      set({ isLoading: false, error: error.response?.data?.message || error.message });
      throw error;
    }
  },
  
  generateInsight: async (reportId, payload = {}) => {
    try {
      const response = await insightService.generateInsight(reportId, payload);
      set({ insightStatus: response.data?.status === 'processing' ? 'processing' : get().insightStatus });
      return response.data;
    } catch (error) {
      set({ insightStatus: 'failed' });
      throw error;
    }
  },

  getInsight: async (reportId) => {
    try {
      const response = await insightService.getInsight(reportId);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  exportPdf: async (reportId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await reportService.exportPdf(reportId);
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      set({ isLoading: false, error: error.response?.data?.message || error.message });
      throw error;
    }
  },

  downloadPdf: async (reportId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await reportService.downloadPdf(reportId);
      set({ isLoading: false });
      return response.data; // This is a blob
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  getPreviewToken: async (reportId) => {
    try {
      const response = await reportService.getPreviewToken(reportId);
      return response.data;
    } catch (error) {
      console.error('Error fetching preview token:', error);
      throw error;
    }
  },

  getReportPreviewData: async (reportId, token) => {
    set({ isLoading: true, error: null });
    try {
      const response = await reportService.getReportPreviewData(reportId, token);
      set({ currentReport: response.data.report, isLoading: false });
      return response.data;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  }
}));
