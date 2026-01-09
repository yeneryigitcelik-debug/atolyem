"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";

interface CartContextType {
  cartCount: number;
  refreshCart: () => Promise<void>;
  incrementCart: () => void;
  decrementCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [cartCount, setCartCount] = useState(0);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCartCount(0);
      return;
    }

    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        const items = data.cart?.items || [];
        setCartCount(items.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0));
      }
    } catch (err) {
      console.error("Error fetching cart:", err);
    }
  }, [user]);

  const incrementCart = useCallback(() => {
    setCartCount(prev => prev + 1);
  }, []);

  const decrementCart = useCallback(() => {
    setCartCount(prev => Math.max(0, prev - 1));
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  return (
    <CartContext.Provider value={{ cartCount, refreshCart, incrementCart, decrementCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}


