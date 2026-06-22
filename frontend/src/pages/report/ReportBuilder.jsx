import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReportStore } from '../../store/reportStore';
import { useAuthStore } from '../../store/authStore';
import ReactApexChart from 'react-apexcharts';
import { buildApexOptions } from '../../utils/chartApexBuilder';
import { generateChartNarrative } from '../../utils/chartNarrativeGenerator';
import ChartNarrative from '../../components/report/ChartNarrative';
import ReportSopSection from '../../components/report/sop/ReportSopSection';
import { InsightBox } from '../../components/report/InsightBox';
import ChartBlock from '../../components/report/ChartBlock';
import ShareButton from '../../components/report/ShareButton';
import { useInsightPolling } from '../../hooks/useInsightPolling';
import { openSystemPdfExport } from '../../utils/systemPdfExport';
import { KPICard } from '../../components/report/KPICard';
import { usePlanLimits } from '../../hooks/usePlanLimits';
import { useModalStore } from '../../store/modalStore';
import {
  KPI_DEFINITIONS,
  buildColumnMap,
  resolveKpiFromMetrics,
  calculateKpis,
  rateKpi
} from '../../utils/kpiCalculator';
import {
  ArrowLeft,
  FileDown,
  Pencil,
  Sparkles,
  Loader2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  BarChart2,
} from 'lucide-react';



