'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';
import { useCart } from '@/lib/CartContext';
import Header from '@/components/client/Header';
import Footer from '@/components/client/Footer';

export default function ProductDetailPage() {
  const params = useParams();
  const { lang, t } = useLanguage();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [added, setAdded] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (params.slug) {
      fetchProduct();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.slug]);

  // Set default color when product loads
  useEffect(() => {
    if (product?.colors && product.colors.length > 0 && !selectedColor) {
      setSelectedColor(product.colors[0]);
    }
    if (product?.hasSize && product.sizes && product.sizes.length > 0 && !selectedSize) {
      setSelectedSize(product.sizes[0].name);
    }
  }, [product, selectedColor, selectedSize]);

  async function fetchProduct() {
    try {
      setLoading(true);
      const res = await fetch(`/api/products/${params.slug}`);
      if (res.ok) {
        const data = await res.json();
        setProduct(data);
      }
    } catch (err) {
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  }

  // Get text based on current language
  function getText(field) {
    return field?.[lang] || field?.en || '';
  }

  // Get translated color name
  function getColorName(colorName) {
    const colorKey = `color${colorName}`;
    return t(colorKey) || colorName;
  }

  // Format price
  function formatPrice(price) {
    const currency = t('currency');
    return lang === 'ar' ? `${price.toFixed(2)} ${currency} ` : `${price.toFixed(2)} ${currency}`;
  }

  // Get available stock for selected size
  function getAvailableStock() {
    if (product?.hasSize && selectedSize) {
      const sizeObj = product.sizes.find(s => s.name === selectedSize);
      return sizeObj ? sizeObj.stock : 0;
    }
    return product?.stock || 0;
  }

  // Handle quantity change
  function handleQuantityChange(delta) {
    setQuantity((prev) => {
      const newQty = prev + delta;
      if (newQty < 1) return 1;
      const availableStock = getAvailableStock();
      if (availableStock && newQty > availableStock) return availableStock;
      return newQty;
    });
  }

  // Handle add to cart
  function handleAddToCart() {
    if (!product || product.stock < 1) return;

    // If product has colors, require color selection
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      alert(t('selectColor'));
      return;
    }

    // If product has sizes, require size selection
    if (product.hasSize && product.sizes && product.sizes.length > 0 && !selectedSize) {
      alert(t('selectSize') || 'Please select a size');
      return;
    }

    addToCart(product, quantity, selectedColor, selectedSize);
    setAdded(true);

    // Reset "added" state after 2 seconds
    setTimeout(() => setAdded(false), 2000);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-white">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="aspect-square bg-gray-100 animate-pulse" />
              <div className="space-y-4">
                <div className="h-8 bg-gray-100 animate-pulse w-3/4" />
                <div className="h-6 bg-gray-100 animate-pulse w-1/4" />
                <div className="h-24 bg-gray-100 animate-pulse" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-white">
          <div className="max-w-6xl mx-auto px-4 py-16 text-center">
            <h1 className="text-xl text-gray-900 mb-4">Product not found</h1>
            <Link href="/shop" className="text-gray-600 underline">
              {t('continueShopping')}
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const availableStock = getAvailableStock();
  const isOutOfStock = !availableStock || availableStock < 1;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="mb-6 text-sm">
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              {t('home')}
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <Link href="/shop" className="text-gray-500 hover:text-gray-700">
              {t('shop')}
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-900">{getText(product.name)}</span>
          </nav>

          {/* Product Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Product Image Gallery */}
            <div>
              {/* Main Image */}
              <div className="aspect-square bg-gray-100 relative overflow-hidden mb-4">
                {product.images?.length > 0 ? (
                  <Image
                    src={product.images[selectedImageIndex]}
                    alt={getText(product.name)}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400" suppressHydrationWarning>
                    {t('noImage')}
                  </div>
                )}
              </div>
              
              {/* Thumbnail Images */}
              {product.images?.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`aspect-square bg-gray-100 relative overflow-hidden cursor-pointer transition-all ${
                        selectedImageIndex === index
                          ? 'ring-2 ring-gray-900'
                          : 'hover:ring-2 hover:ring-gray-400'
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`${getText(product.name)} ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="100px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                {getText(product.name)}
              </h1>

              <p className="text-xl text-gray-900 mb-4">
                {formatPrice(product.price)}
              </p>

              {/* Available Colors */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    {t('availableColors')}:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((colorName, index) => {
                      const colorMap = {
                        'Black': '#000000',
                        'White': '#FFFFFF',
                        'Gray': '#9CA3AF',
                        'Red': '#EF4444',
                        'Blue': '#3B82F6',
                        'Green': '#10B981',
                        'Yellow': '#F59E0B',
                        'Orange': '#F97316',
                        'Pink': '#EC4899',
                        'Purple': '#A855F7',
                        'Brown': '#92400E',
                        'Beige': '#D4A574',
                      };
                      const hex = colorMap[colorName] || '#000000';
                      return (
                        <div
                          key={index}
                          className="flex items-center gap-1.5 px-2.5 py-1 border border-gray-300 rounded text-sm"
                        >
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{
                              backgroundColor: hex,
                              border: hex === '#FFFFFF' ? '1px solid #d1d5db' : 'none',
                            }}
                          />
                          <span className="text-gray-700">{getColorName(colorName)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Stock Status */}
              <p
                className={`text-sm mb-6 ${
                  isOutOfStock ? 'text-red-600' : 'text-green-600'
                }`}
                suppressHydrationWarning
              >
                {isOutOfStock ? t('outOfStock') : t('inStock')}
                {!isOutOfStock && availableStock <= 10 && (
                  <span className="text-gray-500 ml-2">
                    ({availableStock} {t('itemsLeft')})
                  </span>
                )}
              </p>

              {/* Description */}
              {getText(product.description) && (
                <div className="mb-6">
                  <h2 className="text-sm font-medium text-gray-900 mb-2">
                    {t('description')}
                  </h2>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {getText(product.description)}
                  </p>
                </div>
              )}

              {/* Quantity and Add to Cart */}
              {!isOutOfStock && (
                <div className="space-y-4">
                  {/* Color Selector */}
                  {product.colors && product.colors.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        {t('selectColor')}:
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {product.colors.map((colorName, index) => {
                          const colorMap = {
                            'Black': '#000000',
                            'White': '#FFFFFF',
                            'Gray': '#9CA3AF',
                            'Red': '#EF4444',
                            'Blue': '#3B82F6',
                            'Green': '#10B981',
                            'Yellow': '#F59E0B',
                            'Orange': '#F97316',
                            'Pink': '#EC4899',
                            'Purple': '#A855F7',
                            'Brown': '#92400E',
                            'Beige': '#D4A574',
                          };
                          const hex = colorMap[colorName] || '#000000';
                          const isSelected = selectedColor === colorName;
                          
                          return (
                            <button
                              key={index}
                              onClick={() => setSelectedColor(colorName)}
                              className={`flex items-center gap-2 px-3 py-2 border-2 rounded transition-all ${
                                isSelected
                                  ? 'border-gray-900 bg-gray-50'
                                  : 'border-gray-300 hover:border-gray-400'
                              }`}
                            >
                              <div
                                className="w-5 h-5 rounded-full"
                                style={{
                                  backgroundColor: hex,
                                  border: hex === '#FFFFFF' ? '1px solid #d1d5db' : 'none',
                                }}
                              />
                              <span className="text-sm text-gray-900">{getColorName(colorName)}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Size Selector */}
                  {product.hasSize && product.sizes && product.sizes.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        {t('selectSize') || 'Select Size'}:
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {product.sizes.map((sizeObj, index) => {
                          const isSelected = selectedSize === sizeObj.name;
                          const isAvailable = sizeObj.stock > 0;
                          
                          return (
                            <button
                              key={index}
                              onClick={() => isAvailable && setSelectedSize(sizeObj.name)}
                              disabled={!isAvailable}
                              className={`px-4 py-2 border-2 rounded transition-all min-w-[60px] ${
                                !isAvailable
                                  ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : isSelected
                                  ? 'border-gray-900 bg-gray-50 text-gray-900'
                                  : 'border-gray-300 hover:border-gray-400 text-gray-900'
                              }`}
                            >
                              <span className="text-sm font-medium">{sizeObj.name}</span>
                              {!isAvailable && (
                                <span className="block text-xs mt-0.5">Out</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Quantity Selector */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">{t('quantity')}:</span>
                    <div className="flex items-center border border-gray-300">
                      <button
                        onClick={() => handleQuantityChange(-1)}
                        className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                        disabled={quantity <= 1}
                      >
                        −
                      </button>
                      <span className="w-12 text-center text-gray-900">
                        {quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(1)}
                        className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                        disabled={availableStock && quantity >= availableStock}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={handleAddToCart}
                    className={`w-full py-3 text-sm font-medium transition-colors ${
                      added
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                    suppressHydrationWarning
                  >
                    {added ? '✓ Added to Cart' : t('addToCart')}
                  </button>
                </div>
              )}

              {/* Out of Stock Message */}
              {isOutOfStock && (
                <button
                  disabled
                  className="w-full py-3 text-sm font-medium bg-gray-200 text-gray-500 cursor-not-allowed"
                  suppressHydrationWarning
                >
                  {t('outOfStock')}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
