import React from 'react';

export function ChartConfigurator({ columns = [], config = {}, onChange }) {
  const chartTypes = [
    { value: 'bar', label: 'Bar Chart' },
    { value: 'line', label: 'Line Chart' },
    { value: 'area', label: 'Area Chart' },
    { value: 'pie', label: 'Pie Chart' },
    { value: 'donut', label: 'Donut Chart' },
    { value: 'scatter', label: 'Scatter Plot' },
  ];

  const handleTypeChange = (e) => {
    onChange({ ...config, type: e.target.value });
  };

  const handleXChange = (e) => {
    onChange({ ...config, axisX: e.target.value });
  };

  const handleYChange = (e) => {
    onChange({ ...config, axisY: e.target.value });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Tipe Grafik</label>
        <div className="grid grid-cols-3 gap-2">
          {chartTypes.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => onChange({ ...config, type: t.value })}
              className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all text-center ${
                config.type === t.value
                  ? 'border-primary bg-primary/10 text-primary shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Sumbu X (Kategori/Label)</label>
          <select
            value={config.axisX || ''}
            onChange={handleXChange}
            className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50/50"
          >
            <option value="" disabled>Pilih Kolom X...</option>
            {columns.map((col) => (
              <option key={col.name} value={col.name}>
                {col.name} ({col.type})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Sumbu Y (Nilai Angka)</label>
          <select
            value={config.axisY || ''}
            onChange={handleYChange}
            className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50/50"
          >
            <option value="" disabled>Pilih Kolom Y...</option>
            {columns.filter(c => c.type === 'number').map((col) => (
              <option key={col.name} value={col.name}>
                {col.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
