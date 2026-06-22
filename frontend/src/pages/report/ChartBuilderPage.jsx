import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReportStore } from '../../store/reportStore';
import StepIndicator from '../../components/builder/StepIndicator';
import ConfigPanel from '../../components/builder/ConfigPanel';
import PreviewPanel from '../../components/builder/PreviewPanel';
import BottomActionBar from '../../components/builder/BottomActionBar';
import { getStatusBarLabel } from '../../utils/reportTypeConfig';
import { openSystemPdfExport } from '../../utils/systemPdfExport';
import { Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import {
  getAvailableKpis,
  calculateKpis,
  buildColumnMap,
  KPI_DEFINITIONS,
} from '../../utils/kpiCalculator';

export function ChartBuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    currentReport,
    fetchReport,
    charts,
    fetchCharts,
    createChart,
    updateChart,
    deleteChart,
    getCsvColumns,
    getCsvPreview,
    getCsvData,
    getPreviewToken,
    isLoading,
    reportType,
    audienceMode,
    setReportType,
    setAudienceMode,
    updateReport,
    applyDefaultChartsForType,
  } = useReportStore();

  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [activeChartId, setActiveChartId] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  // KPI state
  const [selectedKpis, setSelectedKpis] = useState([]);

  // ── Initialization Logic ──────────────────────────────────────────────────
  const loadReportData = React.useCallback(async (reportId) => {
    try {
      const reportData = await fetchReport(reportId);
      
      // Clear data states if not done to prevent stale/broken UI
      if (reportData.upload_status !== 'done') {
        setColumns([]);
        setRows([]);
        return reportData;
      }

      // ONLY fetch data if status is 'done'
      const chartsData = await fetchCharts(reportId);
      if (chartsData && chartsData.length > 0) {
        setActiveChartId(chartsData[0].id);
      }

      const colsData = await getCsvColumns(reportId);
      const detectedCols = colsData?.columns || [];
      setColumns(detectedCols);

      try {
        const fullData = await getCsvData(reportId, -1);
        setRows(fullData?.rows || []);
      } catch {
        try {
          const previewData = await getCsvPreview(reportId);
          setRows(previewData?.rows || []);
        } catch { /* ... */ }
      }

      const savedKpis = reportData?.config_json?.selectedKpis;
      if (savedKpis && Array.isArray(savedKpis)) {
        setSelectedKpis(savedKpis);
      } else {
        const available = getAvailableKpis(detectedCols);
        const autoSelected = available.slice(0, 2).map(k => k.key);
        setSelectedKpis(autoSelected);
      }
      
      return reportData;
    } catch (err) {
      console.error('Error loading report data', err);
    }
  }, [id]);

  useEffect(() => {
    if (id) loadReportData(id);
  }, [id, loadReportData]);

  // ── Polling for Background Upload ─────────────────────────────────────────
  useEffect(() => {
    if (!id || currentReport?.upload_status !== 'processing') return;

    const interval = setInterval(async () => {
      try {
        const report = await fetchReport(id);
        if (report.upload_status === 'done') {
          await loadReportData(id);
        }
      } catch (err) {
        console.error('Polling error', err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [id, currentReport?.upload_status, loadReportData]);

  // ── Derived Data ──────────────────────────────────────────────────────────
  const activeChart = charts.find((c) => c.id === activeChartId) || null;

  // Build column map once
  const columnMap = useMemo(() => buildColumnMap(columns), [columns]);

  // Calculate KPI results whenever rows or selectedKpis change
  const kpiResults = useMemo(() => {
    if (!rows.length || !selectedKpis.length) return [];
    return calculateKpis(rows, selectedKpis, columnMap);
  }, [rows, selectedKpis, columnMap]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleKpiToggle = (kpiKey) => {
    setSelectedKpis(prev =>
      prev.includes(kpiKey) ? prev.filter(k => k !== kpiKey) : [...prev, kpiKey]
    );
  };

  const handleChartChange = async (updatedChart) => {
    if (!updatedChart.id) return;

    // Optimistic update
    useReportStore.setState((state) => ({
      charts: state.charts.map((c) =>
        c.id === updatedChart.id ? { ...c, ...updatedChart } : c
      ),
    }));

    try {
      await updateChart(id, updatedChart.id, {
        name: updatedChart.name,
        type: updatedChart.type,
        config_json: updatedChart.config_json ?? {},
      });
    } catch (err) {
      console.error('Failed to update chart', err);
    }
  };

  const handleAddChart = async () => {
    try {
      const newChart = await createChart(id, {
        name: `Grafik Baru ${charts.length + 1}`,
        type: 'bar',
        config_json: {
          axisX: columns.find((c) => c.type === 'string' || c.type === 'date')?.name || '',
          axisY: columns.find((c) => c.type === 'number')?.name || '',
        },
      });
      if (newChart) {
        setActiveChartId(newChart.id);
      }
    } catch (err) {
      console.error('Failed to create chart', err);
    }
  };

  const handleDeleteChart = async (chartId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus grafik ini?')) return;
    try {
      await deleteChart(id, chartId);
      if (activeChartId === chartId) {
        const remaining = charts.filter((c) => c.id !== chartId);
        setActiveChartId(remaining.length > 0 ? remaining[0].id : null);
      }
    } catch (err) {
      console.error('Failed to delete chart', err);
    }
  };

  const handleSaveReportConfig = async (currentKpis) => {
    if (!id || !currentReport) return;
    try {
      const updatedConfig = {
        ...(currentReport.config_json || {}),
        selectedKpis: currentKpis,
      };

      await updateReport(id, {
        client_id: currentReport.client_id,
        title: currentReport.title,
        report_type: reportType,
        audience_mode: audienceMode,
        config_json: updatedConfig,
      });

      // Map selected KPI keys to required CSV column names
      const colsToCalculate = [];
      currentKpis.forEach(kpiKey => {
        const def = KPI_DEFINITIONS.find(d => d.key === kpiKey);
        if (def) {
          def.requiredColumns.forEach(req => {
            const actualCol = columnMap[req];
            if (actualCol && !colsToCalculate.includes(actualCol)) {
              colsToCalculate.push(actualCol);
            }
          });
        }
      });

      // Trigger backend calculation
      if (colsToCalculate.length > 0) {
        await calculateSummary(id, {
          columns: colsToCalculate,
        });
      }
    } catch (err) {
      console.error('Failed to save report config or calculate metrics', err);
    }
  };

  const handlePreview = async () => {
    await handleSaveReportConfig(selectedKpis);
    navigate(`/reports/${id}`);
  };

  const handleExport = async () => {
    setIsExporting(true);
    const printWindow = window.open('', '_blank');
    try {
      if (!printWindow) {
        throw new Error('Popup diblokir browser. Izinkan popup untuk membuka dialog cetak.');
      }
      await handleSaveReportConfig(selectedKpis);
      await openSystemPdfExport(id, getPreviewToken, { targetWindow: printWindow });
    } catch (err) {
      printWindow?.close();
      console.error('Failed to export PDF', err);
      alert(err.message || 'Gagal membuka dialog export PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleReportTypeChange = async (type) => {
    if (!id || type === reportType || !currentReport) return;
    try {
      setReportType(type);
      await updateReport(id, {
        client_id: currentReport.client_id,
        title: currentReport.title,
        report_type: type,
        audience_mode: audienceMode,
      });
      const created = await applyDefaultChartsForType(id, type, columns);
      if (created.length > 0) {
        setActiveChartId(created[0].id);
      }
    } catch (err) {
      console.error('Failed to change report type', err);
    }
  };

  const handleAudienceModeChange = async (mode) => {
    if (!id || mode === audienceMode || !currentReport) return;
    try {
      setAudienceMode(mode);
      await updateReport(id, {
        client_id: currentReport.client_id,
        title: currentReport.title,
        report_type: reportType,
        audience_mode: mode,
      });
    } catch (err) {
      console.error('Failed to change audience mode', err);
    }
  };

  const statusHint = getStatusBarLabel(
    reportType,
    audienceMode,
    currentReport?.client?.name
  );

  // ── Loading state ─────────────────────────────────────────────────────────
  if (!currentReport) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <Loader2 className="h-10 w-10 animate-spin text-violet-600 mx-auto" />
          <p className="text-sm font-medium text-slate-500">Memuat data laporan...</p>
        </div>
      </div>
    );
  }

  if (currentReport.upload_status === 'processing') {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="max-w-md w-full p-8 bg-white rounded-3xl border border-slate-200 shadow-sm text-center space-y-6">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-violet-600 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-8 h-8 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900">Sistem Sedang Menyiapkan Data</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Kami sedang memproses ribuan baris data CSV kamu di background agar server tetap stabil. 
              Mohon tunggu beberapa detik, halaman ini akan otomatis muncul saat data siap.
            </p>
          </div>
          <div className="pt-4 border-t border-slate-50">
             <button 
               onClick={() => fetchReport(id)} 
               className="text-xs font-bold text-violet-600 hover:text-violet-800 transition-colors"
             >
               Cek Status Manual &rarr;
             </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentReport.upload_status === 'failed') {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="max-w-md w-full p-8 bg-white rounded-3xl border border-slate-200 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
             <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
             </svg>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900">Gagal Memproses Data</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Terjadi kesalahan saat memproses file CSV kamu. Pastikan format file benar dan tidak korup.
            </p>
          </div>
          <div className="flex gap-3 justify-center pt-4">
             <Button onClick={() => navigate('/upload')}>Coba Upload Lagi</Button>
          </div>
        </div>
      </div>
    );
  }

  if (currentReport.upload_status === 'idle') {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="max-w-md w-full p-8 bg-white rounded-3xl border border-slate-200 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
             <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
             </svg>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900">Belum Ada Data</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Laporan ini belum memiliki data CSV atau Excel. Silakan upload file data kamu terlebih dahulu.
            </p>
          </div>
          <div className="flex gap-3 justify-center pt-4">
             <Button onClick={() => navigate('/upload')}>Upload Data Sekarang</Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 select-none">

      {/* ── Top Header ──────────────────────────────────────────────────── */}
      <header className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between flex-shrink-0 z-30">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/reports')}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-sm font-bold text-slate-900">{currentReport.title}</h1>
            <p className="text-[10px] text-slate-400 font-medium">
              {currentReport.client?.name || 'Klien Umum'}
              {kpiResults.length > 0 && (
                <span className="ml-2 text-violet-500 font-bold">· {kpiResults.length} KPI Aktif</span>
              )}
            </p>
          </div>
        </div>

        <StepIndicator currentStep={3} />
      </header>

      {/* ── Main Split View ─────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden pb-16">
        <ConfigPanel
          columns={columns}
          rows={rows}
          chart={activeChart || {}}
          onChange={handleChartChange}
          overlayMode={activeChart?.type === 'overlay'}
          onOverlayToggle={() => {
            if (!activeChart) return;
            const newType = activeChart.type === 'overlay' ? 'bar' : 'overlay';
            handleChartChange({ ...activeChart, type: newType });
          }}
          onAddChart={handleAddChart}
          reportType={reportType}
          audienceMode={audienceMode}
          onReportTypeChange={handleReportTypeChange}
          onAudienceModeChange={handleAudienceModeChange}
          selectedKpis={selectedKpis}
          onKpiToggle={handleKpiToggle}
        />

        <PreviewPanel
          charts={charts}
          rows={rows}
          activeChartId={activeChartId}
          onSelectChart={setActiveChartId}
          onDeleteChart={handleDeleteChart}
          onAddChart={handleAddChart}
          platform={currentReport?.detected_platform || 'generic'}
          kpiResults={kpiResults}
          reportType={reportType}
        />
      </div>

      {/* ── Footer Actions ──────────────────────────────────────────────── */}
      <BottomActionBar
        chartsCount={charts.length}
        platform={currentReport.detected_platform}
        reportType={reportType}
        audienceMode={audienceMode}
        clientName={currentReport.client?.name}
        statusHint={statusHint}
        isExporting={isExporting}
        onPreview={handlePreview}
        onExport={handleExport}
        kpiCount={kpiResults.length}
      />
    </div>
  );
}

export default ChartBuilderPage;
