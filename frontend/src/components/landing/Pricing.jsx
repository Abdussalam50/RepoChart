import { useLanguage } from '../../hooks/useLanguage';

export const Pricing = () => {
  const { t } = useLanguage();

  const handleCTA = () => {
    window.location.href = '/register';
  };

  return (
    <section id="pricing" className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            {t('Sederhana, tanpa biaya tersembunyi', 'Simple, no hidden fees')}
          </h2>
          <p className="text-lg text-slate-600">
            {t('Mulai gratis. Upgrade kapan saja.', 'Start for free. Upgrade anytime.')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 flex flex-col shadow-sm">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Free</h3>
            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-4xl font-bold text-slate-900">Rp 0</span>
              <span className="text-slate-500">/bulan</span>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
              {[
                { text: '1 klien aktif', type: 'yes' },
                { text: '2 laporan per bulan', type: 'yes' },
                { text: 'Grafik dasar (Bar, Line, Pie)', type: 'yes' },
                { text: 'Preview di browser', type: 'yes' },
                { text: 'Export PDF (ada watermark)', type: 'no' },
                { text: 'AI Insight', type: 'no' },
                { text: 'Shareable dashboard', type: 'no' },
                { text: 'Formula builder', type: 'no' },
                { text: 'Breakdown dimensi lengkap', type: 'no' },
              ].map((feature, idx) => (
                <li key={idx} className="flex gap-3 text-slate-700">
                  {feature.type === 'yes' ? (
                    <span className="text-[var(--color-landing-success)]">✓</span>
                  ) : (
                    <span className="text-slate-300">✗</span>
                  )}
                  <span className={feature.type === 'no' ? 'text-slate-400' : ''}>
                    {t(feature.text, feature.text)}
                  </span>
                </li>
              ))}
            </ul>

            <button onClick={handleCTA} className="w-full py-3 rounded-lg border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors">
              {t('Mulai Gratis', 'Start for Free')}
            </button>
          </div>

          {/* Pro Plan */}
          <div className="bg-white p-8 rounded-2xl border-2 border-[var(--color-landing-primary)] flex flex-col shadow-xl shadow-[var(--color-landing-light)] relative">
            <div className="absolute top-0 right-8 -translate-y-1/2 bg-[var(--color-primary-600)] text-white px-3 py-1 text-sm font-semibold rounded-full">
              {t('Paling populer', 'Most popular')}
            </div>
            
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Pro</h3>
            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-4xl font-bold text-slate-900">Rp 129.000</span>
              <span className="text-slate-500">/bulan</span>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
              {[
                'Unlimited klien',
                'Unlimited laporan',
                'Semua tipe grafik',
                'Export PDF branded tanpa watermark',
                'AI Insight otomatis',
                'Shareable dashboard',
                'Formula builder kustom',
                'Breakdown dimensi lengkap',
                'Prioritas email support',
              ].map((feature, idx) => (
                <li key={idx} className="flex gap-3 text-slate-700">
                  <span className="text-[var(--color-landing-success)]">✓</span>
                  <span>{t(feature, feature)}</span>
                </li>
              ))}
            </ul>

            <button onClick={handleCTA} className="w-full py-3 rounded-lg bg-[var(--color-primary-600)] text-white font-semibold hover:bg-[var(--color-landing-dark)] transition-colors">
              {t('Upgrade ke Pro →', 'Upgrade to Pro →')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
