/**
 * Custom Hook for Order Notifications
 * Polls for new orders and triggers notifications
 */

import { useEffect, useRef, useState } from 'react';
import { notifyNewOrder, requestNotificationPermission } from '@/lib/orderNotifications';

/**
 * Hook to monitor new orders and trigger notifications
 * @param {boolean} enabled - Whether to enable notifications
 * @param {number} pollInterval - How often to check for new orders (ms), default 30000 (30 seconds)
 * @returns {Object} Notification state and controls
 */
export function useOrderNotifications(enabled = true, pollInterval = 30000) {
  const [hasPermission, setHasPermission] = useState(false);
  const [lastOrderCount, setLastOrderCount] = useState(null);
  const [lastOrderId, setLastOrderId] = useState(null);
  const intervalRef = useRef(null);

  // Request notification permission on mount
  useEffect(() => {
    if (enabled) {
      requestNotificationPermission().then(granted => {
        setHasPermission(granted);
      });
    }
  }, [enabled]);

  // Poll for new orders
  useEffect(() => {
    if (!enabled) return;

    async function checkForNewOrders() {
      try {
        const res = await fetch('/api/orders?status=pending');
        if (res.ok) {
          const orders = await res.json();
          
          // Initialize on first check
          if (lastOrderCount === null) {
            setLastOrderCount(orders.length);
            if (orders.length > 0) {
              setLastOrderId(orders[0]._id);
            }
            return;
          }

          // Check if there's a new order
          if (orders.length > 0) {
            const latestOrder = orders[0]; // Orders are sorted by createdAt desc
            
            // New order detected if:
            // 1. Order count increased, OR
            // 2. The latest order ID is different from what we had
            if (orders.length > lastOrderCount || latestOrder._id !== lastOrderId) {
              console.log('🔔 New order detected:', latestOrder);
              
              // Trigger notification
              notifyNewOrder(latestOrder);
              
              // Update tracking
              setLastOrderCount(orders.length);
              setLastOrderId(latestOrder._id);
            }
          }
        }
      } catch (error) {
        console.error('Error checking for new orders:', error);
      }
    }

    // Initial check
    checkForNewOrders();

    // Set up polling interval
    intervalRef.current = setInterval(checkForNewOrders, pollInterval);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, pollInterval, lastOrderCount, lastOrderId]);

  return {
    hasPermission,
    requestPermission: requestNotificationPermission,
  };
}
