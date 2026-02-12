# 🔧 Notification Troubleshooting Guide

## Quick Diagnostics

### Testing Notifications (Desktop & Mobile)

1. **Go to Admin → Orders page**
2. **Enable notifications** (toggle on)
3. **Test buttons:**
   - 🔊 **Speaker icon** = Test sound only
   - 🐛 **Bug icon** = Test sound + popup notification

### What Should Happen:

#### ✅ Sound Test (Speaker Icon)
- You should hear a "ding" sound
- No popup appears
- Check console: "Playing notification sound"

#### ✅ Full Test (Bug Icon)  
- You should hear a "ding" sound
- Popup notification appears with test order
- Check console: "🔔 notifyNewOrder called"

---

## Common Issues & Solutions

### Issue 1: "Allow" Button Does Nothing on Phone

**Why this happens:**
- Mobile browsers block notification permissions until user interacts with page
- Some mobile browsers don't support notifications at all

**Solutions:**

#### For iPhone/iPad (Safari):
```
❌ Safari on iOS does NOT support Web Notifications API
✅ Solution: Use desktop browser or Android device
```

#### For Android (Chrome/Firefox):
1. **Tap the notification toggle** to turn it ON
2. **Tap "Allow" in the yellow warning banner**
3. Browser should show permission popup
4. Tap "Allow" in the browser's native popup

If nothing happens:
```
Settings → Apps → Chrome → Notifications → Enable
Then try again
```

---

### Issue 2: Notifications Not Working

#### Step 1: Check Browser Console
1. Open your admin page
2. Press **F12** (desktop) or enable developer tools (mobile)
3. Go to **Console** tab
4. Look for errors marked with ❌

#### Common Console Errors:

**"Not authenticated. Please refresh the page."**
```
Solution: You're not logged in as admin
1. Go to /admin/login
2. Log in
3. Go back to /admin/orders
```

**"Notification permission denied"**
```
Solution: Reset browser permissions
Chrome: Site Settings → Notifications → Reset
Firefox: Site Permissions → Notifications → Allow
```

**"Browser notifications not supported"**
```
Solution: Your browser doesn't support notifications
- iPhone Safari: NOT SUPPORTED
- Android Chrome: ✅ Supported
- Desktop Chrome/Firefox/Edge: ✅ Supported
```

---

### Issue 3: Sound Not Playing

#### Desktop:
1. Check system volume is not muted
2. Check browser tab is not muted (right-click tab → Unmute)
3. Click speaker icon 🔊 to test
4. Check console for "Playing notification sound"

#### Mobile:
1. **Silent mode:** Turn off silent/vibrate mode
2. **Volume:** Turn up media volume (not ringtone)
3. **Battery saver:** Disable battery saver mode
4. **Browser restrictions:** Some mobile browsers block audio
   - Android Chrome: Usually works ✅
   - iPhone Safari: May not work ❌

---

### Issue 4: Getting "Failed to check for new orders"

**Cause:** Authentication issue with orders API

**Solution:**
1. **Refresh the page** (Ctrl+R or Cmd+R)
2. **Clear cache:** Ctrl+Shift+R (Cmd+Shift+R on Mac)
3. **Log out and log back in:**
   ```
   /admin/login → Enter credentials → /admin/orders
   ```
4. **Check if you're on admin page:**
   - URL should be `/admin/orders`
   - Not `/orders` (different page)

---

### Issue 5: Permission Already Denied

If you accidentally clicked "Block" or "Deny":

#### Chrome (Desktop):
1. Click 🔒 padlock icon in address bar
2. Find **Notifications** → Change to **Allow**
3. Refresh page

#### Chrome (Android):
1. Tap ⋮ (three dots) → **Settings**
2. **Site settings** → **Notifications**
3. Find your site → Enable
4. Refresh page

#### Firefox (Desktop):
1. Click 🔒 padlock → **More information**
2. **Permissions** tab
3. **Notifications** → **Allow**
4. Refresh page

#### Edge (Desktop):
1. Click 🔒 padlock → **Permissions for this site**
2. **Notifications** → **Allow**
3. Refresh page

