/**
 * Meta Pixel Tracking Utilities
 * 
 * Helper functions for tracking ecommerce events with Facebook Pixel.
 * All functions safely check if fbq is available before tracking.
 */

/**
 * Check if Meta Pixel is loaded and available
 * @returns {boolean} True if fbq is available
 */
export function isPixelLoaded() {
  return typeof window !== 'undefined' && typeof window.fbq === 'function'
}

/**
 * Track PageView event
 * Automatically called by MetaPixel component on route changes
 */
export function trackPageView() {
  if (!isPixelLoaded()) return
  
  try {
    window.fbq('track', 'PageView')
  } catch (error) {
    console.error('Meta Pixel PageView tracking error:', error)
  }
}

/**
 * Track ViewContent event when user views a product
 * @param {Object} product - Product object
 * @param {string} product.id - Product ID
 * @param {string|Object} product.name - Product name (string or object with language keys)
 * @param {number} product.price - Product price
 * @param {string} [product.category] - Product category
 */
export function trackViewContent(product) {
  if (!isPixelLoaded() || !product) return
  
  try {
    // Get product name - handle both string and object format
    const productName = typeof product.name === 'object' 
      ? (product.name.en || product.name.ar || 'Product')
      : (product.name || 'Product')

    window.fbq('track', 'ViewContent', {
      content_ids: [String(product._id || product.id)],
      content_name: productName,
      content_type: 'product',
      value: Number(product.price),
      currency: 'DZD',
      ...(product.category && { content_category: product.category })
    })
  } catch (error) {
    console.error('Meta Pixel ViewContent tracking error:', error)
  }
}

/**
 * Track AddToCart event when user adds item to cart
 * @param {Object} product - Product object
 * @param {string} product.id - Product ID
 * @param {string|Object} product.name - Product name
 * @param {number} product.price - Product price
 * @param {number} quantity - Quantity added
 * @param {string} [color] - Selected color
 * @param {string} [size] - Selected size
 */
export function trackAddToCart(product, quantity = 1, color = null, size = null) {
  if (!isPixelLoaded() || !product) return
  
  try {
    // Get product name - handle both string and object format
    const productName = typeof product.name === 'object' 
      ? (product.name.en || product.name.ar || 'Product')
      : (product.name || 'Product')

    const eventData = {
      content_ids: [String(product._id || product.id)],
      content_name: productName,
      content_type: 'product',
      value: Number(product.price * quantity),
      currency: 'DZD',
      num_items: Number(quantity)
    }

    // Add variant info if available
    if (color || size) {
      eventData.contents = [{
        id: String(product._id || product.id),
        quantity: quantity,
        ...(color && { item_color: color }),
        ...(size && { item_size: size })
      }]
    }

    window.fbq('track', 'AddToCart', eventData)
  } catch (error) {
    console.error('Meta Pixel AddToCart tracking error:', error)
  }
}

/**
 * Track InitiateCheckout event when user starts checkout process
 * @param {Array} items - Array of cart items
 * @param {number} value - Total cart value (excluding shipping)
 */
export function trackInitiateCheckout(items = [], value = 0) {
  if (!isPixelLoaded() || !items.length) return
  
  try {
    const contentIds = items.map(item => String(item.productId || item.id))
    const numItems = items.reduce((sum, item) => sum + (item.qty || item.quantity || 1), 0)

    window.fbq('track', 'InitiateCheckout', {
      content_ids: contentIds,
      contents: items.map(item => ({
        id: String(item.productId || item.id),
        quantity: Number(item.qty || item.quantity || 1),
        ...(item.color && { item_color: item.color }),
        ...(item.size && { item_size: item.size })
      })),
      content_type: 'product',
      value: Number(value),
      currency: 'DZD',
      num_items: Number(numItems)
    })
  } catch (error) {
    console.error('Meta Pixel InitiateCheckout tracking error:', error)
  }
}

/**
 * Track Purchase event when order is completed
 * IMPORTANT: Only call this after payment is confirmed
 * @param {Object} orderData - Order data object
 * @param {string} orderData.orderId - Unique order ID
 * @param {Array} orderData.items - Array of order items
 * @param {number} orderData.total - Total order value (including shipping)
 * @param {number} [orderData.subtotal] - Subtotal (product value only)
 * @param {number} [orderData.shipping] - Shipping cost
 */
export function trackPurchase(orderData) {
  if (!isPixelLoaded() || !orderData) return
  
  try {
    const { orderId, items = [], total = 0 } = orderData

    const contentIds = items.map(item => String(item.productId || item.id))
    const numItems = items.reduce((sum, item) => sum + (item.qty || item.quantity || 1), 0)

    // Build purchase data with only validated parameters
    // Note: If you're still getting currency errors, you may need to configure
    // your Meta Pixel in Events Manager to accept the currency parameter
    const purchaseData = {
      value: Number(total),
      currency: 'DZD',
      content_type: 'product'
    }

    // Only add optional parameters if they have values
    if (contentIds.length > 0) {
      purchaseData.content_ids = contentIds
    }

    if (items.length > 0) {
      purchaseData.contents = items.map(item => ({
        id: String(item.productId || item.id),
        quantity: Number(item.qty || item.quantity || 1)
      }))
    }

    if (numItems > 0) {
      purchaseData.num_items = Number(numItems)
    }

    // Track the purchase event
    window.fbq('track', 'Purchase', purchaseData)
    
    // Also track order ID separately as custom parameter
    if (orderId) {
      window.fbq('trackCustom', 'OrderCompleted', {
        order_id: String(orderId),
        value: Number(total),
        currency: 'DZD'
      })
    }
    
    console.log('Purchase tracked:', purchaseData)
  } catch (error) {
    console.error('Meta Pixel Purchase tracking error:', error)
  }
}

/**
 * Track custom event
 * @param {string} eventName - Custom event name
 * @param {Object} eventData - Custom event data
 */
export function trackCustomEvent(eventName, eventData = {}) {
  if (!isPixelLoaded() || !eventName) return
  
  try {
    window.fbq('trackCustom', eventName, eventData)
  } catch (error) {
    console.error(`Meta Pixel ${eventName} tracking error:`, error)
  }
}
