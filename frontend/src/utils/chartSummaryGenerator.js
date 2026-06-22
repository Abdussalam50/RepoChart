/**
 * Generate a summary text line for a chart card based on its type and data.
 * @param {Object} chart - Chart configuration with type, name, data
 * @param {Array} rows - CSV data rows
 * @returns {{ value: string, delta: string|null, context: string }}
 */
export function generateChartSummary(chart, rows = []) {
  if (!rows.length || !chart.config_json?.axisY) {
    return { value: '—', delta: null, context: '' };
  }

  const yCol = chart.config_json.axisY;
  const parseNum = (v) => parseFloat(String(v ?? '').replace(/[,\s]/g, '')) || 0;

  switch (chart.type) {
    case 'bar':
    case 'line':
    case 'area': {
      const values = rows.map(r => parseNum(r[yCol])).filter(v => !isNaN(v));
      if (!values.length) return { value: '—', delta: null, context: '' };
      const total = values.reduce((a, b) => a + b, 0);
      const max = Math.max(...values);
      const maxIdx = values.indexOf(max);
      const xCol = chart.config_json?.axisX;
      const peakLabel = xCol && rows[maxIdx]
        ? String(rows[maxIdx][xCol] ?? '').slice(0, 12)
        : `Baris ${maxIdx + 1}`;
      return {
        value: total.toLocaleString('id-ID', { maximumFractionDigits: 2 }),
        delta: null,
        context: `Puncak ${peakLabel}`,
      };
    }

    case 'pie':
    case 'donut': {
      const xCol = chart.config_json?.axisX;
      if (!xCol) return { value: '—', delta: null, context: '' };
      const grouped = {};
      rows.forEach(r => {
        const key = String(r[xCol] ?? 'Lainnya');
        grouped[key] = (grouped[key] || 0) + parseNum(r[yCol]);
      });
      const total = Object.values(grouped).reduce((a, b) => a + b, 0);
      if (!total) return { value: '—', delta: null, context: '' };
      const top = Object.entries(grouped).sort((a, b) => b[1] - a[1])[0];
      const pct = ((top[1] / total) * 100).toFixed(1);
      return {
        value: total.toLocaleString('id-ID', { maximumFractionDigits: 2 }),
        delta: null,
        context: `${top[0]} dominan ${pct}%`,
      };
    }

    case 'overlay':
      return { value: '—', delta: null, context: 'Mode perbandingan aktif' };

    case 'formula':
      return { value: '—', delta: null, context: `Formula: ${chart.name}` };

    default:
      return { value: '—', delta: null, context: '' };
  }
}
