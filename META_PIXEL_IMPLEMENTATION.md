# Meta Pixel Implementation Guide

## ✅ What Has Been Implemented

Your Next.js ecommerce store now has a **complete, production-ready Meta Pixel (Facebook Pixel) implementation** with comprehensive ecommerce tracking.

---

## 📁 Files Created/Modified

### New Files:
1. **`lib/metaPixelTracking.js`** - Tracking utility functions
   - Safe error handling
   - Support for multiple product name formats (string/object)
   - Comprehensive ecommerce event tracking

### Modified Files:
1. **`components/MetaPixel.js`** - Enhanced Meta Pixel component
   - Official Facebook Pixel initialization code
   - Automatic PageView tracking on route changes
   - NoScript fallback for users with JavaScript disabled
   - Environment variable validation

2. **`app/product/[slug]/page.js`** - Product page
   - Tracks `ViewContent` when user views a product

3. **`lib/CartContext.js`** - Cart provider
   - Tracks `AddToCart` when user adds items

4. **`app/checkout/page.js`** - Checkout page
   - Tracks `InitiateCheckout` when checkout starts
   - Stores order data for Purchase tracking

5. **`app/order-success/page.js`** - Order success page
   - Tracks `Purchase` after successful order
   - Prevents duplicate tracking on page refresh

---

## 📊 Events Currently Tracked

### 1. **PageView** (Automatic)
- Fires on every route change
- Handled by the MetaPixel component

### 2. **ViewContent** (Product Page)
- When: User views a product detail page
- Data tracked:
  - Product ID
  - Product name (supports multilingual)
  - Price
  - Currency (DZD)
  - Content type

### 3. **AddToCart** (Product, Cart Actions)
- When: User adds item to cart
- Data tracked:
  - Product ID
  - Product name
  - Price × Quantity
  - Currency (DZD)
  - Quantity
  - Color variant (if selected)
  - Size variant (if selected)

### 4. **InitiateCheckout** (Checkout Page)
- When: User reaches checkout page
- Data tracked:
  - All product IDs in cart
  - Product details with variants
  - Total cart value (excluding shipping)
  - Currency (DZD)
  - Total number of items

### 5. **Purchase** (Order Success)
- When: Order successfully completed
- Data tracked:
  - Order ID
  - All products with quantities
  - Total order value (including shipping)
  - Subtotal (products only)
  - Shipping cost
  - Currency (DZD)
  - Number of items
- **Important**: Only fires once per order (uses sessionStorage)

---

## 🔒 Safety Features

1. **Environment Variable Check**
   - Component won't render if `NEXT_PUBLIC_META_PIXEL_ID` is missing
   - Console warning alerts you to configuration issues

2. **Error Handling**
   - All tracking functions wrapped in try-catch blocks
   - Graceful failure if fbq is not loaded
   - Detailed error logging for debugging

3. **Duplicate Prevention**
   - Purchase event only fires once per order
   - Uses sessionStorage to prevent tracking on page refresh

4. **Type Safety**
   - Handles both string and object product names
   - Validates data before sending to Facebook

---

## 🎯 How It Works

### Flow Example:

```
1. User visits site → PageView tracked
                    ↓
2. User views product → ViewContent tracked
                    ↓
3. User adds to cart → AddToCart tracked
                    ↓
4. User goes to checkout → InitiateCheckout tracked
                    ↓
5. User completes order → Order data stored in sessionStorage
                    ↓
6. User redirected to success page → Purchase tracked
                    ↓
7. sessionStorage cleared → No duplicate tracking on refresh
```

---

## 🧪 Testing Your Implementation

