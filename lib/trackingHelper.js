// Helper function to track user clicks
export async function trackClick(clickType, extraData = null) {
  try {
    const payload = { clickType };
    if (extraData) {
      payload.extraData = extraData;
    }
    
    const response = await fetch('/api/track-click', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      console.error('Failed to track click');
      return null;
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error tracking click:', error);
    return null;
  }
}

// Click types
export const CLICK_TYPES = {
  WHATSAPP_CONTACT: 'whatsapp_contact',
  ORDER_NOW: 'order_now',
  COMPLETE_ORDER: 'complete_order',
};
