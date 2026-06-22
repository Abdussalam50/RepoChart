import React, { useMemo } from 'react';
import ReactApexChart from 'react-apexcharts';

/**
 * Chart preview using ApexCharts — supports axis labels, legend, and tooltip.
 *
 * @param {{
 *   type: 'bar'|'line'|'area'|'pie'|'donut',
 *   data: number[],
 *   categories: string[],
 *   yLabel: string,
 *   color: string,
 * }} props
 */
export default function MiniChart({
  type = 'bar',
  data = [],
  categories = [],
  yLabel = '',
  color = '#8b5cf6',
}) {
  const PALETTE = [color, '#a78bfa', '#c4b5fd', '#818cf8', '#6366f1'];

  const isPie = type === 'pie' || type === 'donut';

  const isRateMetric = /(ctr|cvr|rate|roas|cpc|cpa|roi|frequency|%|pct)/i.test(yLabel || '');
  const maxVal = data.length > 0 ? Math.max(...data) : 0;

  // Heuristic for ratio vs percentage value:
  // - if max <= 1 → it's a ratio (0.015 = 1.5%), multiply by 100 to display
  // - if max > 1 → already a percentage value (15.5 = 15.5%), display as-is
  const isRatioFormat = isRateMetric && maxVal > 0 && maxVal <= 1.0;
  const isPercentFormat = isRateMetric && maxVal > 1.0;
  const isPctMetric = isRatioFormat || isPercentFormat;

  const formatYValue = (val, isTooltip = false) => {
    if (val == null) return '0';
    if (isPctMetric) {
      const displayVal = isRatioFormat ? val * 100 : val;
      return displayVal.toFixed(1) + '%';
    }
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(isTooltip ? 2 : 1)}M`;
    if (val >= 1_000) return `${(val / 1_000).toFixed(1)}K`;
    return String(Number(val.toFixed(4)));
  };

  // ── shared apex options base ──────────────────────────────────────
  const baseOptions = useMemo(() => ({
    chart: {
      toolbar: { show: false },
      animations: { enabled: false },
      background: 'transparent',
      sparkline: { enabled: false },
      parentHeightOffset: 0,
    },
    colors: PALETTE,
    grid: {
      borderColor: '#f1f5f9',
      strokeDashArray: 3,
      padding: { top: 0, right: 8, bottom: 0, left: 8 },
    },
    tooltip: {
      theme: 'light',
      y: {
        formatter: (val) => formatYValue(val, true),
      },
    },
    dataLabels: { enabled: false },
  }), [color]);

  // ── PIE / DONUT ───────────────────────────────────────────────────
  if (isPie) {
    const hasData = data.length >= 2;
    const pieData = hasData ? data.slice(0, 6) : [40, 30, 30];
    const pieLabels = hasData
      ? categories.slice(0, 6)
      : ['Segmen A', 'Segmen B', 'Segmen C'];

    const options = {
      ...baseOptions,
      chart: { ...baseOptions.chart, type },
      labels: pieLabels,
      legend: {
        show: true,
        position: 'bottom',
        fontSize: '10px',
        fontFamily: 'Inter, sans-serif',
        markers: { size: 6 },
        itemMargin: { horizontal: 6, vertical: 2 },
        formatter: (label) =>
          label.length > 12 ? label.slice(0, 12) + '…' : label,
      },
      plotOptions: {
        pie: {
          donut: { size: type === 'donut' ? '55%' : '0%' },
        },
      },
      stroke: { width: 0 },
      tooltip: {
        ...baseOptions.tooltip,
        y: {
          formatter: (val, opts = {}) => {
            const seriesTotals = opts.w?.globals?.seriesTotals || pieData;
            const total = seriesTotals.reduce((a, b) => a + Number(b || 0), 0);
            const numericValue = Number(val || 0);
            const pct = total ? ((numericValue / total) * 100).toFixed(1) : 0;

            return `${numericValue.toLocaleString('id-ID')} (${pct}%)`;
          },
        },
      },
    };

    return (
      <div className="w-full" style={{ minHeight: 200 }}>
        <ReactApexChart
          key={`${type}-${data.join(',')}`}
          options={options}
          series={pieData}
          type={type}
          height={210}
          width="100%"
        />
      </div>
    );
  }

  // ── BAR / LINE / AREA ─────────────────────────────────────────────
  const hasData = data.length > 0;
  const series = [{ name: yLabel || 'Nilai', data: hasData ? data : [] }];
  const cats = hasData ? categories : [];

  const options = {
    ...baseOptions,
    chart: { ...baseOptions.chart, type: ['bar', 'line', 'area', 'pie', 'donut'].includes(type) ? type : 'bar' },
    xaxis: {
      categories: cats,
      labels: {
        show: true,
        style: { fontSize: '9px', fontFamily: 'Inter, sans-serif', colors: '#94a3b8' },
        rotate: cats.some(c => c.length > 8) ? -35 : 0,
        trim: true,
        maxHeight: 40,
        formatter: (val) => (val && val.length > 10 ? val.slice(0, 10) + '…' : val),
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
      title: {
        // no title on X to save space
      },
    },
    yaxis: {
      labels: {
        show: true,
        style: { fontSize: '9px', fontFamily: 'Inter, sans-serif', colors: '#94a3b8' },
        formatter: (val) => formatYValue(val, false),
      },
    },
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'left',
      fontSize: '10px',
      fontFamily: 'Inter, sans-serif',
      markers: { size: 6 },
      offsetY: -4,
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: Math.min(70, Math.max(30, 80 - data.length * 2)) + '%',
      },
    },
    fill:
      type === 'area'
        ? {
            type: 'gradient',
            gradient: {
              shadeIntensity: 0.4,
              opacityFrom: 0.6,
              opacityTo: 0.05,
              stops: [0, 100],
            },
          }
        : { opacity: 0.92 },
    stroke:
      type === 'bar'
        ? { show: false }
        : { curve: 'smooth', width: 2 },
    markers:
      type === 'line' && data.length <= 15
        ? { size: 3, hover: { size: 5 } }
        : { size: 0 },
  };

  if (!hasData) {
    return (
      <div className="w-full flex items-center justify-center" style={{ minHeight: 180 }}>
        <p className="text-xs text-slate-400">Belum ada data</p>
      </div>
    );
  }

  // Calculate dynamic width based on categories count for scrolling
  // Only apply to bar, line, area charts
  const categoriesCount = cats.length;
  const isLargeDataset = categoriesCount > 20;
  const dynamicWidth = isLargeDataset ? `${categoriesCount * 30}px` : '100%';

  return (
    <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent print:overflow-visible print:w-full">
      <div 
        style={{ 
          minHeight: 200, 
          width: dynamicWidth,
        }}
        className="print:w-full print:!min-width-full"
      >
        <ReactApexChart
          key={`${type}-${yLabel}-${data.length}`}
          options={options}
          series={series}
          type={['bar', 'line', 'area', 'pie', 'donut'].includes(type) ? type : 'bar'}
          height={200}
          width="100%"
        />
      </div>
    </div>
  );
}
