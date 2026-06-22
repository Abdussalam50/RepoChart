import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { buildApexOptions } from '../../utils/chartApexBuilder';
import { generateChartNarrative } from '../../utils/chartNarrativeGenerator';
import { OverlayChart } from '../chart/OverlayChart';
import EditableText from '../ui/EditableText';
import narrativeService from '../../services/narrativeService';

/**
 * Full chart + auto narrative for report preview / PDF export.
 */
export default function ChartBlock({ chart, rows = [], compact = false, platform = 'generic', readOnly = false, reportType = 'monthly' }) {
  const autoNarrative = generateChartNarrative(chart, rows, { platform });
  const displayText = chart.narrative?.is_edited ? chart.narrative.display_text : autoNarrative;
  const yCol = chart.config_json?.axisY || '';
  const height = compact ? 205 : 280;

  const handleSaveNarrative = async (text) => {
    await narrativeService.updateChartNarrative(chart.id, {
      report_id: chart.report_id,
      custom_text: text,
    });
  };

  const handleResetNarrative = async () => {
    const res = await narrativeService.resetChartNarrative(chart.id, {
      report_id: chart.report_id,
    });
    // Return autoNarrative as fallback
    return res.display_text || autoNarrative;
  };

  const renderChart = () => {
    if (!rows.length) {
      return (
        <p className="text-sm italic text-slate-400 py-8 text-center">Tidak ada data untuk grafik ini.</p>
      );
    }

    if (chart.type === 'overlay') {
      return (
        <OverlayChart
          series={chart.config_json?.series || []}
          data={rows}
          axisX={chart.config_json?.axisX}
          axisY={chart.config_json?.axisY}
          type="line"
        />
      );
    }

    if (chart.type === 'formula') {
      return (
        <div className="flex h-32 items-center justify-center rounded-xl bg-amber-50/50 border border-amber-100 text-xs text-amber-800 font-medium">
          Grafik formula — lihat narasi di bawah
        </div>
      );
    }

    const { options, series, type } = buildApexOptions(chart, rows, reportType);
    const isPie = type === 'pie' || type === 'donut';
    const categoriesCount = options.xaxis?.categories?.length || 0;
    const isLargeDataset = !isPie && categoriesCount > 10;
    const dynamicWidth = isLargeDataset ? `${categoriesCount * 40}px` : '100%';

    return (
      <div className="chart-visual chart-scroll-container w-full overflow-x-auto print:overflow-visible">
        <div style={{ width: dynamicWidth, minHeight: height }} className="chart-scroll-inner print:w-full print:!min-w-full">
          <ReactApexChart options={options} series={series} type={type} height={height} width="100%" />
        </div>
      </div>
    );
  };

  return (
    <div className={`chart-block report-section bg-white border border-slate-200 shadow-sm overflow-hidden ${compact ? 'rounded-xl p-3.5' : 'rounded-2xl p-5'}`}>
      <div className={`chart-header ${compact ? 'mb-2' : 'mb-3'}`}>
        <h4 className="font-bold text-slate-800 text-sm inline mr-2">{chart.name}</h4>
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 inline mr-2">
          {chart.type}
          {yCol ? ` · ${yCol}` : ''}
        </span>
        {chart.config_json?.description && (
          <span className="text-[11px] text-slate-500 italic inline">
            — {chart.config_json.description}
          </span>
        )}
      </div>

      {renderChart()}



      <div className={`chart-narrative border-t border-slate-100 pt-3 mt-3 pb-1 ${compact ? 'print:border-slate-200 print:pt-1.5 print:mt-1.5' : 'print:border-slate-200'}`}>
        <EditableText
          text={displayText}
          onSave={handleSaveNarrative}
          onReset={handleResetNarrative}
          readOnly={readOnly}
          className="text-[11px] text-slate-600 leading-relaxed print:text-slate-700"
        />
      </div>
    </div>
  );
}
