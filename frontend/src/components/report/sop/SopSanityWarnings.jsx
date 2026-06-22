import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function SopSanityWarnings({ warnings = [] }) {
  if (!warnings.length) return null;

  return (
    <div className="sop-print-card rounded-2xl border border-amber-200 bg-amber-50 p-4 space-y-2">
      <div className="flex items-center gap-2 text-amber-800 font-semibold text-sm">
        <AlertTriangle className="w-4 h-4 shrink-0" />
        Peringatan integritas data (SOP Tahap 2)
      </div>
      <ul className="space-y-1">
        {warnings.map((w, i) => (
          <li key={i} className="text-xs text-amber-900 leading-relaxed">
            • {w}
          </li>
        ))}
      </ul>
    </div>
  );
}
