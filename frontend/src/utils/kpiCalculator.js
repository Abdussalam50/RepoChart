/**
 * kpiCalculator.js
 * Definisi KPI dan kalkulasi client-side dari array rows CSV.
 * Sesuai README_ChartBuilder.md & README_Frontend_v2.md
 */

// ─────────────────────────────────────────────────────────────────────────────
// KPI Definitions
// ─────────────────────────────────────────────────────────────────────────────
export const KPI_DEFINITIONS = [
  {
    key: 'total_revenue',
    label: 'Total Revenue',
    formula: 'sum(revenue)',
    format: 'currency',
    requiredColumns: ['revenue'],
    description: 'Total pendapatan dari semua transaksi',
  },
  {
    key: 'total_orders',
    label: 'Total Order',
    formula: 'sum(orders)',
    format: 'number',
    requiredColumns: ['orders'],
    description: 'Total jumlah order/transaksi',
  },
  {
    key: 'roas',
    label: 'ROAS',
    formula: 'revenue / ad_spend',
    format: 'ratio',
    requiredColumns: ['revenue', 'ad_spend'],
    description: 'Return on Ad Spend — Revenue / Biaya Iklan',
  },
  {
    key: 'aov',
    label: 'Avg. Order Value',
    formula: 'revenue / orders',
    format: 'currency',
    requiredColumns: ['revenue', 'orders'],
    description: 'Rata-rata nilai per order',
  },
  {
    key: 'ctr',
    label: 'CTR',
    formula: 'clicks / impressions',
    format: 'percent',
    requiredColumns: ['clicks', 'impressions'],
    description: 'Click-Through Rate — Klik / Impresi',
  },
  {
    key: 'cpc',
    label: 'CPC',
    formula: 'ad_spend / clicks',
    format: 'currency',
    requiredColumns: ['ad_spend', 'clicks'],
    description: 'Cost per Click — Biaya Iklan / Klik',
  },
  {
    key: 'conversion_rate',
    label: 'Conversion Rate',
    formula: 'conversions / sessions',
    format: 'percent',
    requiredColumns: ['conversions', 'sessions'],
    description: 'Tingkat konversi — Konversi / Sesi',
  },
  {
    key: 'open_rate',
    label: 'Open Rate Email',
    formula: 'emails_opened / emails_sent',
    format: 'percent',
    requiredColumns: ['emails_opened', 'emails_sent'],
    description: 'Tingkat buka email',
  },
  {
    key: 'engagement_rate',
    label: 'Engagement Rate',
    formula: 'engagements / impressions',
    format: 'percent',
    requiredColumns: ['engagements', 'impressions'],
    description: 'Tingkat engagement konten',
  },
  {
    key: 'cac',
    label: 'CAC',
    formula: 'ad_spend / conversions',
    format: 'currency',
    requiredColumns: ['ad_spend', 'conversions'],
    description: 'Customer Acquisition Cost — Biaya akuisisi per pelanggan baru',
  },
  {
    key: 'roi',
    label: 'ROI',
    formula: '(revenue - ad_spend) / ad_spend',
    format: 'percent',
    requiredColumns: ['revenue', 'ad_spend'],
    description: 'Return on Investment — (Revenue - Spend) / Spend',
  },
  {
    key: 'total_impressions',
    label: 'Total Impressions',
    formula: 'sum(impressions)',
    format: 'number',
    requiredColumns: ['impressions'],
    description: 'Total tayangan iklan/konten',
  },
  {
    key: 'total_clicks',
    label: 'Total Klik',
    formula: 'sum(clicks)',
    format: 'number',
    requiredColumns: ['clicks'],
    description: 'Total klik',
  },
  {
    key: 'total_ad_spend',
    label: 'Total Ad Spend',
    formula: 'sum(ad_spend)',
    format: 'currency',
    requiredColumns: ['ad_spend'],
    description: 'Total biaya iklan',
  },
];

// Inverse metrics: turun = bagus (untuk rating)
export const INVERSE_METRICS = ['bounce_rate', 'unsubscribe_rate', 'refund_rate', 'cac', 'cpc'];

