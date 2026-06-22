import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { formatKpiValue, RATING_COLORS, RATING_BG, INVERSE_METRICS } from '../../utils/kpiCalculator';

/**
 * KPICard — Kartu KPI untuk laporan.
 * Updated: tambah rating, delta direction, format, size variants.
 *
 * @param {{
 *   title: string,
 *   value: number,
 *   delta?: number,            // legacy: delta percent as number
 *   deltaPercent?: number,     // new: explicit delta %
 *   deltaDirection?: 'up'|'down'|'flat', // new
 *   metricKey?: string,        // for inverse metric detection
 *   format?: 'currency'|'percent'|'ratio'|'number',
 *   rating?: 'good'|'warning'|'poor'|'neutral',
 *   isCurrency?: boolean,      // legacy compat
 *   size?: 'sm'|'md'|'lg',
 * }} props
 */
export function KPICard({
  title,
  value,
  delta,
  deltaPercent,
  deltaDirection,
  metricKey,
  format,
  rating,
  isCurrency = false,
  size = 'md',
}) {
  // Resolve delta
  const resolvedDelta = deltaPercent ?? delta;
  const resolvedDirection = deltaDirection ?? (resolvedDelta > 0 ? 'up' : resolvedDelta < 0 ? 'down' : 'flat');

  // Detect inverse metric
  const isInverse = metricKey && INVERSE_METRICS.includes(metricKey);

  // Resolve color: for inverse metrics, down is good
  const isPositive = isInverse
    ? resolvedDirection === 'down'
    : resolvedDirection === 'up';
  const isNeutral = !resolvedDelta && resolvedDelta !== 0;

  // Format value
  const formattedValue = format
    ? formatKpiValue(value, format)
    : isCurrency
    ? 'Rp ' + (Number(value) || 0).toLocaleString('id-ID')
    : (Number(value) || 0).toLocaleString('id-ID');

  // Size classes
  const sizeClasses = {
    sm: { card: 'p-3.5', title: 'text-xs', value: 'text-xl', delta: 'text-xs' },
    md: { card: 'p-5',   title: 'text-sm', value: 'text-2xl', delta: 'text-sm' },
    lg: { card: 'p-6',   title: 'text-sm', value: 'text-3xl', delta: 'text-sm' },
  }[size] || { card: 'p-5', title: 'text-sm', value: 'text-2xl', delta: 'text-sm' };

  // Rating background
  const ratingBg = rating ? RATING_BG[rating] : '';
  const ratingBorder = rating && rating !== 'neutral'
    ? `border-l-[3px]`
    : '';
  const ratingBorderColor = rating ? RATING_COLORS[rating] : undefined;

  return (
    <div
      className={`flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm transition-all ${sizeClasses.card} ${ratingBorder}`}
      style={ratingBorderColor && rating !== 'neutral' ? { borderLeftColor: ratingBorderColor } : undefined}
    >
      <div className="flex items-center justify-between mb-1.5">
        <h3 className={`font-semibold text-slate-500 ${sizeClasses.title}`}>{title}</h3>
        {rating && rating !== 'neutral' && (
          <span
            className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md border ${RATING_BG[rating]}`}
          >
            {rating === 'good' ? '✅ Baik' : rating === 'warning' ? '⚠️ Perhatikan' : '❌ Tindakan'}
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-3 flex-wrap">
        <span className={`font-bold tracking-tight text-slate-900 ${sizeClasses.value}`}>
          {formattedValue}
        </span>

        {!isNeutral && resolvedDelta != null && (
          <div
            className={`flex items-center font-semibold ${sizeClasses.delta} ${
              isPositive ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {resolvedDirection === 'up'
              ? <ArrowUpRight className="mr-0.5 h-4 w-4" />
              : resolvedDirection === 'down'
              ? <ArrowDownRight className="mr-0.5 h-4 w-4" />
              : <Minus className="mr-0.5 h-4 w-4" />
            }
            {Math.abs(resolvedDelta).toFixed(1)}%
          </div>
        )}
      </div>
    </div>
  );
}
