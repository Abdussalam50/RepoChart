/**
 * Format numbers for chart narratives (Indonesian locale).
 */

const ID = 'id-ID';

/**
 * Detect display style from column / metric name.
 */
export function detectValueStyle(label = '') {
  const lower = String(label).toLowerCase();
  if (/%|pct|rate|ctr|roas|ratio|persen|percent/.test(lower)) return 'percent';
  if (/rp|idr|cost|spend|revenue|pendapatan|biaya|harga|amount|budget/.test(lower)) return 'currency';
  return 'decimal';
}

/**
 * @param {number} value
 * @param {{ style?: 'decimal'|'currency'|'percent', columnLabel?: string, maximumFractionDigits?: number }} opts
 */
export function formatNumber(value, opts = {}) {
  if (value == null || Number.isNaN(value)) return '—';

  const style =
    opts.style ||
    (opts.columnLabel ? detectValueStyle(opts.columnLabel) : 'decimal');

  const maxFrac = opts.maximumFractionDigits ?? (style === 'percent' ? 1 : 2);

  if (style === 'currency') {
    return new Intl.NumberFormat(ID, {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(value);
  }

  if (style === 'percent') {
    const pct = Math.abs(value) <= 1 && value !== 0 ? value * 100 : value;
    return `${pct.toLocaleString(ID, { maximumFractionDigits: maxFrac })}%`;
  }

  return value.toLocaleString(ID, { maximumFractionDigits: maxFrac });
}

/**
 * Human-readable metric name from column header.
 */
export function humanMetricName(columnLabel = '') {
  if (!columnLabel) return 'nilai';
  return String(columnLabel);
}

/**
 * Format signed percentage delta for narrative.
 */
export function formatDeltaPercent(pct) {
  if (pct == null || Number.isNaN(pct)) return '';
  const rounded = Math.round(Math.abs(pct) * 10) / 10;
  if (rounded < 0.5) return 'stabil';
  const word = pct >= 0 ? 'naik' : 'turun';
  return `${word} ${rounded}%`;
}
