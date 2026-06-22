import {
  aggregateChartData,
  detectAggregationMode,
  parseLocalNumber,
} from './aggregateChartData';
import { evaluateFormula } from './formulaEvaluator';
import {
  formatNumber,
  formatDeltaPercent,
  humanMetricName,
  detectValueStyle,
} from './numberFormatter';
import { appendSopDecisionToNarrative } from './sop/enhanceChartNarrative';

function getAxes(chart) {
  const cfg = chart?.config_json || {};
  return {
    xCol: cfg.axisX || cfg.x_column || '',
    yCol: cfg.axisY || cfg.y_columns?.[0] || '',
  };
}

function entriesFromChart(chart, rows) {
  const { xCol, yCol } = getAxes(chart);
  if (!xCol || !yCol || !rows?.length) return { xCol, yCol, entries: [] };

  const mode = detectAggregationMode(yCol);
  const { categories, data } = aggregateChartData(rows, xCol, yCol, mode, null);
  const entries = categories.map((cat, i) => ({ label: cat, value: data[i] ?? 0 }));
  return { xCol, yCol, entries };
}

function topTwo(entries) {
  const sorted = [...entries].sort((a, b) => b.value - a.value);
  return [sorted[0], sorted[1]].filter(Boolean);
}

function fmtVal(value, yCol) {
  return formatNumber(value, { columnLabel: yCol });
}

function periodDeltaPhrase(entries) {
  if (entries.length < 4) return '';
  const mid = Math.floor(entries.length / 2);
  const firstHalf = entries.slice(0, mid);
  const secondHalf = entries.slice(mid);
  const sum = (arr) => arr.reduce((s, e) => s + e.value, 0);
  const a = sum(firstHalf);
  const b = sum(secondHalf);
  if (a === 0) return '';
  const pct = ((b - a) / a) * 100;
  const phrase = formatDeltaPercent(pct);
  if (!phrase || phrase === 'stabil') return ', stabil dibanding periode sebelumnya';
  return `, ${phrase} dibanding periode sebelumnya`;
}

function trendWord(entries) {
  if (entries.length < 2) return 'stabil';
  const first = entries.slice(0, Math.max(1, Math.floor(entries.length / 3)));
  const last = entries.slice(-Math.max(1, Math.floor(entries.length / 3)));
  const avg = (arr) => arr.reduce((s, e) => s + e.value, 0) / arr.length;
  const diff = avg(last) - avg(first);
  const base = avg(first) || 1;
  const pct = (diff / Math.abs(base)) * 100;
  if (Math.abs(pct) < 8) return 'fluktuatif';
  return pct > 0 ? 'naik' : 'turun';
}

function narrativeBar(chart, rows) {
  const { yCol, entries } = entriesFromChart(chart, rows);
  if (!entries.length) return fallback(chart);

  const metrik = humanMetricName(yCol);
  const [top1, top2] = topTwo(entries);
  const total = entries.reduce((s, e) => s + e.value, 0);
  const delta = periodDeltaPhrase(entries);

  let text = `${top1.label} mencatat ${metrik} tertinggi (${fmtVal(top1.value, yCol)})`;
  if (top2) {
    text += `, diikuti ${top2.label} (${fmtVal(top2.value, yCol)}).`;
  } else {
    text += '.';
  }
  text += ` Total ${metrik} keseluruhan mencapai ${fmtVal(total, yCol)}${delta}.`;
  return text;
}

function narrativeLine(chart, rows) {
  const { yCol, entries } = entriesFromChart(chart, rows);
  if (!entries.length) return fallback(chart);

  const metrik = humanMetricName(yCol);
  let max = entries[0];
  let min = entries[0];
  entries.forEach((e) => {
    if (e.value > max.value) max = e;
    if (e.value < min.value) min = e;
  });

  const tren = trendWord(entries);
  return (
    `${metrik} mencapai puncak pada ${max.label} (${fmtVal(max.value, yCol)}) ` +
    `dan titik terendah pada ${min.label} (${fmtVal(min.value, yCol)}). ` +
    `Tren secara keseluruhan cenderung ${tren} sepanjang periode ini.`
  );
}

function narrativePie(chart, rows) {
  const { yCol, entries } = entriesFromChart(chart, rows);
  if (!entries.length) return fallback(chart);

  const total = entries.reduce((s, e) => s + e.value, 0);
  if (!total) return fallback(chart);

  const sorted = [...entries].sort((a, b) => b.value - a.value);
  const top1 = sorted[0];
  const top2 = sorted[1];
  const bottom = sorted[sorted.length - 1];
  const pct = (v) => ((v / total) * 100).toFixed(1);

  let text = `${top1.label} mendominasi dengan ${pct(top1.value)}% dari total`;
  if (top2 && top2.label !== top1.label) {
    text += `, diikuti ${top2.label} (${pct(top2.value)}%).`;
  } else {
    text += '.';
  }
  if (bottom && bottom.label !== top1.label) {
    text += ` ${bottom.label} berkontribusi paling kecil (${pct(bottom.value)}%).`;
  }
  return text;
}

