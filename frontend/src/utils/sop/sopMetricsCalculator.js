import { mapSopColumns, sumColumn } from './columnMapper';

/**
 * Tahap 2 SOP — hitung rasio dari nominal (jangan SUM kolom rasio CSV).
 */
export function calculateSopMetrics(rows = [], columnMap = null) {
  const headers = rows.length ? Object.keys(rows[0]) : [];
  const map = columnMap || mapSopColumns(headers);

  const totalSpend = sumColumn(rows, map.spend);
  const totalRevenue = sumColumn(rows, map.revenue);
  const totalImpressions = sumColumn(rows, map.impressions);
  const totalClicks = sumColumn(rows, map.clicks);
  const totalConversions = sumColumn(rows, map.conversions);

  const trueROAS =
    totalSpend > 0 && totalRevenue > 0 ? Math.round((totalRevenue / totalSpend) * 100) / 100 : 0;

  const trueCTR =
    totalImpressions > 0 ? Math.round((totalClicks / totalImpressions) * 10000) / 100 : 0;

  const trueCVR =
    totalClicks > 0 ? Math.round((totalConversions / totalClicks) * 10000) / 100 : 0;

  const trueCPC = totalClicks > 0 ? Math.round(totalSpend / totalClicks) : 0;
  const trueCPA = totalConversions > 0 ? Math.round(totalSpend / totalConversions) : 0;
  const trueCPM =
    totalImpressions > 0 ? Math.round((totalSpend / totalImpressions) * 1000) : 0;

  const sisaAudiens = Math.max(0, Math.round(totalClicks - totalConversions));

  const hasFunnel = totalImpressions > 0 && totalClicks > 0;
  const hasProfitability = totalSpend > 0 && totalRevenue > 0;

  return {
    columnMap: map,
    totalSpend,
    totalRevenue,
    totalImpressions,
    totalClicks,
    totalConversions,
    trueROAS,
    trueCTR,
    trueCVR,
    trueCPC,
    trueCPA,
    trueCPM,
    sisaAudiens,
    hasFunnel,
    hasProfitability,
  };
}

export function sanityCheckMetrics(metrics) {
  const warnings = [];
  if (!metrics) return warnings;

  if (metrics.trueCTR > 30) {
    warnings.push(
      `CTR ${metrics.trueCTR}% tidak realistis — periksa mapping kolom Klik dan Impressions.`
    );
  }
  if (metrics.trueROAS > 100) {
    warnings.push(
      `ROAS ${metrics.trueROAS}× tidak realistis — pastikan satuan Revenue dan Spend konsisten.`
    );
  }
  if (metrics.trueCVR > 50) {
    warnings.push(
      `CVR ${metrics.trueCVR}% tidak realistis — periksa mapping kolom Klik dan Konversi.`
    );
  }
  return warnings;
}
