import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useLanguageStore = create(
  persist(
    (set, get) => ({
      lang: 'id',
      setLang: (lang) => set({ lang }),
      toggleLang: () => set({ lang: get().lang === 'id' ? 'en' : 'id' }),
      t: (id, en) => get().lang === 'id' ? id : en,
    }),
    {
      name: 'repochart-lang',
    }
  )
);
