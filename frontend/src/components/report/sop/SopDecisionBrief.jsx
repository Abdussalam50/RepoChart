import React from 'react';
import { Target } from 'lucide-react';

const VERDICT_STYLES = {
  kritis: 'border-rose-200 bg-rose-50 text-rose-900',
  positif: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  netral: 'border-slate-200 bg-slate-50 text-slate-800',
};

export default function SopDecisionBrief({ executiveBrief }) {
  if (!executiveBrief) return null;

  const { verdict, paragraphs = [], actionItems = [] } = executiveBrief;
  const verdictClass = VERDICT_STYLES[verdict?.level] || VERDICT_STYLES.netral;

  return (
    <div className="sop-print-card sop-print-splittable rounded-3xl border border-violet-100 bg-gradient-to-br from-white via-violet-50/30 to-white p-6 print:p-4 shadow-sm space-y-4 print:space-y-3">
      <div className="sop-keep-together flex items-center gap-2">
        <Target className="w-5 h-5 text-violet-600" />
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Ringkasan Keputusan Bisnis</h3>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
            SOP · Baca ±{executiveBrief.readTimeSeconds || 25} detik
          </p>
        </div>
      </div>

      {verdict && (
        <div className={`sop-keep-together rounded-2xl border px-4 py-3 text-sm font-semibold leading-relaxed ${verdictClass}`}>
          {verdict.headline}
        </div>
      )}

      <div className="space-y-2">
        {paragraphs.map((p, i) => (
          <p key={i} className="text-sm text-slate-700 leading-relaxed">
            {p}
          </p>
        ))}
      </div>

      {/* {actionItems.length > 0 && (
        <div className="sop-print-splittable border-t border-slate-100 pt-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Tindakan prioritas (minggu ini)
          </p>
          <ol className="space-y-2">
            {actionItems.map((item, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-800">
                <span className="font-bold text-violet-600 shrink-0">{i + 1}.</span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ol>
        </div>
      )} */}
    </div>
  );
}
