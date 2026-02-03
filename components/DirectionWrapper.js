'use client';

import { useLanguage } from '@/lib/LanguageContext';
import { useEffect } from 'react';

export default function DirectionWrapper({ children }) {
  const { lang } = useLanguage();

  useEffect(() => {
    // Update body direction attribute for RTL support
    if (typeof document !== 'undefined') {
      document.body.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    }
  }, [lang]);

  return <>{children}</>;
}