### 1. **Install Meta Pixel Helper (Chrome Extension)**
   - Download: [Meta Pixel Helper](https://chrome.google.com/webstore/detail/meta-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc)
   - This shows pixel events in real-time

### 2. **Test Each Event**

**Testing PageView:**
```
1. Navigate between pages on your site
2. Pixel Helper should show "PageView" on each navigation
```

**Testing ViewContent:**
```
1. Open any product page
2. Pixel Helper should show "ViewContent" with product details
```

**Testing AddToCart:**
```
1. Add a product to cart
2. Pixel Helper should show "AddToCart" with product and quantity
```

**Testing InitiateCheckout:**
```
1. Navigate to /checkout
2. Pixel Helper should show "InitiateCheckout" with cart items
```

**Testing Purchase:**
```
1. Complete a test order
2. On success page, Pixel Helper should show "Purchase" with order details
3. Refresh the page - Purchase should NOT fire again
```

### 3. **Check Facebook Events Manager**
   - Go to: [Facebook Events Manager](https://business.facebook.com/events_manager)
   - Select your pixel
   - View real-time events (may take 20-60 seconds to appear)
   - Check event details match expected data

### 4. **Test Error Handling**
```javascript
// In browser console, temporarily disable fbq
window.fbq = undefined;

// Navigate around - no errors should appear in console
// Pixel events will be skipped gracefully
```

---

## 🚀 Next Steps & Recommendations

### 1. **Set Up Conversions in Facebook Ads Manager**

To use your tracked events in Facebook Ads:

1. Go to [Facebook Events Manager](https://business.facebook.com/events_manager)
2. Select your Pixel
3. Navigate to "Aggregated Event Measurement"
4. Configure your events priority for iOS 14.5+ tracking
5. Recommended priority order:
   - **Priority 1**: Purchase (most valuable)
   - **Priority 2**: InitiateCheckout
   - **Priority 3**: AddToCart
   - **Priority 4**: ViewContent

### 2. **Create Custom Conversions**

For advanced campaign optimization:

1. In Events Manager, click "Custom Conversions"
2. Create conversions for specific scenarios:
   - High-value purchases (orders > 10,000 DZD)
   - Specific product categories
   - Repeat customers

### 3. **Implement Conversions API (CAPI)** ⭐ **Highly Recommended**

**Why CAPI is Important:**

With iOS 14.5+ and browser privacy changes (ad blockers, cookie restrictions), client-side tracking (browser-based) is becoming less reliable. **Conversions API (CAPI)** sends events directly from your server to Facebook, making tracking more accurate.

**Benefits:**
- ✅ **Higher Match Rates**: More accurate attribution
- ✅ **Better Performance**: Facebook algorithms optimize better with more data
- ✅ **Ad Blocker Proof**: Events sent from server can't be blocked
- ✅ **iOS 14.5+ Resilient**: Bypasses browser tracking limitations
- ✅ **Reduced Event Loss**: Backup when browser pixel fails

**How to Implement CAPI in Your Next.js Store:**

#### Step 1: Install Facebook Business SDK
```bash
npm install facebook-nodejs-business-sdk
```

#### Step 2: Get Your CAPI Access Token
1. Go to [Facebook Events Manager](https://business.facebook.com/events_manager)
2. Select your Pixel → Settings → Conversions API
3. Generate Access Token
4. Add to `.env.local`:
```env
META_CAPI_ACCESS_TOKEN=your_access_token_here
# Keep your existing:
# NEXT_PUBLIC_META_PIXEL_ID=788654360931902
```

#### Step 3: Create CAPI Helper (`lib/metaPixelCAPI.js`)

```javascript
// lib/metaPixelCAPI.js
import bizSdk from 'facebook-nodejs-business-sdk';

const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

const ServerEvent = bizSdk.ServerEvent;
const EventRequest = bizSdk.EventRequest;
const UserData = bizSdk.UserData;
const CustomData = bizSdk.CustomData;
const Content = bizSdk.Content;

/**
 * Send server-side event to Facebook Conversions API
 * @param {string} eventName - Event name (Purchase, ViewContent, etc.)
 * @param {Object} userData - User information
 * @param {Object} customData - Event-specific data
 * @param {string} sourceUrl - Page URL where event occurred
 */
export async function sendCAPIEvent(eventName, userData = {}, customData = {}, sourceUrl) {
  if (!accessToken || !pixelId) {
    console.warn('Meta CAPI not configured');
    return;
  }

  try {
    const userDataObj = new UserData()
      .setClientIpAddress(userData.ip)
      .setClientUserAgent(userData.userAgent)
      .setFbc(userData.fbc) // Facebook click ID from cookie
      .setFbp(userData.fbp); // Facebook browser ID from cookie

    // Add email/phone if available (hashed)
    if (userData.email) {
      userDataObj.setEmail(userData.email);
    }
    if (userData.phone) {
      userDataObj.setPhone(userData.phone);
    }

    const customDataObj = new CustomData()
      .setValue(customData.value)
      .setCurrency(customData.currency || 'DZD');

    if (customData.contentIds) {
      customDataObj.setContentIds(customData.contentIds);
    }
    if (customData.contents) {
      customDataObj.setContents(customData.contents.map(c => 
        new Content()
          .setId(c.id)
          .setQuantity(c.quantity)
      ));
    }
    if (customData.contentType) {
      customDataObj.setContentType(customData.contentType);
    }
    if (customData.numItems) {
      customDataObj.setNumItems(customData.numItems);
    }

    const serverEvent = new ServerEvent()
      .setEventName(eventName)
      .setEventTime(Math.floor(Date.now() / 1000))
      .setUserData(userDataObj)
      .setCustomData(customDataObj)
      .setEventSourceUrl(sourceUrl)
      .setActionSource('website');

    const eventsData = [serverEvent];
    const eventRequest = new EventRequest(accessToken, pixelId)
      .setEvents(eventsData);

    const response = await eventRequest.execute();
    console.log('CAPI Event sent:', eventName, response);
    
    return response;
  } catch (error) {
    console.error('CAPI Error:', error);
  }
}

/**
 * Extract user data from Next.js request
 * @param {NextRequest} request - Next.js request object
 */
export function getUserDataFromRequest(request) {
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             request.ip;
  
  const userAgent = request.headers.get('user-agent');
  
  // Get _fbc and _fbp from cookies
  const cookies = request.cookies;
  const fbc = cookies.get('_fbc')?.value;
  const fbp = cookies.get('_fbp')?.value;

  return {
    ip,
    userAgent,
    fbc,
    fbp
  };
}
```

#### Step 4: Modify Your Orders API Route

Update `app/api/orders/route.js` to send CAPI Purchase event:

```javascript
import { NextResponse } from 'next/server';
import { sendCAPIEvent, getUserDataFromRequest } from '@/lib/metaPixelCAPI';
// ... your existing imports

export async function POST(request) {
  try {
    const body = await request.json();
    // ... your existing order creation logic
    
    const order = await ordersCollection.insertOne(orderDocument);
    
    // Send CAPI Purchase event
    const userData = getUserDataFromRequest(request);
    userData.email = body.customer.email; // if you collect it
    userData.phone = body.customer.phone;
    
    await sendCAPIEvent(
      'Purchase',
      userData,
      {
        value: body.total,
        currency: 'DZD',
        contentIds: body.items.map(i => String(i.productId)),
        contents: body.items.map(i => ({
          id: String(i.productId),
          quantity: i.qty
        })),
        contentType: 'product',
        numItems: body.items.reduce((sum, i) => sum + i.qty, 0)
      },
      `${process.env.NEXTAUTH_URL}/order-success`
    );

    return NextResponse.json(order);
  } catch (error) {
    console.error('Order error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
```

#### Step 5: Test CAPI in Events Manager

1. Place a test order
2. Go to Events Manager → Test Events
3. You should see events coming from both:
   - **Browser** (from MetaPixel.js)
   - **Server** (from CAPI)

#### Benefits You'll See:

- **Event Match Quality Score** improves (check Events Manager)
- **Better Ad Performance** due to more accurate data
- **More Conversions Attributed** to your ads
- **Lower Cost Per Purchase** over time

---

## 🔍 Troubleshooting

### Pixel Not Loading
```javascript
// Check if pixel ID is set
console.log(process.env.NEXT_PUBLIC_META_PIXEL_ID); // Should show your ID

// Check if fbq is available
console.log(typeof window.fbq); // Should be "function"
```

### Events Not Firing
- Check browser console for errors
- Verify Meta Pixel Helper shows the pixel is active
- Ensure you're not using an ad blocker during testing

### Purchase Tracking Multiple Times
- Should not happen due to sessionStorage clearing
- If it does, check browser console for errors

### Product Names Not Showing Correctly
- The tracking handles both `product.name` as string or object
- For multilingual: `{ en: "Product Name", ar: "اسم المنتج" }`
- System will try `en` first, then `ar`, then fallback to "Product"

---

## 📞 Support & Resources

- **Meta Pixel Documentation**: https://developers.facebook.com/docs/meta-pixel
- **Events Manager**: https://business.facebook.com/events_manager
- **Conversions API Docs**: https://developers.facebook.com/docs/marketing-api/conversions-api
- **Meta Pixel Helper**: Chrome extension for testing

---

## ✨ Summary

Your implementation is **production-ready** and includes:

✅ Proper initialization with official Facebook code  
✅ Automatic PageView tracking  
✅ Complete ecommerce conversion funnel tracking  
✅ Error handling and safety checks  
✅ Multi-language support  
✅ Variant tracking (colors, sizes)  
✅ Duplicate prevention  
✅ NoScript fallback  

**Next Priority**: Implement Conversions API (CAPI) for improved tracking reliability and ad performance!

---

*Last Updated: February 12, 2026*