// Rating thresholds
const DEFAULT_THRESHOLDS = {
  roas:             { good: 3,     warning: 1.5  },
  ctr:              { good: 0.03,  warning: 0.01 },
  bounce_rate:      { good: 0.40,  warning: 0.60 },
  open_rate:        { good: 0.25,  warning: 0.15 },
  engagement_rate:  { good: 0.05,  warning: 0.02 },
  conversion_rate:  { good: 0.03,  warning: 0.01 },
  unsubscribe_rate: { good: 0.005, warning: 0.02 },
  refund_rate:      { good: 0.02,  warning: 0.05 },
};

export const RATING_COLORS = {
  good:    '#1D9E75',
  warning: '#BA7517',
  poor:    '#E24B4A',
  neutral: '#94a3b8',
};

export const RATING_BG = {
  good:    'bg-emerald-50 border-emerald-100 text-emerald-700',
  warning: 'bg-amber-50 border-amber-100 text-amber-700',
  poor:    'bg-rose-50 border-rose-100 text-rose-700',
  neutral: 'bg-slate-50 border-slate-100 text-slate-500',
};

// ─────────────────────────────────────────────────────────────────────────────
// Column Matcher — fuzzy match nama kolom CSV ke kunci KPI
// ─────────────────────────────────────────────────────────────────────────────
const COLUMN_ALIASES = {
  revenue:       ['revenue', 'pendapatan', 'penjualan', 'omzet', 'income', 'sales', 'sale_amount', 'sale_revenue', 'gmv', 'total_revenue'],
  ad_spend:      ['ad_spend', 'spend', 'iklan', 'biaya_iklan', 'cost', 'budget', 'advertising_cost', 'adspend'],
  orders:        ['orders', 'order', 'transaksi', 'pembelian', 'quantity', 'qty', 'jumlah_order'],
  clicks:        ['clicks', 'klik', 'click', 'link_clicks', 'total_clicks'],
  impressions:   ['impressions', 'impresi', 'impression', 'reach', 'views'],
  conversions:   ['conversions', 'konversi', 'conversion', 'leads', 'purchase'],
  sessions:      ['sessions', 'sesi', 'session', 'visits', 'pageviews'],
  emails_sent:   ['emails_sent', 'email_sent', 'sent', 'terkirim', 'total_email'],
  emails_opened: ['emails_opened', 'email_opened', 'opened', 'dibuka', 'open'],
  engagements:   ['engagements', 'engagement', 'interaksi', 'likes', 'reactions'],
};

/**
 * Match a CSV column name to a KPI key alias
 * @param {string} columnName
 * @returns {string|null} matched key or null
 */
export function matchColumnToKpiKey(columnName) {
  if (!columnName) return null;
  const normalized = columnName.toLowerCase().replace(/[\s\-]/g, '_');
  for (const [key, aliases] of Object.entries(COLUMN_ALIASES)) {
    if (aliases.some(alias => normalized.includes(alias) || alias.includes(normalized))) {
      return key;
    }
  }
  return null;
}

/**
 * Build a column map from detected CSV columns
 * @param {Array<{name: string, type: string}>} columns
 * @returns {Object} columnMap: { kpiKey: columnName }
 */
export function buildColumnMap(columns) {
  const map = {};
  columns.forEach(col => {
    const key = matchColumnToKpiKey(col.name);
    if (key && !map[key]) {
      map[key] = col.name;
    }
  });
  return map;
}

/**
 * Get available KPI definitions based on CSV columns
 * @param {Array<{name: string, type: string}>} columns
 * @returns {Array} filtered KPI_DEFINITIONS
 */
