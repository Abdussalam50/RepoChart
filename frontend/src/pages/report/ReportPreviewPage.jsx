import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useReportStore } from '../../store/reportStore';
import ChartBlock from '../../components/report/ChartBlock';
import ReportSopSection from '../../components/report/sop/ReportSopSection';
import { KPICard } from '../../components/report/KPICard';
import { getLayoutConfig } from '../../utils/reportTypeConfig';
import { generateChartNarrative } from '../../utils/chartNarrativeGenerator';
import { Loader2, Sparkles } from 'lucide-react';
import {
  KPI_DEFINITIONS,
  buildColumnMap,
  resolveKpiFromMetrics,
  calculateKpis,
  rateKpi,
} from '../../utils/kpiCalculator';

// ─────────────────────────────────────────────────────────────────────────────
// Helper: format date label
// ─────────────────────────────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function splitNarrativeSentences(text = '') {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function estimateChartPrintUnits(chart, rows, platform) {
  const cfg = chart?.config_json || {};
  const narrative = generateChartNarrative(chart, rows, { platform });
  const narrativeSentences = splitNarrativeSentences(narrative);
  const description = cfg.description || '';
  const categoriesCount = Array.isArray(rows) && rows.length ? rows.length : 0;
  const isLargeDataset = chart?.type !== 'pie' && chart?.type !== 'donut' && categoriesCount > 10;

  let units = 78;

  if (chart?.type === 'overlay') units += 14;
  if (chart?.type === 'formula') units -= 12;
  if (isLargeDataset) units += 8;

  units += Math.ceil((chart?.name || '').length / 42) * 4;
  units += description ? 5 + Math.ceil(description.length / 90) * 4 : 0;
  units += narrativeSentences.reduce((total, sentence) => {
    return total + 5 + Math.ceil(sentence.length / 105) * 4;
  }, narrative ? 8 : 0);

  return units;
}

