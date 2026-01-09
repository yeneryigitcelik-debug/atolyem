"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useRouter } from "next/navigation";

interface AddToCartButtonProps {
  listingId?: string;
  variantId?: string;
  quantity?: number;
  className?: string;
  disabled?: boolean;
  isOwnProduct?: boolean;
  outOfStock?: boolean;
  size?: "default" | "small";
}

export default function AddToCartButton({
  listingId,
  variantId,
  quantity = 1,
  className = "",
  disabled: externalDisabled = false,
  isOwnProduct = false,
  outOfStock = false,
  size = "default",
}: AddToCartButtonProps) {
  const { user } = useAuth();
  const { incrementCart } = useCart();
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastSuccess, setToastSuccess] = useState(false);

  const isDisabled = isAdding || externalDisabled || isOwnProduct || outOfStock;

  const handleAddToCart = async () => {
    if (!user) {
      router.push("/hesap");
      return;
    }

    if (!listingId || isDisabled) return;

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
        const errorMessage = error.error?.message || error.error || "Sepete eklenirken bir hata oluştu";
        setToastMessage(errorMessage);
        setToastSuccess(false);
      } else {
        setToastMessage("Sepete eklendi");
        setToastSuccess(true);
        // Update cart count in context
        incrementCart();
      }
    } catch {
      setToastMessage("Bir hata oluştu");
      setToastSuccess(false);
    } finally {
      setIsAdding(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  if (!listingId) {
    return null;
  }

  // Button sizing
  const sizeClasses = size === "small" 
    ? "py-2.5 px-4 text-sm"
    : "py-4 px-6 text-base";

  // Get button label and state
  const getButtonContent = () => {
    if (isAdding) {
      return (
        <>
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span className="ml-2">Ekleniyor...</span>
        </>
      );
    }

    if (isOwnProduct) {
      return (
        <>
          <span className="material-symbols-outlined text-[20px]">block</span>
          <span className="ml-2">Kendi Ürününüz</span>
        </>
      );
    }

    if (outOfStock) {
      return (
        <>
          <span className="material-symbols-outlined text-[20px]">inventory_2</span>
          <span className="ml-2">Stokta Yok</span>
        </>
      );
    }

    return (
      <>
        <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
        <span className="ml-2">Sepete Ekle</span>
      </>
    );
  };

  return (
    <>
      <button
        onClick={handleAddToCart}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        className={`
          group relative w-full ${sizeClasses}
          font-semibold rounded-lg
          flex items-center justify-center
          transition-all duration-200 ease-out
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
          ${isDisabled 
            ? "bg-gray-200 text-gray-500 cursor-not-allowed" 
            : "bg-primary text-white hover:bg-primary-dark hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md"
          }
          ${className}
        `}
      >
        {/* Shine effect on hover */}
        {!isDisabled && (
          <span className="absolute inset-0 overflow-hidden rounded-lg">
            <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transform transition-transform duration-700" />
          </span>
        )}
        
        <span className="relative flex items-center justify-center">
          {getButtonContent()}
        </span>
      </button>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <div 
            className={`
              px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3
              backdrop-blur-sm border
              ${toastSuccess 
                ? "bg-green-600/95 border-green-500 text-white" 
                : "bg-red-600/95 border-red-500 text-white"
              }
            `}
          >
            <span className="material-symbols-outlined text-[22px]">
              {toastSuccess ? "check_circle" : "error"}
            </span>
            <span className="font-medium">{toastMessage}</span>
            {toastSuccess && (
              <button
                onClick={() => {
                  setShowToast(false);
                  router.push("/sepet");
                }}
                className="ml-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
              >
                Sepete Git
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
