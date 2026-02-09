'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/lib/LanguageContext';

export default function FeaturedProducts() {
  const { lang, t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('/api/products?featured=true&limit=8');
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  // Get product name based on current language
  const getProductName = (product) => {
    return product.name?.[lang] || product.name?.en || product.name || 'Unnamed';
  };

  // Format price
  const formatPrice = (price) => {
    const currency = t('currency');
    return lang === 'ar' ? `${price} ${currency}` : `${currency}${price}`;
  };

  if (loading) {
    return (
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8" suppressHydrationWarning>
            {t('featuredTitle')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <div className="aspect-square bg-gray-100 animate-pulse mb-3" />
                <div className="h-4 bg-gray-100 animate-pulse mb-2 w-3/4" />
                <div className="h-4 bg-gray-100 animate-pulse w-1/4" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8" suppressHydrationWarning>
            {t('featuredTitle')}
          </h2>
          <p className="text-gray-500" suppressHydrationWarning>{t('noProducts')}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-semibold text-gray-900 mb-8" suppressHydrationWarning>
          {t('featuredTitle')}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link
              key={product._id}
              href={`/product/${product._id}`}
              className="block"
            >
              <div className="aspect-square bg-gray-100 mb-3 relative overflow-hidden">
                {product.images?.[0] ? (
                  <Image
                    src={typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url}
                    alt={getProductName(product)}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No image
                  </div>
                )}
              </div>
              <h3 className="text-gray-900 text-sm mb-1">
                {getProductName(product)}
              </h3>
              <p className="text-gray-600 text-sm font-medium">
                {formatPrice(product.price)}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
