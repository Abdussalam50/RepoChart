/**
 * Left configuration panel for the chart builder.
 * Updated: tambah KPI Selector section sesuai README_ChartBuilder.md
 */

import {
  REPORT_TYPE_OPTIONS,
  AUDIENCE_MODE_OPTIONS,
} from '../../utils/reportTypeConfig';
import { SeriesManager } from '../chart/SeriesManager';
import { getAvailableKpis, KPI_DEFINITIONS } from '../../utils/kpiCalculator';
import { useMemo } from 'react';
import { CheckSquare, Square, Info } from 'lucide-react';
import { usePlanLimits } from '../../hooks/usePlanLimits';
import { useModalStore } from '../../store/modalStore';

const CHART_TYPES = [
  { value: 'bar',    label: 'Bar',   icon: '▊' },
  { value: 'line',   label: 'Line',  icon: '⟋' },
  { value: 'area',   label: 'Area',  icon: '◿' },
  { value: 'pie',    label: 'Pie',   icon: '◔' },
  { value: 'donut',  label: 'Donut', icon: '◎' },
];

// Warna type indicator kolom (sesuai README_ChartBuilder.md)
const TYPE_COLORS = {
  number: 'bg-[#c8f060] text-emerald-900',
  date:   'bg-[#60d4f0] text-sky-900',
  string: 'bg-[#f0b860] text-amber-900',
  text:   'bg-[#f0b860] text-amber-900',
};

const SectionLabel = ({ children }) => (
  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{children}</p>
);

