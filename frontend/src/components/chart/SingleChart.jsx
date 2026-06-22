import React from 'react';
import Chart from 'react-apexcharts';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function parseNum(val) {
  if (val === undefined || val === null) return 0;
  return parseFloat(String(val).replace(/[,\s]/g, '')) || 0;
}

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

// Aggregate rows → { label: aggregatedValue } untuk pie/donut/bar/line/area
function aggregateByCategory(data, xCol, yCol) {
  const map = {};
  const isRateMetric = /(ctr|cvr|rate|roas|cpc|cpa|roi|frequency|%|pct)/i.test(yCol || '');
  
  // Dynamically check if the xCol is multi-value
  let isMulti = false;
  let delimiter = ',';
  const samples = data.map(r => String(r[xCol] ?? '')).filter(Boolean).slice(0, 20);
  let semicolonCount = 0;
  let commaCount = 0;
  
  samples.forEach(s => {
    if (!isNaN(s.replace(/[,\s]/g, ''))) return; // skip numbers like "1,000"
    if (s.includes(';')) semicolonCount++;
    else if (s.includes(',')) commaCount++;
  });
  
  if (semicolonCount > 0) {
    isMulti = true;
    delimiter = ';';
  } else if (commaCount > 0) {
    isMulti = true;
    delimiter = ',';
  }

  const counts = {}; // to calculate average for ratios

  data.forEach(row => {
    const rawVal = String(row[xCol] ?? 'Unknown');
    const val = parseNum(row[yCol]);

    const addToMap = (key) => {
      map[key] = (map[key] || 0) + val;
      counts[key] = (counts[key] || 0) + 1;
    };

    if (isMulti && (rawVal.includes(',') || rawVal.includes(';'))) {
      const parts = rawVal.split(delimiter).map(p => p.trim()).filter(Boolean);
      if (parts.length === 0) {
        addToMap('Unknown');
      } else {
        parts.forEach(part => {
          addToMap(toTitleCase(part));
        });
      }
    } else {
      addToMap(toTitleCase(rawVal.trim()));
    }
  });

  if (isRateMetric) {
    Object.keys(map).forEach(key => {
      if (counts[key] > 0) {
        map[key] = map[key] / counts[key];
      }
    });
  }

  return map;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function SingleChart({
  type = 'bar',
  data = [],
  axisX,
  axisY,
  brandColor = '#8b5cf6',
  title = ''
}) {
  if (!data || data.length === 0 || !axisX || !axisY) {
    return (
      <div className="flex h-72 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm font-medium text-slate-500 font-sans">
        Pilih sumbu X dan sumbu Y untuk melihat pratinjau grafik
      </div>
    );
  }

  const aggregated = aggregateByCategory(data, axisX, axisY);
  const categories = Object.keys(aggregated);
  const rawValues = Object.values(aggregated);
  const maxVal = rawValues.length > 0 ? Math.max(...rawValues) : 0;

  const isRateMetric = /(ctr|cvr|rate|roas|cpc|cpa|roi|frequency|%|pct)/i.test(axisY || '');
  const isRatioFormat = isRateMetric && maxVal > 0 && maxVal <= 1.0;
  const isPercentFormat = isRateMetric && maxVal > 1.0;
  const isPctMetric = isRatioFormat || isPercentFormat;

  const formatYValue = (v) => {
    if (v == null) return '0';
    if (isPctMetric) {
      const displayVal = isRatioFormat ? v * 100 : v;
      return displayVal.toFixed(2) + '%';
    }
    if (v >= 1_000_000_000) return (v / 1_000_000_000).toFixed(1) + 'B';
    if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + 'M';
    if (v >= 1_000) return (v / 1_000).toFixed(1) + 'K';
    return v.toLocaleString('id-ID');
  };

  // ── Pie / Donut ─────────────────────────────────────────────────────────────
  if (type === 'pie' || type === 'donut') {
    // Limit to top 12 slices for readability
    const sorted = Object.entries(aggregated)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 12);

    const pieLabels = sorted.map(([label]) => label);
    const pieSeries = sorted.map(([, val]) => parseFloat(val.toFixed(2)));

    const pieOptions = {
      chart: {
        type,
        fontFamily: 'Outfit, Inter, sans-serif',
        toolbar: { show: false },
        animations: { enabled: true, speed: 800 },
      },
      labels: pieLabels,
      colors: [
        brandColor,
        '#06b6d4', '#10b981', '#f59e0b', '#ef4444',
        '#ec4899', '#3b82f6', '#84cc16', '#f97316',
        '#6366f1', '#a78bfa', '#34d399',
      ],
      legend: {
        position: 'bottom',
        horizontalAlign: 'center',
        fontSize: '12px',
      },
      dataLabels: {
        enabled: true,
        formatter: (val) => `${val.toFixed(1)}%`,
      },
      tooltip: {
        y: {
          formatter: (val) => formatYValue(val),
        },
      },
      stroke: { show: false },
      plotOptions: {
        pie: {
          donut: {
            size: type === 'donut' ? '65%' : '0%',
            labels: {
              show: type === 'donut',
              total: {
                show: true,
                label: 'Total',
                fontSize: '13px',
                fontWeight: 600,
                color: '#0f172a',
                formatter: (w) => {
                  const seriesTotals = w?.globals?.seriesTotals || pieSeries;
                  const total = seriesTotals.reduce((a, b) => a + Number(b || 0), 0);
                  return formatYValue(total);
                },
              },
            },
          },
        },
      },
    };

    return (
      <div className="w-full bg-white p-4">
        {title && <h4 className="text-sm font-bold text-slate-800 mb-4">{title}</h4>}
        <Chart
          options={pieOptions}
          series={pieSeries}
          type={type}
          height={320}
          width="100%"
        />
      </div>
    );
  }

  // ── Scatter ──────────────────────────────────────────────────────────────────
  if (type === 'scatter') {
    // Each row becomes an {x, y} point
    const scatterPoints = data.map(row => ({
      x: parseNum(row[axisX]) || 0,  // scatter needs numeric X too
      y: parseNum(row[axisY]) || 0,
    }));

    const scatterSeries = [{ name: `${axisX} vs ${axisY}`, data: scatterPoints }];

    const scatterOptions = {
      chart: {
        type: 'scatter',
        fontFamily: 'Outfit, Inter, sans-serif',
        toolbar: { show: false },
        zoom: { enabled: true },
        animations: { enabled: true, speed: 600 },
      },
      colors: [brandColor],
      markers: { size: 6, strokeWidth: 0 },
      xaxis: {
        type: 'numeric',
        tickAmount: 8,
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: {
          style: { colors: '#64748b', fontSize: '12px' },
          formatter: v => formatYValue(v)
        },
        title: { text: axisX, style: { color: '#64748b', fontSize: '11px' } },
      },
      yaxis: {
        labels: {
          style: { colors: '#64748b', fontSize: '12px' },
          formatter: v => formatYValue(v)
        },
        title: { text: axisY, style: { color: '#64748b', fontSize: '11px' } },
      },
      grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
      tooltip: {
        x: { formatter: v => `${axisX}: ${v.toLocaleString('id-ID')}` },
        y: { formatter: v => `${axisY}: ${formatYValue(v)}` },
      },
    };

    return (
      <div className="w-full bg-white p-4">
        {title && <h4 className="text-sm font-bold text-slate-800 mb-4">{title}</h4>}
        <Chart
          options={scatterOptions}
          series={scatterSeries}
          type="scatter"
          height={320}
          width="100%"
        />
      </div>
    );
  }

  // ── Bar / Line / Area (default) ──────────────────────────────────────────────
  const seriesData = rawValues.map(v => parseFloat(v.toFixed(2)));
  const series = [{ name: axisY, data: seriesData }];

  const options = {
    chart: {
      type,
      fontFamily: 'Outfit, Inter, sans-serif',
      toolbar: { show: true },
      zoom: {
        enabled: true,
        type: 'x',
        autoScaleYaxis: true
      },
      animations: { enabled: true, easing: 'easeinout', speed: 800 },
    },
    colors: [brandColor],
    plotOptions: {
      bar: { borderRadius: 6, columnWidth: '50%' },
    },
    dataLabels: { enabled: false },
    stroke: {
      curve: 'smooth',
      width: type === 'line' || type === 'area' ? 3 : 0,
    },
    fill: {
      type: type === 'area' ? 'gradient' : 'solid',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [0, 100],
      },
    },
    xaxis: {
      categories: categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: '#64748b', fontSize: '12px' } },
    },
    yaxis: {
      labels: {
        style: { colors: '#64748b', fontSize: '12px' },
        formatter: (value) => formatYValue(value),
      },
    },
    grid: {
      borderColor: '#f1f5f9',
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    legend: { position: 'top', horizontalAlign: 'right' },
    tooltip: {
      theme: 'light',
      y: { formatter: (val) => formatYValue(val) },
    },
  };

  return (
    <div className="w-full bg-white p-4">
      {title && <h4 className="text-sm font-bold text-slate-800 mb-4">{title}</h4>}
      <Chart
        options={options}
        series={series}
        type={type}
        height={320}
        width="100%"
      />
    </div>
  );
}
