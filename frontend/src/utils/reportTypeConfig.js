import { headerMatchKey, mapSopColumns } from './sop/columnMapper';

export const REPORT_TYPE_OPTIONS = [
  { value: 'daily', label: 'Harian' },
  { value: 'weekly', label: 'Mingguan' },
  { value: 'monthly', label: 'Bulanan' },
  { value: 'quarterly', label: 'Kuartalan' },
];

export const AUDIENCE_MODE_OPTIONS = [
  { value: 'client', label: 'Klien', icon: '👤' },
  { value: 'internal', label: 'Internal', icon: '🔧' },
];

const CHART_TEMPLATES = {
  daily: [
    { name: 'Spend Harian', type: 'line', xHints: [/date/i, /day/i, /tanggal/i, /week/i], yHints: [/spend/i, /cost/i, /amount/i] },
  ],
  weekly: [
    { name: 'Performa Kampanye', type: 'bar', xHints: [/campaign/i, /kampanye/i], yHints: [/conversion/i, /result/i, /purchase/i] },
    { name: 'Tren CTR', type: 'line', xHints: [/week/i, /date/i, /tanggal/i], yHints: [/ctr/i, /click/i] },
  ],
  monthly: [
    { name: 'Tren Spend', type: 'line', xHints: [/date/i, /day/i, /tanggal/i], yHints: [/spend/i, /cost/i, /amount/i] },
    { name: 'CTR per Kampanye', type: 'bar', xHints: [/campaign/i, /kampanye/i], yHints: [/ctr/i, /click/i] },
    { name: 'Budget per Platform', type: 'donut', xHints: [/platform/i, /channel/i, /network/i], yHints: [/spend/i, /cost/i] },
  ],
  quarterly: [
    { name: 'Tren Revenue Bulanan', type: 'line', xHints: [/month/i, /bulan/i, /date/i, /tanggal/i], yHints: [/revenue/i, /value/i, /purchase/i] },
    { name: 'Konversi per Bulan', type: 'bar', xHints: [/month/i, /bulan/i, /date/i], yHints: [/conversion/i, /result/i] },
    { name: 'Pertumbuhan Konversi', type: 'area', xHints: [/month/i, /bulan/i, /date/i], yHints: [/conversion/i, /result/i, /roas/i] },
  ],
};

function findColumnByHints(columns, hints, fallbackTypes = []) {
  const names = (columns || []).map((c) => c.name);
  for (const hint of hints) {
    const found = names.find((n) => hint.test(headerMatchKey(n)));
    if (found) return found;
  }
  for (const type of fallbackTypes) {
    const found = columns?.find((c) => c.type === type)?.name;
    if (found) return found;
  }
  return names[0] || '';
}

function findSpendColumn(columns) {
  const map = mapSopColumns((columns || []).map((c) => c.name));
  if (map.spend) return map.spend;
  return findColumnByHints(columns, [/spend/i, /cost/i, /amount/i], ['number']);
}

function findRevenueColumn(columns) {
  const map = mapSopColumns((columns || []).map((c) => c.name));
  if (map.revenue) return map.revenue;
  return findColumnByHints(columns, [/revenue/i, /value/i, /purchase/i], ['number']);
}

export function resolveChartTemplate(template, columns) {
  const axisX = findColumnByHints(columns, template.xHints, ['string', 'date']);
  let axisY = findColumnByHints(columns, template.yHints, ['number']);
  if (!axisY || axisY === axisX) {
    axisY = findSpendColumn(columns) || findRevenueColumn(columns);
  }
  return {
    name: template.name,
    type: template.type,
    config_json: { axisX, axisY },
  };
}

export function buildDefaultCharts(reportType, columns) {
  const templates = CHART_TEMPLATES[reportType] || CHART_TEMPLATES.monthly;
  return templates.map((t) => resolveChartTemplate(t, columns));
}

export function getLayoutConfig(reportType = 'monthly', audienceMode = 'client') {
  const internal = audienceMode === 'internal';

  const base = {
    showScorecard: true,
    showDecisionBrief: true,
    showFunnel: true,
    showBreakdown: true,
    showActionPlan: true,
    showSanityWarnings: internal,
    showAiInsight: true,
    showSavedMetrics: true,
    breakdownColumns: internal ? 'full' : 'client',
    breakdownDimensions: ['platform', 'country', 'campaign', 'industry'],
    maxRecommendations: 3,
    technicalFooter: internal,
    statusBarHint: '',
  };

  switch (reportType) {
    case 'daily':
      return {
        ...base,
        showFunnel: false,
        showBreakdown: false,
        showActionPlan: false,
        showAiInsight: false,
        showSavedMetrics: false,
        showSanityWarnings: internal,
        maxRecommendations: internal ? 3 : 0,
        statusBarHint: internal
          ? 'Mode harian · Internal · Deteksi anomali aktif'
          : 'Mode harian · Klien · Ringkas 1 halaman',
      };
    case 'weekly':
      return {
        ...base,
        showFunnel: false,
        showAiInsight: false,
        breakdownDimensions: ['campaign'],
        maxRecommendations: 2,
        statusBarHint: internal
          ? 'Mode mingguan · Internal · Breakdown kampanye lengkap'
          : 'Mode mingguan · Klien · Highlight win/loss mingguan',
      };
    case 'quarterly':
      return {
        ...base,
        statusBarHint: internal
          ? 'Mode kuartalan · Internal · LTV/CAC & channel profitability'
          : 'Mode kuartalan · Klien · Strategic summary',
      };
    default:
      return {
        ...base,
        statusBarHint: internal
          ? 'Mode bulanan · Internal · Diagnosis SOP & metrik teknis'
          : 'Mode bulanan · Klien · Laporan lengkap branded',
      };
  }
}

export function getStatusBarLabel(reportType, audienceMode, clientName = '') {
  const layout = getLayoutConfig(reportType, audienceMode);
  if (layout.statusBarHint) return layout.statusBarHint;
  const typeLabel = REPORT_TYPE_OPTIONS.find((o) => o.value === reportType)?.label || 'Bulanan';
  const audLabel = audienceMode === 'internal' ? 'Internal' : 'Klien';
  const brand = clientName ? ` · Branding ${clientName}` : '';
  return `Mode ${typeLabel.toLowerCase()} · ${audLabel}${brand}`;
}

export function filterBreakdowns(breakdowns, reportType, audienceMode = 'client') {
  const layout = getLayoutConfig(reportType, audienceMode);
  if (!layout.breakdownDimensions) return breakdowns || [];
  
  const allowed = new Set(layout.breakdownDimensions);
  return (breakdowns || []).filter((b) => allowed.has(b.dimension));
}
