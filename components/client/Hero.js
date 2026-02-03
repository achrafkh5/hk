'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';

// Placeholder images - replace with your own
const heroImages = [
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&h=600&fit=crop&q=80',
];

export default function Hero() {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative h-[500px] overflow-hidden bg-gray-100">
      {/* Sliding background images */}
      <div className="absolute inset-0">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className="absolute inset-0 transition-transform duration-1000 ease-in-out"
            style={{
              transform: `translateX(${(index - currentIndex) * 100}%)`,
            }}
          >
            <img
              src={image}
              alt={`Hero ${index + 1}`}
              className="w-full h-full object-cover"
              loading={index === 0 ? 'eager' : 'lazy'}
            />
          </div>
        ))}
      </div>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/30 z-10" />

      {/* Content */}
      <div className="relative h-full flex items-center justify-center z-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-semibold text-white mb-4 drop-shadow-lg" suppressHydrationWarning>
            {t('heroTitle')}
          </h1>
          <p className="text-white text-lg mb-8 max-w-xl mx-auto drop-shadow-md" suppressHydrationWarning>
            {t('heroSubtitle')}
          </p>
          <Link
            href="/shop"
            className="inline-block bg-black text-white px-8 py-3 text-sm font-medium hover:bg-gray-900 transition-colors"            suppressHydrationWarning          >
            {t('shopNow')}
          </Link>
        </div>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-20">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex
                ? 'bg-white w-8'
                : 'bg-white bg-opacity-50 hover:bg-opacity-75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
