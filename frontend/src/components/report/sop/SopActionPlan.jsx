import React from 'react';
import { TrendingUp, ArrowLeftRight, Users } from 'lucide-react';

const MECHANISMS = [
  { key: 'scaling', icon: TrendingUp, title: 'Scaling', color: 'emerald' },
  { key: 'budgetShift', icon: ArrowLeftRight, title: 'Budget Shifting', color: 'violet' },
  { key: 'retargeting', icon: Users, title: 'Retargeting', color: 'amber' },
];

export default function SopActionPlan({ strategy, diagnosis = [] }) {
  const scaling = strategy?.scaling || [];
  const shift = strategy?.budgetShift;
  const retarget = strategy?.retargeting;

  const hasContent = scaling.length || shift || retarget || diagnosis.length;
  if (!hasContent) return null;

  return (
    <div className="sop-print-stack space-y-4 print:space-y-3 mt-4 gap-4">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
        Rencana Optimasi Strategis (SOP Tahap 5)
      </h3>

      <div className="sop-action-grid grid gap-3 md:grid-cols-3">
        <div className="sop-print-card rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 print:p-3">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-emerald-800">1. Scaling</span>
          </div>
          {scaling.length ? (
            <ul className="text-xs text-emerald-900 space-y-1.5 leading-relaxed">
              {scaling.map((s, i) => (
                <li key={i}>• {s.rekomendasi}</li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-emerald-700/70 italic">Belum ada dimensi di atas target ROAS scaling.</p>
          )}
        </div>

        <div className="sop-print-card rounded-2xl border border-violet-100 bg-violet-50/50 p-4 print:p-3">
          <div className="flex items-center gap-2 mb-2">
            <ArrowLeftRight className="w-4 h-4 text-violet-600" />
            <span className="text-xs font-bold text-violet-800">2. Budget Shifting</span>
          </div>
          {shift ? (
            <p className="text-xs text-violet-900 leading-relaxed">{shift.rekomendasi}</p>
          ) : (
            <p className="text-xs text-violet-700/70 italic">Selisih ROAS antar dimensi belum signifikan untuk shifting.</p>
          )}
        </div>

        <div className="sop-print-card rounded-2xl border border-amber-100 bg-amber-50/50 p-4 print:p-3">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-bold text-amber-800">3. Retargeting</span>
          </div>
          {retarget ? (
            <p className="text-xs text-amber-900 leading-relaxed">{retarget.rekomendasi}</p>
          ) : (
            <p className="text-xs text-amber-700/70 italic">Tidak ada sisa audiens klik tanpa konversi terdeteksi.</p>
          )}
        </div>
      </div>

      {diagnosis.length > 0 && (
        <div className="sop-print-stack sop-print-splittable rounded-2xl border border-slate-200 bg-white p-4 print:p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Diagnosa funnel (SOP Tahap 4)
          </p>
          <div className="sop-diagnosis-list space-y-3 print:space-y-2">
            {diagnosis.map((d) => (
              <div key={d.kondisi} className="sop-diagnosis-item text-xs border-l-2 border-violet-300 pl-3">
                <p className="font-bold text-slate-800">
                  Kondisi {d.kondisi}: {d.masalah}
                  {d.prioritas === 'kritis' && (
                    <span className="ml-1 text-rose-600 uppercase text-[9px]">Kritis</span>
                  )}
                </p>
                <p className="text-slate-600 mt-0.5">{d.temuan}</p>
                <p className="text-violet-700 font-medium mt-1">→ {d.aksi}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
