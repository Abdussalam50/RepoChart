import React, { useMemo } from 'react';
import { evaluateFormula } from '../../utils/formulaEvaluator';

function fmt(val) {
  if (val === null || val === undefined || isNaN(val)) return '-';
  const num = Number(val);
  return num.toLocaleString('id-ID', { maximumFractionDigits: 4 });
}

export function FormulaResultTable({ formulas = [], data = [], columnMappings = {} }) {
  if (!formulas.length || !data.length) return null;

  // Compute results per formula per row
  const formulaResults = useMemo(() => {
    return formulas.map(formula => {
      const mapping = columnMappings[formula.id] || {};
      const rowValues = data.map(row => evaluateFormula(row, formula.steps, mapping));

      // Aggregated value
      let aggregated;
      switch (formula.aggregation) {
        case 'sum': aggregated = rowValues.reduce((a, b) => a + b, 0); break;
        case 'min': aggregated = Math.min(...rowValues); break;
        case 'max': aggregated = Math.max(...rowValues); break;
        case 'avg':
        default:    aggregated = rowValues.reduce((a, b) => a + b, 0) / (rowValues.length || 1);
      }

      const maxVal = Math.max(...rowValues);

      return { formula, rowValues, aggregated, maxVal };
    });
  }, [formulas, data, columnMappings]);

  return (
    <div className="rounded-3xl border border-violet-200 bg-white overflow-hidden shadow-sm">
      {/* Header strip */}
      <div className="flex items-center gap-2 border-b border-violet-100 bg-violet-50/50 px-6 py-3">
        <div className="h-2 w-2 rounded-full bg-violet-400" />
        <p className="text-xs font-bold uppercase tracking-wider text-violet-600">Hasil Formula Kustom</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-5 py-3.5 sticky left-0 bg-slate-50">#</th>
              {formulas.map(f => (
                <th key={f.id} className="px-5 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                      style={{ backgroundColor: f.color }}
                    >
                      kustom
                    </span>
                    <span className="text-slate-600">{f.name}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.slice(0, 20).map((_, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-violet-50/30 transition-colors">
                <td className="px-5 py-3 text-slate-400 font-mono text-xs sticky left-0 bg-white">
                  {rowIdx + 1}
                </td>
                {formulaResults.map(({ formula, rowValues, maxVal }) => {
                  const val = rowValues[rowIdx];
                  const isBest = val === maxVal && maxVal > 0;
                  return (
                    <td
                      key={formula.id}
                      className={`px-5 py-3 text-right font-semibold transition-all ${
                        isBest
                          ? 'text-emerald-700 bg-emerald-50/60'
                          : 'text-slate-700'
                      }`}
                    >
                      {fmt(val)}
                      {isBest && (
                        <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 align-middle" />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
          {/* Aggregated footer */}
          <tfoot>
            <tr className="border-t-2 border-violet-200 bg-violet-50/50 font-bold text-slate-900">
              <td className="px-5 py-3.5 text-xs font-bold uppercase text-violet-600 sticky left-0 bg-violet-50/50">
                {formulaResults[0]?.formula?.aggregation?.toUpperCase() ?? 'RINGKASAN'}
              </td>
              {formulaResults.map(({ formula, aggregated }) => (
                <td key={formula.id} className="px-5 py-3.5 text-right" style={{ color: formula.color }}>
                  {fmt(aggregated)}
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>

      {data.length > 20 && (
        <div className="border-t border-violet-100 bg-violet-50/30 px-6 py-2 text-center text-xs text-violet-400">
          Menampilkan 20 dari {data.length} baris data
        </div>
      )}
    </div>
  );
}
