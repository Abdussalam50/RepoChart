import { useAuthStore } from '../store/authStore';

/**
 * usePlanLimits — centralised plan-gating logic.
 *
 * Free plan:
 *  - 1 active client
 *  - 2 reports per month
 *  - Basic charts only: bar, line, area
 *  - PDF with watermark
 *  - No AI Insight
 *  - No Breakdown Dimensi
 *
 * Pro plan:
 *  - Unlimited clients & reports
 *  - All chart types
 *  - Branded PDF (no watermark)
 *  - AI Insight
 *  - Full Breakdown
 */
export function usePlanLimits() {
  const { user } = useAuthStore();
  const isPro = user?.plan === 'pro';

  return {
    isPro,
    isFree: !isPro,

    // Clients
    maxClients: isPro ? Infinity : 1,
    canAddClient: (currentCount) => isPro || currentCount < 1,

    // Reports per month
    maxReportsPerMonth: isPro ? Infinity : 2,
    canAddReport: (reportsThisMonth) => isPro || reportsThisMonth < 2,

    // Chart types allowed
    allowedChartTypes: isPro
      ? ['bar', 'line', 'area', 'pie', 'donut']
      : ['bar', 'line', 'area'],
    isChartTypeLocked: (type) => !isPro && !['bar', 'line', 'area'].includes(type),

    // SOP features
    showBreakdown: isPro,
    showAiInsight: isPro,

    // PDF
    pdfWatermark: !isPro,
  };
}
