import React, { useMemo } from 'react';

export function SummaryPanel({ columns = [], selectedCols, onToggleCol, toggles, onToggle }) {
  const numberCols = columns.filter(c => c.type === 'number');

  const metricOptions = [
    { key: 'showSum',    label: 'SUM (Total)' },
    { key: 'showAvg',    label: 'AVG (Rata-rata)' },
    { key: 'showMinMax', label: 'MIN / MAX' },
    { key: 'showDelta',  label: 'Delta % vs Periode Lalu' },
    { key: 'showContrib','label': 'Kontribusi % (Breakdown)' },
  ];

  return (
    <div className="space-y-6">
      {/* Pilih Kolom Angka */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Kolom yang Dikalkulasi</p>
        {numberCols.length === 0 ? (
          <p className="text-sm text-slate-400 italic">Tidak ada kolom numerik ditemukan di CSV.</p>
        ) : (
          <div className="space-y-2">
            {numberCols.map(col => (
              <label
                key={col.name}
                className={`flex items-center gap-3 cursor-pointer rounded-2xl border px-4 py-3 transition-all ${
                  selectedCols.includes(col.name)
                    ? 'border-primary/40 bg-primary/5'
                    : 'border-slate-100 bg-white hover:border-slate-200'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedCols.includes(col.name)}
                  onChange={() => onToggleCol(col.name)}
                  className="h-4 w-4 accent-primary cursor-pointer"
                />
                <span className="flex-1 text-sm font-semibold text-slate-800">{col.name}</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 uppercase">angka</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Toggle Metrik */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Tampilkan Metrik</p>
        <div className="space-y-2">
          {metricOptions.map(opt => (
            <label
              key={opt.key}
              className="flex items-center gap-3 cursor-pointer rounded-2xl border border-slate-100 bg-white px-4 py-3 hover:border-slate-200 transition-all"
            >
              <input
                type="checkbox"
                checked={toggles[opt.key] ?? true}
                onChange={() => onToggle(opt.key)}
                className="h-4 w-4 accent-primary cursor-pointer"
              />
              <span className="text-sm font-medium text-slate-700">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
