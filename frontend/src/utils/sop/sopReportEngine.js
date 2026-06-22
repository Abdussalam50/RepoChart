import { calculateSopMetrics, sanityCheckMetrics } from './sopMetricsCalculator';
import { buildDimensionalBreakdowns } from './dimensionalBreakdown';
import { diagnoseFunnel } from './funnelDiagnostics';
import { buildStrategicPlan } from './strategicActions';
import { getBenchmark } from './benchmarks';
import { formatNumber } from '../numberFormatter';

function roasVerdict(metrics, bench) {
  if (!metrics.hasProfitability) return null;
  if (metrics.trueROAS < bench.roas_min) {
    return {
      level: 'kritis',
      headline: `Iklan belum profit — True ROAS ${metrics.trueROAS}× (di bawah break-even 1×).`,
      decision: 'Prioritas: hentikan pemborosan budget sebelum scaling.',
    };
  }
  if (metrics.trueROAS >= bench.roas_scale) {
    return {
      level: 'positif',
      headline: `Performa kuat — True ROAS ${metrics.trueROAS}× (di atas target scaling ${bench.roas_scale}×).`,
      decision: 'Prioritas: scaling terukur 15–20% pada dimensi terbaik.',
    };
  }
  return {
    level: 'netral',
    headline: `Iklan profit — True ROAS ${metrics.trueROAS}×, masih di bawah ambang scaling agresif.`,
    decision: 'Prioritas: optimasi funnel dan uji kreatif sebelum menaikkan budget besar.',
  };
}

/**
 * Ringkasan eksekutif — dibaca < 30 detik, mengarah ke keputusan.
 */
export function buildExecutiveBrief(metrics, diagnosis = [], strategy = {}, platform = 'generic') {
  const bench = getBenchmark(platform);
  const verdict = roasVerdict(metrics, bench);

  const paragraphs = [];

  if (verdict) {
    paragraphs.push(verdict.headline);
    paragraphs.push(verdict.decision);
  } else if (metrics.hasFunnel) {
    paragraphs.push(
      `Funnel menunjukkan ${formatNumber(metrics.totalImpressions)} impresi → ${formatNumber(metrics.totalClicks)} klik (CTR ${metrics.trueCTR}%) → ${formatNumber(metrics.totalConversions)} konversi (CVR ${metrics.trueCVR}%).`
    );
    paragraphs.push(
      'Keputusan: fokus perbaiki tahap funnel yang paling lemah sebelum menaikkan budget iklan.'
    );
  } else {
    paragraphs.push(
      'Data belum memiliki kolom spend/revenue/funnel lengkap — pastikan CSV berisi Impressions, Clicks, Conversions, dan Spend.'
    );
  }

  if (diagnosis.length > 0) {
    const top = diagnosis.find((d) => d.prioritas === 'kritis') || diagnosis[0];
    paragraphs.push(`Diagnosa utama (${top.kondisi}): ${top.temuan} Aksi: ${top.aksi}`);
  }

  const actions = [];
  if (strategy.scaling?.length) {
    actions.push(strategy.scaling[0].rekomendasi);
  }
  if (strategy.budgetShift) {
    actions.push(strategy.budgetShift.rekomendasi);
  }
  if (strategy.retargeting) {
    actions.push(strategy.retargeting.rekomendasi);
  }

  return {
    verdict,
    paragraphs: paragraphs.slice(0, 3),
    actionItems: actions.slice(0, 3),
    readTimeSeconds: 25,
  };
}

/**
 * Jalankan seluruh pipeline SOP (Tahap 1–5) untuk satu set baris CSV.
 */
export function runSopAnalysis(rows = [], platform = 'generic') {
  if (!rows?.length) {
    return {
      metrics: null,
      warnings: [],
      breakdowns: [],
      diagnosis: [],
      strategy: { scaling: [], budgetShift: null, retargeting: null },
      executiveBrief: {
        verdict: null,
        paragraphs: ['Upload data CSV untuk menghasilkan analisis SOP laporan.'],
        actionItems: [],
      },
      ready: false,
    };
  }

  const metrics = calculateSopMetrics(rows);
  const warnings = sanityCheckMetrics(metrics);
  const breakdowns = buildDimensionalBreakdowns(rows, metrics.columnMap);
  const diagnosis = diagnoseFunnel(metrics, platform);
  const strategy = buildStrategicPlan(metrics, breakdowns, platform);
  const executiveBrief = buildExecutiveBrief(metrics, diagnosis, strategy, platform);

  const ready = metrics.hasFunnel || metrics.hasProfitability;

  return {
    metrics,
    warnings,
    breakdowns,
    diagnosis,
    strategy,
    executiveBrief,
    ready,
  };
}
