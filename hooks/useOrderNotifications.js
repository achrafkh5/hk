/**
 * Custom Hook for Order Notifications
 * Polls for new orders and triggers notifications
 */

import { useEffect, useRef, useState } from 'react';
import { notifyNewOrder, requestNotificationPermission, getNotificationPermission } from '@/lib/orderNotifications';

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
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  // Check notification permission on mount and when enabled changes
  useEffect(() => {
    if (enabled) {
      const currentPermission = getNotificationPermission();
      setHasPermission(currentPermission === 'granted');
      
      if (currentPermission === 'default') {
        // Auto-request permission
        requestNotificationPermission().then(granted => {
          setHasPermission(granted);
          if (!granted) {
            setError('Notification permission denied');
          }
        }).catch(err => {
          console.error('Error requesting notification permission:', err);
          setError('Failed to request notification permission');
        });
      }
    }
  }, [enabled]);

  // Poll for new orders
  useEffect(() => {
    if (!enabled) {
      setError(null);
      return;
    }

    async function checkForNewOrders() {
      try {
        const res = await fetch('/api/orders?status=pending', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            setError('Not authenticated. Please refresh the page.');
            console.error('Orders API: Authentication required');
            return;
          }
          throw new Error(`Failed to fetch orders: ${res.status}`);
        }
        
        const orders = await res.json();
        
        // Clear any previous errors
        setError(null);
        
        // Initialize on first check
        if (lastOrderCount === null) {
          console.log('📊 Initial order count:', orders.length);
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
            console.log('🔔 New order detected!', {
              customer: latestOrder.customer?.name,
              total: latestOrder.total,
              id: latestOrder._id
            });
            
            // Trigger notification
            notifyNewOrder(latestOrder);
            
            // Update tracking
            setLastOrderCount(orders.length);
            setLastOrderId(latestOrder._id);
          }
        }
      } catch (error) {
        console.error('❌ Error checking for new orders:', error);
        setError(error.message || 'Failed to check for new orders');
      }
    }

    // Initial check after a short delay
    const initialTimeout = setTimeout(() => {
      checkForNewOrders();
    }, 1000);

    // Set up polling interval
    intervalRef.current = setInterval(checkForNewOrders, pollInterval);

    // Cleanup
    return () => {
      clearTimeout(initialTimeout);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, pollInterval, lastOrderCount, lastOrderId]);

  return {
    hasPermission,
    requestPermission: requestNotificationPermission,
    error,
  };
}
