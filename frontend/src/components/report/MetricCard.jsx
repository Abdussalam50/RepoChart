import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function fmt(val) {
  if (val === null || val === undefined || isNaN(val)) return '—';
  const num = Number(val);
  if (Math.abs(num) >= 1_000_000_000) return (num / 1_000_000_000).toFixed(2) + 'B';
  if (Math.abs(num) >= 1_000_000) return (num / 1_000_000).toFixed(2) + 'M';
  if (Math.abs(num) >= 1_000) return (num / 1_000).toFixed(2) + 'K';
  return num.toLocaleString('id-ID', { maximumFractionDigits: 2 });
}

function computeDelta(values) {
  if (!values || values.length < 4) return null;
  const mid = Math.floor(values.length / 2);
  const firstHalf = values.slice(0, mid);
  const secondHalf = values.slice(mid);
  const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  if (avgFirst === 0) return avgSecond === 0 ? 0 : 100;
  return parseFloat(((avgSecond - avgFirst) / Math.abs(avgFirst) * 100).toFixed(1));
}

function getPrimaryValue(metrics, aggregation) {
  if (!metrics) return null;
  switch (aggregation) {
    case 'sum': return metrics.sum;
    case 'avg': return metrics.avg;
    case 'min': return metrics.min;
    case 'max': return metrics.max;
    default: return metrics.sum;
  }
}

function getAggLabel(aggregation) {
  switch (aggregation) {
    case 'sum': return 'Total';
    case 'avg': return 'Rata-rata';
    case 'min': return 'Minimum';
    case 'max': return 'Maksimum';
    default: return 'Total';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Sparkline — Pure SVG, no dependencies
// ─────────────────────────────────────────────────────────────────────────────
function Sparkline({ values = [], color = '#8b5cf6', width = 200, height = 48 }) {
  const points = useMemo(() => {
    if (!values.length) return '';
    const nums = values.map(Number).filter(v => !isNaN(v));
    if (nums.length < 2) return '';

    const minVal = Math.min(...nums);
    const maxVal = Math.max(...nums);
    const range = maxVal - minVal || 1;
    const padY = 4;
    const padX = 2;
    const usableW = width - padX * 2;
    const usableH = height - padY * 2;

    return nums.map((v, i) => {
      const x = padX + (i / (nums.length - 1)) * usableW;
      const y = padY + usableH - ((v - minVal) / range) * usableH;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  }, [values, width, height]);

  if (!points) return null;

  const gradientId = `sparkGrad_${color.replace('#', '')}`;
  // Build the fill polygon (close path to bottom)
  const firstPoint = points.split(' ')[0];
  const lastPoint = points.split(' ').pop();
  const fillPoints = `${2},${height} ${points} ${lastPoint?.split(',')[0]},${height}`;

  return (
    <svg width={width} height={height} className="overflow-visible" style={{ display: 'block' }}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {/* Filled area */}
      <polygon
        points={fillPoints}
        fill={`url(#${gradientId})`}
      />
      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MetricCard Component
// ─────────────────────────────────────────────────────────────────────────────
export function MetricCard({
  columnName,
  metrics = {},
  rawValues = [],
  aggregation = 'sum',
  showDelta = true,
  showMinMax = true,
  showAvg = true,
  formulaColor,
}) {
  const { sum, avg, min, max } = metrics;

  // ── Primary value based on aggregation ──
  const primaryValue = getPrimaryValue(metrics, aggregation);
  const aggLabel = getAggLabel(aggregation);

  // ── Delta calculation ──
  const deltaValue = useMemo(() => computeDelta(rawValues), [rawValues]);
  const hasDelta = deltaValue !== null && !isNaN(deltaValue);

  const DeltaIcon = hasDelta
    ? deltaValue > 0 ? TrendingUp : deltaValue < 0 ? TrendingDown : Minus
    : Minus;

  const deltaColorClass = hasDelta
    ? deltaValue > 0
      ? 'text-emerald-600 bg-emerald-50'
      : deltaValue < 0
        ? 'text-red-600 bg-red-50'
        : 'text-slate-500 bg-slate-100'
    : 'text-slate-400 bg-slate-100';

  // ── Sparkline color ──
  const sparkColor = formulaColor
    || (hasDelta && deltaValue > 0 ? '#10b981' : hasDelta && deltaValue < 0 ? '#ef4444' : '#8b5cf6');

  // ── Sub-metric items ──
  const subMetrics = [];
  if (showAvg && aggregation !== 'avg') {
    subMetrics.push({ label: 'Rata-rata', value: avg, color: 'text-slate-700' });
  }
  if (showMinMax) {
    if (aggregation !== 'min') subMetrics.push({ label: 'Terendah', value: min, color: 'text-red-500' });
    if (aggregation !== 'max') subMetrics.push({ label: 'Tertinggi', value: max, color: 'text-emerald-600' });
  }
  // Always show SUM if aggregation is not SUM
  if (aggregation !== 'sum') {
    subMetrics.unshift({ label: 'Total', value: sum, color: 'text-slate-700' });
  }

  return (
    <div className="group relative rounded-3xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 overflow-hidden">
      {/* ── Sparkline Background ── */}
      {rawValues.length >= 2 && (
        <div className="absolute bottom-0 left-0 right-0 opacity-60 group-hover:opacity-90 transition-opacity duration-300 pointer-events-none">
          <Sparkline
            values={rawValues}
            color={sparkColor}
            width={400}
            height={56}
          />
        </div>
      )}

      {/* ── Header ── */}
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {formulaColor && (
              <span
                className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: formulaColor }}
              />
            )}
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {columnName}
            </p>
          </div>
          <p className="text-2xl font-bold text-slate-900 tracking-tight">{fmt(primaryValue)}</p>
          <p className="text-[10px] font-medium text-slate-400 mt-0.5">{aggLabel}</p>
        </div>
        {showDelta && (
          <div className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${deltaColorClass}`}>
            <DeltaIcon className="h-3.5 w-3.5" />
            {hasDelta ? `${deltaValue > 0 ? '+' : ''}${deltaValue}%` : '—'}
          </div>
        )}
      </div>

      {/* ── Sub-metrics ── */}
      {subMetrics.length > 0 && (
        <div className={`relative z-10 grid gap-3 border-t border-slate-100 pt-4 mt-4`}
          style={{ gridTemplateColumns: `repeat(${Math.min(subMetrics.length, 3)}, 1fr)` }}
        >
          {subMetrics.map((m, i) => (
            <div key={i} className="space-y-0.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{m.label}</p>
              <p className={`text-sm font-semibold ${m.color}`}>{fmt(m.value)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
