import React from 'react';
import { formatNumber } from '../../../utils/numberFormatter';

function BreakdownTable({ title, rows, mode = 'full' }) {
  if (!rows?.length) return null;

  const clientMode = mode === 'client';

  return (
    <div className="overflow-x-auto">
      <h4 className="text-xs font-bold text-slate-700 mb-2">{title}</h4>
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="border-b border-slate-200 text-left text-slate-400 uppercase tracking-wider">
            <th className="py-2 pr-3 font-bold">Dimensi</th>
            {!clientMode && (
              <th className="py-2 pr-3 font-bold text-right">Spend</th>
            )}
            <th className="py-2 pr-3 font-bold text-right">Revenue</th>
            <th className="py-2 pr-3 font-bold text-right">ROAS</th>
            {!clientMode && (
              <>
                <th className="py-2 pr-3 font-bold text-right">CTR</th>
                <th className="py-2 pr-3 font-bold text-right">CVR</th>
                <th className="py-2 font-bold text-right">CPA</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 8).map((r) => (
            <tr key={r.label} className="border-b border-slate-100 hover:bg-slate-50/50">
              <td className="py-2 pr-3 font-medium text-slate-800">{r.label}</td>
              {!clientMode && (
                <td className="py-2 pr-3 text-right text-slate-600">
                  {formatNumber(r.spend, { style: 'currency', columnLabel: 'spend' })}
                </td>
              )}
              <td className="py-2 pr-3 text-right text-slate-600">
                {r.revenue
                  ? formatNumber(r.revenue, { style: 'currency', columnLabel: 'revenue' })
                  : '—'}
              </td>
              <td className="py-2 pr-3 text-right font-semibold text-violet-700">
                {r.roas ? `${r.roas}×` : '—'}
              </td>
              {!clientMode && (
                <>
                  <td className="py-2 pr-3 text-right text-slate-500">{r.ctr ? `${r.ctr}%` : '—'}</td>
                  <td className="py-2 pr-3 text-right text-slate-500">{r.cvr ? `${r.cvr}%` : '—'}</td>
                  <td className="py-2 text-right text-slate-500">
                    {r.cpa ? formatNumber(r.cpa, { style: 'currency', columnLabel: 'cpa' }) : '—'}
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function DimensionalBreakdownTables({ breakdowns = [], audienceMode = 'client' }) {
  const mode = audienceMode === 'internal' ? 'full' : 'client';

  if (!breakdowns.length) {
    return (
      <p className="text-sm text-slate-500 italic">
        Tidak ada dimensi Platform/Negara/Kampanye terdeteksi untuk breakdown.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {breakdowns.map((b) => (
        <BreakdownTable key={b.dimension} title={`Per ${b.label}`} rows={b.rows} mode={mode} />
      ))}
    </div>
  );
}
