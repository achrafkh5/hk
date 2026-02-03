'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { translations } from './translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  // Initialize with localStorage value immediately (client-side only check)
  const [lang, setLang] = useState(() => {
    if (typeof window === 'undefined') return 'en';
    const saved = localStorage.getItem('lang');
    return saved && ['en', 'fr', 'ar'].includes(saved) ? saved : 'en';
  });

  // Sync to localStorage and document when language changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lang', lang);
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const t = (key) => {
    return translations[lang]?.[key] || translations.en[key] || key;
  };

  const changeLanguage = (newLang) => {
    if (['en', 'fr', 'ar'].includes(newLang)) {
      setLang(newLang);
    }
  };

  return (
    <LanguageContext.Provider value={{ lang, t, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}