import { aggregateChartData, detectAggregationMode } from './aggregateChartData';

/**
 * Build ApexCharts options + series for a report chart and CSV rows.
 */
export function buildApexOptions(chart, rows, reportType = 'monthly') {
  const xCol = chart.config_json?.axisX || '';
  const yCol = chart.config_json?.axisY || '';
  const type = chart.type || 'bar';
  const isPie = type === 'pie' || type === 'donut';
  const COLOR = '#8b5cf6';
  const PALETTE = [COLOR, '#a78bfa', '#6366f1', '#c4b5fd', '#818cf8'];

  const aggMode = detectAggregationMode(yCol);
  const { categories: cats, data: yData } = aggregateChartData(rows, xCol, yCol, aggMode, null, reportType);

  // Detect if the Y column is a rate/percentage metric (CTR, CVR, rate, etc.)
  const isRateMetric = /(ctr|cvr|rate|roas|cpc|cpa|roi|frequency|%|pct|biaya per|hasil per)/i.test(yCol);
  const maxDataVal = yData.length > 0 ? Math.max(...yData.filter(v => v != null && !isNaN(v))) : 0;

  // Smart percentage logic:
  // - if max <= 1 → it's a ratio (0.015 = 1.5%), multiply by 100 to display
  // - if max > 1 → already a percentage value (15.5 = 15.5%), display as-is
  const isRatioFormat = isRateMetric && maxDataVal > 0 && maxDataVal <= 1.0;
  const isPercentFormat = isRateMetric && maxDataVal > 1.0;
  const isPctMetric = isRatioFormat || isPercentFormat;

  const formatYValue = (v, isTooltip = false) => {
    if (v == null) return '0';
    if (isPctMetric) {
      const displayVal = isRatioFormat ? v * 100 : v;
      return displayVal.toFixed(2) + '%';
    }
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(isTooltip ? 2 : 1)}M`;
    if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
    return String(Number(v?.toFixed(4) ?? 0));
  };

  const baseOptions = {
    chart: {
      toolbar: { show: false },
      animations: { speed: 400 },
      background: 'transparent',
    },
    colors: PALETTE,
    grid: { borderColor: '#f1f5f9', strokeDashArray: 3 },
    dataLabels: { enabled: false },
    tooltip: {
      theme: 'light',
      y: {
        formatter: (v) => formatYValue(v, true),
      },
    },
  };

  if (isPie) {
    const hasData = yData.length >= 2;
    return {
      options: {
        ...baseOptions,
        chart: { ...baseOptions.chart, type },
        labels: hasData ? cats.slice(0, 12) : ['A', 'B', 'C'],
        legend: { position: 'bottom', fontSize: '11px' },
        plotOptions: { pie: { donut: { size: type === 'donut' ? '60%' : '0%' } } },
      },
      series: hasData ? yData.slice(0, 12) : [40, 30, 30],
      type,
    };
  }

  return {
    options: {
      ...baseOptions,
      chart: { ...baseOptions.chart, type: type === 'bar' ? 'bar' : type },
      xaxis: {
        categories: cats,
        labels: {
          style: { fontSize: '10px', colors: '#94a3b8' },
          rotate: cats.length > 10 ? -45 : 0,
          rotateAlways: cats.length > 10,
          formatter: (v) => (v && v.length > 15 ? v.slice(0, 15) + '…' : v),
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          style: { fontSize: '10px', colors: '#94a3b8' },
          formatter: (v) => formatYValue(v, false),
        },
      },
      legend: { show: true, position: 'top', horizontalAlign: 'left', fontSize: '11px' },
      plotOptions: {
        bar: { borderRadius: 5, columnWidth: '60%' },
      },
      stroke: type === 'bar' ? { show: false } : { curve: 'smooth', width: 2 },
      fill:
        type === 'area'
          ? {
              type: 'gradient',
              gradient: { shadeIntensity: 0.4, opacityFrom: 0.5, opacityTo: 0.02, stops: [0, 100] },
            }
          : { opacity: 0.9 },
      markers: type === 'line' && yData.length <= 20 ? { size: 4 } : { size: 0 },
    },
    series: [{ name: yCol || 'Nilai', data: yData }],
    type: type === 'bar' ? 'bar' : type,
  };
}
