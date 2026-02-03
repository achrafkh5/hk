'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';
import { useCart } from '@/lib/CartContext';
import Header from '@/components/client/Header';
import Footer from '@/components/client/Footer';
import algerianWilayas from 'algeria-wilayas';

export default function CheckoutPage() {
  const router = useRouter();
  const { lang, t } = useLanguage();
  const { cart, getCartTotal, clearCart } = useCart();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    wilaya: '',
    daira: '',
    commune: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [dairas, setDairas] = useState([]);
  const [communes, setCommunes] = useState([]);

  // Redirect to cart if empty
  useEffect(() => {
    if (cart.length === 0) {
      router.push('/cart');
    }
  }, [cart, router]);

  // Get product name based on current language
  function getProductName(item) {
    if (typeof item.name === 'object') {
      return item.name?.[lang] || item.name?.en || 'Unnamed';
    }
    return item.name || 'Unnamed';
  }

  // Get translated color name
  function getColorName(colorName) {
    if (!colorName) return '';
    const colorKey = `color${colorName}`;
    return t(colorKey) || colorName;
  }

  // Format price
  function formatPrice(price) {
    const currency = t('currency');
    return lang === 'ar' ? ` ${price.toFixed(2)} ${currency}` : `${price.toFixed(2)} ${currency}`;
  }

  function handleInputChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');

    // When wilaya changes, load dairas and reset daira/commune
    if (field === 'wilaya') {
      const wilayaDairas = algerianWilayas.getDairasByWilaya(value);
      setDairas(wilayaDairas);
      setCommunes([]);
      setFormData(prev => ({ ...prev, daira: '', commune: '' }));
    }

    // When daira changes, load communes
    if (field === 'daira') {
      const dairaCommunes = algerianWilayas.getCommunesByDaira(value);
      setCommunes(dairaCommunes);
      setFormData(prev => ({ ...prev, commune: '' }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // Validate
    if (!formData.name.trim()) {
      setError(t('nameRequired') || 'Name is required');
      return;
    }
    if (!formData.phone.trim()) {
      setError(t('phoneRequired') || 'Phone is required');
      return;
    }
    if (!formData.wilaya) {
      setError(t('wilayaRequired') || 'Wilaya is required');
      return;
    }
    if (!formData.daira) {
      setError(t('dairaRequired') || 'Daira is required');
      return;
    }
    if (!formData.commune) {
      setError(t('communeRequired') || 'Commune is required');
      return;
    }

    setSubmitting(true);
    setError('');

    const languageKey = lang === 'ar' ? 'arabic' : 'ascii';
    const wilayaName = algerianWilayas.getWilayaName(formData.wilaya, languageKey);
    const selectedDaira = dairas.find(d => d.id === formData.daira);
    const selectedCommune = communes.find(c => c.id === formData.commune);

    const orderPayload = {
      items: cart.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        qty: item.qty,
        color: item.color || null,
      })),
      total: getCartTotal(),
      customer: {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        wilaya: wilayaName || formData.wilaya,
        daira: selectedDaira?.name?.[languageKey] || formData.daira,
        commune: lang === 'ar' ? (selectedCommune?.commune_name || formData.commune) : (selectedCommune?.commune_name_ascii || formData.commune),
      },
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      if (res.ok) {
        const data = await res.json();
        clearCart();
        router.push('/order-success');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to place order');
      }
    } catch (err) {
      console.error('Error placing order:', err);
      setError('Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const cartTotal = getCartTotal();

  // Don't render if cart is empty (will redirect)
  if (cart.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Page Header */}
          <h1 className="text-2xl font-semibold text-gray-900 mb-8" suppressHydrationWarning>
            {t('checkoutTitle')}
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Customer Form */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4" suppressHydrationWarning>
                {t('customerInfo')}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <p className="text-red-600 text-sm">{error}</p>
                )}

                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm text-gray-700 mb-1"
                    suppressHydrationWarning
                  >
                    {t('name')} *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:border-gray-500"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm text-gray-700 mb-1"
                    suppressHydrationWarning
                  >
                    {t('phone')} *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:border-gray-500"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="wilaya"
                    className="block text-sm text-gray-700 mb-1"
                    suppressHydrationWarning
                  >
                    {t('wilaya') || 'Wilaya'} *
                  </label>
                  <select
                    id="wilaya"
                    value={formData.wilaya}
                    onChange={(e) => handleInputChange('wilaya', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:border-gray-500"
                    required
                  >
                    <option value="">{t('selectWilaya') || 'Select Wilaya'}</option>
                    {algerianWilayas.getAllWilayas().map((wilaya) => {
                      const languageKey = lang === 'ar' ? 'arabic' : 'ascii';
                      return (
                        <option key={wilaya.code} value={wilaya.code}>
                          {wilaya.code} - {wilaya.name[languageKey]}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="daira"
                    className="block text-sm text-gray-700 mb-1"
                    suppressHydrationWarning
                  >
                    {t('daira') || 'Daira'} *
                  </label>
                  <select
                    id="daira"
                    value={formData.daira}
                    onChange={(e) => handleInputChange('daira', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:border-gray-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                    required
                    disabled={!formData.wilaya}
                  >
                    <option value="">{t('selectDaira') || 'Select Daira'}</option>
                    {dairas.map((daira) => {
                      const languageKey = lang === 'ar' ? 'arabic' : 'ascii';
                      return (
                        <option key={daira.id} value={daira.id}>
                          {daira.name[languageKey]}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="commune"
                    className="block text-sm text-gray-700 mb-1"
                    suppressHydrationWarning
                  >
                    {t('commune') || 'Commune'} *
                  </label>
                  <select
                    id="commune"
                    value={formData.commune}
                    onChange={(e) => handleInputChange('commune', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:border-gray-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                    required
                    disabled={!formData.daira}
                  >
                    <option value="">{t('selectCommune') || 'Select Commune'}</option>
                    {communes.map((commune) => {
                      const communeName = lang === 'ar' ? commune.commune_name : commune.commune_name_ascii;
                      return (
                        <option key={commune.id} value={commune.id}>
                          {communeName}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {submitting ? '...' : t('placeOrder')}
                </button>

                <Link
                  href="/cart"
                  className="block text-center text-sm text-gray-600 hover:text-gray-900"
                >
                  ← {t('backToCart')}
                </Link>
              </form>
            </div>

            {/* Order Summary */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4" suppressHydrationWarning>
                {t('orderSummary')}
              </h2>

              <div className="bg-gray-50 p-4 border border-gray-200">
                {/* Items */}
                <div className="space-y-3 mb-4">
                  {cart.map((item, index) => (
                    <div
                      key={`${item.productId}-${item.color || 'no-color'}-${index}`}
                      className="text-sm"
                    >
                      <div className="flex justify-between">
                        <span className="text-gray-700">
                          {getProductName(item)} × {item.qty}
                        </span>
                        <span className="text-gray-900">
                          {formatPrice(item.price * item.qty)}
                        </span>
                      </div>
                      {item.color && (
                        <span className="text-gray-500 text-xs">
                          {t('color')}: {getColorName(item.color)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-700" suppressHydrationWarning>{t('subtotal')}</span>
                    <span className="text-gray-900">{formatPrice(cartTotal)}</span>
                  </div>
                </div>

                {/* Total */}
                <div className="border-t border-gray-200 mt-4 pt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-900 font-medium" suppressHydrationWarning>{t('total')}</span>
                    <span className="text-gray-900 font-semibold text-lg">
                      {formatPrice(cartTotal)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
