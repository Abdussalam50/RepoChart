import React from 'react';

/**
 * Auto-generated narrative block below a chart (builder card, report, PDF).
 * Updated: render each sentence as a separate line item so long narratives
 * are never clipped. Adds comfortable vertical spacing around the block.
 */
export default function ChartNarrative({ text, className = '' }) {
  if (!text) return null;

  return (
    <div className={`chart-narrative border-t border-slate-100 pt-3 mt-3 pb-1 ${className}`}>
      <p className="chart-narrative-item text-[11px] leading-relaxed text-slate-600 print:text-slate-700">
        {text}
      </p>
    </div>
  );
}