function paginateChartsForPrint(charts = [], rows = [], platform = 'generic') {
  const maxChartsPerPage = 2;
  const maxPageUnits = 320; // Ditingkatkan drastis agar 2 grafik selalu masuk 1 halaman jika muat
  const pages = [];
  let index = 0;

  while (index < charts.length) {
    const first = charts[index];
    const second = charts[index + 1];

    if (!second) {
      pages.push([first]);
      break;
    }

    const firstUnits = estimateChartPrintUnits(first, rows, platform);
    const secondUnits = estimateChartPrintUnits(second, rows, platform);

    if (firstUnits + secondUnits <= maxPageUnits) {
      pages.push([first, second].slice(0, maxChartsPerPage));
      index += 2;
    } else {
      pages.push([first]);
      index += 1;
    }
  }

  return pages;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export function ReportPreviewPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const showWatermark = searchParams.get('watermark') === '1';
  const autoPrint = searchParams.get('autoprint') === '1';

  const { getReportPreviewData } = useReportStore();
  const [report, setReport] = useState(null);
  const [charts, setCharts] = useState([]);
  const [rows, setRows] = useState([]);
  const [sopAnalysis, setSopAnalysis] = useState(null);
  const [layout, setLayout] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const chartsReadyRef = useRef(false);

  useEffect(() => {
    const fetchPreviewData = async () => {
      if (!id || !token) {
        setErrorMsg('Report ID and temporary preview token are required.');
        setIsLoading(false);
        return;
      }
      try {
        const response = await getReportPreviewData(id, token);
        setReport(response.report);
        setCharts(response.charts || response.report?.charts || []);
        setRows(response.csv_preview || []);
        setSopAnalysis(response.sop_analysis || null);
        setLayout(
          response.layout ||
            getLayoutConfig(
              response.report?.report_type || 'monthly',
              response.report?.audience_mode || 'client'
            )
        );
      } catch (err) {
        setErrorMsg('Failed to authorize or load report preview.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreviewData();
  }, [id, token]);

  // Let charts finish rendering before optional system print.
  useEffect(() => {
    if (!isLoading && report && !chartsReadyRef.current) {
      const timer = setTimeout(() => {
        document.dispatchEvent(new Event('charts-ready'));
        chartsReadyRef.current = true;
        if (autoPrint) {
          window.print();
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isLoading, report, autoPrint]);

  // ── Loading state ─────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-slate-500 font-sans">Menyiapkan preview PDF A4...</p>
        </div>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (errorMsg || !report) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="rounded-2xl bg-red-50 p-6 border border-red-100 max-w-md text-center">
          <h2 className="text-lg font-bold text-red-800 mb-2">Access Denied</h2>
          <p className="text-sm text-red-700 font-sans">{errorMsg || 'Unable to load preview.'}</p>
        </div>
      </div>
    );
  }

  // ── Derived data (ALWAYS after loading/error guards) ─────────────────────
  const client = report.client || {};
  const metrics = report.metrics || [];
  const platform = report.detected_platform || 'generic';
  const reportType = report.report_type || 'monthly';
  const audienceMode = report.audience_mode || 'client';
  const pageLayout = layout || getLayoutConfig(reportType, audienceMode);

  // Resolve columns and columnMap from rows
  const csvColumns = rows.length > 0
    ? Object.keys(rows[0]).map(name => ({ name, type: isNaN(Number(rows[0][name])) ? 'string' : 'number' }))
    : [];
  const columnMap = buildColumnMap(csvColumns);

  // Read selected KPIs from config
  const selectedKpis = report.config_json?.selectedKpis || [];

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

  // ⚡ FIX: Define insights and recommendations BEFORE using them
  const insights =
    report.config_json?.manual_insights?.insights ||
    ((report.insight?.custom_insight_text || report.insight?.insight_text)
      ? (report.insight.custom_insight_text || report.insight.insight_text).split('\n').filter(Boolean)
      : []);

  const recommendations =
    report.config_json?.manual_insights?.recommendations ||
    ((report.insight?.custom_recommendation_text || report.insight?.recommendation_text)
      ? (report.insight.custom_recommendation_text || report.insight.recommendation_text).split('\n').filter(Boolean)
      : []);

  // Show ALL insights and recommendations in PDF (no truncation)
  const displayInsights = insights;
  const displayRecommendations = recommendations;

  const brandColor = client.brand_color || '#8b5cf6';
  const logoUrl = client.logo_path
    ? `${import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:8000'}/storage/${client.logo_path}`
    : null;

  const today = formatDate(new Date().toISOString());
  const periodLabel = report.period_start
    ? `${formatDate(report.period_start)}${report.period_end ? ` – ${formatDate(report.period_end)}` : ''}`
    : today;

  // Cadence label
  const cadenceMap = { daily: 'Harian', weekly: 'Mingguan', monthly: 'Bulanan', quarterly: 'Kuartalan' };
  const cadenceLabel = cadenceMap[report.cadence] || 'Bulanan';
  const chartPages = paginateChartsForPrint(charts, rows, platform);
  const hasInsights = displayInsights.length > 0 || displayRecommendations.length > 0;
  const totalPages = 1 + chartPages.length + (!showWatermark && hasInsights ? 1 : 0);

  // ── Render (A4 layout) ────────────────────────────────────────────────────
  return (
    <div className="report-shell bg-slate-100 min-h-screen font-sans antialiased flex flex-col items-center py-8 gap-6 relative">

      {/* Watermark */}
      {showWatermark && (
        <div
          className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center opacity-[0.06]"
          aria-hidden
        >
          <span className="text-6xl font-black uppercase tracking-widest rotate-[-24deg] text-slate-900">
            RepoChart Free
          </span>
        </div>
      )}

      {/* Print + global styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght=400;500;600;700;800;900&display=swap');
        
        @page {
          size: A4;
          margin: 0;
        }
        
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          font-family: 'Inter', system-ui, sans-serif;
          box-sizing: border-box;
        }
        
        html, body, #root {
          background: #f1f5f9;
        }
        
        /* LAYOUT UTAMA (PREVIEW DI LAYAR) */
        .report-page {
          width: 210mm;
          min-height: 297mm;
          padding: 12mm 14mm 12mm;
          background: white;
          position: relative;
          border-radius: 12px;
          margin-bottom: 8mm;
          display: flex;
          flex-direction: column;
        }

        .report-body {
          flex: 1 1 auto;
          padding-bottom: 8mm;
        }

        .report-footer {
          margin-top: auto;
          border-top: 1px solid #f1f5f9;
          padding-top: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #94a3b8;
          font-size: 9px;
          font-weight: 600;
        }

        /* KONDISI SAAT PRINT (PDF) */
        @media print {
          html, body {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          
          .no-print { display: none !important; }
          
          .report-shell {
            padding: 0 !important;
            gap: 0 !important;
            background: white !important;
          }

          .report-page {
            width: 210mm !important;
            /* PENTING: Ubah min-height menjadi auto agar browser bisa memotong secara natural */
            min-height: auto !important; 
            height: auto !important;
            /* PENTING: Matikan flexbox saat print agar page-break-inside bekerja sempurna */
            display: block !important; 
            overflow: visible !important;
            padding: 12mm 14mm 12mm !important;
            box-shadow: none !important;
            margin: 0 !important;
            border-radius: 0 !important;
            page-break-after: always;
            break-after: page;
          }
          
          .report-page:last-of-type {
            page-break-after: auto;
            break-after: auto;
          }

          /* Memaksa footer tetap berada di bawah halaman cetak tanpa merusak flow */
          .report-footer {
            page-break-inside: avoid;
            break-inside: avoid;
            margin-top: 8mm; 
          }
          
          /* Mencegah komponen terpotong di tengah-tengah */
          .report-section,
          .chart-print-card,
          .kpi-print-grid,
          .insight-print-box,
          .kpi-grid-4,
          .kpi-grid-3,
          .kpi-grid-2,
          table, 
          tr {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          .chart-scroll-container {
            overflow: visible !important;
          }
          
          .chart-scroll-inner {
            width: 100% !important;
            min-width: 100% !important;
          }

          .sop-print-flow,
          .sop-print-flow > section,
          .sop-print-flow .sop-print-stack,
          .sop-print-flow .sop-diagnosis-list {
            page-break-inside: auto !important;
            break-inside: auto !important;
          }

          .sop-print-flow .sop-print-card,
          .sop-print-flow .sop-diagnosis-item {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            box-shadow: none !important;
          }

          .sop-print-flow .sop-print-splittable {
            page-break-inside: auto !important;
            break-inside: auto !important;
          }

          .sop-print-flow .sop-print-splittable p,
          .sop-print-flow .sop-print-splittable li,
          .sop-print-flow .sop-print-splittable .sop-keep-together {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          .sop-print-flow .sop-action-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
            gap: 8px !important;
          }

          .report-flow-section,
          .report-flow-section .report-flow-list {
            page-break-inside: auto !important;
            break-inside: auto !important;
          }

          .report-flow-section li,
          .report-flow-section .report-flow-item {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          .chart-print-flow,
          .chart-print-flow .report-section,
          .chart-print-flow .chart-page-grid {
            page-break-inside: auto !important;
            break-inside: auto !important;
          }

          .chart-print-flow .chart-print-card,
          .chart-print-flow .chart-block,
          .chart-print-flow .chart-narrative,
          .chart-print-flow .chart-header,
          .chart-print-flow .chart-visual,
          .chart-print-flow .chart-description,
          .chart-print-flow .chart-narrative-item {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          .chart-print-flow .chart-block {
            overflow: visible !important;
            box-shadow: none !important;
            padding: 6px !important;
            margin-bottom: 4px !important;
          }

          .chart-print-flow .chart-page-grid {
            gap: 4px !important;
          }
        }

        /* UTILITY GRIDS */
        .kpi-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
        .kpi-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .kpi-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
        .chart-page-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }

        /* Force KPI grid to 4-columns in PDF/print */
        @media print {
          .grid-cols-1, .grid-cols-2 {
            grid-template-columns: repeat(4, 1fr) !important;
          }
        }
      `}</style>

      {/* ══════════════════════════════════════════════════════════════════
          HALAMAN 1 — Executive Summary
      ══════════════════════════════════════════════════════════════════ */}
      <div className="report-page shadow-xl">

        {/* ── Brand Color Bar ─────────────────────────────────────────── */}
        <div className="report-brand-bar" style={{ backgroundColor: brandColor }} />

        <div className="report-body">

        {/* ── Header: Logo + Judul + Periode ─────────────────────────── */}
        <div className="flex items-start justify-between mb-8 pt-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span
                className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full text-white"
                style={{ backgroundColor: brandColor }}
              >
                {cadenceLabel}
              </span>
              {platform && platform !== 'generic' && (
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {platform.replace('_', ' ')}
                </span>
              )}
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 leading-tight">
              {report.title}
            </h1>
            <div className="flex flex-wrap gap-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">
              <span>Klien: {client.name || '—'}</span>
              <span>•</span>
              <span>{periodLabel}</span>
            </div>
          </div>

          {logoUrl ? (
            <div className="h-14 w-28 p-1.5 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-100 ml-4 shrink-0">
              <img src={logoUrl} alt="Logo Klien" className="max-h-full max-w-full object-contain" />
            </div>
          ) : (
            <div
              className="h-12 w-12 rounded-xl text-white flex items-center justify-center font-extrabold text-xl uppercase ml-4 shrink-0"
              style={{ backgroundColor: brandColor }}
            >
              {client.name?.slice(0, 1) || '?'}
            </div>
          )}
        </div>

        {/* ── KPI Cards Utama ───────────── */}
        {displayKpiCards.length > 0 && (
          <div className="report-section mb-8">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">KPI Utama</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 print:kpi-grid-4">
              {displayKpiCards.map((kpi) => (
                <KPICard
                  key={kpi.key}
                  title={kpi.label}
                  value={kpi.value}
                  delta={kpi.delta}
                  deltaPercent={kpi.delta}
                  metricKey={kpi.key}
                  format={kpi.format}
                  rating={rateKpi(kpi.key, kpi.value)}
                  size="md"
                />
              ))}
            </div>
          </div>
        )}

        {/* ── SOP Analysis ────────────────────────────────────────────── */}
        {sopAnalysis && (
          <div className="sop-print-flow mb-6">
            <ReportSopSection
              rows={rows}
              platform={platform}
              sopFromApi={sopAnalysis}
              reportType={reportType}
              audienceMode={audienceMode}
              layout={pageLayout}
            />
          </div>
        )}

        {/* ── Saved Metrics (secondary) ────────────────────────────────── */}
        {pageLayout.showSavedMetrics && metrics.length > 4 && (
          <div className="report-section report-flow-section space-y-3 mb-6">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Metrik Tambahan</h3>
            <div className="grid grid-cols-2 gap-3">
              {metrics.slice(4).map((metric) => (
                <div key={metric.id} className="report-flow-item">
                <KPICard
                  title={metric.column_name}
                  value={Number(metric.metric_sum)}
                  delta={metric.delta_percent != null ? Number(metric.delta_percent) : undefined}
                  size="sm"
                />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Footer halaman 1 ─────────────────────────────────────────── */}
        </div>

        <div className="report-footer">
          <span>Dibuat otomatis oleh RepoChart</span>
          <span>Halaman 1 dari {totalPages}</span>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          HALAMAN 2 — Visualisasi Grafik
      ══════════════════════════════════════════════════════════════════ */}
      {chartPages.map((pageCharts, pageIndex) => {
        const pageNumber = pageIndex + 2;

        return (
        <div className="report-page shadow-xl page-break">

          {/* Brand bar */}
          <div className="report-brand-bar" style={{ backgroundColor: brandColor }} />

          {/* Header mini */}
          <div className="pt-4 mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">{report.title}</h2>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">
                Visualisasi Data · {periodLabel}
              </p>
            </div>
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-8 max-w-[80px] object-contain opacity-70" />
            ) : (
              <div
                className="h-7 w-7 rounded-lg text-white flex items-center justify-center font-bold text-sm"
                style={{ backgroundColor: brandColor }}
              >
                {client.name?.slice(0, 1) || '?'}
              </div>
            )}
          </div>

          {/* Charts grid */}
          <div className="chart-print-flow report-section space-y-5 print:space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Grafik & Visualisasi</p>

            {pageCharts.length === 0 ? (
              <p className="text-sm italic text-slate-400">Belum ada grafik dikonfigurasi.</p>
            ) : (
              <div className="chart-page-grid">
                {pageCharts.map((chart) => (
                  <div key={chart.id} className="chart-print-card">
                    <ChartBlock chart={chart} rows={rows} platform={platform} compact reportType={reportType} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer halaman 2 */}
          <div className="report-footer">
            <span>Dibuat otomatis oleh RepoChart</span>
            <span>Halaman {pageNumber} dari {totalPages}</span>
          </div>
        </div>
        );
      })}

      {/* ══════════════════════════════════════════════════════════════════
          HALAMAN TERAKHIR — AI Insight
      ══════════════════════════════════════════════════════════════════ */}
      {!showWatermark && hasInsights && (
        <div className="report-page shadow-xl page-break">
          {/* Brand bar */}
          <div className="report-brand-bar" style={{ backgroundColor: brandColor }} />

          {/* Header mini */}
          <div className="pt-4 mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">{report.title}</h2>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">
                Kesimpulan & Rekomendasi · {periodLabel}
              </p>
            </div>
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-8 max-w-[80px] object-contain opacity-70" />
            ) : (
              <div
                className="h-7 w-7 rounded-lg text-white flex items-center justify-center font-bold text-sm"
                style={{ backgroundColor: brandColor }}
              >
                {client.name?.slice(0, 1) || '?'}
              </div>
            )}
          </div>

          <div className="report-body">
             <div className="rounded-2xl bg-slate-50 border border-slate-200 p-6 space-y-6 insight-print-box">
                <div className="flex items-center gap-3 text-slate-800 font-bold text-base border-b border-slate-200 pb-3">
                  <div className="rounded-xl bg-violet-100 p-2 text-violet-700">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <span>Report Insights & Recommendations</span>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Key Insights</h4>
                    {displayInsights.length > 0 ? (
                      <ul className="space-y-2">
                        {displayInsights.map((item, idx) => (
                          <li key={idx} className="flex gap-2 text-sm text-slate-700 leading-relaxed">
                            <span className="text-violet-500 font-bold shrink-0 mt-0.5">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs italic text-slate-400">Belum ada insight.</p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recommendations</h4>
                    {displayRecommendations.length > 0 ? (
                      <ul className="space-y-2">
                        {displayRecommendations.map((item, idx) => (
                          <li key={idx} className="flex gap-2 text-sm text-slate-700 leading-relaxed">
                            <span className="text-emerald-500 font-bold shrink-0 mt-0.5">✓</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs italic text-slate-400">Belum ada rekomendasi.</p>
                    )}
                  </div>
                </div>
             </div>
          </div>

          <div className="report-footer mt-auto">
            <span>Dibuat otomatis oleh RepoChart</span>
            <span>Halaman {totalPages} dari {totalPages}</span>
          </div>
        </div>
      )}

      {/* Print button (no-print) */}
      <button
        onClick={() => window.print()}
        className="no-print fixed bottom-6 right-6 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-lg transition-colors flex items-center gap-2 z-50"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        Cetak / Export PDF
      </button>
    </div>
  );
}
