'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';
import Header from '@/components/client/Header';
import Footer from '@/components/client/Footer';

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');
  const { t } = useLanguage();

  // Shorten order ID for display
  function shortenId(id) {
    if (!id) return '';
    return id.slice(-8).toUpperCase();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-white">
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          {/* Success Icon */}
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-600"
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
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            {t('orderConfirmed')}
          </h1>

          {/* Thank you message */}
          <p className="text-gray-600 mb-6">
            {t('orderThankYou')}
          </p>

          {/* Order ID */}
          {orderId && (
            <div className="mb-8 p-4 bg-gray-50 border border-gray-200 inline-block">
              <p className="text-sm text-gray-600 mb-1">{t('orderNumber')}</p>
              <p className="text-lg font-mono font-medium text-gray-900">
                #{shortenId(orderId)}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <Link
              href="/shop"
              className="inline-block bg-gray-900 text-white px-6 py-3 text-sm font-medium hover:bg-gray-800"
            >
              {t('continueShopping')}
            </Link>
            <p className="text-sm text-gray-500">
              {t('orderConfirmationEmail')}
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
