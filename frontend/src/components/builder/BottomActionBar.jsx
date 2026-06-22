import React from 'react';
import { BarChart2 } from 'lucide-react';

/**
 * BottomActionBar — footer of the chart builder page.
 * Updated: tambah badge KPI aktif.
 */
export default function BottomActionBar({
  chartsCount = 0,
  platform = 'Generic',
  isExporting = false,
  reportType = 'monthly',
  audienceMode = 'client',
  clientName = '',
  statusHint = '',
  kpiCount = 0,
  onPreview,
  onExport,
}) {
  const getPlatformLabel = (id) => {
    if (!id) return 'Platform Umum';
    switch (id.toLowerCase()) {
      case 'meta_ads':      return 'Meta Ads';
      case 'google_ads':    return 'Google Ads';
      case 'tiktok_ads':    return 'TikTok Ads';
      case 'shopee_ads':    return 'Shopee Ads';
      case 'tokopedia_ads': return 'Tokopedia Ads';
      default:              return 'Platform Umum';
    }
  };

  const typeLabel =
    { daily: 'Harian', weekly: 'Mingguan', monthly: 'Bulanan', quarterly: 'Kuartalan' }[reportType] ||
    'Bulanan';
  const audLabel = audienceMode === 'internal' ? 'Internal' : 'Klien';

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 shadow-lg px-6 flex items-center justify-between z-40">
      {/* Left: Status Info */}
      <div className="flex items-center text-xs text-slate-500 font-medium space-x-2 flex-wrap gap-y-1">
        <span className="flex items-center gap-1 text-slate-800 font-semibold">
          <BarChart2 className="w-3.5 h-3.5" />
          {chartsCount} Grafik
        </span>
        <span>•</span>
        <span className="px-2 py-0.5 rounded-md bg-violet-50 text-violet-700 uppercase tracking-wider text-[10px] font-bold">
          {typeLabel} · {audLabel}
        </span>
        <span>•</span>
        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 uppercase tracking-wider text-[10px] font-bold">
          {getPlatformLabel(platform)}
        </span>

        {kpiCount > 0 && (
          <>
            <span>•</span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {kpiCount} KPI Aktif
            </span>
          </>
        )}

        {statusHint && (
          <>
            <span>•</span>
            <span className="text-slate-600">{statusHint}</span>
          </>
        )}

        {reportType === 'monthly' && audienceMode === 'client' && (
          <>
            <span>•</span>
            <span className="flex items-center text-emerald-600 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
              AI Aktif
            </span>
          </>
        )}
      </div>

      {/* Right: Action Buttons */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onPreview}
          className="px-4 py-2 border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:scale-95 transition-all duration-150 rounded-xl"
        >
          Preview Laporan
        </button>
        <button
          onClick={onExport}
          disabled={isExporting || chartsCount === 0}
          className="flex items-center px-4 py-2 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 active:scale-95 transition-all duration-150 rounded-xl shadow-sm"
        >
          {isExporting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Mengekspor...
            </>
          ) : (
            'Export PDF'
          )}
        </button>
      </div>
    </div>
  );
}