---

## Advanced Debugging

### Enable Detailed Logging

Open browser console and run:
```javascript
// See all notification events
localStorage.setItem('debugNotifications', 'true');
```

### Check Notification Permission Status

Open console and run:
```javascript
console.log('Permission:', Notification.permission);
console.log('Supported:', 'Notification' in window);
```

**Expected output:**
```
Permission: "granted"    // or "default" or "denied"
Supported: true
```

### Manually Trigger Test Notification

Open console and run:
```javascript
// Test sound
window.playNotificationSound?.();

// Test notification
new Notification('Test', { body: 'Testing notifications' });
```

---

## Mobile-Specific Limitations

### iOS (iPhone/iPad)
| Feature | Safari | Chrome | Firefox |
|---------|--------|--------|---------|
| Notifications | ❌ | ❌ | ❌ |
| Sound | ⚠️ Limited | ⚠️ Limited | ⚠️ Limited |

**Recommendation:** Use desktop browser for notifications

### Android
| Feature | Chrome | Firefox | Samsung Internet |
|---------|--------|---------|------------------|
| Notifications | ✅ | ✅ | ✅ |
| Sound | ✅ | ✅ | ⚠️ |

**Recommendation:** Chrome works best on Android

---

## Best Setup for Notifications

### Ideal Setup:
1. **Desktop computer** (Windows/Mac/Linux)
2. **Chrome, Firefox, or Edge** browser
3. **Admin page open** in dedicated tab
4. **Notifications enabled** in browser
5. **Volume turned up** (not muted)

### Alternative Setup (if desktop not available):
1. **Android tablet or phone**
2. **Chrome browser**
3. **Keep screen on** (adjust timeout in settings)
4. **Notifications enabled** system-wide
5. **Media volume up**

---

## Still Not Working?

### Checklist:

- [ ] I'm logged in as admin
- [ ] I'm on `/admin/orders` page (not `/orders`)
- [ ] Notification toggle is **ON** (green)
- [ ] Browser shows permission as **granted**
- [ ] I can see "🔔 You'll receive..." blue info message
- [ ] Test button (🔊) plays sound
- [ ] Console shows no ❌ errors
- [ ] Browser tab is not muted
- [ ] System volume is up

### If all checked and still not working:

1. **Try different browser:**
   - Install Chrome if using Safari
   - Try Firefox as alternative

2. **Check server:**
   ```
   Visit: /api/orders
   Should show: Order list (if logged in)
   Not: 401 error or "Unauthorized"
   ```

3. **Hard refresh:**
   ```
   Ctrl + Shift + R (Windows/Linux)
   Cmd + Shift + R (Mac)
   ```

4. **Clear everything:**
   ```
   1. Clear browser cache
   2. Clear cookies for your site
   3. Close all tabs
   4. Restart browser
   5. Log in again
   6. Enable notifications again
   ```

---

## Expected Behavior (When Working)

### Initial Setup:
1. Enable notification toggle → Browser asks permission
2. Click "Allow" → Permission granted
3. Blue info bar appears: "You'll receive notifications..."
4. Click test button → Hear sound

### When New Order Comes In:
1. Customer places order on your website
2. Within 30 seconds:
   - 🔊 Sound plays ("ding")
   - 🔔 Popup notification appears
   - Shows customer name and total
3. Notification auto-closes after 10 seconds

### Console Logs (Normal):
```
📊 Initial order count: 5
📊 Initial order count: 5
(waits 30 seconds)
🔔 New order detected! { customer: "Name", total: 1500 }
🔔 notifyNewOrder called: Name
✅ Notification shown successfully
```

---

## Contact Info

If you've tried everything and it's still not working, collect this info:

1. **Browser & Version:** (e.g., "Chrome 120 on Windows")
2. **Device:** (e.g., "iPhone 15" or "Windows PC")
3. **Console errors:** (screenshot or copy text)
4. **Permission status:** Result of `Notification.permission`
5. **URL you're on:** (should be `/admin/orders`)

Check your browser console for specific error messages that will help diagnose the issue!

---

**Last Updated:** February 2026
