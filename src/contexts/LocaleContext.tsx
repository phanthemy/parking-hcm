'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Locale, t as translate, TranslationKey } from '@/lib/i18n';

interface LocaleContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: TranslationKey) => string;
}

const LocaleContext = createContext<LocaleContextType>({
  locale: 'vi',
  setLocale: () => {},
  t: (k) => k,
});

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('vi');

  useEffect(() => {
    const saved = localStorage.getItem('mapgo-lang') as Locale;
    if (saved === 'vi' || saved === 'en') setLocaleState(saved);
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem('mapgo-lang', l);
  }, []);

  const tFunc = useCallback(
    (key: TranslationKey) => translate(locale, key),
    [locale]
  );

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t: tFunc }}>
      {children}
    </LocaleContext.Provider>
  );
}

export const useLocale = () => useContext(LocaleContext);
