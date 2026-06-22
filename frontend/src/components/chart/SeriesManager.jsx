import React, { useState } from 'react';
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react';

const PRESET_COLORS = [
  '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b',
  '#ef4444', '#ec4899', '#3b82f6', '#84cc16',
  '#f97316', '#6366f1',
];

export function SeriesManager({ columns = [], data = [], series, onChange }) {
  const [newCategory, setNewCategory] = useState('');
  const [newNumeric, setNewNumeric] = useState('');

  // Get unique values from a category column
  const getUniqueValues = (colName) => {
    if (!colName || !data.length) return [];
    const vals = [...new Set(data.map(row => row[colName]).filter(Boolean))];
    return vals.slice(0, 10); // limit to 10 unique values
  };

  const categoryColumns = columns.filter(c => c.type === 'text' || c.type === 'string' || c.type === 'date');
  const numericColumns = columns.filter(c => c.type === 'number');

  const handleAddFromColumn = (colName) => {
    const uniqueVals = getUniqueValues(colName);
    const existing = series.map(s => s.name);
    const newSeries = uniqueVals
      .filter(v => !existing.includes(v))
      .map((v, i) => ({
        name: v,
        color: PRESET_COLORS[(series.length + i) % PRESET_COLORS.length],
        active: true,
        sourceColumn: colName,
      }));
    onChange([...series, ...newSeries]);
  };

  const handleAddNumericCol = (colName) => {
    const existing = series.map(s => s.name);
    if (existing.includes(colName)) return;

    const newSeries = {
      name: colName,
      color: PRESET_COLORS[series.length % PRESET_COLORS.length],
      active: true,
      yColumn: colName, // Special flag for numeric overlay
    };
    onChange([...series, newSeries]);
  };

  const toggleSeries = (index) => {
    const updated = series.map((s, i) =>
      i === index ? { ...s, active: !s.active } : s
    );
    onChange(updated);
  };

  const removeSeries = (index) => {
    onChange(series.filter((_, i) => i !== index));
  };

  const updateColor = (index, color) => {
    const updated = series.map((s, i) =>
      i === index ? { ...s, color } : s
    );
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Pilih Kolom Kategori */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Tambah Seri dari Kolom Kategori
        </label>
        <div className="flex gap-2">
          <select
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50/50"
          >
            <option value="" disabled>Pilih kolom kategori...</option>
            {categoryColumns.map(col => (
              <option key={col.name} value={col.name}>{col.name}</option>
            ))}
          </select>
          <button
            type="button"
            disabled={!newCategory}
            onClick={() => { handleAddFromColumn(newCategory); setNewCategory(''); }}
            className="flex items-center gap-1.5 rounded-xl bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <Plus className="h-4 w-4" />
            Deteksi Nilai
          </button>
        </div>
      </div>

      {/* Pilih Kolom Numerik */}
      <div className="pt-2 border-t border-slate-100">
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Tambah Seri dari Kolom Numerik (Sumbu Y Tambahan)
        </label>
        <div className="flex gap-2">
          <select
            value={newNumeric}
            onChange={e => setNewNumeric(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50/50"
          >
            <option value="" disabled>Pilih kolom numerik...</option>
            {numericColumns.map(col => (
              <option key={col.name} value={col.name}>{col.name}</option>
            ))}
          </select>
          <button
            type="button"
            disabled={!newNumeric}
            onClick={() => { handleAddNumericCol(newNumeric); setNewNumeric(''); }}
            className="flex items-center gap-1.5 rounded-xl bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <Plus className="h-4 w-4" />
            Tambah
          </button>
        </div>
      </div>

      {/* Daftar Seri */}
      {series.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center text-sm text-slate-400">
          Belum ada seri. Pilih kolom kategori untuk mendeteksi nilai uniknya.
        </div>
      ) : (
        <div className="space-y-2">
          {series.map((s, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition-all ${
                s.active ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50 opacity-60'
              }`}
            >
              {/* Warna */}
              <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-white shadow-sm overflow-hidden"
                style={{ backgroundColor: s.color }}>
                <input
                  type="color"
                  value={s.color}
                  onChange={e => updateColor(i, e.target.value)}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  title="Klik untuk ganti warna"
                />
              </div>

              {/* Nama Seri */}
              <span className="flex-1 text-sm font-semibold text-slate-800 truncate">{s.name}</span>

              {/* Toggle aktif */}
              <button
                type="button"
                onClick={() => toggleSeries(i)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
                title={s.active ? 'Sembunyikan' : 'Tampilkan'}
              >
                {s.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>

              {/* Hapus */}
              <button
                type="button"
                onClick={() => removeSeries(i)}
                className="rounded-lg p-1 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
                title="Hapus seri"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
