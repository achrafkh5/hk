# Order Notification System 🔔

## Overview
Your admin panel now has a **real-time notification system with sound** that alerts you whenever a new order is placed!

## Features

### ✅ What's Included

1. **🔊 Sound Alert** - Pleasant notification sound plays when new order arrives
2. **🔔 Browser Notifications** - Desktop notification with order details
3. **⚙️ Toggle Control** - Easy on/off switch for notifications
4. **🧪 Test Button** - Test the notification sound anytime
5. **💾 Persistent Settings** - Your preferences are saved in browser
6. **🔄 Auto-Polling** - Checks for new orders every 30 seconds

---

## How to Use

### Step 1: Enable Notifications

1. Go to **Admin → Orders** page
2. Look for the **"Order Alerts"** toggle in the top right
3. Click to enable notifications
4. Your browser will ask for notification permission - **click "Allow"**

### Step 2: Test the Sound

1. Click the **speaker icon** (🔊) next to the toggle
2. You should hear a pleasant "ding" sound
3. This is the sound you'll hear when new orders arrive

### Step 3: Keep the Admin Page Open

- As long as the Orders page is open in your browser, you'll receive notifications
- New orders are checked every **30 seconds**
- You can minimize the browser - notifications will still work!

---

## What Happens When a New Order Arrives?

1. **🔊 Sound Notification** - A pleasant "ding" sound plays
2. **🔔 Desktop Notification** - A popup appears showing:
   - "New Order Received!"
   - Customer name
   - Order total

3. **📋 Notification stays for 10 seconds** then auto-closes

---

## Settings & Controls

### Order Alerts Toggle
- **ON (Green icon)** 🟢 - Notifications enabled, you'll be alerted
- **OFF (Grey icon)** ⚪ - Notifications disabled, silent mode

### Test Sound Button (Speaker Icon)
- Click to test the notification sound
- Helps verify your volume is comfortable
- No need to wait for a real order to test!

---

## Technical Details

### Files Created

1. **`lib/orderNotifications.js`**
   - Sound generation using Web Audio API
   - Browser notification handlers
   - Permission management

2. **`hooks/useOrderNotifications.js`**
   - Custom React hook for polling orders
   - Detects new orders automatically
   - Manages notification state

3. **`app/admin/orders/page.js`** (Updated)
   - Added notification toggle UI
   - Integrated notification system
   - Added test button

### How It Works

```
Every 30 seconds:
  ↓
Check for new pending orders
  ↓
Compare with last known order
  ↓
New order detected?
  ↓
YES → Play sound + Show notification
NO  → Continue monitoring
```

### Browser Notification Example

```
┌─────────────────────────────────┐
│ 🛒 New Order Received!          │
│                                 │
│ From: Ahmed Benali              │
│ Total: 2500.00 DA              │
└─────────────────────────────────┘
```

---

## Troubleshooting

### Not receiving notifications?

**Check 1: Notifications Enabled?**
- Make sure the toggle is ON (green)
- Look for the active notification info banner

**Check 2: Browser Permission**
- If you see a yellow warning, click "Allow" button
- Or check browser settings → Site permissions → Notifications

**Check 3: Sound Working?**
- Click the test button (speaker icon)
- If no sound, check:
  - Computer volume is not muted
  - Browser tab is not muted
  - Browser has permission to play sound

**Check 4: Browser Tab Active?**
- Keep the Orders page open
- Minimize is OK, but don't close the tab

### Permission blocked?

If you accidentally blocked notifications:

**Chrome/Edge:**
1. Click the lock icon 🔒 in address bar
2. Find "Notifications" → Select "Allow"
3. Refresh the page

**Firefox:**
1. Click the shield icon in address bar
2. Permissions → Notifications → Allow
3. Refresh the page

**Safari:**
1. Safari menu → Preferences → Websites  
2. Notifications → Find your site → Allow
3. Refresh the page

---

## Customization Options

### Change Check Interval

Edit `app/admin/orders/page.js` line ~32:

```javascript
const { hasPermission, requestPermission } = useOrderNotifications(
  notificationsEnabled,
  30000 // ← Change this (milliseconds)
);
```

Common values:
- `15000` = 15 seconds (more frequent)
- `30000` = 30 seconds (balanced)
- `60000` = 1 minute (less frequent)

⚠️ **Note:** More frequent checks = more server requests

### Modify Sound

Edit `lib/orderNotifications.js` function `playNotificationSound()`:

```javascript
oscillator1.frequency.value = 800;  // ← Lower = deeper
oscillator2.frequency.value = 1000; // ← Higher = brighter
```

Try these presets:
- **Gentle:** `600, 750`
- **Default:** `800, 1000`
- **Bright:** `1000, 1200`
- **Deep:** `400, 500`

---

## Privacy & Performance

### ✅ Privacy
- No data is sent to external servers
- All notifications are local to your browser
- Order data stays in your MongoDB database

### ✅ Performance
- Minimal bandwidth usage (~1 API call per 30 seconds)
- Sound generated in real-time (no audio files loaded)
- Efficient polling with optimized queries
- No impact when notifications are disabled

---

## Best Practices

1. **Keep a dedicated admin tab open** during business hours
2. **Test the sound** when you first set it up
3. **Adjust your volume** to a comfortable level
4. **Don't disable browser notifications** accidentally
5. **Refresh the page** if notifications stop working

---

## FAQ

**Q: Will I get notified if the browser is minimized?**  
A: Yes! Desktop notifications work even when browser is minimized.

**Q: What if I have multiple admin tabs open?**  
A: Each tab will notify independently. For best experience, keep one admin tab open.

**Q: Do notifications work on mobile?**  
A: Browser notifications may not work on mobile Safari. Sound may work depending on mobile browser.

**Q: Can I customize the notification message?**  
A: Yes, edit the `showOrderNotification()` function in `lib/orderNotifications.js`

**Q: Will this drain my battery?**  
A: Minimal impact. The polling is lightweight and only checks when the page is open.

**Q: What happens to old notifications?**  
A: They auto-close after 10 seconds to avoid clutter.

---

## Support

If you encounter any issues:
1. Check the browser console for error messages
2. Verify browser notification permissions
3. Test with the speaker button first
4. Try refreshing the admin page

---

**Enjoy your new notification system! 🎉**  
*No more missed orders!*
