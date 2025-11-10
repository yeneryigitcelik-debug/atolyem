"use client";

import { useState, useEffect, useActionState } from "react";
import { addToCart, type AddToCartResult } from "@/app/cart/actions";

interface AddToCartButtonProps {
  variantId: string;
  stock: number;
  disabled?: boolean;
}

export default function AddToCartButton({ variantId, stock, disabled }: AddToCartButtonProps) {
  const [state, formAction] = useActionState<AddToCartResult | null, FormData>(addToCart, null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Başarı mesajını göster
  useEffect(() => {
    if (state?.success) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [state?.success]);

  const isDisabled = disabled || stock === 0;

  return (
    <div className="flex flex-col gap-2">
      <form action={formAction}>
        <input type="hidden" name="variantId" value={variantId} />
        <input type="hidden" name="qty" value="1" />
        <button
          type="submit"
          disabled={isDisabled}
          className="rounded-md bg-primary px-4 py-2 text-sm text-white hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {stock > 0 ? "Sepete Ekle" : "Stokta Yok"}
        </button>
      </form>
      {state?.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}
      {showSuccess && (
        <p className="text-sm text-green-600">Ürün sepete eklendi!</p>
      )}
    </div>
  );
}

