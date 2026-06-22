import React from 'react';
import { formatNumber } from '../../../utils/numberFormatter';

export default function ExecutiveScorecard({ metrics }) {
  if (!metrics?.hasProfitability && !metrics?.totalSpend) {
    return (
      <p className="text-sm text-slate-500 italic">
        Kolom Spend/Revenue tidak terdeteksi — scorecard membutuhkan data biaya dan pendapatan nominal.
      </p>
    );
  }

  const cards = [
    {
      label: 'Total Spend',
      value: formatNumber(metrics.totalSpend, { columnLabel: 'spend', style: 'currency' }),
      sub: 'Investasi iklan periode ini',
    },
    {
      label: 'Total Revenue',
      value: metrics.totalRevenue
        ? formatNumber(metrics.totalRevenue, { columnLabel: 'revenue', style: 'currency' })
        : '—',
      sub: 'Pendapatan teratribusi',
    },
    {
      label: 'True ROAS',
      value: metrics.trueROAS ? `${metrics.trueROAS}×` : '—',
      sub: metrics.trueROAS >= 1 ? 'Profit (di atas break-even)' : 'Di bawah break-even',
      highlight: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 print:gap-2">
      {cards.map((c) => (
        <div
          key={c.label}
          className={`sop-print-card rounded-2xl border p-5 print:p-3 ${
            c.highlight
              ? 'border-violet-200 bg-gradient-to-br from-violet-50 to-white shadow-sm'
              : 'border-slate-200 bg-white'
          }`}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{c.label}</p>
          <p className={`text-2xl font-extrabold mt-1 ${c.highlight ? 'text-violet-700' : 'text-slate-900'}`}>
            {c.value}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">{c.sub}</p>
        </div>
      ))}
    </div>
  );
}
