import { runSopAnalysis } from './sopReportEngine';
import { formatNumber } from '../numberFormatter';

/**
 * Tambahkan kalimat keputusan bisnis pada narasi chart (SOP-aware).
 */
export function appendSopDecisionToNarrative(baseNarrative, chart, rows, platform = 'generic') {
  if (!baseNarrative || !rows?.length) return baseNarrative;

  const sop = runSopAnalysis(rows, platform);
  if (!sop.ready || !sop.metrics) return baseNarrative;

  const yCol = chart?.config_json?.axisY || '';
  const yLower = yCol.toLowerCase();

  let decision = '';

  if (/roas|revenue|pendapatan/i.test(yLower) && sop.metrics.trueROAS > 0) {
    decision =
      sop.metrics.trueROAS >= 1
        ? ` Keputusan: pertahankan atau scale channel ini — True ROAS portofolio ${sop.metrics.trueROAS}×.`
        : ` Keputusan: evaluasi pause/kurangi budget — True ROAS portofolio ${sop.metrics.trueROAS}× di bawah break-even.`;
  } else if (/spend|cost|biaya/i.test(yLower)) {
    decision = ` Keputusan: alokasikan ulang spend ke dimensi dengan ROAS tertinggi (cek tabel breakdown di atas).`;
  } else if (/ctr|click|klik/i.test(yLower) && sop.diagnosis.some((d) => d.kondisi === 'A')) {
    decision = ' Keputusan: perbaiki kreatif/targeting sebelum menaikkan budget (CTR di bawah benchmark).';
  } else if (/cvr|conv|konversi/i.test(yLower) && sop.diagnosis.some((d) => d.kondisi === 'B')) {
    decision = ' Keputusan: optimasi landing page — klik tinggi tetapi konversi rendah.';
  } else if (sop.strategy.scaling?.[0]) {
    decision = ` Keputusan: ${sop.strategy.scaling[0].rekomendasi}`;
  }

  if (!decision) return baseNarrative;

  const combined = `${baseNarrative}${decision}`;
  const sentences = combined.match(/[^.!?]+[.!?]+/g) || [combined];
  return sentences.slice(0, 10).join(' ').trim();
}
