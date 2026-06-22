import { mapSopColumns, sumColumn } from './columnMapper';

function toTitleCase(str) {
  if (typeof str !== 'string') {
    if (str === null || str === undefined) return '';
    str = String(str);
  }
  return str.split(/\s+/).map(word => {
    if (!word) return '';
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join(' ');
}

// We keep some priority rules for known labels, but will mostly rely on dynamic detection
const PRIORITY_DIMENSIONS = [
  { id: 'platform', label: 'Platform', patterns: [/platform/i, /channel/i, /network/i, /sumber/i] },
  { id: 'country', label: 'Negara', patterns: [/country/i, /negara/i, /region/i, /wilayah/i] },
  { id: 'campaign', label: 'Kampanye', patterns: [/campaign/i, /kampanye/i, /ad set/i] },
  { id: 'industry', label: 'Industri', patterns: [/industry/i, /kategori/i, /category/i, /vertical/i] },
];

function findPriorityInfo(header) {
  const matched = PRIORITY_DIMENSIONS.find((rule) => rule.patterns.some((p) => p.test(header)));
  if (matched) {
    return { id: matched.id, label: matched.label };
  }
  return { id: header.toLowerCase(), label: (header.charAt(0).toUpperCase() + header.slice(1)) };
}

function groupBreakdown(rows, groupCol, columnMap) {
  const groups = new Map();

  rows.forEach((row) => {
    let rawKey = String(row[groupCol] ?? '').trim();
    let key = rawKey ? toTitleCase(rawKey) : 'Lainnya';
    
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(row);
  });

  const result = [];

  groups.forEach((groupRows, label) => {
    const spend = sumColumn(groupRows, columnMap.spend);
    const revenue = sumColumn(groupRows, columnMap.revenue);
    const impressions = sumColumn(groupRows, columnMap.impressions);
    const clicks = sumColumn(groupRows, columnMap.clicks);
    const conversions = sumColumn(groupRows, columnMap.conversions);

    const roas = spend > 0 && revenue > 0 ? Math.round((revenue / spend) * 100) / 100 : 0;
    const ctr = impressions > 0 ? Math.round((clicks / impressions) * 10000) / 100 : 0;
    const cvr = clicks > 0 ? Math.round((conversions / clicks) * 10000) / 100 : 0;
    const cpa = conversions > 0 ? Math.round(spend / conversions) : 0;

    result.push({
      label,
      spend,
      revenue,
      roas,
      ctr,
      cvr,
      cpa,
      conversions,
    });
  });

  return result.sort((a, b) => (b.revenue || b.spend) - (a.revenue || a.spend));
}

/**
 * Helper to check if a string is somewhat date-like
 */
function isDateLike(str) {
  const cleaned = String(str).trim();
  if (/^\d{4}[-/]\d{2}[-/]\d{2}/.test(cleaned)) return true;
  if (/^(\d{2})[-/](\d{2})[-/](\d{4})/.test(cleaned)) return true;
  return false;
}

/**
 * Tahap 3 — breakdown per dimensi secara dinamis.
 */
export function buildDimensionalBreakdowns(rows = [], columnMap = null) {
  if (!rows?.length) return [];

  const headers = Object.keys(rows[0]);
  const map = columnMap || mapSopColumns(headers);
  const breakdowns = [];
  
  // Get all known metric columns to exclude them
  const metricCols = new Set(Object.values(map).filter(Boolean));

  // Find candidate dimensions
  const dimensionCandidates = headers.filter(header => {
    // Exclude mapped metric columns
    if (metricCols.has(header)) return false;

    // We check the values in this column across rows
    let isNumeric = true;
    let isDate = true;
    let validCount = 0;
    const uniqueValues = new Set();

    for (const row of rows) {
      const val = String(row[header] ?? '').trim();
      if (!val) continue;
      
      validCount++;
      uniqueValues.add(val);
      
      // If we find any non-numeric value, it's not a purely numeric column
      if (isNaN(parseFloat(val.replace(/[^\d.-]/g, '')))) {
        isNumeric = false;
      }
      
      // If we find any value that doesn't look like a date, it's not a date column
      if (!isDateLike(val)) {
        isDate = false;
      }
    }

    // A valid dimension should have data, shouldn't be purely dates,
    // shouldn't be purely numbers (unless they are ID-like, but let's exclude numbers for safety),
    // and should have cardinality between 2 and 100.
    if (validCount === 0) return false;
    if (isDate) return false;
    // We allow numeric dimensions ONLY IF they have very low cardinality (e.g., categorical numbers like "1", "2")
    if (isNumeric && uniqueValues.size > 5) return false; 
    if (uniqueValues.size < 2 || uniqueValues.size > 100) return false;

    return true;
  });

  dimensionCandidates.forEach((col) => {
    const rows_data = groupBreakdown(rows, col, map);
    if (rows_data.length < 2) return;

    const info = findPriorityInfo(col);
    breakdowns.push({
      dimension: info.id,
      label: info.label,
      column: col,
      rows: rows_data,
    });
  });

  return breakdowns;
}
