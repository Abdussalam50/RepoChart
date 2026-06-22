import { useLanguage } from '../../hooks/useLanguage';

export const AppPreview = () => {
  const { t } = useLanguage();

  return (
    <section id="preview" className="py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="relative rounded-2xl bg-white border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden">
          
          {/* Topbar Fake Browser */}
          <div className="h-12 border-b border-slate-100 flex items-center px-4 bg-slate-50 gap-4">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="flex-1 text-center">
              <div className="inline-block bg-white border border-slate-200 rounded text-xs px-2 py-0.5 text-slate-500">
                app.repochart.id/dashboard/preview
              </div>
            </div>
            <div className="w-12"></div> {/* Spacer for balance */}
          </div>

          {/* App Content Mockup */}
          <div className="p-6 md:p-8 bg-slate-50">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Acme Corp - Q3 Campaign</h3>
                <p className="text-sm text-slate-500">Periode: 1 Agu - 31 Agu 2026</p>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 rounded border border-slate-200 text-sm font-medium text-slate-700 bg-white shadow-sm flex items-center gap-2">
                  <span className="w-4 h-4 text-slate-400">📄</span> Export PDF
                </button>
                <button className="px-3 py-1.5 rounded text-sm font-medium text-white bg-[var(--color-primary-600)] shadow-sm flex items-center gap-2">
                  <span className="w-4 h-4">↗️</span> Share Dashboard
                </button>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'True ROAS', value: '4.2x', trend: '+12%' },
                { label: 'Total Revenue', value: 'Rp 42.5M', trend: '+8%' },
                { label: 'Total Spend', value: 'Rp 10.1M', trend: '-2%' },
                { label: 'Konversi', value: '842', trend: '+15%' },
              ].map((m, i) => (
                <div key={i} className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
                  <div className="text-sm text-slate-500 mb-1">{m.label}</div>
                  <div className="text-2xl font-bold text-slate-900 mb-2">{m.value}</div>
                  <div className={`text-xs font-medium ${m.trend.startsWith('+') ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {m.trend} vs last month
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Area */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 p-6 rounded-xl bg-white border border-slate-100 shadow-sm h-64 flex flex-col justify-between relative overflow-hidden">
                 <div className="font-semibold text-slate-800 mb-4">Tren Revenue Harian</div>
                 {/* Fake Chart Lines */}
                 <div className="flex-1 flex items-end gap-2 px-2">
                    {[30, 45, 25, 60, 75, 40, 80, 55, 90, 100].map((h, i) => (
                      <div key={i} className="flex-1 bg-indigo-100 rounded-t" style={{ height: `${h}%` }}>
                         <div className="w-full bg-[var(--color-primary-600)] rounded-t" style={{ height: `${h * 0.8}%` }}></div>
                      </div>
                    ))}
                 </div>
              </div>
              <div className="p-6 rounded-xl bg-white border border-slate-100 shadow-sm flex flex-col">
                <div className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="text-amber-500">✨</span> AI Insight
                </div>
                <p className="text-sm text-slate-600 leading-relaxed bg-amber-50/50 p-3 rounded border border-amber-100 flex-1">
                  "Kampanye di akhir pekan menunjukkan peningkatan ROAS hingga 5.1x dibandingkan hari kerja. Disarankan untuk memindahkan 20% budget dari hari Senin-Rabu ke Sabtu-Minggu untuk memaksimalkan margin."
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
