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

/**
 * Parse a numeric string that may use localized formatting.
 * Handles: "1.234,56" (ID/EU) → 1234.56, "1,234.56" (US/EN) → 1234.56
 * Also handles plain numbers and scientific notation.
 */
export function parseLocalNumber(v) {
  if (v === null || v === undefined) return 0;
  const s = String(v).trim();
  if (s === '' || s === '-') return 0;

  // Already a plain number (integer or decimal with dot)
  if (/^-?\d+(\.\d+)?$/.test(s)) return parseFloat(s);

  // Simple decimal-comma format: e.g. "15,50" or "0,45" or "2,5"
  // Must be ONLY digits + single comma + digits (no thousand-separator dots before it)
  if (/^\d+(,\d+)$/.test(s)) {
    return parseFloat(s.replace(',', '.'));
  }

  // ID/EU format: 1.234,56 or 1.234 (period as thousands separator, comma as decimal)
  if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(s)) {
    return parseFloat(s.replace(/\./g, '').replace(',', '.'));
  }

  // Simple ID/EU format: 15,50 (comma as decimal, no thousands separator)
  if (/^\d+(,\d+)?$/.test(s)) {
    return parseFloat(s.replace(',', '.'));
  }

  // US/EN format: 1,234.56 or 1,234
  if (/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(s)) {
    return parseFloat(s.replace(/,/g, ''));
  }

  // Fallback: strip all non-numeric except dot and minus
  const cleaned = s.replace(/[^\d.\-]/g, '');
  return parseFloat(cleaned) || 0;
}

/**
 * Helper to parse various date formats into Date objects.
 * Supports: YYYY-MM-DD, DD-MM-YYYY, DD/MM/YYYY, MM/DD/YYYY, and standard JS Date parsable strings.
 */
