/**
 * Mobile Detection and Capability Checking
 */

/**
 * Detect if user is on mobile device
 * @returns {boolean} True if mobile device
 */
export function isMobileDevice() {
  if (typeof window === 'undefined') return false;
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Detect if user is on iOS device
 * @returns {boolean} True if iOS device
 */
export function isIOSDevice() {
  if (typeof window === 'undefined') return false;
  
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/**
 * Detect if user is on Android device
 * @returns {boolean} True if Android device
 */
export function isAndroidDevice() {
  if (typeof window === 'undefined') return false;
  
  return /Android/i.test(navigator.userAgent);
}

/**
 * Check if browser supports notifications
 * @returns {boolean} True if notifications are supported
 */
export function supportsNotifications() {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Get device type string
 * @returns {string} Device type
 */
export function getDeviceType() {
  if (isIOSDevice()) return 'iOS';
  if (isAndroidDevice()) return 'Android';
  if (isMobileDevice()) return 'Mobile';
  return 'Desktop';
}

/**
 * Check if notifications are likely to work on current device
 * @returns {Object} Support information
 */
export function checkNotificationSupport() {
  const deviceType = getDeviceType();
  const hasNotificationAPI = supportsNotifications();
  
  // iOS doesn't support Web Notifications API
  if (deviceType === 'iOS') {
    return {
      supported: false,
      deviceType,
      reason: 'iOS does not support web notifications',
      recommendation: 'Use a desktop browser for order notifications',
    };
  }
  
  // Android with notification API should work
  if (deviceType === 'Android' && hasNotificationAPI) {
    return {
      supported: true,
      deviceType,
      reason: 'Android Chrome supports notifications',
      recommendation: 'Make sure notifications are enabled in Android settings',
    };
  }
  
  // Desktop should work
  if (deviceType === 'Desktop' && hasNotificationAPI) {
    return {
      supported: true,
      deviceType,
      reason: 'Desktop browsers support notifications',
      recommendation: null,
    };
  }
  
  // Fallback
  return {
    supported: hasNotificationAPI,
    deviceType,
    reason: hasNotificationAPI 
      ? 'Browser supports notifications' 
      : 'Browser does not support notifications',
    recommendation: 'Try using Chrome or Firefox on desktop',
  };
}
