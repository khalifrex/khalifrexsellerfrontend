// context/CartContext.js
"use client";
import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItemCount, setCartItemCount] = useState(0);

  // Load cart count when app starts
  useEffect(() => {
    async function fetchCart() {
      try {
        const res = await fetch("http://localhost:3092/cart", { credentials: "include" });
        const data = await res.json();
        const items = data?.cart?.items || [];
        const count = items.reduce((acc, item) => acc + (item.quantity || 1), 0);
        setCartItemCount(count);
      } catch (err) {
        console.error("Failed to fetch cart", err);
      }
    }
    fetchCart();
  }, []);

  const updateCartCount = (newCount) => setCartItemCount(newCount);

  const incrementCartCount = (by = 1) =>
    setCartItemCount((prev) => prev + by);

  const decrementCartCount = (by = 1) =>
    setCartItemCount((prev) => Math.max(prev - by, 0));

  return (
    <CartContext.Provider
      value={{
        cartItemCount,
        setCartItemCount,
        updateCartCount,
        incrementCartCount,
        decrementCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
