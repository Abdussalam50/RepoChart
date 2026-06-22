import { parseLocalNumber } from '../aggregateChartData';

/** ad_spend, amount_spent, link-clicks → bentuk yang bisa di-regex */
export function headerMatchKey(name) {
  return String(name || '')
    .trim()
    .replace(/^\uFEFF/, '')
    .replace(/[_\-.]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const RULES = {
  spend: [
    /amount\s*spent/i,
    /^ad\s*spend$/i,
    /^cost$/i,
    /^spend$/i,
    /biaya\s*iklan/i,
    /ad\s*spend/i,
    /media\s*cost/i,
    /total\s*spend/i,
  ],
  revenue: [
    /^revenue$/i,
    /sale\s*amount/i,
    /sales?\s*revenue/i,
    /purchase\s*value/i,
    /conversion\s*value/i,
    /website\s*purchase/i,
    /purchases?\s*conversion\s*value/i,
    /nilai\s*konversi/i,
    /pendapatan/i,
    /omset/i,
    /total\s*value/i,
    /sales?\s*value/i,
  ],
  impressions: [/impressions?/i, /tayangan/i, /reach/i, /impresi/i, /Impressions/i, /Impression/i],
  clicks: [/link\s*clicks?/i, /clicks?/i, /Click\/?/i, /Clicks?/i, /klik/i, /Klik/i, /klik/i, /click/i, /klik\s*tayang/i],
  conversions: [/results?/i, /conversions?/i, /Conversions?/i, /pesanan/i, /purchases?/i, /leads?/i, /konversi/i, /conversion/i, /Conversion/i],
};

function isRatioHeader(name) {
  const n = headerMatchKey(name);
  return /\bctr\b/i.test(n)
    || /\bcvr\b/i.test(n)
    || /\bcpc\b/i.test(n)
    || /\bcpa\b/i.test(n)
    || /\broas\b/i.test(n)
    || /\broi\b/i.test(n)
    || /purchase\s*roas|return on ad spend/i.test(n)
    || /\bcpm\b/i.test(n)
    || /frequency|conv\.?\s*rate|conversion\s*rate|cost per result|avg\.?\s*cpc|cost\s*\/\s*conv/i.test(n)
    || /cost per click|cost per action|click[-_ ]?through\s*rate|rasio\s*klik/i.test(n);
}

function findColumn(headers, patterns) {
  for (const h of headers) {
    if (isRatioHeader(h)) continue;
    const key = headerMatchKey(h);
    if (patterns.some((p) => p.test(key))) return h;
  }
  return null;
}

/**
 * Map CSV headers to SOP canonical fields.
 */
export function mapSopColumns(headers = []) {
  const map = {};
  Object.entries(RULES).forEach(([key, patterns]) => {
    map[key] = findColumn(headers, patterns);
  });
  return map;
}

export function sumColumn(rows, col) {
  if (!col || !rows?.length) return 0;
  return rows.reduce((s, r) => s + parseLocalNumber(r[col]), 0);
}
