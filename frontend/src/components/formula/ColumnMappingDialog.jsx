import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export function ColumnMappingDialog({ formula, columns = [], mapping, onUpdateMapping, onClose, onConfirm }) {
  if (!formula) return null;

  // Determine which operands are column names (not numbers)
  const operandNames = formula.steps
    .map(s => s.operand)
    .filter(op => op !== '' && op !== null && op !== undefined && isNaN(Number(op)));

  const unmapped = operandNames.filter(op => !columns.find(c => c.name === op) && !mapping[op]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white shadow-2xl p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 transition-all"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3 mb-5">
          <div className="rounded-xl bg-amber-50 p-2 shrink-0">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Pemetaan Kolom Diperlukan</h3>
            <p className="text-sm text-slate-500 mt-0.5">
              Formula <span className="font-semibold text-slate-700">{formula.name}</span> membutuhkan kolom yang tidak cocok dengan nama di file CSV ini.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {operandNames.map(op => {
            const existsInCsv = columns.find(c => c.name === op);
            if (existsInCsv) return null;

            return (
              <div key={op} className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4 space-y-2">
                <p className="text-xs text-amber-700 font-medium">
                  Formula membutuhkan kolom <span className="font-bold">"{op}"</span>, tapi tidak ditemukan di file CSV ini.
                </p>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pilih kolom pengganti dari CSV:
                </label>
                <select
                  value={mapping[op] || ''}
                  onChange={e => onUpdateMapping({ ...mapping, [op]: e.target.value })}
                  className="block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="" disabled>Pilih kolom CSV...</option>
                  {columns.filter(c => c.type === 'number').map(col => (
                    <option key={col.name} value={col.name}>{col.name}</option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={unmapped.some(op => !mapping[op])}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Konfirmasi Pemetaan
          </button>
        </div>
      </div>
    </div>
  );
}
