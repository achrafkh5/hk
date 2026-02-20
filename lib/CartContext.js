'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { trackAddToCart } from './metaPixelTracking';

const CartContext = createContext();

// Helper to read cart from localStorage
function getStoredCart() {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem('cart');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Error parsing cart:', e);
    }
  }
  return [];
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => getStoredCart());

  // Save cart to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Add item to cart
  function addToCart(product, quantity = 1, color = null, size = null) {
    // Use sale price if available, otherwise regular price
    const effectivePrice = product.salePrice || product.price;
    
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => item.productId === product._id && item.color === color && item.size === size
      );

      if (existingIndex >= 0) {
        // Update quantity if item exists with same color and size
        const updatedCart = [...prevCart];
        updatedCart[existingIndex].qty += quantity;
        return updatedCart;
      }

      // Add new item
      return [
        ...prevCart,
        {
          productId: product._id,
          name: product.name,
          price: effectivePrice,
          originalPrice: product.salePrice ? product.price : null,
          image: product.images?.[0] || null,
          qty: quantity,
          color: color,
          size: size,
        },
      ];
    });

    // Track AddToCart event for Meta Pixel
    trackAddToCart(product, quantity, color, size);
  }

  // Update item quantity
  function updateQuantity(productId, quantity, color = null, size = null) {
    if (quantity < 1) {
      removeFromCart(productId, color, size);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.productId === productId && item.color === color && item.size === size
          ? { ...item, qty: quantity }
          : item
      )
    );
  }

  // Remove item from cart
  function removeFromCart(productId, color = null, size = null) {
    setCart((prevCart) =>
      prevCart.filter((item) => !(item.productId === productId && item.color === color && item.size === size))
    );
  }

  // Clear cart
  function clearCart() {
    setCart([]);
  }

  // Get cart total
  function getCartTotal() {
    return cart.reduce((total, item) => total + item.price * item.qty, 0);
  }

  // Get cart item count
  function getCartCount() {
    return cart.reduce((count, item) => count + item.qty, 0);
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getCartTotal,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