export default function ConfigPanel({
  columns = [],
  rows = [],
  chart = {},
  onChange,
  overlayMode = false,
  onOverlayToggle,
  onAddChart,
  reportType = 'monthly',
  audienceMode = 'client',
  onReportTypeChange,
  onAudienceModeChange,
  // KPI props
  selectedKpis = [],
  onKpiToggle,
}) {
  const { isChartTypeLocked } = usePlanLimits();
  const { openModal } = useModalStore();

  const stringColumns = columns.filter(c => c.type === 'string' || c.type === 'date');
  const numberColumns = columns.filter(c => c.type === 'number');

  // Get available KPIs based on columns
  const availableKpis = useMemo(() => getAvailableKpis(columns), [columns]);

  const handleSeriesChange = (newSeries) => {
    onChange?.({ ...chart, config_json: { ...chart.config_json, series: newSeries } });
  };

  const handleChange = (key, value) => {
    onChange?.({ ...chart, config_json: { ...chart.config_json, [key]: value } });
  };

  const handleTypeChange = (type) => {
    onChange?.({ ...chart, type });
  };

  return (
    <aside className="w-64 shrink-0 h-full flex flex-col bg-white border-r border-gray-100 overflow-hidden">
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain py-5 px-4 flex flex-col gap-5 [scrollbar-gutter:stable]">

        {/* ── Tipe Laporan & Audience ─────────────────────────────────── */}
        <div className="space-y-4 pb-4 border-b border-gray-100">
          <div>
            <SectionLabel>Tipe Laporan</SectionLabel>
            <select
              value={reportType}
              onChange={(e) => onReportTypeChange?.(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-violet-400"
            >
              {REPORT_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <SectionLabel>Audience Mode</SectionLabel>
            <div className="grid grid-cols-2 gap-1.5">
              {AUDIENCE_MODE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onAudienceModeChange?.(opt.value)}
                  className={[
                    'flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-semibold border transition-all',
                    audienceMode === opt.value
                      ? 'bg-violet-600 text-white border-violet-600'
                      : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-violet-300',
                  ].join(' ')}
                >
                  <span>{opt.icon}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tipe Grafik ─────────────────────────────────────────────── */}
        <div>
          <SectionLabel>Tipe Grafik</SectionLabel>
          <div className="grid grid-cols-3 gap-1.5 font-sans">
            {CHART_TYPES.map(ct => {
              const locked = isChartTypeLocked(ct.value);
              return (
                <button
                  key={ct.value}
                  type="button"
                  onClick={() => {
                    if (locked) {
                      openModal();
                    } else {
                      handleTypeChange(ct.value);
                    }
                  }}
                  title={locked ? "Upgrade ke Pro untuk menggunakan tipe grafik ini" : undefined}
                  className={[
                    'relative flex flex-col items-center justify-center gap-0.5 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer',
                    chart.type === ct.value
                      ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                      : locked
                      ? 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200 hover:text-slate-600'
                      : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-violet-300 hover:text-violet-600',
                  ].join(' ')}
                >
                  <span className="text-base leading-none flex items-center justify-center gap-1">
                    {ct.icon}
                    {locked && <span className="text-[10px] select-none" role="img" aria-label="locked">🔒</span>}
                  </span>
                  <span>{ct.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Sumbu (tanpa overlay mode) ──────────────────────────────── */}
        {!overlayMode && (
          <>
            <div>
              <SectionLabel>Sumbu X (Kategori)</SectionLabel>
              <select
                value={chart.config_json?.axisX ?? ''}
                onChange={e => handleChange('axisX', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
              >
                <option value="">-- Pilih kolom --</option>
                {stringColumns.map(c => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <SectionLabel>Sumbu Y (Nilai)</SectionLabel>
              <select
                value={chart.config_json?.axisY ?? ''}
                onChange={e => handleChange('axisY', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
              >
                <option value="">-- Pilih kolom --</option>
                {numberColumns.map(c => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* ── Daftar Kolom CSV (dengan type indicator) ─────────────────── */}
        {columns.length > 0 && (
          <div>
            <SectionLabel>Kolom Tersedia</SectionLabel>
            <div className="flex flex-wrap gap-1.5">
              {columns.map(col => (
                <span
                  key={col.name}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border border-transparent ${TYPE_COLORS[col.type] || 'bg-gray-100 text-gray-600'}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                  {col.name}
                </span>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              {[['number','#c8f060'],['date','#60d4f0'],['text','#f0b860']].map(([t, c]) => (
                <span key={t} className="flex items-center gap-1 text-[9px] text-gray-400 font-medium">
                  <span className="w-2 h-2 rounded-sm inline-block" style={{ background: c }} />
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Mode Perbandingan Overlay ────────────────────────────────── */}
        {/* <div>
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <div
              onClick={onOverlayToggle}
              className={[
                'relative w-10 h-5 rounded-full transition-colors flex-shrink-0',
                overlayMode ? 'bg-violet-600' : 'bg-gray-200',
              ].join(' ')}
            >
              <span
                className={[
                  'absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform',
                  overlayMode ? 'translate-x-5' : 'translate-x-0',
                ].join(' ')}
              />
            </div>
            <span className="text-sm text-gray-700 font-medium">Bandingkan Seri Data</span>
          </label>
          {overlayMode && (
            <p className="mt-1.5 text-xs text-violet-500">
              Beberapa seri akan ditumpuk pada satu grafik.
            </p>
          )}
        </div> */}

        {/* ── SeriesManager (overlay mode) ─────────────────────────────── */}
        {overlayMode && (
          <div className="border-t border-gray-100 pt-4 space-y-4">
            <div>
              <SectionLabel>Sumbu X (Kategori)</SectionLabel>
              <select
                value={chart.config_json?.axisX ?? ''}
                onChange={e => handleChange('axisX', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
              >
                <option value="">-- Pilih kolom --</option>
                {stringColumns.map(c => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <SectionLabel>Sumbu Y Default (Nilai)</SectionLabel>
              <select
                value={chart.config_json?.axisY ?? ''}
                onChange={e => handleChange('axisY', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
              >
                <option value="">-- Pilih kolom --</option>
                {numberColumns.map(c => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <SectionLabel>Konfigurasi Seri</SectionLabel>
              <div className="-mx-1">
                <SeriesManager
                  columns={columns}
                  data={rows}
                  series={chart.config_json?.series ?? []}
                  onChange={handleSeriesChange}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── KPI Selector ─────────────────────────────────────────────── */}
        {availableKpis.length > 0 && onKpiToggle && (
          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between mb-2">
              <SectionLabel>KPI Metrik</SectionLabel>
              {selectedKpis.length > 0 && (
                <span className="text-[10px] text-violet-600 font-bold bg-violet-50 px-1.5 py-0.5 rounded-md">
                  {selectedKpis.length} aktif
                </span>
              )}
            </div>
            <p className="text-[10px] text-gray-400 mb-2.5 leading-relaxed">
              Pilih KPI yang relevan untuk ditampilkan di preview.
            </p>
            <div className="space-y-1.5">
              {availableKpis.map(kpi => {
                const isSelected = selectedKpis.includes(kpi.key);
                return (
                  <button
                    key={kpi.key}
                    type="button"
                    onClick={() => onKpiToggle(kpi.key)}
                    className={[
                      'w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs border transition-all text-left',
                      isSelected
                        ? 'bg-violet-50 border-violet-200 text-violet-800'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-violet-200 hover:bg-violet-50/30',
                    ].join(' ')}
                    title={kpi.description}
                  >
                    {isSelected
                      ? <CheckSquare className="w-3.5 h-3.5 text-violet-600 shrink-0" />
                      : <Square className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    }
                    <span className="font-semibold flex-1">{kpi.label}</span>
                    <span className="text-[9px] text-gray-400 font-normal uppercase">{kpi.format}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Keterangan Grafik ────────────────────────────────────────── */}
        <div>
          <SectionLabel>Keterangan Grafik</SectionLabel>
          <textarea
            value={chart.config_json?.description ?? ''}
            onChange={e => handleChange('description', e.target.value)}
            placeholder="Tulis catatan, analisis, atau kesimpulan singkat untuk grafik ini..."
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent resize-none"
          />
        </div>

      </div>

      {/* ── Tombol Tambah Grafik ────────────────────────────────────────── */}
      <div className="shrink-0 border-t border-gray-100 bg-white p-4">
        <button
          onClick={onAddChart}
          className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white text-sm font-semibold py-2.5 rounded-2xl transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Tambah Grafik
        </button>
      </div>
    </aside>
  );
}
