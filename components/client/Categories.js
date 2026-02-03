'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';

export default function Categories() {
  const { lang, t } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  // Get category name based on current language
  const getCategoryName = (category) => {
    return category.name?.[lang] || category.name?.en || category.name || 'Unnamed';
  };

  if (loading) {
    return (
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8" suppressHydrationWarning>
            {t('categoriesTitle')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-100 animate-pulse rounded" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return (
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8" suppressHydrationWarning>
            {t('categoriesTitle')}
          </h2>
          <p className="text-gray-500" suppressHydrationWarning>{t('noCategories')}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-semibold text-gray-900 mb-8" suppressHydrationWarning>
          {t('categoriesTitle')}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category) => (
            <Link
              key={category._id}
              href={`/shop?category=${category._id}`}
              className="block bg-white border border-gray-200 overflow-hidden hover:border-gray-400 transition-colors"
            >
              {category.imageUrl ? (
                <div className="aspect-square w-full bg-gray-100">
                  <img
                    src={category.imageUrl}
                    alt={getCategoryName(category)}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-square w-full bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-400 text-sm">No image</span>
                </div>
              )}
              <div className="p-4 text-center">
                <span className="text-gray-900 font-medium text-sm">
                  {getCategoryName(category)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
