"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

interface AddToCartButtonProps {
  listingId?: string;
  variantId?: string;
  quantity?: number;
  className?: string;
  disabled?: boolean;
}

export default function AddToCartButton({
  listingId,
  variantId,
  quantity = 1,
  className = "",
  disabled: externalDisabled = false,
}: AddToCartButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const handleAddToCart = async () => {
    if (!user) {
      router.push("/hesap");
      return;
    }

    if (!listingId || isAdding || externalDisabled) return;

    setIsAdding(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          variantId: variantId || undefined,
          quantity,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        setToastMessage(error.error || "Sepete eklenirken bir hata oluştu");
      } else {
        setToastMessage("Sepete eklendi");
      }
    } catch (err) {
      setToastMessage("Bir hata oluştu");
    } finally {
      setIsAdding(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
  };

  if (!listingId) {
    return null;
  }

  return (
    <>
      <button
        onClick={handleAddToCart}
        disabled={isAdding || externalDisabled}
        className={`w-full py-4 bg-primary hover:bg-primary-dark disabled:bg-primary/50 disabled:cursor-not-allowed text-white font-semibold rounded-md transition-colors flex items-center justify-center gap-2 ${className}`}
      >
        {isAdding ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Ekleniyor...
          </>
        ) : (
          <>
            <span className="material-symbols-outlined">shopping_bag</span>
            Sepete Ekle
          </>
        )}
      </button>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <div className="px-4 py-3 bg-text-charcoal text-white rounded-lg shadow-xl flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">
              {toastMessage.includes("eklendi") ? "check_circle" : "error"}
            </span>
            {toastMessage}
          </div>
        </div>
      )}
    </>
  );
}


