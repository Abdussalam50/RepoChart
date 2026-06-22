import { useLanguage } from '../../hooks/useLanguage';
import { Cpu, Calculator, Sparkles, Share2, FileText, ShieldCheck } from 'lucide-react';

export const Features = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: <Cpu className="w-6 h-6 text-[var(--color-landing-primary)]" />,
      title: t('Auto-detect platform', 'Auto-detect platform'),
      desc: t(
        'Sistem kenali format CSV dari Meta, Google, TikTok secara otomatis. Tidak perlu setting manual.',
        'System automatically recognizes CSV format from Meta, Google, TikTok. No manual setup needed.'
      )
    },
    {
      icon: <Calculator className="w-6 h-6 text-[var(--color-landing-primary)]" />,
      title: t('Kalkulasi metrik yang benar', 'Accurate metrics calculation'),
      desc: t(
        'True ROAS, CTR, CPA dihitung ulang dari data nominal. Bukan SUM rasio bawaan CSV yang bisa menyesatkan.',
        'True ROAS, CTR, CPA recalculated from nominal data. Not misleading CSV default ratio SUMs.'
      )
    },
    {
      icon: <Sparkles className="w-6 h-6 text-[var(--color-landing-primary)]" />,
      title: t('AI Insight otomatis', 'Automated AI Insight'),
      desc: t(
        '3 insight + 3 rekomendasi actionable dalam Bahasa Indonesia berdasarkan data nyata — bukan template generik.',
        '3 insights + 3 actionable recommendations in Indonesian based on real data — not generic templates.'
      )
    },
    {
      icon: <Share2 className="w-6 h-6 text-[var(--color-landing-primary)]" />,
      title: t('Shareable dashboard', 'Shareable dashboard'),
      desc: t(
        'Bagikan link ke klien. Mereka bisa pantau performa kapan saja tanpa login — data selalu real-time.',
        'Share link with clients. They can monitor performance anytime without login — always real-time data.'
      )
    },
    {
      icon: <FileText className="w-6 h-6 text-[var(--color-landing-primary)]" />,
      title: t('Export PDF branded', 'Branded PDF export'),
      desc: t(
        'Logo klien, warna brand, dan narasi otomatis per grafik. PDF siap kirim langsung via WhatsApp.',
        'Client logo, brand colors, and auto-narrative per chart. PDF ready to send directly via WhatsApp.'
      )
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-[var(--color-landing-primary)]" />,
      title: t('Data aman & terlindungi', 'Secure & protected data'),
      desc: t(
        'File CSV dihapus otomatis setelah diproses. Yang tersimpan hanya hasil kalkulasi — bukan file mentah.',
        'CSV files automatically deleted after processing. Only calculation results stored — not raw files.'
      )
    }
  ];

  return (
    <section id="features" className="py-20 px-6 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            {t('Semua yang kamu butuhkan', 'Everything you need')}
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            {t(
              'Dirancang khusus untuk freelancer dan agensi digital marketing Indonesia.',
              'Designed specifically for Indonesian digital marketing freelancers and agencies.'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-landing-light)] flex items-center justify-center mb-6">
                {feat.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{feat.title}</h3>
              <p className="text-slate-600 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