/* ─── Main Page ─────────────────────────────────────────────────────── */
export function ReportBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { isPro } = usePlanLimits();
  const { openModal } = useModalStore();

  const {
    currentReport,
    fetchReport,
    fetchCharts,
    charts,
    getCsvData,
    generateInsight,
    getInsight,
    getPreviewToken,
  } = useReportStore();

  const [rows, setRows] = useState([]);
  const [isExporting, setIsExporting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Custom AI Insight configuration state
  const [insightFocus, setInsightFocus] = useState('umum');
  const [selectedChartIds, setSelectedChartIds] = useState([]);
  const [customInstructions, setCustomInstructions] = useState('');

  const {
    insight,
    setInsight,
    isPolling: isInsightPolling,
    error: insightError,
    setError: setInsightError,
    startProcessing: startInsightProcessing,
    status: insightStatus,
  } = useInsightPolling(id, currentReport?.insight_status ?? 'idle');

  // Auto-select all charts when fetched
  useEffect(() => {
    if (charts && charts.length > 0 && selectedChartIds.length === 0) {
      setSelectedChartIds(charts.map(c => c.id));
    }
  }, [charts]);

  useEffect(() => {
    if (!id) return;
    const init = async () => {
      setIsLoading(true);
      try {
        const reportData = await fetchReport(id);
        await fetchCharts(id);
        const csvData = await getCsvData(id, -1);
        setRows(csvData?.rows || []);
        try {
          const ins = await getInsight(id);
          if (ins?.insight_text || ins?.recommendation_text) {
            setInsight(ins);
          }
        } catch (_) {
          /* insight may not exist yet */
        }
      } catch (err) {
        setError('Gagal memuat data laporan.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [id]);

  const handleGenerateAI = async () => {
    setInsightError(null);
    setError('');
    startInsightProcessing();
    try {
      const res = await generateInsight(id, {
        focus: insightFocus,
        chart_ids: selectedChartIds,
        custom_instructions: customInstructions,
      });
      if (res?.status !== 'processing') {
        setInsightError('Respons tidak dikenali. Coba lagi.');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Gagal memulai generate AI insight.');
      setInsightError(err.response?.data?.error || err.message || 'Gagal memulai generate AI insight.');
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await openSystemPdfExport(id, getPreviewToken, { watermark: !isPro });
    } catch (err) {
      setError(err.message || 'Gagal membuka dialog export PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  /* ── loading ── */
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <Loader2 className="h-10 w-10 animate-spin text-violet-600 mx-auto" />
          <p className="text-sm font-medium text-slate-500">Memuat pratinjau laporan…</p>
        </div>
      </div>
    );
  }

  const report = currentReport;
  const client = report?.client || {};
  const brandColor = client.brand_color || '#8b5cf6';
  const platform = report?.detected_platform || 'generic';

  const metrics = report?.metrics || [];

  // Resolve columns and columnMap from rows
  const csvColumns = rows.length > 0
    ? Object.keys(rows[0]).map(name => ({ name, type: isNaN(Number(rows[0][name])) ? 'string' : 'number' }))
    : [];
  const columnMap = buildColumnMap(csvColumns);

  // Read selected KPIs from config
  const selectedKpis = report?.config_json?.selectedKpis || [];

  // Calculate KPI values directly from rows (guarantees they show up if data exists)
  const resolvedKpis = calculateKpis(rows, selectedKpis, columnMap).map(kpi => {
    // Try to get delta from backend metrics if it exists
    const backendKpi = resolveKpiFromMetrics(kpi.key, metrics, columnMap);
    return {
      key: kpi.key,
      label: kpi.label,
      value: kpi.value,
      delta: backendKpi?.delta,
      format: kpi.format,
    };
  });

  const displayKpiCards = resolvedKpis.length > 0
    ? resolvedKpis.slice(0, 4)
    : metrics.slice(0, 4).map(m => ({
        key: m.column_name?.toLowerCase(),
        label: m.column_name,
        value: Number(m.metric_sum),
        delta: m.delta_percent != null ? Number(m.delta_percent) : undefined,
        format: undefined,
      }));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* ── Top bar ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 h-16 px-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/reports/${id}/builder`)}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700 transition-colors"
            title="Kembali ke Builder"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-sm font-bold text-slate-900 leading-tight">
              {report?.title || 'Preview Laporan'}
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">
              {client.name || 'Pratinjau'} · {charts.length} grafik
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/reports/${id}/builder`)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Pencil className="w-4 h-4" />
            Edit Grafik
          </button>

          {/* Share Dashboard — Pro only */}
          {isPro && (
            <ShareButton reportId={id} />
          )}

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-colors disabled:opacity-60"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileDown className="w-4 h-4" />
            )}
            Export PDF
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8 space-y-8">
        {/* ── Error banner ── */}
        {error && (
          <div className="rounded-2xl bg-red-50 border border-red-100 p-4 flex items-center gap-3 text-sm text-red-700">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}

        {/* ── Report header card ── */}
        <div
          className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex items-center justify-between"
          style={{ borderLeft: `5px solid ${brandColor}` }}
        >
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">{report?.title}</h2>
            <p className="text-sm text-slate-500 mt-1">
              Klien: <span className="font-semibold text-slate-700">{client.name}</span>
              {report?.period_start && (
                <>
                  {' · '}
                  {new Date(report.period_start).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
                  {report.period_end ? ` – ${new Date(report.period_end).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}` : ''}
                </>
              )}
            </p>
            {report?.detected_platform && report.detected_platform !== 'generic' && (
              <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
                {report.detected_platform.replace('_', ' ')}
              </span>
            )}
          </div>
          {client.logo_path ? (
            <img
              src={`${import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:8000'}/storage/${client.logo_path}`}
              alt="Logo"
              className="h-14 max-w-[120px] object-contain rounded-xl border border-slate-100 p-1"
            />
          ) : (
            <div
              className="h-12 w-12 rounded-2xl flex items-center justify-center text-white text-xl font-extrabold"
              style={{ backgroundColor: brandColor }}
            >
              {client.name?.slice(0, 1) || '?'}
            </div>
          )}
        </div>

        {/* ── Ringkasan Metrik / KPI ── */}
        {displayKpiCards.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4">
            {displayKpiCards.map((m, i) => (
              <KPICard
                key={m.key || i}
                title={m.label}
                value={m.value}
                change={m.delta}
                type={rateKpi(m.key, m.delta)}
                format={m.format}
              />
            ))}
          </div>
        )}

        {/* ── SOP Analysis (3 lapis + keputusan bisnis) ── */}
        <ReportSopSection
          rows={rows}
          platform={platform}
          reportType={currentReport?.report_type || 'monthly'}
          audienceMode={currentReport?.audience_mode || 'client'}
        />

        {/* ── Charts grid ── */}
        <section>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Visualisasi Grafik</h3>

          {charts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center text-slate-400 space-y-3">
              <BarChart2 className="w-10 h-10 mx-auto opacity-40" />
              <p className="text-sm font-medium">Belum ada grafik yang dikonfigurasi.</p>
              <button
                onClick={() => navigate(`/reports/${id}/builder`)}
                className="text-violet-600 text-sm font-semibold hover:underline"
              >
                Buka Chart Builder →
              </button>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
              {/* CSS Print Styles to expand scrollable charts to full width in PDF */}
              <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                  .chart-scroll-container {
                    overflow: visible !important;
                    width: 100% !important;
                    min-width: 100% !important;
                  }
                  .chart-scroll-inner {
                    width: 100% !important;
                    min-width: 100% !important;
                  }
                }
              `}} />
              {charts.map((chart) => {
                if (!rows.length) return null;
                const { options, series, type } = buildApexOptions(chart, rows);
                
                const isPie = type === 'pie' || type === 'donut';
                const categoriesCount = options.xaxis?.categories?.length || 0;
                const isLargeDataset = !isPie && categoriesCount > 10;
                const dynamicWidth = isLargeDataset ? `${categoriesCount * 40}px` : '100%';

                return (
                  <div
                    key={chart.id}
                    className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm overflow-hidden"
                  >
                     <ChartBlock chart={chart} rows={rows} platform={platform} compact={false} reportType={currentReport?.report_type || 'monthly'} /> 
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── AI Insight section ── */}
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-600" />
              <h3 className="font-bold text-slate-800">AI Insight</h3>
              {!isPro && (
                <button
                  onClick={openModal}
                  className="text-[10px] bg-amber-100 hover:bg-amber-200 text-amber-700 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider cursor-pointer transition-colors"
                  title="Klik untuk upgrade ke Pro"
                >
                  Pro
                </button>
              )}
            </div>
            {isPro && (
              <button
                onClick={handleGenerateAI}
                disabled={isInsightPolling}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold transition-colors disabled:opacity-60"
              >
                {isInsightPolling ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                {isInsightPolling ? 'Memproses…' : 'Generate'}
              </button>
            )}
          </div>

          {isPro && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
              {/* Focus Selector */}
              <div>
                <label className="block text-slate-500 font-semibold mb-1 uppercase tracking-wider">Fokus Analisis</label>
                <select
                  value={insightFocus}
                  onChange={(e) => setInsightFocus(e.target.value)}
                  disabled={isInsightPolling}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-violet-500"
                >
                  <option value="umum">Umum (General)</option>
                  <option value="cost_efficiency">Efisiensi Biaya (Cost Efficiency)</option>
                  <option value="conversions">Konversi & ROAS</option>
                  <option value="engagement">Keterlibatan (Engagement & Clicks)</option>
                </select>
              </div>

              {/* Chart selector */}
              <div>
                <label className="block text-slate-500 font-semibold mb-1 uppercase tracking-wider">Pilih Grafik untuk Dianalisis</label>
                <div className="max-h-24 overflow-y-auto space-y-1.5 bg-white border border-slate-200 rounded-xl p-2.5">
                  {charts.map(chart => (
                    <label key={chart.id} className="flex items-center gap-2 cursor-pointer text-slate-700">
                      <input
                        type="checkbox"
                        checked={selectedChartIds.includes(chart.id)}
                        disabled={isInsightPolling}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedChartIds([...selectedChartIds, chart.id]);
                          } else {
                            setSelectedChartIds(selectedChartIds.filter(id => id !== chart.id));
                          }
                        }}
                        className="rounded text-violet-600 focus:ring-violet-500 h-3.5 w-3.5"
                      />
                      <span className="truncate">{chart.name}</span>
                    </label>
                  ))}
                  {charts.length === 0 && <span className="text-slate-400 italic text-[11px]">Belum ada grafik</span>}
                </div>
              </div>

              {/* Custom prompt/instructions */}
              <div>
                <label className="block text-slate-500 font-semibold mb-1 uppercase tracking-wider">Instruksi Khusus (Opsional)</label>
                <textarea
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  disabled={isInsightPolling}
                  rows={2}
                  placeholder="Misal: Evaluasi campaign hijab, kenapa CTR rendah?"
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
                />
              </div>
            </div>
          )}

          {!isPro ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50/50 to-indigo-50/30 text-slate-700 shadow-sm font-sans">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-violet-900 flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-amber-450 animate-pulse" />
                  Fitur AI Insight Terkunci
                </h4>
                <p className="text-xs text-slate-500">
                  Upgrade ke paket <strong>Pro</strong> untuk mendapatkan analisis AI otomatis dan rekomendasi performa iklan Anda.
                </p>
              </div>
              <button 
                type="button"
                onClick={openModal}
                className="shrink-0 px-4 py-2 bg-violet-600 hover:bg-violet-750 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer hover:bg-violet-700"
              >
                Upgrade ke Pro
              </button>
            </div>
          ) : isInsightPolling ? (
            <div className="flex flex-col items-center justify-center gap-3 py-8 rounded-2xl bg-violet-50/50 border border-violet-100">
              <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
              <div className="text-center space-y-1">
                <p className="text-sm font-semibold text-violet-800">AI sedang menganalisis data…</p>
                <p className="text-xs text-violet-600/80">
                  Hasil insight akan tampil otomatis — tidak perlu refresh halaman.
                </p>
              </div>
            </div>
          ) : insightError || insightStatus === 'failed' ? (
            <div className="rounded-2xl bg-red-50 border border-red-100 p-4 text-sm text-red-700">
              {insightError || 'Generasi insight gagal. Silakan coba lagi.'}
            </div>
          ) : insight?.insight_text || insight?.recommendation_text || insight?.custom_insight_text ? (
            <InsightBox insight={insight} reportId={id} userPlan={isPro ? 'pro' : 'free'} />
          ) : (
            <p className="text-sm text-slate-400 italic">
              Belum ada insight. Klik tombol "Generate" untuk memulai analisis AI.
            </p>
          )}
        </section>
      </main>
    </div>
  );
}

export default ReportBuilder;
