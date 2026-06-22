import { getBenchmark } from './benchmarks';

/**
 * Tahap 4 — diagnosa funnel IF-THEN.
 */
export function diagnoseFunnel(metrics, platform = 'generic') {
  if (!metrics) return [];

  const bench = getBenchmark(platform);
  const diagnosis = [];

  if (metrics.hasFunnel && metrics.trueCTR < bench.ctr_target) {
    diagnosis.push({
      kondisi: 'A',
      masalah: 'Kreatif Iklan / Targeting Audiens',
      temuan: `CTR ${metrics.trueCTR}% di bawah target ${bench.ctr_target}%.`,
      aksi: 'Ganti visual iklan, ubah teks penawaran, atau persempit demografi target.',
      prioritas: 'tinggi',
    });
  }

  const ctrHigh = metrics.trueCTR >= bench.ctr_target;
  const cvrLow = metrics.trueCVR < bench.cvr_target;

  if (metrics.hasFunnel && ctrHigh && cvrLow) {
    diagnosis.push({
      kondisi: 'B',
      masalah: 'Landing Page / Produk',
      temuan: `CTR tinggi (${metrics.trueCTR}%) tetapi CVR rendah (${metrics.trueCVR}%).`,
      aksi: 'Perbaiki kecepatan loading website, perjelas tombol pembelian, atau evaluasi harga produk.',
      prioritas: 'tinggi',
    });
  }

  if (metrics.hasProfitability && metrics.trueROAS > 0 && metrics.trueROAS < bench.roas_min) {
    diagnosis.push({
      kondisi: 'C',
      masalah: 'Iklan Rugi / Boncos',
      temuan: `True ROAS ${metrics.trueROAS}× — setiap Rp1 spend menghasilkan kurang dari break-even.`,
      aksi: 'Segera pause atau kurangi budget pada dimensi dengan ROAS di bawah 1× untuk menghentikan kerugian.',
      prioritas: 'kritis',
    });
  }

  return diagnosis;
}
