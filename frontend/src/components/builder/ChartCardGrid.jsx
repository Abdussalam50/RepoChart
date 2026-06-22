import React from 'react';
import ChartCard from './ChartCard';

/**
 * ChartCardGrid displays a 2-column grid of ChartCards with an optional 'Add' placeholder card.
 * @param {Object} props
 * @param {Array} props.charts - List of charts [{ id, name, type, config_json }]
 * @param {Array} props.rows - Parsed CSV rows
 * @param {string|number|null} props.activeChartId - ID of the active chart being configured
 * @param {Function} props.onSelectChart - Callback when a chart is selected
 * @param {Function} props.onDeleteChart - Callback when a chart is deleted
 * @param {Function} props.onAddChart - Callback to add a new chart
 * @param {string} props.platform - Detected ads platform for SOP narratives
 */
export default function ChartCardGrid({
  charts = [],
  rows = [],
  activeChartId,
  onSelectChart,
  onDeleteChart,
  onAddChart,
  platform = 'generic',
  reportType = 'monthly',
}) {
  const isOdd = charts.length % 2 !== 0;

  if (charts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50 text-center">
        <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-500 flex items-center justify-center mb-3">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-slate-800">Belum ada grafik</p>
        <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
          Tambah grafik pertama Anda untuk mulai menyusun laporan.
        </p>
        <button
          onClick={onAddChart}
          className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 active:scale-95 transition-all duration-150 rounded-xl shadow-sm"
        >
          Tambah Grafik
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {charts.map((chart) => (
        <ChartCard
          key={chart.id}
          chart={chart}
          rows={rows}
          isActive={chart.id === activeChartId}
          onEdit={onSelectChart}
          onDelete={onDeleteChart}
          platform={platform}
          reportType={reportType}
        />
      ))}

      {/* Show Tambah Grafik card placeholder to balance grid if count is odd, or as a helper */}
      {isOdd && (
        <button
          onClick={onAddChart}
          className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 hover:border-violet-300 hover:bg-violet-50/10 rounded-2xl transition-all duration-150 text-slate-400 hover:text-violet-600 min-h-[160px]"
        >
          <svg className="w-6 h-6 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-xs font-semibold">Tambah Grafik</span>
        </button>
      )}
    </div>
  );
}
