import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import ChartBlock from '../../components/report/ChartBlock';
import ReportSopSection from '../../components/report/sop/ReportSopSection';
import { KPICard } from '../../components/report/KPICard';
import { getLayoutConfig } from '../../utils/reportTypeConfig';
import { InsightBox } from '../../components/report/InsightBox';
import SharedDashboardFooter from '../../components/shared/SharedDashboardFooter';
import { Loader2, AlertCircle, Link2Off } from 'lucide-react';
import { getPublicDashboard } from '../../api/reportService';
import {
  buildColumnMap,
  resolveKpiFromMetrics,
  calculateKpis,
  rateKpi,
} from '../../utils/kpiCalculator';

// Helper: format date label
function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function SharedDashboardPage() {
  const { token } = useParams();

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await getPublicDashboard(token);
        setData(response.data);
      } catch (err) {
        if (err.response?.status === 404) {
          setNotFound(true);
        } else {
          setErrorMsg('Gagal memuat dashboard.');
        }
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchDashboard();
    }
  }, [token]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
          <p className="text-sm font-medium text-slate-500 font-sans">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="rounded-2xl bg-white p-8 border border-slate-200 shadow-sm max-w-md w-full">
          <Link2Off className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Dashboard Tidak Ditemukan</h2>
          <p className="text-sm text-slate-500 font-sans mb-6">
            Tautan ini tidak valid atau telah dinonaktifkan oleh pemilik laporan.
          </p>
          <a
            href="https://repochart.id?ref=shared-dashboard-404"
            className="inline-block px-5 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 transition-colors"
          >
            Buat Laporan dengan RepoChart
          </a>
        </div>
      </div>
    );
  }

  if (errorMsg || !data) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="rounded-2xl bg-red-50 p-6 border border-red-100 max-w-md text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-red-800 mb-2">Terjadi Kesalahan</h2>
          <p className="text-sm text-red-700 font-sans">{errorMsg || 'Unable to load dashboard.'}</p>
        </div>
      </div>
    );
  }

  const { report, client, metrics = [], charts = [], insight, csv_preview: rows = [], sop_analysis } = data;
  
  const platform = report.detected_platform || 'generic';
  const reportType = report.report_type || 'monthly';
  const audienceMode = report.audience_mode || 'client';
  const pageLayout = getLayoutConfig(reportType, audienceMode);

  // Resolve columns and columnMap from rows
  const csvColumns = rows.length > 0
    ? Object.keys(rows[0]).map(name => ({ name, type: isNaN(Number(rows[0][name])) ? 'string' : 'number' }))
    : [];
  const columnMap = buildColumnMap(csvColumns);

  // Read selected KPIs from config
  const selectedKpis = report.config_json?.selectedKpis || [];

  // Calculate KPI values
  const resolvedKpis = calculateKpis(rows, selectedKpis, columnMap).map(kpi => {
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

  const brandColor = client?.brand_color || '#8b5cf6';
  const logoUrl = client?.logo_path
    ? `${import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:8000'}/storage/${client.logo_path}`
    : null;

  const today = formatDate(new Date().toISOString());
  const periodLabel = report.period_start
    ? `${formatDate(report.period_start)}${report.period_end ? ` – ${formatDate(report.period_end)}` : ''}`
    : today;

  const cadenceMap = { daily: 'Harian', weekly: 'Mingguan', monthly: 'Bulanan', quarterly: 'Kuartalan' };
  const cadenceLabel = cadenceMap[report.cadence] || 'Bulanan';

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased">
      {/* Brand Bar */}
      <div className="h-1.5 w-full" style={{ backgroundColor: brandColor }} />
      
      {/* Header Container */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
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
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 leading-tight">
              {report.title}
            </h1>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
              {client?.name} &bull; {periodLabel}
            </p>
          </div>
          
          {logoUrl ? (
            <div className="h-12 w-24 p-1 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-100 shrink-0">
              <img src={logoUrl} alt="Logo Klien" className="max-h-full max-w-full object-contain mix-blend-multiply" />
            </div>
          ) : (
            <div
              className="h-10 w-10 rounded-xl text-white flex items-center justify-center font-extrabold text-lg uppercase shrink-0 shadow-sm"
              style={{ backgroundColor: brandColor }}
            >
              {client?.name?.slice(0, 1) || '?'}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-6 py-8 flex flex-col gap-8">
        
        {/* KPI Scorecard */}
        {displayKpiCards.length > 0 && (
          <section>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Executive Summary</h3>
            <div className={`grid gap-4 grid-cols-2 md:grid-cols-${Math.min(4, displayKpiCards.length)}`}>
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
          </section>
        )}

        {/* AI Insight / Manual Insight - Read Only */}
        {(insight?.insight_text || insight?.recommendation_text || insight?.custom_insight_text) && (
          <section>
            <InsightBox insight={insight} reportId={report.id} userPlan="pro" readOnly={true} />
          </section>
        )}

        {/* SOP Analysis (Funnel) */}
        {sop_analysis && Object.keys(sop_analysis).length > 0 && (
          <section>
            <ReportSopSection
              rows={rows}
              platform={platform}
              sopFromApi={sop_analysis}
              reportType={reportType}
              audienceMode={audienceMode}
              layout={pageLayout}
              isSharedView={true}
            />
          </section>
        )}

        {/* Charts Grid */}
        {charts.length > 0 && (
          <section className="space-y-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Grafik Performa</h3>
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
              {charts.map((chart) => (
                <div key={chart.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-1">
                  <ChartBlock chart={chart} rows={rows} platform={platform} compact={false} readOnly={true} />
                </div>
              ))}
            </div>
          </section>
        )}
        
        {/* Timestamp */}
        <div className="text-center pt-8 border-t border-slate-200">
          <p className="text-xs text-slate-400 font-medium">
            Tautan dashboard publik ini diakses pada {new Date().toLocaleString('id-ID')}
          </p>
        </div>
      </main>

      {/* Global Footer */}
      <SharedDashboardFooter />
    </div>
  );
}

export default SharedDashboardPage;
