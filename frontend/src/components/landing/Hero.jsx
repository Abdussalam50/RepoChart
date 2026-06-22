import { useLanguage } from '../../hooks/useLanguage';

export const Hero = () => {
  const { t } = useLanguage();

  const handleCTA = () => {
    window.location.href = '/register';
  };

  const scrollToPreview = () => {
    document.getElementById('preview')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="pt-24 pb-16 px-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-[var(--color-landing-light)] rounded-full blur-[100px] opacity-50 -z-10 pointer-events-none"></div>

      <div className="max-w-3xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-primary-100)] text-[var(--color-primary-600)] text-sm font-medium mb-8">
          <span className="text-lg">✦</span> Baru — Shareable Dashboard
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-[1.1] mb-6">
          {t(
            'Laporan iklan klien yang profesional, siap kirim kurang dari 5 menit',
            'Professional ad reports for your clients, ready to send less than 5 minutes'
          )}
        </h1>

        {/* Subheadline */}
        <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          {t(
            'Upload file CSV dari Meta Ads, Google Ads, atau TikTok Adsmu dan RepoChart otomatis buat laporan lengkap dengan grafik, insight AI, dan PDF branded.',
            'Upload your CSV from your Meta Ads, Google Ads, or TikTok Ads, then RepoChart automatically generates complete reports with charts, AI insights, and branded PDFs.'
          )}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <button 
            onClick={handleCTA}
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[var(--color-primary-600)] text-white font-semibold text-lg hover:bg-[var(--color-landing-dark)] transition-colors shadow-lg shadow-[var(--color-landing-light)] flex items-center justify-center gap-2"
          >
            ↑ {t('Coba Gratis Sekarang', 'Try for Free Now')}
          </button>
          <button 
            onClick={scrollToPreview}
            className="w-full sm:w-auto px-6 py-3 rounded-lg border border-slate-200 text-slate-700 font-semibold text-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
          >
            👁 {t('Lihat Demo', 'Watch Demo')}
          </button>
        </div>

        {/* Social Proof */}
        <div className="text-sm text-slate-500 font-medium">
          {t('Tidak perlu kartu kredit · Free plan tersedia · Setup < 2 menit', 'No credit card required · Free plan available · Setup < 2 mins')}
        </div>
      </div>
    </section>
  );
};
