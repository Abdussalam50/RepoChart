import React, { useMemo } from 'react';
import { runSopAnalysis } from '../../../utils/sop/sopReportEngine';
import { getLayoutConfig, filterBreakdowns } from '../../../utils/reportTypeConfig';
import SopSanityWarnings from './SopSanityWarnings';
import SopDecisionBrief from './SopDecisionBrief';
import ExecutiveScorecard from './ExecutiveScorecard';
import FunnelFlowVisual from './FunnelFlowVisual';
import DimensionalBreakdownTables from './DimensionalBreakdownTable';
import SopActionPlan from './SopActionPlan';
import { usePlanLimits } from '../../../hooks/usePlanLimits';
import { useModalStore } from '../../../store/modalStore';

/**
 * Laporan SOP 3 lapis — konten disesuaikan Tipe Laporan × Audience Mode.
 */
export default function ReportSopSection({
  rows = [],
  platform = 'generic',
  sopFromApi = null,
  reportType = 'monthly',
  audienceMode = 'client',
  layout: layoutProp = null,
  isSharedView = false,
}) {
  const layout = layoutProp || getLayoutConfig(reportType, audienceMode);
  const { isPro } = usePlanLimits();
  const { openModal } = useModalStore();

  const sop = useMemo(() => {
    const local = runSopAnalysis(rows, platform);
    const warnings = [...new Set([...(local.warnings || []), ...(sopFromApi?.warnings || [])])];
    const breakdowns = filterBreakdowns(local.breakdowns, reportType, audienceMode);

    return { ...local, warnings, breakdowns };
  }, [rows, platform, sopFromApi, reportType, audienceMode]);

  const isUnlocked = isSharedView || isPro;

  if (!sop.ready && !rows?.length) {
    return null;
  }

  return (
    <section className="sop-print-stack space-y-4 print:space-y-3">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">Analisis Performa Iklan</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {audienceMode === 'internal'
              ? 'Metodologi SOP — metrik dihitung ulang dari nilai nominal (bukan SUM rasio CSV)'
              : 'Ringkasan performa iklan periode ini'}
          </p>
        </div>
      </div>

      {layout.showSanityWarnings && <SopSanityWarnings warnings={sop.warnings} />}

      {layout.showDecisionBrief && <SopDecisionBrief executiveBrief={sop.executiveBrief} />}

      {layout.showScorecard && (
        <div className="sop-print-card bg-white rounded-3xl border border-slate-200 p-6 print:p-4 shadow-sm space-y-4 print:space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Lapis 1 — Executive Scorecard
          </h3>
          <ExecutiveScorecard metrics={sop.metrics} />
        </div>
      )}

      {layout.showFunnel && (
        <div className="sop-print-card bg-white rounded-3xl border border-slate-200 p-6 print:p-4 shadow-sm space-y-4 print:space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Lapis 2 — Alur Funnel
          </h3>
          <FunnelFlowVisual metrics={sop.metrics} />
        </div>
      )}

      {layout.showBreakdown && (
        isUnlocked ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4 mt-4 font-sans">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Lapis 3 — Breakdown Dimensi
            </h3>
            <DimensionalBreakdownTables
              breakdowns={sop.breakdowns}
              audienceMode={audienceMode}
            />
          </div>
        ) : (
          <div className="bg-slate-50 rounded-3xl border border-dashed border-violet-250 p-8 text-center space-y-3 mt-4 font-sans shadow-sm print:hidden">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider text-slate-450">
              Lapis 3 — Breakdown Dimensi
            </h3>
            <div className="max-w-md mx-auto space-y-2">
              <p className="text-sm text-slate-700 font-semibold flex items-center justify-center gap-1.5">
                <span>Fitur Breakdown Dimensi Terkunci</span>
                <span role="img" aria-label="locked">🔒</span>
              </p>
              <p className="text-xs text-slate-500 leading-relaxed">
                Analisis detail per platform, wilayah, kampanye, dan industri hanya tersedia untuk pengguna paket <strong>Pro</strong>.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={openModal}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-750 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-sm transition-all hover:bg-violet-700"
                >
                  Upgrade ke Pro
                </button>
              </div>
            </div>
          </div>
        )
      )}

      {layout.showActionPlan && (
        <div className="sop-print-stack sop-print-splittable bg-white rounded-3xl border border-slate-200 p-6 print:p-4 shadow-sm print:shadow-none">
          <SopActionPlan strategy={sop.strategy} diagnosis={sop.diagnosis} />
        </div>
      )}

      {layout.technicalFooter && (
        <p className="text-[10px] text-slate-400 italic text-center print:mt-4">
          Metrik dihitung ulang dari nilai nominal — bukan SUM kolom rasio CSV.
        </p>
      )}
    </section>
  );
}
