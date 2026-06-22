import { useLanguage } from '../../hooks/useLanguage';

export const Navbar = () => {
  const { lang, setLang, t } = useLanguage();

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCTA = () => {
    window.location.href = '/register';
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 transition-all">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 font-semibold text-lg cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
          <div className="w-8 h-8 rounded-lg bg-[var(--color-primary-200)] flex items-center justify-center text-[var(--color-primary-700)] text-xs font-bold">
            R <span className="text-white">C</span>
          </div>
          <span className="text-slate-900">RepoChart</span>
        </div>

        {/* Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <button onClick={() => scrollTo('features')} className="hover:text-slate-900 transition-colors">
            {t('Fitur', 'Features')}
          </button>
          <button onClick={() => scrollTo('pricing')} className="hover:text-slate-900 transition-colors">
            {t('Harga', 'Pricing')}
          </button>
          <button onClick={() => scrollTo('faq')} className="hover:text-slate-900 transition-colors">
            FAQ
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setLang(lang === 'id' ? 'en' : 'id')}
            className="text-xs font-semibold px-2 py-1 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors uppercase"
          >
            {lang === 'id' ? 'EN' : 'ID'}
          </button>
          <button 
            onClick={handleCTA}
            className="hidden md:flex px-4 py-2 text-sm font-semibold rounded-md bg-[var(--color-primary-600)] text-white hover:bg-[var(--color-landing-dark)] transition-colors"
          >
            {t('Coba Gratis →', 'Try for Free →')}
          </button>
        </div>
      </div>
    </nav>
  );
};