function narrativeOverlay(chart, rows) {
  const cfg = chart.config_json || {};
  const { xCol, yCol } = getAxes(chart);
  const seriesList = (cfg.series || []).filter((s) => s.active !== false);

  if (!seriesList.length || !xCol || !rows.length) {
    return 'Mode perbandingan aktif — konfigurasi seri dan sumbu untuk melihat narasi perbandingan.';
  }

  const mode = detectAggregationMode(yCol);
  const seriesStats = seriesList.map((s) => {
    const col = s.yColumn || yCol;
    const filtered = s.sourceColumn
      ? rows.filter((r) => String(r[s.sourceColumn] ?? '') === s.name)
      : rows;
    const { categories, data } = aggregateChartData(filtered, xCol, col, mode, null);
    const entries = categories.map((cat, i) => ({ label: cat, value: data[i] ?? 0 }));
    const avg =
      entries.length > 0
        ? entries.reduce((sum, e) => sum + e.value, 0) / entries.length
        : 0;
    const peak = entries.reduce(
      (best, e) => (e.value > (best?.value ?? -Infinity) ? e : best),
      null
    );
    return { name: s.name, avg, peak, col };
  });

  seriesStats.sort((a, b) => b.avg - a.avg);
  const winner = seriesStats[0];
  const runner = seriesStats[1];

  if (!winner || winner.avg === 0) return fallback(chart);

  let text = `${winner.name} secara konsisten lebih tinggi`;
  if (runner) {
    const diffPct = runner.avg
      ? Math.round(((winner.avg - runner.avg) / runner.avg) * 100)
      : 0;
    text += ` dibanding ${runner.name} dengan selisih rata-rata ${diffPct}%.`;
  } else {
    text += ' dibanding seri lainnya.';
  }

  if (winner.peak) {
    const metrik = humanMetricName(winner.col);
    text += ` ${winner.name} mencatat ${metrik} tertinggi pada ${winner.peak.label} (${fmtVal(winner.peak.value, winner.col)}).`;
  }
  return text;
}

function narrativeFormula(chart, rows) {
  const cfg = chart.config_json || {};
  const { xCol, yCol } = getAxes(chart);
  const steps = cfg.formula_steps || cfg.steps || [];
  const formulaName = chart.name || cfg.formula_name || humanMetricName(yCol);
  const benchmark = cfg.benchmark ?? cfg.industry_benchmark;

  if (!steps.length || !rows.length) {
    return `Formula ${formulaName} — lengkapi langkah formula untuk menghasilkan narasi.`;
  }

  const mapping = cfg.column_mapping || {};
  const results = rows.map((row) => ({
    label: xCol ? String(row[xCol] ?? '') : '',
    value: evaluateFormula(row, steps, mapping),
  }));

  const valid = results.filter((r) => !Number.isNaN(r.value));
  if (!valid.length) return fallback(chart);

  const avg = valid.reduce((s, r) => s + r.value, 0) / valid.length;
  const best = valid.reduce((b, r) => (r.value > b.value ? r : b), valid[0]);
  const style = detectValueStyle(formulaName);

  let text = `${formulaName} rata-rata berada di ${formatNumber(avg, { style, columnLabel: formulaName })}`;
  if (benchmark != null && benchmark !== '') {
    const bench = parseLocalNumber(benchmark);
    const compare = avg >= bench ? 'di atas' : 'di bawah';
    text += `, ${compare} rata-rata industri ${formatNumber(bench, { style, columnLabel: formulaName })}.`;
  } else {
    text += '.';
  }

  if (best.label) {
    text += ` ${best.label} mencatat ${formulaName} terbaik (${formatNumber(best.value, { style, columnLabel: formulaName })}).`;
  }
  return text;
}

function fallback(chart) {
  const name = chart?.name || 'Grafik ini';
  return `${name} belum memiliki data yang cukup untuk narasi otomatis. Periksa sumbu X dan Y pada konfigurasi grafik.`;
}

/**
 * Generate natural-language narrative (max ~3 sentences) for a chart.
 * @param {Object} chart - Chart config from reportStore / API
 * @param {Array<Object>} rows - CSV rows
 * @param {{ platform?: string }} [options] - SOP context (platform for benchmarks)
 * @returns {string}
 */
export function generateChartNarrative(chart, rows = [], options = {}) {
  if (!chart) return '';
  if (!rows?.length) return fallback(chart);

  const { yCol } = getAxes(chart);
  if (!yCol && chart.type !== 'overlay') return fallback(chart);

  let base;
  switch (chart.type) {
    case 'bar':
      base = narrativeBar(chart, rows);
      break;
    case 'line':
    case 'area':
      base = narrativeLine(chart, rows);
      break;
    case 'pie':
    case 'donut':
      base = narrativePie(chart, rows);
      break;
    case 'overlay':
      base = narrativeOverlay(chart, rows);
      break;
    case 'formula':
      base = narrativeFormula(chart, rows);
      break;
    default:
      base = narrativeBar(chart, rows);
  }

  const platform = options.platform || 'generic';
  return appendSopDecisionToNarrative(base, chart, rows, platform);
}
