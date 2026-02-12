'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/lib/LanguageContext';
import { useCart } from '@/lib/CartContext';
import { trackInitiateCheckout } from '@/lib/metaPixelTracking';
import Header from '@/components/client/Header';
import Footer from '@/components/client/Footer';
import WhatsAppButton from '@/components/client/WhatsAppButton';
import algerianWilayas from 'algeria-wilayas';

const DELIVERY_PRICES = {
  Adrar: { domicile: 1400, stopdesk: 970 },
  Chlef: { domicile: 850, stopdesk: 520 },
  Laghouat: { domicile: 950, stopdesk: 620 },
  "Oum El Bouaghi": { domicile: 850, stopdesk: 520 },
  Batna: { domicile: 900, stopdesk: 520 },
  Béjaïa: { domicile: 800, stopdesk: 520 },
  Biskra: { domicile: 950, stopdesk: 620 },
  Béchar: { domicile: 1100, stopdesk: 720 },
  Blida: { domicile: 600, stopdesk: 470 },
  Bouira: { domicile: 700, stopdesk: 520 },
  Tamanrasset: { domicile: 1600, stopdesk: 1120 },
  Tébessa: { domicile: 900, stopdesk: 570 },
  Tlemcen: { domicile: 900, stopdesk: 570 },
  Tiaret: { domicile: 850, stopdesk: 520 },
  "Tizi Ouzou": { domicile: 750, stopdesk: 520 },
  Alger: { domicile: 500, stopdesk: 370 },
  Djelfa: { domicile: 950, stopdesk: 570 },
  Jijel: { domicile: 900, stopdesk: 520 },
  Sétif: { domicile: 800, stopdesk: 520 },
  Saïda: { domicile: 900, stopdesk: 570 },
  Skikda: { domicile: 900, stopdesk: 520 },
  "Sidi Bel Abbès": { domicile: 900, stopdesk: 520 },
  Annaba: { domicile: 850, stopdesk: 520 },
  Guelma: { domicile: 900, stopdesk: 520 },
  Constantine: { domicile: 800, stopdesk: 520 },
  Médéa: { domicile: 800, stopdesk: 520 },
  Mostaganem: { domicile: 900, stopdesk: 520 },
  "M'Sila": { domicile: 850, stopdesk: 570 },
  Mascara: { domicile: 900, stopdesk: 520 },
  Ouargla: { domicile: 950, stopdesk: 670 },
  Oran: { domicile: 800, stopdesk: 520 },
  "El Bayadh": { domicile: 1100, stopdesk: 670 },
  Illizi: { domicile: 0, stopdesk: 0 },
  "Bordj Bou Arreridj": { domicile: 800, stopdesk: 520 },
  Boumerdès: { domicile: 700, stopdesk: 520 },
  "El Tarf": { domicile: 850, stopdesk: 520 },
  Tindouf: { domicile: 0, stopdesk: 0 },
  Tissemsilt: { domicile: 900, stopdesk: 520 },
  "El Oued": { domicile: 950, stopdesk: 670 },
  Khenchela: { domicile: 900, stopdesk: 520 },
  "Souk Ahras": { domicile: 900, stopdesk: 520 },
  Tipaza: { domicile: 700, stopdesk: 520 },
  Mila: { domicile: 900, stopdesk: 520 },
  "Aïn Defla": { domicile: 900, stopdesk: 520 },
  Naâma: { domicile: 1100, stopdesk: 670 },
  "Aïn Témouchent": { domicile: 900, stopdesk: 520 },
  Ghardaïa: { domicile: 950, stopdesk: 620 },
  Relizane: { domicile: 900, stopdesk: 520 },
  Timimoun: { domicile: 1400, stopdesk: 0 },
  "Bordj Badji Mokhtar": { domicile: 0, stopdesk: 0 },
  "Ouled Djellal": { domicile: 950, stopdesk: 620 },
  "Béni Abbès": { domicile: 1100, stopdesk: 970 },
  "In Salah": { domicile: 1600, stopdesk: 0 },
  "In Guezzam": { domicile: 1600, stopdesk: 0 },
  Touggourt: { domicile: 950, stopdesk: 670 },
  Djanet: { domicile: 0, stopdesk: 0 },
  "El M'Ghair": { domicile: 950, stopdesk: 0 },
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
    commune: '',
    deliveryType: 'stopdesk',
    address: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [communes, setCommunes] = useState([]);
  const [deliveryPrice, setDeliveryPrice] = useState(0);
  const [availableDeliveryTypes, setAvailableDeliveryTypes] = useState({ domicile: true, stopdesk: true });
  const [isDeliveryAvailable, setIsDeliveryAvailable] = useState(true);
  const [colors, setColors] = useState([]);
  const [directOrderItem, setDirectOrderItem] = useState(null);
  const [isCheckingDirectOrder, setIsCheckingDirectOrder] = useState(true);

  // Check for direct order on mount
  useEffect(() => {
    const directOrder = sessionStorage.getItem('directOrder');
    if (directOrder) {
      try {
        const item = JSON.parse(directOrder);
        setDirectOrderItem(item);
        sessionStorage.removeItem('directOrder');
      } catch (err) {
        console.error('Error parsing direct order:', err);
      }
    }
    setIsCheckingDirectOrder(false);
  }, []);

  // Get items - either from cart or direct order
  const items = directOrderItem ? [directOrderItem] : cart;

  // Calculate total
  const getTotal = () => {
    if (directOrderItem) {
      return directOrderItem.price * directOrderItem.qty;
    }
    return getCartTotal();
  };

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

  // Redirect to cart if empty (but not if order was just placed or direct order or still checking)
  // Also track InitiateCheckout when page loads with items
  useEffect(() => {
    if (!isCheckingDirectOrder && items.length === 0 && !orderPlaced) {
      router.push('/cart');
    } else if (!isCheckingDirectOrder && items.length > 0 && !orderPlaced) {
      // Track InitiateCheckout event when checkout page loads with items
      const total = getTotal();
      trackInitiateCheckout(items, total);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, router, orderPlaced, isCheckingDirectOrder]);

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

    // When wilaya changes, load ALL communes from all dairas of that wilaya
    if (field === 'wilaya') {
      const wilayaDairas = algerianWilayas.getDairasByWilaya(value);
      const allCommunes = [];
      wilayaDairas.forEach(daira => {
        const dairaCommunes = algerianWilayas.getCommunesByDaira(daira.id);
        allCommunes.push(...dairaCommunes);
      });
      // Sort communes alphabetically
      allCommunes.sort((a, b) => (a.commune_name_ascii || '').localeCompare(b.commune_name_ascii || ''));
      setCommunes(allCommunes);
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
    if (!formData.commune) {
      setError(t('communeRequired') || 'Commune is required');
      return;
    }
    if (formData.deliveryType === 'domicile' && !formData.address.trim()) {
      setError(t('addressRequired') || 'Address is required for home delivery');
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

    const orderPayload = {
      items: items.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          qty: item.qty,
          color: item.color || null,
          size: item.size || null,
        })),
      subtotal: cartTotal,
      deliveryPrice: deliveryPrice,
      deliveryType: formData.deliveryType,
      total: cartTotal + deliveryPrice,
      customer: {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        wilaya: wilayaName || formData.wilaya,
        commune: communeName,
        ...(formData.deliveryType === 'domicile' && formData.address.trim() && { address: formData.address.trim() }),
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
        setOrderPlaced(true);
        
        // Store order data for Purchase tracking on success page
        const orderDataForTracking = {
          orderId: data._id || data.id,
          items: orderPayload.items,
          total: orderPayload.total,
          subtotal: orderPayload.subtotal,
          shipping: orderPayload.deliveryPrice
        };
        sessionStorage.setItem('completedOrder', JSON.stringify(orderDataForTracking));
        
        if (!directOrderItem) {
          clearCart();
        }
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

  const cartTotal = getTotal();
  if (items.length === 0) {
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
                    disabled={!formData.wilaya}
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

                {/* Address field - shown only for domicile delivery */}
                {formData.deliveryType === 'domicile' && availableDeliveryTypes.domicile && (
                  <div>
                    <label
                      htmlFor="address"
                      className="block text-sm text-gray-700 mb-1"
                      suppressHydrationWarning
                    >
                      {t('address') || 'Address'} *
                    </label>
                    <input
                      type="text"
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:border-gray-500"
                      placeholder={t('addressPlaceholder') || 'Enter your full address'}
                      required
                    />
                  </div>
                )}

                {/* Order Summary - Mobile Only (before Place Order button) */}
                <div className="lg:hidden">
                  <h2 className="text-lg font-medium text-gray-900 mb-4" suppressHydrationWarning>
                    {t('orderSummary')}
                  </h2>

                  <div className="bg-gray-50 p-4 border border-gray-200">
                    {/* Items */}
                    <div className="space-y-3 mb-4">
                      {items.map((item, index) => (
                        <div
                          key={`${item.productId}-${item.color || 'no-color'}-${index}`}
                          className="flex gap-3"
                        >
                          {/* Product Image */}
                          {item.image && (
                            <div className="w-16 h-16 bg-gray-100 relative overflow-hidden flex-shrink-0">
                              <Image
                                src={item.image}
                                alt={getProductName(item)}
                                fill
                                className="object-cover"
                                sizes="64px"
                              />
                            </div>
                          )}
                          
                          {/* Product Details */}
                          <div className="flex-1 text-sm">
                            <div className="flex justify-between mb-1">
                              <span className="text-gray-700">
                                {getProductName(item)} × {item.qty}
                              </span>
                              <span className="text-gray-900">
                                {formatPrice(item.price * item.qty)}
                              </span>
                            </div>
                            {item.color && (
                              <span className="text-gray-500 text-xs block">
                                {t('color')}: {getColorName(item.color)}
                              </span>
                            )}
                            {item.size && (
                              <span className="text-gray-500 text-xs block">
                                {t('size')}: {item.size}
                              </span>
                            )}
                          </div>
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
                  href="/shop"
                  className="block text-center text-sm text-gray-600 hover:text-gray-900"
                >
                  ← {t('backToShop')}
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
                  {items.map((item, index) => (
                    <div
                      key={`${item.productId}-${item.color || 'no-color'}-${index}`}
                      className="flex gap-3"
                    >
                      {/* Product Image */}
                      {item.image && (
                        <div className="w-16 h-16 bg-gray-100 relative overflow-hidden flex-shrink-0">
                          <Image
                            src={item.image}
                            alt={getProductName(item)}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                      )}
                      
                      {/* Product Details */}
                      <div className="flex-1 text-sm">
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-700">
                            {getProductName(item)} × {item.qty}
                          </span>
                          <span className="text-gray-900">
                            {formatPrice(item.price * item.qty)}
                          </span>
                        </div>
                        {item.color && (
                          <span className="text-gray-500 text-xs block">
                            {t('color')}: {getColorName(item.color)}
                          </span>
                        )}
                        {item.size && (
                          <span className="text-gray-500 text-xs block">
                            {t('size')}: {item.size}
                          </span>
                        )}
                      </div>
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
      <WhatsAppButton />
    </div>
  );
}
