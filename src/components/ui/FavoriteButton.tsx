"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface FavoriteButtonProps {
  listingId: string;
  initialFavorited?: boolean;
  onFavoriteChange?: (isFavorited: boolean) => void;
  variant?: "icon" | "button" | "card" | "outline"; // Different visual styles
  size?: "sm" | "md" | "lg";
  className?: string;
  showToast?: boolean;
}

/**
 * FavoriteButton - A shared component for adding/removing listings from favorites
 * 
 * Features:
 * - Optimistic UI updates
 * - Animation feedback
 * - Toast notifications (optional)
 * - Multiple variants for different contexts
 * - Automatic redirect to login if not authenticated
 */
export default function FavoriteButton({
  listingId,
  initialFavorited = false,
  onFavoriteChange,
  variant = "icon",
  size = "md",
  className = "",
  showToast = true,
}: FavoriteButtonProps) {
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const handleClick = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      // Redirect to login
      window.location.href = "/hesap";
      return;
    }

    if (!listingId || isLoading) return;

    // Optimistic update with animation
    setIsAnimating(true);
    const newState = !isFavorited;
    setIsFavorited(newState);
    setIsLoading(true);

    try {
      const res = await fetch(
        newState ? "/api/favorites" : `/api/favorites?listingId=${listingId}`,
        {
          method: newState ? "POST" : "DELETE",
          headers: { "Content-Type": "application/json" },
          ...(newState && { body: JSON.stringify({ listingId }) }),
        }
      );

      if (!res.ok) {
        // Revert on error
        setIsFavorited(!newState);
        if (showToast) {
          setToast({ message: "Bir hata oluştu", type: "error" });
        }
      } else {
        if (showToast) {
          setToast({
            message: newState ? "Favorilere eklendi" : "Favorilerden çıkarıldı",
            type: "success",
          });
        }
        onFavoriteChange?.(newState);
      }
    } catch {
      setIsFavorited(!newState);
      if (showToast) {
        setToast({ message: "Bir hata oluştu", type: "error" });
      }
    }

    setIsLoading(false);
    setTimeout(() => setIsAnimating(false), 300);
    
    // Clear toast after 2 seconds
    if (showToast) {
      setTimeout(() => setToast(null), 2000);
    }
  }, [user, listingId, isFavorited, isLoading, onFavoriteChange, showToast]);

  // Size classes
  const sizeClasses = {
    sm: {
      icon: "p-1.5",
      iconSize: "text-[16px]",
      button: "px-3 py-1.5 text-sm",
    },
    md: {
      icon: "p-2",
      iconSize: "text-[20px]",
      button: "px-4 py-2 text-sm",
    },
    lg: {
      icon: "p-2.5",
      iconSize: "text-[24px]",
      button: "px-5 py-2.5 text-base",
    },
  };

  const currentSize = sizeClasses[size];

  // Render based on variant
  const renderButton = () => {
    switch (variant) {
      case "icon":
        return (
          <button
            onClick={handleClick}
            disabled={isLoading}
            className={`
              rounded-full transition-all duration-300
              ${currentSize.icon}
              ${isFavorited 
                ? "bg-red-500 text-white shadow-lg" 
                : "bg-white/90 text-text-secondary hover:text-red-500 hover:bg-white"
              }
              ${isAnimating ? "scale-125" : "scale-100"}
              ${isLoading ? "opacity-70 cursor-not-allowed" : ""}
              ${className}
            `}
            aria-label={isFavorited ? "Favorilerden çıkar" : "Favorilere ekle"}
            title={isFavorited ? "Favorilerden çıkar" : "Favorilere ekle"}
          >
            <span className={`material-symbols-outlined ${currentSize.iconSize} ${isFavorited ? "fill" : ""}`}>
              {isFavorited ? "favorite" : "favorite_border"}
            </span>
          </button>
        );

      case "button":
        return (
          <button
            onClick={handleClick}
            disabled={isLoading}
            className={`
              inline-flex items-center gap-2 font-medium rounded-lg transition-all duration-300
              ${currentSize.button}
              ${isFavorited 
                ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100" 
                : "bg-surface-white text-text-secondary border border-border-subtle hover:text-red-500 hover:border-red-200"
              }
              ${isAnimating ? "scale-105" : "scale-100"}
              ${isLoading ? "opacity-70 cursor-not-allowed" : ""}
              ${className}
            `}
            aria-label={isFavorited ? "Favorilerden çıkar" : "Favorilere ekle"}
          >
            <span className={`material-symbols-outlined ${currentSize.iconSize} ${isFavorited ? "fill" : ""} ${isAnimating ? "animate-bounce" : ""}`}>
              {isFavorited ? "favorite" : "favorite_border"}
            </span>
            {isFavorited ? "Favorilerde" : "Favorilere Ekle"}
          </button>
        );

      case "card":
        return (
          <button
            onClick={handleClick}
            disabled={isLoading}
            className={`
              absolute top-3 right-3 z-10 rounded-full transition-all duration-300
              ${currentSize.icon}
              ${isFavorited 
                ? "bg-red-500 text-white shadow-lg" 
                : "bg-white/90 text-text-secondary hover:text-red-500 hover:bg-white opacity-0 group-hover:opacity-100"
              }
              ${isAnimating ? "scale-125" : "scale-100"}
              ${isLoading ? "opacity-70" : ""}
              ${className}
            `}
            aria-label={isFavorited ? "Favorilerden çıkar" : "Favorilere ekle"}
          >
            <span className={`material-symbols-outlined ${currentSize.iconSize} ${isFavorited ? "fill" : ""}`}>
              {isFavorited ? "favorite" : "favorite_border"}
            </span>
          </button>
        );

      case "outline":
        return (
          <button
            onClick={handleClick}
            disabled={isLoading}
            className={`
              w-full py-4 bg-surface-white border font-semibold rounded-md transition-all duration-300 flex items-center justify-center gap-2
              ${isFavorited 
                ? "border-red-300 text-red-500 hover:bg-red-50" 
                : "border-border-subtle text-text-charcoal hover:border-primary hover:text-primary"
              }
              ${isAnimating ? "scale-[1.02]" : "scale-100"}
              ${isLoading ? "opacity-70 cursor-not-allowed" : ""}
              ${className}
            `}
            aria-label={isFavorited ? "Favorilerden çıkar" : "Favorilere ekle"}
          >
            <span className={`material-symbols-outlined ${isFavorited ? "fill" : ""} ${isAnimating ? "animate-bounce" : ""}`}>
              {isFavorited ? "favorite" : "favorite_border"}
            </span>
            {isFavorited ? "Favorilerde" : "Favorilere Ekle"}
          </button>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {renderButton()}
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <div className={`px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 ${
            toast.type === "success" 
              ? "bg-text-charcoal text-white" 
              : "bg-red-500 text-white"
          }`}>
            <span className="material-symbols-outlined text-[18px]">
              {toast.message.includes("eklendi") ? "favorite" : toast.message.includes("çıkarıldı") ? "favorite_border" : "error"}
            </span>
            {toast.message}
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Hook for managing favorite state across multiple components
 * Useful when you need to sync favorite state between list and detail views
 */
export function useFavorite(listingId: string, initialFavorited: boolean = false) {
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [isLoading, setIsLoading] = useState(false);

  const toggleFavorite = useCallback(async () => {
    if (!user) {
      window.location.href = "/hesap";
      return;
    }

    if (!listingId || isLoading) return;

    const newState = !isFavorited;
    setIsFavorited(newState);
    setIsLoading(true);

    try {
      const res = await fetch(
        newState ? "/api/favorites" : `/api/favorites?listingId=${listingId}`,
        {
          method: newState ? "POST" : "DELETE",
          headers: { "Content-Type": "application/json" },
          ...(newState && { body: JSON.stringify({ listingId }) }),
        }
      );

      if (!res.ok) {
        setIsFavorited(!newState);
      }
    } catch {
      setIsFavorited(!newState);
    }

    setIsLoading(false);
  }, [user, listingId, isFavorited, isLoading]);

  return {
    isFavorited,
    isLoading,
    toggleFavorite,
    setIsFavorited,
  };
}



