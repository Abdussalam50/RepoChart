import { useLanguage } from '../../hooks/useLanguage';

export const HowItWorks = () => {
  const { t } = useLanguage();

  const steps = [
    {
      title: t('Upload CSV', 'Upload CSV'),
      desc: t(
        'Export file dari Meta Ads, Google Ads, atau TikTok Ads. Drag & drop ke RepoChart.',
        'Export file from Meta Ads, Google Ads, or TikTok Ads. Drag & drop to RepoChart.'
      )
    },
    {
      title: t('Auto-analisis', 'Auto-analysis'),
      desc: t(
        'Platform terdeteksi otomatis. Metrik dihitung ulang dari data nominal bukan dari rasio atau kalkulasi yang bisa menyesatkan.',
        'Platform is detected automatically. Metrics are recalculated from nominal data not misleading ratio SUMs or calculations.'
      )
    },
    {
      title: t('Kustomisasi', 'Customize'),
      desc: t(
        'Pilih grafik, atur warna brand klien, tambah formula kustom seperti ROAS, ROI, CPC, CPA, dan CTR.',
        'Select charts, set client brand colors, add custom formulas like ROAS,ROI, CPC, CPA, and CTR.'
      )
    },
    {
      title: t('Kirim ke klien', 'Send to client'),
      desc: t(
        'Share link dashboard real-time atau export PDF branded. Klien dapat membukanya tanpa perlu login.',
        'Share real-time dashboard link or export branded PDF. Clients can open it without logging in.'
      )
    }
  ];

  return (
    <section className="py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-16">
          {t('Dari CSV ke laporan siap kirim', 'From CSV to ready-to-send report')}
        </h2>

        <div className="space-y-12">
          {steps.map((step, idx) => (
            <div key={idx} className="flex gap-6 md:gap-8 items-start">
              <div className="shrink-0 w-12 h-12 rounded-full bg-[var(--color-landing-light)] text-[var(--color-landing-primary)] font-bold text-xl flex items-center justify-center shadow-sm">
                {idx + 1}
              </div>
              <div className="pt-2">
                <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-slate-600 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
