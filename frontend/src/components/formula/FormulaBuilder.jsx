import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Sparkles } from 'lucide-react';
import { evaluateFormula } from '../../utils/formulaEvaluator';

const OPERATORS = ['÷', '×', '+', '−'];
const AGGREGATIONS = [
  { value: 'avg', label: 'AVG (Rata-rata)' },
  { value: 'sum', label: 'SUM (Total)' },
  { value: 'min', label: 'MIN (Terendah)' },
  { value: 'max', label: 'MAX (Tertinggi)' },
];
const PRESET_COLORS = [
  '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b',
  '#ef4444', '#ec4899', '#3b82f6',
];

function createStep(operand = '', operator = '×') {
  return { operand, operator };
}

function getFormulaPreviewText(formula, columns) {
  if (!formula.steps.length) return '';
  const parts = formula.steps.map((s, i) => {
    const label = s.operand !== '' && s.operand !== undefined ? String(s.operand) : '?';
    return i < formula.steps.length - 1 ? `${label} ${s.operator}` : label;
  });
  return `${formula.name} = ${parts.join(' ')}`;
}

export function FormulaBuilder({ columns = [], data = [], formulas = [], onChange }) {
  const numberCols = columns.filter(c => c.type === 'number');
  const allColNames = columns.map(c => c.name);

  const addFormula = () => {
    const idx = formulas.length;
    const newFormula = {
      id: Date.now(),
      name: `Metrik Kustom ${idx + 1}`,
      color: PRESET_COLORS[idx % PRESET_COLORS.length],
      aggregation: 'avg',
      steps: [createStep('', '÷'), createStep('', null)],
    };
    onChange([...formulas, newFormula]);
  };

  const updateFormula = (id, updated) => {
    onChange(formulas.map(f => f.id === id ? { ...f, ...updated } : f));
  };

  const removeFormula = (id) => {
    onChange(formulas.filter(f => f.id !== id));
  };

  const addStep = (id) => {
    const formula = formulas.find(f => f.id === id);
    if (!formula) return;
    const steps = [...formula.steps];
    // Set operator on last step before adding new
    if (steps.length > 0) {
      steps[steps.length - 1] = { ...steps[steps.length - 1], operator: '×' };
    }
    steps.push(createStep('', null));
    updateFormula(id, { steps });
  };

  const removeStep = (id, stepIdx) => {
    const formula = formulas.find(f => f.id === id);
    if (!formula || formula.steps.length <= 2) return;
    const steps = formula.steps.filter((_, i) => i !== stepIdx);
    updateFormula(id, { steps });
  };

  const updateStep = (id, stepIdx, key, val) => {
    const formula = formulas.find(f => f.id === id);
    if (!formula) return;
    const steps = formula.steps.map((s, i) =>
      i === stepIdx ? { ...s, [key]: val } : s
    );
    updateFormula(id, { steps });
  };

  const getPreviewResult = (formula) => {
    if (!data.length || !formula.steps.length) return null;
    const results = data.map(row => evaluateFormula(row, formula.steps, {}));
    switch (formula.aggregation) {
      case 'sum': return results.reduce((a, b) => a + b, 0);
      case 'avg': return results.reduce((a, b) => a + b, 0) / (results.length || 1);
      case 'min': return Math.min(...results);
      case 'max': return Math.max(...results);
      default: return results[0];
    }
  };

  return (
    <div className="space-y-5">
      {formulas.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
          <Sparkles className="mx-auto h-10 w-10 text-violet-300 mb-3" />
          <p className="text-sm font-semibold text-slate-600">Belum ada formula kustom</p>
          <p className="text-xs text-slate-400 mt-1">Buat metrik baru dari kombinasi kolom CSV tanpa coding.</p>
        </div>
      ) : (
        formulas.map(formula => {
          const previewVal = getPreviewResult(formula);
          const previewText = getFormulaPreviewText(formula, columns);

          return (
            <div key={formula.id} className="rounded-3xl border border-violet-200 bg-white p-5 shadow-sm space-y-5">
              {/* Header */}
              <div className="flex items-center gap-3">
                <div
                  className="h-3.5 w-3.5 rounded-full shrink-0 border-2 border-white shadow-sm"
                  style={{ backgroundColor: formula.color }}
                />
                <input
                  type="text"
                  value={formula.name}
                  onChange={e => updateFormula(formula.id, { name: e.target.value })}
                  className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
                  placeholder="Nama metrik kustom..."
                />
                <input
                  type="color"
                  value={formula.color}
                  onChange={e => updateFormula(formula.id, { color: e.target.value })}
                  className="h-9 w-9 cursor-pointer rounded-xl border border-slate-200 p-1"
                  title="Warna metrik"
                />
                <button
                  type="button"
                  onClick={() => removeFormula(formula.id)}
                  className="rounded-xl p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Step Builder */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Formula</p>
                {formula.steps.map((step, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {/* Operand select */}
                    <select
                      value={step.operand}
                      onChange={e => updateStep(formula.id, i, 'operand', e.target.value)}
                      className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100 bg-slate-50/50"
                    >
                      <option value="" disabled>Pilih kolom / angka...</option>
                      <optgroup label="Kolom Angka">
                        {numberCols.map(col => (
                          <option key={col.name} value={col.name}>{col.name}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Konstanta">
                        {[100, 1000, 1000000].map(n => (
                          <option key={n} value={n}>{n.toLocaleString()}</option>
                        ))}
                      </optgroup>
                    </select>

                    {/* Operator (semua step kecuali terakhir) */}
                    {i < formula.steps.length - 1 && (
                      <select
                        value={step.operator}
                        onChange={e => updateStep(formula.id, i, 'operator', e.target.value)}
                        className="w-16 rounded-xl border border-slate-200 px-2 py-2 text-sm font-bold text-center focus:border-violet-400 focus:outline-none bg-violet-50 text-violet-700"
                      >
                        {OPERATORS.map(op => (
                          <option key={op} value={op}>{op}</option>
                        ))}
                      </select>
                    )}

                    {/* Hapus step */}
                    {formula.steps.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeStep(formula.id, i)}
                        className="rounded-lg p-1.5 text-slate-300 hover:text-red-400 transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => addStep(formula.id)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-violet-600 hover:text-violet-800 transition-all"
                >
                  <Plus className="h-3.5 w-3.5" /> Tambah Operand
                </button>
              </div>

              {/* Aggregation */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Agregasi untuk Ringkasan</label>
                <div className="flex gap-2 flex-wrap">
                  {AGGREGATIONS.map(agg => (
                    <button
                      key={agg.value}
                      type="button"
                      onClick={() => updateFormula(formula.id, { aggregation: agg.value })}
                      className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
                        formula.aggregation === agg.value
                          ? 'border-violet-400 bg-violet-50 text-violet-700'
                          : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      {agg.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Preview */}
              <div className="rounded-2xl border border-violet-100 bg-violet-50/50 px-4 py-3 space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-violet-400">Pratinjau Formula</p>
                <p className="text-sm font-mono font-bold text-violet-800">{previewText || '—'}</p>
                {previewVal !== null && (
                  <p className="text-xs text-slate-500">
                    Hasil ({formula.aggregation.toUpperCase()}): <span className="font-bold text-violet-700">{previewVal.toLocaleString('id-ID', { maximumFractionDigits: 4 })}</span>
                  </p>
                )}
              </div>
            </div>
          );
        })
      )}

      <button
        type="button"
        onClick={addFormula}
        className="w-full flex items-center justify-center gap-2 rounded-2xl border border-dashed border-violet-300 py-3 text-sm font-semibold text-violet-600 hover:bg-violet-50 transition-all"
      >
        <Plus className="h-4 w-4" /> Tambah Formula Baru
      </button>
    </div>
  );
}
