'use client';

import { useLanguage } from '@/lib/LanguageContext';

export default function Footer() {
  const { t, lang } = useLanguage();

  return (
    <footer className="border-t border-gray-200 py-8" style={{backgroundColor: '#fdf5ea'}}>
      <div className="max-w-6xl mx-auto px-4 text-center">
        <p className="text-gray-500 text-sm" suppressHydrationWarning>
          {t('footerText')}
        </p>
      </div>
    </footer>
  );
}
