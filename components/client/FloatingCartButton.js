'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';
import { useCart } from '@/lib/CartContext';

export default function FloatingCartButton() {
  const { t } = useLanguage();
  const { getCartCount } = useCart();
  const pathname = usePathname();
  const cartCount = getCartCount();
  const [prevCount, setPrevCount] = useState(0);
  const [animate, setAnimate] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Only render after hydration to avoid mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Animate when cart count changes
  useEffect(() => {
    if (mounted && cartCount > prevCount) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 600);
      return () => clearTimeout(timer);
    }
    setPrevCount(cartCount);
  }, [cartCount, prevCount, mounted]);

  // Don't render on server, if cart is empty, or on admin/login pages
  if (!mounted || cartCount === 0 || pathname?.startsWith('/admin') || pathname === '/login') {
    return null;
  }

  return (
    <Link
      href="/cart"
      className={`fixed bottom-6 right-6 z-50 bg-gray-900 text-white rounded-full shadow-lg hover:bg-gray-800 transition-all ${
        animate ? 'scale-110' : 'scale-100'
      }`}
      style={{
        animation: animate ? 'pulse 0.6s ease-in-out' : 'none',
      }}
    >
      <div className="flex items-center gap-3 px-5 py-3">
        {/* Shopping Cart Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
          />
        </svg>

        {/* Cart Count and Label */}
        <div className="flex flex-col items-start">
          <span className="text-xs opacity-80" suppressHydrationWarning>
            {cartCount} {t('cartItems')}
          </span>
          <span className="text-sm font-semibold" suppressHydrationWarning>
            {t('cart')}
          </span>
        </div>
      </div>

      {/* Pulse animation on add */}
      {animate && (
        <span className="absolute inset-0 rounded-full bg-gray-900 animate-ping opacity-75" />
      )}

      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
      `}</style>
    </Link>
  );
}
