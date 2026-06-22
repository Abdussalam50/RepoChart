/** Kolom nominal — BOLEH di-SUM */
export const NOMINAL_PATTERNS = [
  /impressions?/i,
  /tayangan/i,
  /reach/i,
  /clicks?/i,
  /link clicks/i,
  /klik/i,
  /conversions?/i,
  /results?/i,
  /pesanan/i,
  /amount spent/i,
  /spend/i,
  /cost(?! per)/i,
  /biaya/i,
  /revenue/i,
  /pendapatan/i,
  /video views/i,
];

/** Kolom rasio — JANGAN di-SUM, hitung ulang dari nominal */
export const RATIO_PATTERNS = [
  /^ctr$/i,
  /^cvr$/i,
  /^cpc$/i,
  /^cpa$/i,
  /^roas$/i,
  /\broas\b/i,
  /purchase\s*roas/i,
  /return on ad spend/i,
  /^cpm$/i,
  /frequency/i,
  /conv\.?\s*rate/i,
  /cost per result/i,
  /avg\.?\s*cpc/i,
  /cost\s*\/\s*conv/i,
];

import { headerMatchKey } from './columnMapper';

export function isRatioColumn(name) {
  const n = headerMatchKey(name);
  return RATIO_PATTERNS.some((p) => p.test(n));
}

export function isNominalColumn(name) {
  const n = headerMatchKey(name);
  if (isRatioColumn(name)) return false;
  return NOMINAL_PATTERNS.some((p) => p.test(n));
}

export function categorizeColumns(headers = []) {
  const nominal = [];
  const ratio = [];
  const unknown = [];

  headers.forEach((h) => {
    if (isRatioColumn(h)) ratio.push(h);
    else if (isNominalColumn(h)) nominal.push(h);
    else unknown.push(h);
  });

  return { nominal, ratio, unknown };
}
