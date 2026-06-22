import React from 'react';
import { formatKpiValue, RATING_BG, RATING_COLORS } from '../../utils/kpiCalculator';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * KpiCardRow — row of KPI metric cards shown above the chart grid in PreviewPanel.
 *
 * @param {{ kpiResults: Array, className?: string }} props
 */
export default function KpiCardRow({ kpiResults = [], className = '' }) {
  if (!kpiResults.length) return null;

  return (
    <div className={`grid gap-3 ${kpiResults.length <= 2 ? 'grid-cols-2' : kpiResults.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'} ${className}`}>
      {kpiResults.map((kpi) => (
        <KpiMiniCard key={kpi.key} kpi={kpi} />
      ))}
    </div>
  );
}

function KpiMiniCard({ kpi }) {
  const bgClass = RATING_BG[kpi.rating] || RATING_BG.neutral;
  const ratingColor = RATING_COLORS[kpi.rating] || RATING_COLORS.neutral;

  const RatingDot = () => (
    <span
      className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
      style={{ backgroundColor: ratingColor }}
    />
  );

  return (
    <div className={`rounded-2xl border p-3.5 flex flex-col gap-1 transition-all ${bgClass} shadow-lg border-gray-200`}>
      <div className="flex items-center justify-between gap-1">
        <p className="text-[10px] font-bold uppercase tracking-wider opacity-70 truncate">
          {kpi.label}
        </p>
        <RatingDot />
      </div>
      <p className="text-lg font-extrabold leading-tight tracking-tight">
        {kpi.formattedValue}
      </p>
      {kpi.delta_percent != null && (
        <DeltaBadge deltaPercent={kpi.delta_percent} deltaDirection={kpi.delta_direction} metricKey={kpi.key} />
      )}
      {kpi.description && (
        <p className="text-[9px] opacity-60 truncate">{kpi.description}</p>
      )}
    </div>
  );
}

function DeltaBadge({ deltaPercent, deltaDirection, metricKey }) {
  const INVERSE = ['bounce_rate', 'cac', 'refund_rate', 'cpc', 'unsubscribe_rate'];
  const isInverse = INVERSE.includes(metricKey);
  const isUp = deltaDirection === 'up';
  const isPositive = isInverse ? !isUp : isUp;

  const color = isPositive ? 'text-emerald-600' : 'text-rose-600';
  const Icon = isUp ? TrendingUp : isUp === false && deltaDirection === 'down' ? TrendingDown : Minus;

  return (
    <div className={`flex items-center gap-0.5 text-[10px] font-semibold ${color}`}>
      <Icon className="w-3 h-3" />
      <span>{Math.abs(deltaPercent).toFixed(1)}% vs periode lalu</span>
    </div>
  );
}
