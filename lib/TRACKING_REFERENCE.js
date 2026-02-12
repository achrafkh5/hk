// Meta Pixel Tracking Quick Reference
// =====================================
// This is a REFERENCE FILE with code examples - not meant to be imported or executed

/* eslint-disable */

// ✅ ALREADY IMPLEMENTED - No additional code needed!

// 1. PAGEVIEW - Automatic on every route change
// Location: components/MetaPixel.js
// Fires when: User navigates to any page

// 2. VIEWCONTENT - Product page
// Location: app/product/[slug]/page.js
// Fires when: User views a product
// Usage example (already in your code):
import { trackViewContent } from '@/lib/metaPixelTracking';

async function fetchProduct() {
  const res = await fetch(`/api/products/${params.slug}`);
  const data = await res.json();
  trackViewContent(data); // ← Tracks the view
}

// 3. ADDTOCART - Cart actions
// Location: lib/CartContext.js
// Fires when: User adds item to cart
// Usage example (already in your code):
import { trackAddToCart } from './metaPixelTracking';

function addToCart(product, quantity = 1, color = null, size = null) {
  // ... add to cart logic ...
  trackAddToCart(product, quantity, color, size); // ← Tracks the addition
}

// 4. INITIATECHECKOUT - Checkout page
// Location: app/checkout/page.js
// Fires when: User reaches checkout page with items
// Usage example (already in your code):
import { trackInitiateCheckout } from '@/lib/metaPixelTracking';

useEffect(() => {
  if (items.length > 0) {
    const total = getTotal();
    trackInitiateCheckout(items, total); // ← Tracks checkout start
  }
}, [items.length]);

// 5. PURCHASE - Order success
// Location: app/order-success/page.js
// Fires when: Order successfully completed (once only)
// Usage example (already in your code):
import { trackPurchase } from '@/lib/metaPixelTracking';

useEffect(() => {
  const orderData = sessionStorage.getItem('completedOrder');
  if (orderData) {
    trackPurchase(JSON.parse(orderData)); // ← Tracks the purchase
    sessionStorage.removeItem('completedOrder'); // Prevent duplicates
  }
}, []);

// =============================================================================
// CUSTOM TRACKING (if you need to add more events)
// =============================================================================

// Example: Track search
import { trackCustomEvent } from '@/lib/metaPixelTracking';

function handleSearch(searchTerm) {
  trackCustomEvent('Search', { search_string: searchTerm });
}

// Example: Track wishlist add
function addToWishlist(product) {
  trackCustomEvent('AddToWishlist', {
    content_ids: [product.id],
    content_name: product.name,
    value: product.price,
    currency: 'DZD'
  });
}

// Example: Track category view
function viewCategory(categoryName) {
  trackCustomEvent('ViewCategory', {
    content_category: categoryName
  });
}

// =============================================================================
// TESTING IN BROWSER CONSOLE
// =============================================================================

// Check if pixel is loaded:
// console.log(typeof window.fbq); // Should return "function"

// Manually fire a test event:
// window.fbq('trackCustom', 'TestEvent', { test: true });

// View all tracked events (with Meta Pixel Helper extension installed)

// =============================================================================
// ENVIRONMENT VARIABLES
// =============================================================================

// Required in .env.local:
// NEXT_PUBLIC_META_PIXEL_ID=788654360931902

// Optional for CAPI (Conversions API):
// META_CAPI_ACCESS_TOKEN=your_token_here

// =============================================================================
// ALL TRACKING FUNCTIONS AVAILABLE
// =============================================================================

/*
import {
  trackPageView,         // Automatic - don't call manually
  trackViewContent,      // Product views
  trackAddToCart,        // Cart additions
  trackInitiateCheckout, // Checkout start
  trackPurchase,         // Order completion
  trackCustomEvent,      // Custom events
  isPixelLoaded          // Check if fbq is available
} from '@/lib/metaPixelTracking';
*/
