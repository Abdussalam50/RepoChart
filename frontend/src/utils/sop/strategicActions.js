import { getBenchmark } from './benchmarks';
import { formatNumber } from '../numberFormatter';

/**
 * Tahap 5 — scaling, budget shifting, retargeting.
 */
export function getScalingTargets(breakdownRows = [], platform = 'generic') {
  const bench = getBenchmark(platform);
  const target = bench.roas_scale;

  return breakdownRows
    .filter((r) => r.roas >= target && r.spend > 0)
    .sort((a, b) => b.roas - a.roas)
    .slice(0, 3)
    .map((r) => ({
      dimensi: r.label,
      roas: r.roas,
      rekomendasi: `Naikkan budget ${r.label} 15–20% per minggu (ROAS ${r.roas}×).`,
    }));
}

export function getBudgetShift(breakdownRows = []) {
  if (!breakdownRows || breakdownRows.length < 2) return null;

  const valid = breakdownRows.filter((r) => r.spend > 0 && r.roas > 0);
  if (valid.length < 2) return null;

  const sorted = [...valid].sort((a, b) => b.roas - a.roas);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];

  if (best.roas > worst.roas * 1.3) {
    return {
      dari: worst.label,
      ke: best.label,
      alasan: `ROAS ${best.label} (${best.roas}×) jauh di atas ${worst.label} (${worst.roas}×).`,
      rekomendasi: `Pindahkan 10–20% budget dari ${worst.label} ke ${best.label} untuk efisiensi anggaran.`,
    };
  }
  return null;
}

export function getRetargetingAction(metrics) {
  if (!metrics?.sisaAudiens || metrics.sisaAudiens <= 0) return null;

  return {
    audiens: metrics.sisaAudiens,
    rekomendasi: `Ada ${formatNumber(metrics.sisaAudiens)} orang yang sudah klik tetapi belum konversi — buat kampanye retargeting dengan penawaran khusus (diskon atau gratis ongkir).`,
  };
}

export function buildStrategicPlan(metrics, breakdowns = [], platform = 'generic') {
  const primaryBreakdown = breakdowns[0]?.rows || [];
  return {
    scaling: getScalingTargets(primaryBreakdown, platform),
    budgetShift: getBudgetShift(primaryBreakdown),
    retargeting: getRetargetingAction(metrics),
  };
}
