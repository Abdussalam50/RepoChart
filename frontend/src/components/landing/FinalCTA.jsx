import { useLanguage } from '../../hooks/useLanguage';

export const FinalCTA = () => {
  const { t } = useLanguage();

  const handleCTA = () => {
    window.location.href = '/register';
  };

  const scrollToPreview = () => {
    document.getElementById('preview')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-24 px-6 bg-[var(--color-landing-light)]">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-6">
          {t('Buat laporan pertamamu hari ini', 'Create your first report today')}
        </h2>
        
        <p className="text-xl text-slate-700 mb-10">
          {t('Gratis. Tidak perlu kartu kredit. Setup kurang dari 2 menit.', 'Free. No credit card required. Setup in less than 2 minutes.')}
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={handleCTA}
            className="w-full sm:w-auto px-8 py-4 rounded-lg bg-[var(--color-primary-600)] text-white font-bold text-lg hover:bg-[var(--color-landing-dark)] transition-colors shadow-lg"
          >
            🚀 {t('Coba Gratis Sekarang', 'Try for Free Now')}
          </button>
          <button 
            onClick={scrollToPreview}
            className="w-full sm:w-auto px-8 py-4 rounded-lg border border-[var(--color-landing-primary)] text-[var(--color-landing-primary)] font-bold text-lg hover:bg-white/50 transition-colors"
          >
            👁 {t('Lihat Demo Dulu', 'Watch Demo First')}
          </button>
        </div>
      </div>
    </section>
  );
};
