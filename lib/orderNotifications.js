/**
 * Order Notification System
 * Handles sound alerts and browser notifications for new orders
 */

/**
 * Generate and play notification sound using Web Audio API
 * Creates a pleasant "ding" sound
 */
export function playNotificationSound() {
  if (typeof window === 'undefined') return;

  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create oscillators for a pleasant notification sound
    const oscillator1 = audioContext.createOscillator();
    const oscillator2 = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Connect nodes
    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Set sound frequencies (pleasant bell-like tone)
    oscillator1.frequency.value = 800; // Higher tone
    oscillator2.frequency.value = 1000; // Even higher tone
    oscillator1.type = 'sine';
    oscillator2.type = 'sine';
    
    // Set volume envelope (fade in and out)
    const currentTime = audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, currentTime + 0.01); // Quick fade in
    gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.5); // Fade out
    
    // Play sound
    oscillator1.start(currentTime);
    oscillator2.start(currentTime);
    
    // Stop after 0.5 seconds
    oscillator1.stop(currentTime + 0.5);
    oscillator2.stop(currentTime + 0.5);
    
    // Clean up
    setTimeout(() => {
      audioContext.close();
    }, 600);
  } catch (error) {
    console.error('Error playing notification sound:', error);
  }
}

/**
 * Request browser notification permission
 * @returns {Promise<boolean>} True if permission granted
 */
export async function requestNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.warn('Browser notifications not supported');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

/**
 * Show browser notification for new order
 * @param {Object} order - Order details
 */
export function showOrderNotification(order) {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return;
  }

  if (Notification.permission === 'granted') {
    const customerName = order.customer?.name || 'Customer';
    const total = order.total || 0;
    
    const notification = new Notification('🛒 New Order Received!', {
      body: `From: ${customerName}\nTotal: ${total.toFixed(2)} DA`,
      icon: '/favicon.ico', // You can customize this
      badge: '/favicon.ico',
      tag: `order-${order._id}`, // Prevents duplicate notifications
      requireInteraction: false,
      silent: false, // Let the notification make its default sound too
    });

    // Auto close after 10 seconds
    setTimeout(() => {
      notification.close();
    }, 10000);

    // Optional: Click to focus the window
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }
}

/**
 * Play notification sound and show browser notification
 * @param {Object} order - Order details
 */
export function notifyNewOrder(order) {
  // Play sound
  playNotificationSound();
  
  // Show browser notification
  showOrderNotification(order);
}

/**
 * Get notification permission status
 * @returns {string} 'granted', 'denied', or 'default'
 */
export function getNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}
