import { useLanguage } from '../../hooks/useLanguage';

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="py-8 px-6 border-t border-slate-200">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-slate-600 font-medium">
          <div className="w-6 h-6 rounded bg-[var(--color-primary-200)] flex items-center justify-center text-[var(--color-primary-700)] text-xs font-bold">
            R <span className="text-white">C</span>
          </div>
          RepoChart &copy; 2026
        </div>
        
        <div className="flex items-center gap-6 text-sm text-slate-500">
          <a href="#" className="hover:text-slate-900 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-slate-900 transition-colors">Terms of Service</a>
          <a href="mailto:hello@repochart.id" className="hover:text-slate-900 transition-colors">
            {t('Hubungi Kami', 'Contact Us')}
          </a>
        </div>
      </div>
    </footer>
  );
};
