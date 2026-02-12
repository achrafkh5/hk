'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';
import { trackPurchase } from '@/lib/metaPixelTracking';
import Header from '@/components/client/Header';
import Footer from '@/components/client/Footer';
import WhatsAppButton from '@/components/client/WhatsAppButton';

export default function OrderSuccessPage() {
  const { t } = useLanguage();

  useEffect(() => {
    // Track Purchase event for Meta Pixel
    // This should only fire once when order is complete
    const completedOrder = sessionStorage.getItem('completedOrder');
    
    if (completedOrder) {
      try {
        const orderData = JSON.parse(completedOrder);
        trackPurchase(orderData);
        
        // Remove from sessionStorage to prevent duplicate tracking on page refresh
        sessionStorage.removeItem('completedOrder');
      } catch (error) {
        console.error('Error tracking purchase:', error);
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-white flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          {/* Simple checkmark icon */}
          <div className="w-12 h-12 mx-auto mb-6 rounded-full border-2 border-gray-900 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-gray-900"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-xl font-medium text-gray-900 mb-3" suppressHydrationWarning>
            {t('orderReceived')}
          </h1>

          {/* Message */}
          <p className="text-gray-600 mb-8 leading-relaxed" suppressHydrationWarning>
            {t('orderReceivedMessage')}
          </p>

          {/* Return to shop */}
          <Link
            href="/shop"
            className="inline-block bg-gray-900 text-white px-6 py-3 text-sm font-medium hover:bg-gray-800"
            suppressHydrationWarning
          >
            {t('backToShop')}
          </Link>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
