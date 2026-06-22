import { useLanguageStore } from '../store/languageStore';

export function useLanguage() {
  const { lang, setLang, toggleLang, t } = useLanguageStore();
  return { lang, setLang, toggleLang, t };
}
