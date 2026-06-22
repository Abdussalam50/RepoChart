import React from 'react';
import MiniChart from './MiniChart';
import ChartNarrative from '../report/ChartNarrative';
import { generateChartNarrative } from '../../utils/chartNarrativeGenerator';
import { aggregateChartData, detectAggregationMode } from '../../utils/aggregateChartData';
import { OverlayChart } from '../chart/OverlayChart';

/**
 * ChartCard displays a single chart configuration and its mini preview.
 * @param {Object} props
 * @param {Object} props.chart - The chart configuration { id, name, type, config_json, sort_order }
 * @param {Array} props.rows - The parsed CSV rows
 * @param {boolean} props.isActive - Whether this card is currently being edited
 * @param {Function} props.onEdit - Callback when the card is clicked for editing
 * @param {Function} props.onDelete - Callback to delete this chart
 */
export default function ChartCard({ chart, rows = [], isActive, onEdit, onDelete, platform = 'generic', reportType = 'monthly' }) {
  // Border color based on chart type
  let borderColor = 'border-violet-100 hover:border-violet-300';
  if (chart.type === 'overlay') {
    borderColor = 'border-emerald-100 hover:border-emerald-300';
  } else if (chart.type === 'formula') {
    borderColor = 'border-amber-100 hover:border-amber-300';
  }

  const activeClass = isActive
    ? 'ring-2 ring-violet-500 shadow-lg border-transparent'
    : 'shadow-sm';

  // Get aggregated data for MiniChart (grouped by xCol to avoid duplicates)
  const xCol = chart.config_json?.axisX;
  const yCol = chart.config_json?.axisY;
  const aggMode = detectAggregationMode(yCol);
  const { categories: xCategories, data: dataPoints } = aggregateChartData(rows, xCol, yCol, aggMode, null, reportType);

  const narrative = generateChartNarrative(chart, rows, { platform });

  // Pick color representation
  const themeColor = chart.type === 'overlay'
    ? '#10b981'
    : chart.type === 'formula'
    ? '#f59e0b'
    : '#8b5cf6';

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm(`Hapus grafik "${chart.name}"?`)) {
      onDelete(chart.id);
    }
  };

  return (
    <div
      onClick={() => onEdit(chart.id)}
      className={`flex flex-col justify-between p-4 bg-white border rounded-2xl cursor-pointer transition-all duration-200 min-h-[420px] ${borderColor} ${activeClass}`}
    >
      {/* Top Section */}
      <div className="flex items-start justify-between mb-3 ">
        <div>
          <h4 className="font-semibold text-slate-800 text-sm inline mr-2">{chart.name}</h4>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 inline mr-2">
            {chart.type} {yCol ? `· ${yCol}` : ''}
          </span>
          {chart.config_json?.description && (
            <span className="text-[11px] text-slate-500 italic inline">
              — {chart.config_json.description}
            </span>
          )}
        </div>
        <button
          onClick={handleDelete}
          className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors duration-150"
          aria-label="Delete chart"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Middle Preview Section */}
      <div className="flex-1 min-h-0 rounded-xl overflow-hidden mb-2">
        {chart.type === 'overlay' ? (
          <OverlayChart
            series={chart.config_json?.series || []}
            data={rows}
            axisX={chart.config_json?.axisX}
            axisY={chart.config_json?.axisY}
            type="line"
            height={180}
          />
        ) : chart.type === 'formula' ? (
          <div className="flex h-full items-center justify-center rounded-xl bg-amber-50/50 border border-amber-100 text-xs text-amber-800 font-medium p-4 text-center">
            Grafik formula — silakan lihat penjelasan narasi di bawah
          </div>
        ) : (
          <MiniChart type={chart.type} data={dataPoints} categories={xCategories} yLabel={yCol} color={themeColor} />
        )}
      </div>



      {/* Auto narrative */}
      <ChartNarrative text={narrative} />
    </div>
  );
}
