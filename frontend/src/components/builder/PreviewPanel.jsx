import React from 'react';
import ChartCardGrid from './ChartCardGrid';
import KpiCardRow from './KpiCardRow';

/**
 * PreviewPanel — right side preview area of the chart builder split view.
 * Updated: tambah KPI card row di atas chart grid.
 */
export default function PreviewPanel({
  charts = [],
  rows = [],
  activeChartId,
  onSelectChart,
  onDeleteChart,
  onAddChart,
  platform = 'generic',
  kpiResults = [],
  reportType = 'monthly',
}) {
  return (
    <div className="flex-1 bg-slate-50/50 p-6 overflow-y-auto min-h-full">
      <div className="max-w-6xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Pratinjau Laporan</h2>
            <p className="text-xs text-slate-500">
              Grafik di bawah ini akan digenerate ke dalam PDF laporan Anda.
            </p>
          </div>
          {charts.length > 0 && (
            <span className="text-[11px] font-bold text-slate-400 bg-white border border-slate-200 px-2.5 py-1 rounded-xl">
              {charts.length} Grafik
            </span>
          )}
        </div>

        {/* KPI Cards — tampil di atas chart grid jika ada KPI aktif */}
        {kpiResults.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">KPI Ringkasan</p>
            <KpiCardRow kpiResults={kpiResults} />
          </div>
        )}

        {/* Chart Grid */}
        <ChartCardGrid
          charts={charts}
          rows={rows}
          activeChartId={activeChartId}
          onSelectChart={onSelectChart}
          onDeleteChart={onDeleteChart}
          onAddChart={onAddChart}
          platform={platform}
          reportType={reportType}
        />
      </div>
    </div>
  );
}
