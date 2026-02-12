/**
 * Meta Pixel Purchase Event Test
 * 
 * Open your browser console and paste this code to test if the Purchase event
 * works with your current pixel configuration.
 * 
 * This will help determine if the issue is in the code or in Facebook Events Manager settings.
 */

// Test 1: Minimal Purchase (only required parameters)
console.log('🧪 Test 1: Minimal Purchase Event (value + currency only)');
if (typeof window.fbq !== 'undefined') {
  window.fbq('track', 'Purchase', {
    value: 100,
    currency: 'DZD'
  });
  console.log('✅ Sent: Purchase with value=100, currency=DZD');
} else {
  console.error('❌ fbq not loaded');
}

// Wait 2 seconds
setTimeout(() => {
  // Test 2: Purchase with standard parameters
  console.log('\n🧪 Test 2: Purchase Event with standard parameters');
  if (typeof window.fbq !== 'undefined') {
    window.fbq('track', 'Purchase', {
      value: 200,
      currency: 'DZD',
      content_type: 'product',
      content_ids: ['test123'],
      num_items: 1
    });
    console.log('✅ Sent: Purchase with all standard parameters');
  }
}, 2000);

// Wait 4 seconds
setTimeout(() => {
  // Test 3: Purchase without currency (to test if that's the issue)
  console.log('\n🧪 Test 3: Purchase Event WITHOUT currency');
  if (typeof window.fbq !== 'undefined') {
    window.fbq('track', 'Purchase', {
      value: 300,
      content_type: 'product'
    });
    console.log('✅ Sent: Purchase WITHOUT currency parameter');
  }
}, 4000);

// Wait 6 seconds
setTimeout(() => {
  // Test 4: Try with USD currency
  console.log('\n🧪 Test 4: Purchase Event with USD currency');
  if (typeof window.fbq !== 'undefined') {
    window.fbq('track', 'Purchase', {
      value: 400,
      currency: 'USD'
    });
    console.log('✅ Sent: Purchase with currency=USD');
  }
}, 6000);

setTimeout(() => {
  console.log('\n📊 Test Complete!');
  console.log('Check your Meta Pixel Helper extension to see which events were accepted.');
  console.log('Check Facebook Events Manager → Test Events to see which ones arrived.');
  console.log('\nIf Test 3 (without currency) works but others don\'t, there\'s an Events Manager configuration issue.');
  console.log('If Test 4 (USD) works but DZD doesn\'t, check your Business Manager currency settings.');
}, 8000);

/**
 * INSTRUCTIONS:
 * 
 * 1. Open your website (http://localhost:3000 or your production URL)
 * 2. Open browser DevTools (F12)
 * 3. Go to Console tab
 * 4. Copy and paste this entire file content
 * 5. Press Enter
 * 6. Wait 10 seconds and observe the results
 * 7. Check Meta Pixel Helper (Chrome extension) - look for Purchase events
 * 8. Check Facebook Events Manager → Test Events (within 1 minute)
 * 
 * WHAT TO LOOK FOR:
 * - If all 4 tests work: No issue with code or pixel
 * - If Test 3 works but Test 1 doesn't: Currency parameter issue in Events Manager
 * - If Test 4 works but Test 1 doesn't: DZD currency not accepted (use USD or business default)
 * - If none work: Pixel not properly initialized or blocked by ad blocker
 */
