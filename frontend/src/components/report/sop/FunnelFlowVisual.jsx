import React from 'react';
import { formatNumber } from '../../../utils/numberFormatter';
import { ArrowRight } from 'lucide-react';

export default function FunnelFlowVisual({ metrics }) {
  if (!metrics?.hasFunnel) {
    return (
      <p className="text-sm text-slate-500 italic">
        Funnel membutuhkan kolom Impressions, Clicks, dan Conversions pada CSV.
      </p>
    );
  }

  const stages = [
    { label: 'Impressions', value: metrics.totalImpressions },
    { label: 'Clicks', value: metrics.totalClicks, bridge: `CTR ${metrics.trueCTR}%` },
    { label: 'Conversions', value: metrics.totalConversions, bridge: `CVR ${metrics.trueCVR}%` },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-2 print:gap-2">
      {stages.map((stage, i) => (
        <React.Fragment key={stage.label}>
          <div className="sop-print-card flex-1 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 print:p-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{stage.label}</p>
            <p className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1">
              {formatNumber(stage.value)}
            </p>
            {stage.bridge && (
              <p className="text-[11px] font-semibold text-violet-600 mt-2">{stage.bridge}</p>
            )}
          </div>
          {i < stages.length - 1 && (
            <ArrowRight className="hidden sm:block w-5 h-5 text-slate-300 shrink-0" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