function smartParseDate(str) {
  if (!str) return null;
  const cleaned = String(str).trim();
  
  // Format: YYYY-MM-DD or YYYY/MM/DD
  if (/^\d{4}[-/]\d{2}[-/]\d{2}/.test(cleaned)) {
    const d = new Date(cleaned);
    if (!isNaN(d.getTime())) return d;
  }
  
  // Format: DD-MM-YYYY or DD/MM/YYYY
  const dm = cleaned.match(/^(\d{2})[-/](\d{2})[-/](\d{4})/);
  if (dm) {
    const day = parseInt(dm[1], 10);
    const month = parseInt(dm[2], 10) - 1; // 0-indexed month
    const year = parseInt(dm[3], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d;
  }

  // Fallback to JS standard Date parsing
  const d = new Date(cleaned);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Helper to get Indonesian Quarter Name
 */
function getIndoQuarterYear(date) {
  const month = date.getMonth();
  const quarter = Math.floor(month / 3) + 1;
  return `Q${quarter} ${date.getFullYear()}`;
}

/**
 * Helper to get Week Name (e.g., W1 Jan 2025)
 */
function getIndoWeekYear(date) {
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const diffDays = Math.floor((date - firstDayOfMonth) / (1000 * 60 * 60 * 24));
  const week = Math.floor(diffDays / 7) + 1;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return `W${week} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Helper to get Indonesian Month Name
 */
function getIndoMonthYear(date) {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Helper to get standard Daily Date Name
 */
function getIndoDaily(date) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Groups CSV rows by the X-axis column and aggregates the Y-axis values.
 * If X-axis is date and range > 60 days, auto-aggregates to Monthly categories.
 *
 * @param {Array<Object>}  rows      - Parsed CSV rows (array of objects)
 * @param {string}         xCol      - Column name to use as categories (X axis)
 * @param {string}         yCol      - Column name to aggregate (Y axis)
 * @param {'sum'|'avg'|'max'|'min'} mode - Aggregation mode (default: 'sum')
 * @param {number|null}            limit     - Max number of categories to return (default: null / no limit)
 * @param {string}                 reportType - 'monthly', 'weekly', 'quarterly', 'daily'
 * @returns {{ categories: string[], data: number[] }}
 */
export function aggregateChartData(rows, xCol, yCol, mode = 'sum', limit = null, reportType = 'monthly') {
  if (!rows || !rows.length || !yCol) {
    return { categories: [], data: [] };
  }

  // If no X column → time-series style (no grouping, just take first N rows)
  if (!xCol) {
    const sliced = limit ? rows.slice(0, limit) : rows;
    return {
      categories: sliced.map((_, i) => `#${i + 1}`),
      data: sliced.map((r) => parseLocalNumber(r[yCol])),
    };
  }

  // First pass: check if xCol contains dates and estimate date range
  let isDateCol = false;
  let parsedDates = [];
  
  for (const row of rows) {
    const xVal = String(row[xCol] ?? '').trim();
    if (!xVal) continue;
    const dt = smartParseDate(xVal);
    if (dt) {
      parsedDates.push({ row, originalX: xVal, date: dt });
    }
  }

  // If more than 60% of non-empty rows are dates, we classify it as a Date column
  const nonEmptyRowsCount = rows.filter(r => String(r[xCol] ?? '').trim()).length;
  if (parsedDates.length > 0 && parsedDates.length / nonEmptyRowsCount > 0.6) {
    isDateCol = true;
  }

  // Group rows by X column value (which may be converted to Monthly names)
  const groups = new Map(); // key: groupedValue (string), value: { yValues: number[], sortKey: any }

  for (const row of rows) {
    const xVal = String(row[xCol] ?? '').trim();
    if (!xVal) continue; // skip empty labels
    const yVal = parseLocalNumber(row[yCol]);
    
    let groupKey = xVal;
    let sortKey = xVal;

    if (isDateCol) {
      const dt = smartParseDate(xVal);
      if (dt) {
        if (reportType === 'monthly') {
          groupKey = getIndoMonthYear(dt);
          sortKey = dt.getFullYear() * 100 + dt.getMonth();
        } else if (reportType === 'weekly') {
          groupKey = getIndoWeekYear(dt);
          // sortKey for weekly
          const firstDayOfMonth = new Date(dt.getFullYear(), dt.getMonth(), 1);
          const diffDays = Math.floor((dt - firstDayOfMonth) / (1000 * 60 * 60 * 24));
          const week = Math.floor(diffDays / 7) + 1;
          sortKey = dt.getFullYear() * 1000 + dt.getMonth() * 10 + week;
        } else if (reportType === 'quarterly') {
          groupKey = getIndoQuarterYear(dt);
          const quarter = Math.floor(dt.getMonth() / 3) + 1;
          sortKey = dt.getFullYear() * 10 + quarter;
        } else { // daily
          groupKey = getIndoDaily(dt);
          sortKey = dt.getTime();
        }
      } else {
        groupKey = toTitleCase(xVal);
        sortKey = groupKey;
      }
    } else {
      groupKey = toTitleCase(xVal);
      sortKey = groupKey;
    }

    if (!groups.has(groupKey)) {
      groups.set(groupKey, { yValues: [], sortKey });
    }
    groups.get(groupKey).yValues.push(yVal);
  }

  // Aggregate each group
  const aggregate = (values) => {
    if (!values.length) return 0;
    switch (mode) {
      case 'avg': return values.reduce((a, b) => a + b, 0) / values.length;
      case 'max': return Math.max(...values);
      case 'min': return Math.min(...values);
      case 'sum':
      default:    return values.reduce((a, b) => a + b, 0);
    }
  };

  // Convert map to array of objects
  let entries = Array.from(groups.entries()).map(([cat, info]) => ({
    cat,
    val: aggregate(info.yValues),
    sortKey: info.sortKey,
  }));

  // Sort logic
  if (isDateCol) {
    // Sort chronologically ascending
    entries.sort((a, b) => {
      if (typeof a.sortKey === 'number' && typeof b.sortKey === 'number') {
        return a.sortKey - b.sortKey;
      }
      return String(a.sortKey).localeCompare(String(b.sortKey));
    });
  } else {
    // Standard categorical: sort by aggregated value descending
    entries.sort((a, b) => b.val - a.val);
  }

  // Apply limit if specified
  if (limit) {
    entries = entries.slice(0, limit);
  }

  return {
    categories: entries.map((e) => e.cat),
    data: entries.map((e) => Math.round(e.val * 100) / 100),
  };
}

/**
 * Detects the best aggregation mode based on the Y column name.
 * Rates/ratios/percentages → avg. Counts/amounts → sum.
 */
export function detectAggregationMode(yCol = '') {
  const lower = (yCol || '').toLowerCase();
  const avgKeywords = [
    'rate', 'ctr', 'cvr', 'cpc', 'cpm', 'cpa', 'roas',
    'ratio', 'pct', '%', 'avg', 'average',
    'frequency', 'score', 'conv. rate',
    'klik tayang', 'rasio klik', 'biaya per', 'hasil per'
  ];
  if (avgKeywords.some((kw) => lower.includes(kw))) return 'avg';
  return 'sum';
}
