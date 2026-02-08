'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/lib/LanguageContext';
import { useCart } from '@/lib/CartContext';
import Header from '@/components/client/Header';
import Footer from '@/components/client/Footer';
import WhatsAppButton from '@/components/client/WhatsAppButton';

export default function CartPage() {
  const { lang, t } = useLanguage();
  const { cart, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const isClient = typeof window !== 'undefined';
  const [productStocks, setProductStocks] = useState({});
  const [colors, setColors] = useState([]);

  // Fetch colors on mount
  useEffect(() => {
    async function fetchColors() {
      try {
        const res = await fetch('/api/colors');
        if (res.ok) {
          const data = await res.json();
          setColors(data);
        }
      } catch (err) {
        console.error('Error fetching colors:', err);
      }
    }
    fetchColors();
  }, []);

  // Fetch product stocks for all cart items
  useEffect(() => {
    async function fetchStocks() {
      const stocks = {};
      for (const item of cart) {
        try {
          const res = await fetch(`/api/products/${item.productId}`);
          if (res.ok) {
            const product = await res.json();
            const key = `${item.productId}-${item.size || 'no-size'}`;
            
            if (product.hasSize && item.size) {
              const sizeObj = product.sizes.find(s => s.name === item.size);
              stocks[key] = sizeObj ? sizeObj.stock : 0;
            } else {
              stocks[key] = product.stock || 0;
            }
          }
        } catch (err) {
          console.error('Error fetching product stock:', err);
        }
      }
      setProductStocks(stocks);
    }

    if (cart.length > 0) {
      fetchStocks();
    }
  }, [cart]);

  // Get available stock for an item
  function getAvailableStock(item) {
    const key = `${item.productId}-${item.size || 'no-size'}`;
    return productStocks[key] || 0;
  }

  // Get product name based on current language
  function getProductName(item) {
    if (typeof item.name === 'object') {
      return item.name?.[lang] || item.name?.en || 'Unnamed';
    }
    return item.name || 'Unnamed';
  }

  // Get text based on current language
  function getText(field) {
    return field?.[lang] || field?.en || '';
  }

  // Get color object by ID
  function getColorById(colorId) {
    return colors.find(c => c._id === colorId);
  }

  // Get translated color name
  function getColorName(colorId) {
    if (!colorId) return '';
    const color = getColorById(colorId);
    if (!color) return colorId;
    return getText(color.name);
  }

  // Format price
  function formatPrice(price) {
    const currency = t('currency');
    return lang === 'ar' ? `${price.toFixed(2)} ${currency} ` : `${price.toFixed(2)} ${currency}`;
  }

  // Handle quantity change
  function handleQuantityChange(productId, color, size, delta, currentQty, item) {
    const availableStock = getAvailableStock(item);
    const newQty = currentQty + delta;
    
    if (newQty < 1) {
      removeFromCart(productId, color, size);
    } else if (newQty > availableStock) {
      // Don't allow exceeding available stock
      return;
    } else {
      updateQuantity(productId, newQty, color, size);
    }
  }

  const cartTotal = getCartTotal();

  // Show loading state on server to avoid hydration mismatch
  if (!isClient) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-white">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-8" suppressHydrationWarning>
              {t('cartTitle')}
            </h1>
            <div className="text-center py-12">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Page Header */}
          <h1 className="text-2xl font-semibold text-gray-900 mb-8" suppressHydrationWarning>
            {t('cartTitle')}
          </h1>

          {cart.length === 0 ? (
            /* Empty Cart */
            <div className="text-center py-12">
              <p className="text-gray-500 mb-6" suppressHydrationWarning>{t('cartEmpty')}</p>
              <Link
                href="/shop"
                className="inline-block bg-gray-900 text-white px-6 py-3 text-sm font-medium hover:bg-gray-800"
                suppressHydrationWarning
              >
                {t('continueShopping')}
              </Link>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="border-t border-gray-200">
                {cart.map((item, index) => (
                  <div
                    key={`${item.productId}-${item.color || 'no-color'}-${item.size || 'no-size'}-${index}`}
                    className="flex items-start gap-4 py-6 border-b border-gray-200"
                  >
                    {/* Product Image */}
                    <div className="w-20 h-20 bg-gray-100 flex-shrink-0 relative overflow-hidden">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={getProductName(item)}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          {t('noImage')}
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/product/${item.productId}`}
                        className="text-gray-900 font-medium hover:underline"
                      >
                        {getProductName(item)}
                      </Link>
                      <p className="text-gray-600 text-sm mt-1">
                        {formatPrice(item.price)}
                      </p>
                      
                      {/* Color Display */}
                      {item.color && (
                        <p className="text-gray-500 text-sm mt-1">
                          {t('color')}: {getColorName(item.color)}
                        </p>
                      )}
                      
                      {/* Size Display */}
                      {item.size && (
                        <p className="text-gray-500 text-sm mt-1">
                          {t('size')}: {item.size}
                        </p>
                      )}

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center border border-gray-300">
                            <button
                              onClick={() =>
                                handleQuantityChange(item.productId, item.color, item.size, -1, item.qty, item)
                              }
                              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                            >
                              −
                            </button>
                            <span className="w-10 text-center text-sm text-gray-900">
                              {item.qty}
                            </span>
                            <button
                              onClick={() =>
                                handleQuantityChange(item.productId, item.color, item.size, 1, item.qty, item)
                              }
                              disabled={item.qty >= getAvailableStock(item)}
                              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              +
                            </button>
                          </div>
                          {getAvailableStock(item) > 0 && (
                            <p className="text-xs text-gray-500">
                              {item.qty >= getAvailableStock(item) 
                                ? t('maxStock')
                                : `${getAvailableStock(item)} ${t('available')}`
                              }
                            </p>
                          )}
                        </div>

                        <button
                          onClick={() => removeFromCart(item.productId, item.color, item.size)}
                          className="text-sm text-gray-500 hover:text-gray-700"
                          suppressHydrationWarning
                        >
                          {t('remove')}
                        </button>
                      </div>
                    </div>

                    {/* Line Total */}
                    <div className="text-right">
                      <p className="text-gray-900 font-medium">
                        {formatPrice(item.price * item.qty)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart Summary */}
              <div className="mt-8 flex flex-col items-end">
                <div className="w-full max-w-xs">
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600" suppressHydrationWarning>{t('subtotal')}</span>
                    <span className="text-gray-900 font-medium">
                      {formatPrice(cartTotal)}
                    </span>
                  </div>
                  
                  {/* Delivery info message */}
                  <div className="py-2 border-t border-gray-200">
                    <p className="text-xs text-gray-500 text-center" suppressHydrationWarning>
                      {t('deliveryAddedAtCheckout')}
                    </p>
                  </div>
                  
                  <div className="flex justify-between py-2 border-t border-gray-200">
                    <span className="text-gray-900 font-medium" suppressHydrationWarning>{t('total')}</span>
                    <span className="text-gray-900 font-semibold text-lg">
                      {formatPrice(cartTotal)}
                    </span>
                  </div>

                  <Link
                    href="/checkout"
                    className="block w-full mt-4 bg-gray-900 text-white text-center py-3 text-sm font-medium hover:bg-gray-800"
                    suppressHydrationWarning
                  >
                    {t('checkout')}
                  </Link>

                  <Link
                    href="/shop"
                    className="block w-full mt-2 text-center py-2 text-sm text-gray-600 hover:text-gray-900"
                    suppressHydrationWarning
                  >
                    {t('continueShopping')}
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
