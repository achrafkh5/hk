'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/lib/LanguageContext';
import { useCart } from '@/lib/CartContext';

export default function Header() {
  const { lang, t, changeLanguage } = useLanguage();
  const { getCartCount } = useCart();
  const cartCount = getCartCount();
  const [mounted, setMounted] = useState(false);

  // Only render cart count after hydration to avoid mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="border-b border-gray-200" style={{backgroundColor: '#fdf5ea'}}>
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-semibold text-gray-900" suppressHydrationWarning>
              {t('logo')}
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-6">
            <Link 
              href="/" 
              className="text-gray-600 hover:text-gray-900 text-sm"
              suppressHydrationWarning
            >
              {t('home')}
            </Link>
            <Link 
              href="/shop" 
              className="text-gray-600 hover:text-gray-900 text-sm"
              suppressHydrationWarning
            >
              {t('shop')}
            </Link>
            <Link 
              href="/cart" 
              className="text-gray-600 hover:text-gray-900 text-sm relative"
              suppressHydrationWarning
            >
              {t('cart')}
              {mounted && cartCount > 0 && (
                <span 
                  className={`absolute -top-2 bg-gray-900 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center ${
                    lang === 'ar' ? '-left-4' : '-right-4'
                  }`}
                >
                  {cartCount}
                </span>
              )}
            </Link>
          </nav>

          {/* Language Switcher */}
          <div className="flex items-center">
            {/* Desktop: Buttons */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => changeLanguage('en')}
                className={`px-2 py-1 text-xs rounded ${
                  lang === 'en' 
                    ? 'bg-gray-900 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                suppressHydrationWarning
              >
                EN
              </button>
              <button
                onClick={() => changeLanguage('fr')}
                className={`px-2 py-1 text-xs rounded ${
                  lang === 'fr' 
                    ? 'bg-gray-900 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                suppressHydrationWarning
              >
                FR
              </button>
              <button
                onClick={() => changeLanguage('ar')}
                className={`px-2 py-1 text-xs rounded ${
                  lang === 'ar' 
                    ? 'bg-gray-900 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                suppressHydrationWarning
              >
                AR
              </button>
            </div>

            {/* Mobile: Dropdown */}
            <select
              value={lang}
              onChange={(e) => changeLanguage(e.target.value)}
              className="sm:hidden px-2 py-1 text-xs rounded bg-gray-900 text-white border-none focus:outline-none focus:ring-2 focus:ring-gray-900"
              suppressHydrationWarning
            >
              <option value="en">EN</option>
              <option value="fr">FR</option>
              <option value="ar">AR</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
}
