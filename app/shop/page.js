'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/lib/LanguageContext';
import Header from '@/components/client/Header';
import Footer from '@/components/client/Footer';

function ShopContent() {
  const { lang, t } = useLanguage();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || '');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  async function fetchCategories() {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }

  async function fetchProducts() {
    try {
      setLoading(true);
      let url = '/api/products?active=true';
      
      if (selectedCategory) {
        url += `&categoryId=${selectedCategory}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }

  // Get product name based on current language
  function getProductName(product) {
    return product.name?.[lang] || product.name?.en || 'Unnamed';
  }

  // Get category name based on current language
  function getCategoryName(category) {
    return category.name?.[lang] || category.name?.en || 'Unnamed';
  }

  // Format price
  function formatPrice(price) {
    const currency = t('currency');
    return lang === 'ar' ? `${price} ${currency}` : `${price} ${currency}`;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2" suppressHydrationWarning>
          {t('shop')}
        </h1>
        <p className="text-gray-500 text-sm" suppressHydrationWarning>
          {t('shopSubtitle')}
        </p>
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-4 py-2 text-sm border rounded ${
                selectedCategory === ''
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-300 text-gray-600 hover:border-gray-400'
              }`}
              suppressHydrationWarning
            >
              {t('allProducts')}
            </button>
            {categories.map((category) => (
              <button
                key={category._id}
                onClick={() => setSelectedCategory(category._id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm border rounded ${
                  selectedCategory === category._id
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-300 text-gray-600 hover:border-gray-400'
                }`}
              >
                {category.imageUrl && (
                  <img
                    src={category.imageUrl}
                    alt=""
                    className="w-5 h-5 object-cover rounded"
                  />
                )}
                {getCategoryName(category)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i}>
              <div className="aspect-square bg-gray-100 animate-pulse mb-3" />
              <div className="h-4 bg-gray-100 animate-pulse mb-2 w-3/4" />
              <div className="h-4 bg-gray-100 animate-pulse w-1/4" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">{t('noProducts')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link
              key={product._id}
              href={`/product/${product._id}`}
              className="block group"
            >
              <div className="aspect-square bg-gray-100 mb-3 relative overflow-hidden">
                {product.images?.[0] ? (
                  <Image
                    src={typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url}
                    alt={getProductName(product)}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                    {t('noImage')}
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
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-white">
        <Suspense fallback={
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="mb-8">
              <div className="h-8 bg-gray-200 animate-pulse mb-2 w-32"></div>
              <div className="h-4 bg-gray-200 animate-pulse w-48"></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i}>
                  <div className="aspect-square bg-gray-100 animate-pulse mb-3" />
                  <div className="h-4 bg-gray-100 animate-pulse mb-2 w-3/4" />
                  <div className="h-4 bg-gray-100 animate-pulse w-1/4" />
                </div>
              ))}
            </div>
          </div>
        }>
          <ShopContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
