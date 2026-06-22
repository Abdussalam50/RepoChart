import React from 'react';
import Chart from 'react-apexcharts';

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

export function OverlayChart({
  series = [],       // [{ name, color, active, sourceColumn }]
  data = [],
  axisX,
  axisY,
  type = 'line',
  height = 320,
}) {
  // Series with their own yColumn are valid even without a top-level axisY
  const hasUsableY = axisY || series.some(s => s.yColumn);

  // Show informative fallback instead of crashing
  if (!data.length) {
    return (
      <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm font-medium text-slate-500">
        Data CSV belum tersedia
      </div>
    );
  }
  if (!axisX) {
    return (
      <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm font-medium text-slate-500">
        Pilih Sumbu X terlebih dahulu
      </div>
    );
  }
  if (!series.length) {
    return (
      <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm font-medium text-slate-500">
        Tambah minimal satu seri perbandingan
      </div>
    );
  }
  if (!hasUsableY) {
    return (
      <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm font-medium text-slate-500">
        Pilih kolom nilai (Y) untuk setiap seri
      </div>
    );
  }

  const activeSeries = series.filter(s => s.active !== false); // default active if undefined

  if (!activeSeries.length) {
    return (
      <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm font-medium text-slate-400">
        Tidak ada seri yang aktif
      </div>
    );
  }

  // Dynamically check if the axisX is multi-value
  let isMulti = false;
  let delimiter = ',';
  const samples = data.map(r => String(r[axisX] ?? '')).filter(Boolean).slice(0, 20);
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

  // Get unique X categories
  const categories = [...new Set(
    data.flatMap(row => {
      const val = String(row[axisX] ?? 'Unknown');
      if (isMulti && (val.includes(',') || val.includes(';'))) {
        return val.split(delimiter).map(s => toTitleCase(s.trim())).filter(Boolean);
      }
      return [toTitleCase(val.trim())];
    })
  )].filter(Boolean);

  // Build datasets for each series
  const chartSeries = activeSeries.map((s, idx) => {
    // Filter rows where sourceColumn === series name
    const seriesRows = s.sourceColumn
      ? data.filter(row => String(row[s.sourceColumn]) === s.name)
      : data;

    // Map to categories
    const seriesData = categories.map(cat => {
      const matchingRows = seriesRows.filter(row => {
        const val = String(row[axisX] ?? 'Unknown');
        if (isMulti && (val.includes(',') || val.includes(';'))) {
          return val.split(delimiter).map(x => toTitleCase(x.trim())).includes(cat);
        }
        return toTitleCase(val.trim()) === cat;
      });

      const values = matchingRows.map(row => {
        const raw = row[s.yColumn || axisY];
        if (raw === undefined || raw === null) return null;
        return parseFloat(String(raw).replace(/[,\s]/g, '')) || 0;
      }).filter(v => v !== null);

      const isRatio = (s.yColumn || axisY || '').toLowerCase().match(/ctr|cvr|roas|rate/);
      const result = values.length > 0 
        ? (isRatio ? (values.reduce((a, b) => a + b, 0) / values.length) : values.reduce((a, b) => a + b, 0))
        : 0;
      return parseFloat(result.toFixed(2));
    });

    return {
      name: s.name,
      data: seriesData,
      color: s.color,
    };
  });

  // Stable key: forces a clean remount when series composition changes
  // This prevents ApexCharts' runMaskReveal crash (null DOM reference during animation)
  const chartKey = activeSeries.map(s => s.name).join('|') + axisX;
  if (!categories.length) {
    return (
      <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm font-medium text-slate-400">
        Tidak ada kategori ditemukan pada kolom X yang dipilih
      </div>
    );
  }

  const isRateMetric = /(ctr|cvr|rate|roas|cpc|cpa|roi|frequency|%|pct)/i.test(axisY || '');
  const allValues = chartSeries.flatMap(s => s.data);
  const maxVal = allValues.length > 0 ? Math.max(...allValues) : 0;

  const isRatioFormat = isRateMetric && maxVal > 0 && maxVal <= 1.0;
  const isPercentFormat = isRateMetric && maxVal > 1.0;
  const isPctMetric = isRatioFormat || isPercentFormat;

  const formatYValue = (v) => {
    if (v == null) return '0';
    if (isPctMetric) {
      const displayVal = isRatioFormat ? v * 100 : v;
      return displayVal.toFixed(2) + '%';
    }
    if (v >= 1000000) return (v / 1000000).toFixed(1) + 'M';
    if (v >= 1000) return (v / 1000).toFixed(1) + 'K';
    return v.toLocaleString('id-ID');
  };

  const options = {
    chart: {
      id: `overlay-${axisX}`,
      type: type === 'bar' ? 'bar' : 'line',
      fontFamily: 'Outfit, Inter, sans-serif',
      toolbar: { show: true },
      zoom: {
        enabled: true,
        type: 'x',
        autoScaleYaxis: true,
      },
      animations: { enabled: false }, // disabled to prevent runMaskReveal null crash
    },
    colors: activeSeries.map(s => s.color),
    stroke: {
      curve: 'smooth',
      width: activeSeries.map((_, i) => (i % 2 === 1 ? 3 : 2.5)),
      dashArray: activeSeries.map((_, i) => (i % 2 === 1 ? 6 : 0)),
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: '60%',
        grouped: true,
      }
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: '#64748b', fontSize: '12px' } }
    },
    yaxis: {
      labels: {
        style: { colors: '#64748b', fontSize: '12px' },
        formatter: v => formatYValue(v)
      }
    },
    grid: {
      borderColor: '#f1f5f9',
      strokeDashArray: 4,
      yaxis: { lines: { show: true } },
      xaxis: { lines: { show: false } },
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      fontSize: '12px',
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: { formatter: val => formatYValue(val) }
    },
  };

  return (
    <div className="w-full bg-white">
      <Chart
        key={chartKey}
        options={options}
        series={chartSeries}
        type={type === 'bar' ? 'bar' : 'line'}
        height={height}
        width="100%"
      />
    </div>
  );
}
