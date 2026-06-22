/** Benchmark per platform — selaras README SOP */
export const BENCHMARKS = {
  meta_ads: {
    ctr_target: 1.5,
    cvr_target: 3.0,
    roas_min: 1.0,
    roas_scale: 3.0,
    cpa_max: 50000,
  },
  google_ads: {
    ctr_target: 2.0,
    cvr_target: 3.5,
    roas_min: 1.0,
    roas_scale: 3.5,
    cpa_max: 75000,
  },
  tiktok_ads: {
    ctr_target: 1.0,
    cvr_target: 2.5,
    roas_min: 1.0,
    roas_scale: 3.0,
    cpa_max: 60000,
  },
  generic: {
    ctr_target: 1.5,
    cvr_target: 3.0,
    roas_min: 1.0,
    roas_scale: 3.0,
    cpa_max: 50000,
  },
};

export function getBenchmark(platform = 'generic') {
  return BENCHMARKS[platform] || BENCHMARKS.generic;
}