export function getAvailableKpis(columns) {
  const columnMap = buildColumnMap(columns);
  const availableKeys = Object.keys(columnMap);
  return KPI_DEFINITIONS.filter(kpi =>
    kpi.requiredColumns.every(req => availableKeys.includes(req))
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Calculator helpers
// ─────────────────────────────────────────────────────────────────────────────
function parseNum(val) {
  if (val === undefined || val === null || val === '') return 0;
  return parseFloat(String(val).replace(/[,\s]/g, '')) || 0;
}

function sumCol(rows, colName) {
  if (!colName) return null;
  return rows.reduce((acc, row) => acc + parseNum(row[colName]), 0);
}

/**
 * Rate a KPI value
 * @param {string} key
 * @param {number} value
 * @returns {'good'|'warning'|'poor'|'neutral'}
 */
export function rateKpi(key, value) {
  const t = DEFAULT_THRESHOLDS[key];
  if (!t || value == null) return 'neutral';
  const isInverse = INVERSE_METRICS.includes(key);
  if (!isInverse) {
    if (value >= t.good)    return 'good';
    if (value >= t.warning) return 'warning';
    return 'poor';
  } else {
    if (value <= t.good)    return 'good';
    if (value <= t.warning) return 'warning';
    return 'poor';
  }
}

/**
 * Format a KPI value based on format type
 * @param {number} value
 * @param {'currency'|'percent'|'ratio'|'number'} format
 * @param {string} locale
 * @returns {string}
 */
export function formatKpiValue(value, format, locale = 'id-ID') {
  if (value == null || isNaN(value)) return '—';
  const n = Number(value);
  switch (format) {
    case 'currency':
      if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)}M`;
      if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}Jt`;
      if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}K`;
      return 'Rp ' + n.toLocaleString(locale);
    case 'percent': {
      // Heuristic for ratio vs percentage value:
      // - If n is between 0 and 1.0, we treat it as a ratio (0.015 -> 1.5%)
      // - If n is > 1.0, we treat it as an already-multiplied percentage (15.5 -> 15.5%)
      // - This handles ROI of 150% (150.0) correctly.
      const displayVal = (n > 0 && n <= 1.0) ? n * 100 : n;
      return displayVal.toFixed(1) + '%';
    }
    case 'ratio':
      return n.toFixed(2) + 'x';
    case 'number':
      if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
      if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
      return n.toLocaleString(locale);
    default:
      return n.toLocaleString(locale);
  }
}

/**
 * Calculate a single KPI from rows
 * @param {Array<Object>} rows
 * @param {string} kpiKey
 * @param {Object} columnMap - { kpiKey: columnName }
 * @returns {number|null}
 */
export function calculateSingleKpi(rows, kpiKey, columnMap) {
  if (!rows.length) return null;
  const m = columnMap;

  switch (kpiKey) {
    case 'total_revenue':
      return sumCol(rows, m.revenue);
    case 'total_orders':
      return sumCol(rows, m.orders);
    case 'total_ad_spend':
      return sumCol(rows, m.ad_spend);
    case 'total_impressions':
      return sumCol(rows, m.impressions);
    case 'total_clicks':
      return sumCol(rows, m.clicks);
    case 'roas': {
      const rev = sumCol(rows, m.revenue);
      const spend = sumCol(rows, m.ad_spend);
      if (!spend || spend === 0) return null;
      return parseFloat((rev / spend).toFixed(2));
    }
    case 'aov': {
      const rev = sumCol(rows, m.revenue);
      const ord = sumCol(rows, m.orders);
      if (!ord || ord === 0) return null;
      return parseFloat((rev / ord).toFixed(0));
    }
    case 'ctr': {
      const clicks = sumCol(rows, m.clicks);
      const imp = sumCol(rows, m.impressions);
      if (!imp || imp === 0) return null;
      // Store as percentage (e.g. 3.24 for 3.24%)
      return parseFloat(((clicks / imp) * 100).toFixed(2));
    }
    case 'cpc': {
      const spend = sumCol(rows, m.ad_spend);
      const clicks = sumCol(rows, m.clicks);
      if (!clicks || clicks === 0) return null;
      // CPC = total spend / total clicks, keep 2 decimal places
      return parseFloat((spend / clicks).toFixed(2));
    }
    case 'conversion_rate': {
      const conv = sumCol(rows, m.conversions);
      const sess = sumCol(rows, m.sessions);
      if (!sess || sess === 0) return null;
      return parseFloat(((conv / sess) * 100).toFixed(2));
    }
    case 'open_rate': {
      const opened = sumCol(rows, m.emails_opened);
      const sent = sumCol(rows, m.emails_sent);
      if (!sent || sent === 0) return null;
      return parseFloat(((opened / sent) * 100).toFixed(2));
    }
    case 'engagement_rate': {
      const eng = sumCol(rows, m.engagements);
      const imp = sumCol(rows, m.impressions);
      if (!imp || imp === 0) return null;
      return parseFloat(((eng / imp) * 100).toFixed(2));
    }
    case 'cac': {
      const spend = sumCol(rows, m.ad_spend);
      const conv = sumCol(rows, m.conversions);
      if (!conv || conv === 0) return null;
      // CAC = total spend / total conversions, keep 2 decimal places
      return parseFloat((spend / conv).toFixed(2));
    }
    case 'roi': {
      const rev = sumCol(rows, m.revenue);
      const spend = sumCol(rows, m.ad_spend);
      if (!spend || spend === 0) return null;
      return parseFloat((((rev - spend) / spend) * 100).toFixed(2));
    }
    default:
      return null;
  }
}

/**
 * Calculate multiple KPIs at once
 * @param {Array<Object>} rows
 * @param {string[]} kpiKeys
 * @param {Object} columnMap
 * @returns {Array<{key, label, value, format, formattedValue, rating}>}
 */
export function calculateKpis(rows, kpiKeys, columnMap) {
  return kpiKeys
    .map(key => {
      const def = KPI_DEFINITIONS.find(d => d.key === key);
      if (!def) return null;
      const value = calculateSingleKpi(rows, key, columnMap);
      if (value === null) return null;
      return {
        key,
        label: def.label,
        value,
        format: def.format,
        formattedValue: formatKpiValue(value, def.format),
        rating: rateKpi(key, value),
        description: def.description,
      };
    })
    .filter(Boolean);
}

/**
 * Match a client-side KPI key to calculated backend metrics.
 * @param {string} kpiKey
 * @param {Array} metrics - backend report.metrics
 * @param {Object} columnMap - KPI key to CSV column mapping
 * @returns {{value: number, delta: number|null}|null}
 */
export function resolveKpiFromMetrics(kpiKey, metrics = [], columnMap = {}) {
  if (!metrics || !metrics.length) return null;

  const rawColName = columnMap[kpiKey] || columnMap[kpiKey.replace('total_', '')];
  const targetNames = [];
  if (rawColName) targetNames.push(rawColName.toLowerCase());

  switch (kpiKey) {
    case 'roas':
      targetNames.push('true roas', 'roas');
      break;
    case 'ctr':
      targetNames.push('true ctr (%)', 'true ctr', 'ctr');
      break;
    case 'conversion_rate':
      targetNames.push('true cvr (%)', 'true cvr', 'conversion rate', 'cvr');
      break;
    case 'cpc':
      targetNames.push('true cpc', 'cpc');
      break;
    case 'cac':
      targetNames.push('true cpa', 'cpa', 'cac', 'customer acquisition cost');
      break;
    case 'total_revenue':
      targetNames.push('total revenue', 'revenue');
      break;
    case 'total_ad_spend':
      targetNames.push('total spend', 'spend', 'ad spend', 'ad_spend');
      break;
    case 'aov':
      targetNames.push('avg. order value', 'aov');
      break;
    case 'total_orders':
      targetNames.push('orders', 'total orders');
      break;
    case 'total_clicks':
      targetNames.push('clicks', 'total clicks');
      break;
    case 'total_impressions':
      targetNames.push('impressions', 'total impressions');
      break;
    default:
      break;
  }

  const foundMetric = metrics.find(m => {
    if (!m.column_name) return false;
    const nameLower = m.column_name.toLowerCase();
    return targetNames.includes(nameLower) || targetNames.some(t => nameLower.includes(t));
  });

  if (!foundMetric) return null;

  const value = foundMetric.metric_sum !== null && foundMetric.metric_sum !== undefined
    ? Number(foundMetric.metric_sum)
    : foundMetric.metric_avg !== null && foundMetric.metric_avg !== undefined
    ? Number(foundMetric.metric_avg)
    : 0;

  return {
    value,
    delta: foundMetric.delta_percent !== null && foundMetric.delta_percent !== undefined
      ? Number(foundMetric.delta_percent)
      : null,
  };
}

