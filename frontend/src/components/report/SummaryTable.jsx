import React, { useMemo } from 'react';

function parseNum(val) {
  if (val === undefined || val === null) return 0;
  return parseFloat(String(val).replace(/[,\s]/g, '')) || 0;
}

function fmt(val) {
  if (val === null || val === undefined || isNaN(val)) return '-';
  const num = Number(val);
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(2) + 'K';
  return num.toLocaleString('id-ID', { maximumFractionDigits: 2 });
}

export function SummaryTable({ data = [], groupByColumn, valueColumns = [], showContrib = true }) {
  const breakdown = useMemo(() => {
    if (!data.length || !groupByColumn || !valueColumns.length) return [];

    // Dynamically check if the groupByColumn is multi-value
    let isMulti = false;
    let delimiter = ',';
    const samples = data.map(r => String(r[groupByColumn] ?? '')).filter(Boolean).slice(0, 20);
    let semicolonCount = 0;
    let commaCount = 0;
    
    samples.forEach(s => {
      if (!isNaN(s.replace(/[,\s]/g, ''))) return; // skip numbers like "1,000"
      if (s.includes(';')) semicolonCount++;
      else if (s.includes(',')) commaCount++;
    });
    
    if (semicolonCount > 0) {
      isMulti = true;
      delimiter = ';';
    } else if (commaCount > 0) {
      isMulti = true;
      delimiter = ',';
    }

    const groups = {};
    data.forEach(row => {
      const rawVal = String(row[groupByColumn] ?? 'Unknown');
      if (isMulti && (rawVal.includes(',') || rawVal.includes(';'))) {
        const parts = rawVal.split(delimiter).map(p => p.trim()).filter(Boolean);
        if (parts.length === 0) {
          const key = 'Unknown';
          if (!groups[key]) groups[key] = [];
          groups[key].push(row);
        } else {
          parts.forEach(part => {
            const key = part;
            if (!groups[key]) groups[key] = [];
            groups[key].push(row);
          });
        }
      } else {
        const key = rawVal;
        if (!groups[key]) groups[key] = [];
        groups[key].push(row);
      }
    });

    const grandTotals = {};
    valueColumns.forEach(col => {
      grandTotals[col] = data.reduce((acc, row) => acc + parseNum(row[col]), 0);
    });

    return Object.entries(groups).map(([key, rows]) => {
      const entry = { group: key };
      valueColumns.forEach(col => {
        const colSum = rows.reduce((acc, row) => acc + parseNum(row[col]), 0);
        entry[col] = parseFloat(colSum.toFixed(2));
        entry[col + '_pct'] = grandTotals[col] > 0
          ? parseFloat(((colSum / grandTotals[col]) * 100).toFixed(1))
          : 0;
      });
      return entry;
    }).sort((a, b) => {
      const firstCol = valueColumns[0];
      return (b[firstCol] ?? 0) - (a[firstCol] ?? 0);
    });
  }, [data, groupByColumn, valueColumns]);

  const grandTotals = useMemo(() => {
    const totals = { group: 'TOTAL' };
    valueColumns.forEach(col => {
      totals[col] = parseFloat(data.reduce((acc, row) => acc + parseNum(row[col]), 0).toFixed(2));
      totals[col + '_pct'] = 100;
    });
    return totals;
  }, [data, valueColumns]);

  if (!breakdown.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-400">
        Pilih kolom grup dan kolom nilai untuk menampilkan tabel breakdown.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-5 py-3.5 sticky left-0 bg-slate-50">{groupByColumn}</th>
              {valueColumns.map(col => (
                <React.Fragment key={col}>
                  <th className="px-5 py-3.5 text-right">{col}</th>
                  {showContrib && <th className="px-5 py-3.5 text-right">% Kontribusi</th>}
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {breakdown.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-5 py-3 font-semibold text-slate-800 sticky left-0 bg-white">
                  {row.group}
                </td>
                {valueColumns.map(col => (
                  <React.Fragment key={col}>
                    <td className="px-5 py-3 text-right font-medium text-slate-700">
                      {fmt(row[col])}
                    </td>
                    {showContrib && (
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-xs font-semibold text-slate-500 w-10 text-right">
                            {row[col + '_pct']}%
                          </span>
                          {/* Mini progress bar */}
                          <div className="h-2 w-20 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary transition-all"
                              style={{ width: `${Math.min(row[col + '_pct'], 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    )}
                  </React.Fragment>
                ))}
              </tr>
            ))}
          </tbody>
          {/* Row TOTAL */}
          <tfoot>
            <tr className="bg-slate-50 border-t-2 border-slate-200 font-bold text-slate-900">
              <td className="px-5 py-3.5 sticky left-0 bg-slate-50">TOTAL</td>
              {valueColumns.map(col => (
                <React.Fragment key={col}>
                  <td className="px-5 py-3.5 text-right">{fmt(grandTotals[col])}</td>
                  {showContrib && (
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-xs font-semibold text-slate-700 w-10 text-right">100%</span>
                        <div className="h-2 w-20 rounded-full bg-primary overflow-hidden">
                          <div className="h-full w-full bg-primary rounded-full" />
                        </div>
                      </div>
                    </td>
                  )}
                </React.Fragment>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
