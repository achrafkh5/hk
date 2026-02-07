'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';
import { useCart } from '@/lib/CartContext';
import Header from '@/components/client/Header';
import Footer from '@/components/client/Footer';
import algerianWilayas from 'algeria-wilayas';

const DELIVERY_PRICES = {
  Adrar: { domicile: 1400, stopdesk: 970 },
  Chlef: { domicile: 800, stopdesk: 520 },
  Laghouat: { domicile: 950, stopdesk: 670 },
  "Oum El Bouaghi": { domicile: 700, stopdesk: 520 },
  Béjaïa: { domicile: 750, stopdesk: 520 },
  Biskra: { domicile: 800, stopdesk: 570 },
  Béchar: { domicile: 1100, stopdesk: 720 },
  Blida: { domicile: 750, stopdesk: 520 },
  Bouira: { domicile: 750, stopdesk: 520 },
  Tamanrasset: { domicile: 1600, stopdesk: 1120 },
  Tébessa: { domicile: 800, stopdesk: 520 },
  Tlemcen: { domicile: 950, stopdesk: 620 },
  Tiaret: { domicile: 800, stopdesk: 520 },
  "Tizi Ouzou": { domicile: 800, stopdesk: 520 },
  Alger: { domicile: 600, stopdesk: 520 },
  Djelfa: { domicile: 950, stopdesk: 670 },
  Jijel: { domicile: 800, stopdesk: 520 },
  Sétif: { domicile: 750, stopdesk: 520 },
  Saïda: { domicile: 800, stopdesk: 570 },
  Skikda: { domicile: 750, stopdesk: 520 },
  "Sidi Bel Abbès": { domicile: 800, stopdesk: 520 },
  Annaba: { domicile: 750, stopdesk: 520 },
  Guelma: { domicile: 750, stopdesk: 520 },
  Constantine: { domicile: 750, stopdesk: 520 },
  Médéa: { domicile: 800, stopdesk: 520 },
  Mostaganem: { domicile: 800, stopdesk: 520 },
  "M'Sila": { domicile: 800, stopdesk: 570 },
  Mascara: { domicile: 800, stopdesk: 520 },
  Ouargla: { domicile: 950, stopdesk: 670 },
  Oran: { domicile: 800, stopdesk: 520 },
  "El Bayadh": { domicile: 1100, stopdesk: 670 },
  Illizi: { domicile: 0, stopdesk: 0 },
  "Bordj Bou Arreridj": { domicile: 750, stopdesk: 520 },
  Boumerdès: { domicile: 750, stopdesk: 520 },
  "El Tarf": { domicile: 750, stopdesk: 520 },
  Tindouf: { domicile: 0, stopdesk: 0 },
  Tissemsilt: { domicile: 800, stopdesk: 520 },
  "El Oued": { domicile: 950, stopdesk: 670 },
  Khenchela: { domicile: 600, stopdesk: 520 },
  "Souk Ahras": { domicile: 700, stopdesk: 520 },
  Tipaza: { domicile: 800, stopdesk: 520 },
  Mila: { domicile: 700, stopdesk: 520 },
  "Aïn Defla": { domicile: 800, stopdesk: 520 },
  Naâma: { domicile: 1100, stopdesk: 670 },
  "Aïn Témouchent": { domicile: 800, stopdesk: 520 },
  Ghardaïa: { domicile: 950, stopdesk: 670 },
  Relizane: { domicile: 800, stopdesk: 520 },
  Timimoun: { domicile: 1400, stopdesk: 970 },
  "Bordj Badji Mokhtar": { domicile: 0, stopdesk: 0 },
  "Ouled Djellal": { domicile: 950, stopdesk: 570 },
  "Béni Abbès": { domicile: 1200, stopdesk: 970 },
  "In Salah": { domicile: 1600, stopdesk: 1120 },
  "In Guezzam": { domicile: 1600, stopdesk: 0 },
  Touggourt: { domicile: 950, stopdesk: 670 },
  Djanet: { domicile: 0, stopdesk: 0 },
  "El Meghaier": { domicile: 950, stopdesk: 0 },
  "El Menia": { domicile: 1000, stopdesk: 0 }
};


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
    deliveryType: 'stopdesk',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [dairas, setDairas] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [deliveryPrice, setDeliveryPrice] = useState(0);
  const [availableDeliveryTypes, setAvailableDeliveryTypes] = useState({ domicile: true, stopdesk: true });
  const [isDeliveryAvailable, setIsDeliveryAvailable] = useState(true);
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

  // Redirect to cart if empty
  useEffect(() => {
    if (cart.length === 0) {
      router.push('/cart');
    }
  }, [cart, router]);

  // Calculate delivery price when wilaya or delivery type changes
  useEffect(() => {
    if (formData.wilaya) {
      const wilayaName = algerianWilayas.getWilayaName(formData.wilaya, 'ascii');
      const prices = DELIVERY_PRICES[wilayaName];
      
      if (prices) {
        // Check which delivery types are available
        const domicileAvailable = prices.domicile > 0;
        const stopdeskAvailable = prices.stopdesk > 0;
        setAvailableDeliveryTypes({ domicile: domicileAvailable, stopdesk: stopdeskAvailable });
        
        // Check if any delivery is available
        const anyDeliveryAvailable = domicileAvailable || stopdeskAvailable;
        setIsDeliveryAvailable(anyDeliveryAvailable);
        
        // If current selection is not available, switch to available option
        if (formData.deliveryType === 'domicile' && !domicileAvailable && stopdeskAvailable) {
          setFormData(prev => ({ ...prev, deliveryType: 'stopdesk' }));
          setDeliveryPrice(prices.stopdesk);
        } else if (formData.deliveryType === 'stopdesk' && !stopdeskAvailable && domicileAvailable) {
          setFormData(prev => ({ ...prev, deliveryType: 'domicile' }));
          setDeliveryPrice(prices.domicile);
        } else if (formData.deliveryType && anyDeliveryAvailable) {
          const price = prices[formData.deliveryType];
          setDeliveryPrice(price);
          
          // Clear error if delivery is now available
          if (price > 0) {
            setError('');
          }
        } else {
          setDeliveryPrice(0);
        }
      } else {
        // Wilaya not in delivery list
        setAvailableDeliveryTypes({ domicile: false, stopdesk: false });
        setIsDeliveryAvailable(false);
        setDeliveryPrice(0);
      }
    } else {
      setAvailableDeliveryTypes({ domicile: true, stopdesk: true });
      setIsDeliveryAvailable(true);
      setDeliveryPrice(0);
    }
  }, [formData.wilaya, formData.deliveryType]);

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
    if (!isDeliveryAvailable) {
      setError('Delivery not available for selected wilaya');
      return;
    }
    if (deliveryPrice === 0) {
      setError('Delivery not available for selected delivery type');
      return;
    }

    setSubmitting(true);
    setError('');

    const languageKey = lang === 'ar' ? 'arabic' : 'ascii';
    const wilayaName = algerianWilayas.getWilayaName(formData.wilaya, languageKey);
    const selectedDaira = dairas.find(d => d.id === formData.daira);
    
    // Try to find commune by matching both string and number versions of ID
    const selectedCommune = communes.find(c => 
      c.id === formData.commune || 
      c.id === parseInt(formData.commune) || 
      String(c.id) === String(formData.commune)
    );
    
    // Get commune name based on language
    let communeName = String(formData.commune);
    if (selectedCommune) {
      if (lang === 'ar') {
        communeName = selectedCommune.commune_name || selectedCommune.commune_name_ascii || String(formData.commune);
      } else {
        communeName = selectedCommune.commune_name_ascii || selectedCommune.commune_name || String(formData.commune);
      }
    }
    
    console.log('Commune ID from form:', formData.commune, 'Type:', typeof formData.commune);
    console.log('Available communes:', communes.map(c => ({ id: c.id, type: typeof c.id })));
    console.log('Selected Commune:', selectedCommune);
    console.log('Commune Name:', communeName);
    console.log('Cart items:', JSON.stringify(cart, null, 2));

    const orderPayload = {
      items: cart.map((item) => {
        console.log('Item in cart:', item);
        return {
          productId: item.productId,
          name: item.name,
          price: item.price,
          qty: item.qty,
          color: item.color || null,
          size: item.size || null,
        };
      }),
      subtotal: getCartTotal(),
      deliveryPrice: deliveryPrice,
      deliveryType: formData.deliveryType,
      total: getCartTotal() + deliveryPrice,
      customer: {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        wilaya: wilayaName || formData.wilaya,
        daira: selectedDaira?.name?.[languageKey] || formData.daira,
        commune: communeName,
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
                    {t('wilaya')} *
                  </label>
                  <select
                    id="wilaya"
                    value={formData.wilaya}
                    onChange={(e) => handleInputChange('wilaya', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:border-gray-500"
                    required
                  >
                    <option value="">{t('selectWilaya')}</option>
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
                    {t('daira')} *
                  </label>
                  <select
                    id="daira"
                    value={formData.daira}
                    onChange={(e) => handleInputChange('daira', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:border-gray-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                    required
                    disabled={!formData.wilaya}
                  >
                    <option value="">{t('selectDaira')}</option>
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
                    {t('commune')} *
                  </label>
                  <select
                    id="commune"
                    value={formData.commune}
                    onChange={(e) => handleInputChange('commune', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:border-gray-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                    required
                    disabled={!formData.daira}
                  >
                    <option value="">{t('selectCommune')}</option>
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

                <div>
                  <label className="block text-sm text-gray-700 mb-2" suppressHydrationWarning>
                    {t('deliveryType')} *
                  </label>
                  {!isDeliveryAvailable && formData.wilaya ? (
                    <div className="p-3 border border-red-300 rounded bg-red-50">
                      <p className="text-red-600 text-sm">
                        ⚠️ Delivery is not available for the selected wilaya
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className={`flex items-center space-x-3 p-3 border border-gray-300 rounded ${
                        availableDeliveryTypes.domicile ? 'cursor-pointer hover:bg-gray-50' : 'bg-gray-100 cursor-not-allowed opacity-60'
                      }`}>
                        <input
                          type="radio"
                          name="deliveryType"
                          value="domicile"
                          checked={formData.deliveryType === 'domicile'}
                          onChange={(e) => handleInputChange('deliveryType', e.target.value)}
                          disabled={!availableDeliveryTypes.domicile}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-gray-900" suppressHydrationWarning>
                          {t('homeDelivery')}
                          {!availableDeliveryTypes.domicile && formData.wilaya && (
                            <span className="text-red-600 ml-2">(Not available)</span>
                          )}
                        </span>
                      </label>
                      <label className={`flex items-center space-x-3 p-3 border border-gray-300 rounded ${
                        availableDeliveryTypes.stopdesk ? 'cursor-pointer hover:bg-gray-50' : 'bg-gray-100 cursor-not-allowed opacity-60'
                      }`}>
                        <input
                          type="radio"
                          name="deliveryType"
                          value="stopdesk"
                          checked={formData.deliveryType === 'stopdesk'}
                          onChange={(e) => handleInputChange('deliveryType', e.target.value)}
                          disabled={!availableDeliveryTypes.stopdesk}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-gray-900" suppressHydrationWarning>
                          {t('stopDesk')}
                          {!availableDeliveryTypes.stopdesk && formData.wilaya && (
                            <span className="text-red-600 ml-2">(Not available)</span>
                          )}
                        </span>
                      </label>
                    </div>
                  )}
                </div>

                {/* Order Summary - Mobile Only (before Place Order button) */}
                <div className="lg:hidden">
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
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-700" suppressHydrationWarning>{t('subtotal')}</span>
                        <span className="text-gray-900">{formatPrice(cartTotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700" suppressHydrationWarning>{t('delivery')}</span>
                        <span className="text-gray-900">
                          {deliveryPrice > 0 ? formatPrice(deliveryPrice) : '-'}
                        </span>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="border-t border-gray-200 mt-4 pt-4">
                      <div className="flex justify-between">
                        <span className="text-gray-900 font-medium" suppressHydrationWarning>{t('total')}</span>
                        <span className="text-gray-900 font-semibold text-lg">
                          {formatPrice(cartTotal + deliveryPrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !isDeliveryAvailable}
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

            {/* Order Summary - Desktop Only */}
            <div className="hidden lg:block">
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
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700" suppressHydrationWarning>{t('subtotal')}</span>
                    <span className="text-gray-900">{formatPrice(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700" suppressHydrationWarning>{t('delivery')}</span>
                    <span className="text-gray-900">
                      {deliveryPrice > 0 ? formatPrice(deliveryPrice) : '-'}
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div className="border-t border-gray-200 mt-4 pt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-900 font-medium" suppressHydrationWarning>{t('total')}</span>
                    <span className="text-gray-900 font-semibold text-lg">
                      {formatPrice(cartTotal + deliveryPrice)}
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
