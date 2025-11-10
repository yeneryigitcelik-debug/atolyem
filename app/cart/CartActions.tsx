"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { updateCartItem, removeFromCart } from "./actions";

interface CartActionsProps {
  itemId: string;
  currentQty: number;
  maxStock: number;
  priceCents: number;
}

export default function CartActions({ itemId, currentQty, maxStock, priceCents }: CartActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [optimisticQty, setOptimisticQty] = useState<number | null>(null);

  const handleUpdateQty = async (newQty: number) => {
    if (newQty < 1) {
      await handleRemove();
      return;
    }
    if (newQty > maxStock) {
      setError(`Maksimum stok: ${maxStock} adet`);
      return;
    }

    setError(null);
    setOptimisticQty(newQty); // Optimistic update

    startTransition(async () => {
      try {
        await updateCartItem(itemId, newQty);
        router.refresh();
      } catch (err: any) {
        setError(err.message || "Güncelleme başarısız oldu");
        setOptimisticQty(null); // Revert optimistic update
      }
    });
  };

  const handleRemove = async () => {
    setError(null);

    startTransition(async () => {
      try {
        await removeFromCart(itemId);
        router.refresh();
      } catch (err: any) {
        setError(err.message || "Silme işlemi başarısız oldu");
      }
    });
  };

  const displayQty = optimisticQty ?? currentQty;

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleUpdateQty(displayQty - 1)}
            disabled={isPending || displayQty <= 1}
            className="rounded border border-gray-300 px-2 py-1 text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Miktarı azalt"
          >
            -
          </button>
          <span className={`w-8 text-center text-sm ${optimisticQty !== null ? "opacity-70" : ""}`}>
            {displayQty}
          </span>
          <button
            onClick={() => handleUpdateQty(displayQty + 1)}
            disabled={isPending || displayQty >= maxStock}
            className="rounded border border-gray-300 px-2 py-1 text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Miktarı artır"
          >
            +
          </button>
          {displayQty >= maxStock && (
            <span className="text-xs text-orange-600">Maksimum stok: {maxStock}</span>
          )}
        </div>
        <div className={`font-medium ${optimisticQty !== null ? "opacity-70" : ""}`}>
          {((priceCents * displayQty) / 100).toLocaleString("tr-TR")} TL
        </div>
        <button
          onClick={handleRemove}
          disabled={isPending}
          className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Ürünü kaldır"
        >
          Sil
        </button>
      </div>
      {error && (
        <div className="mt-2 rounded-md bg-red-50 border border-red-200 p-2">
          <p className="text-xs text-red-800">{error}</p>
        </div>
      )}
    </div>
  );
}

