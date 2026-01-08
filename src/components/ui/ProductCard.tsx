"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface ProductCardProps {
  title: string;
  artist: string;
  artistSlug?: string;
  price: number;
  slug: string;
  image: string;
  badge?: string;
  listingId?: string;
  isFavorited?: boolean;
  onFavoriteChange?: (isFavorited: boolean) => void;
}

export default function ProductCard({ 
  title, 
  artist, 
  artistSlug,
  price, 
  slug, 
  image, 
  badge,
  listingId,
  isFavorited: initialFavorited = false,
  onFavoriteChange,
}: ProductCardProps) {
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handleFavoriteClick = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      // Redirect to login or show login modal
      window.location.href = "/hesap";
      return;
    }

    if (!listingId) return;

    // Optimistic update with animation
    setIsAnimating(true);
    const newState = !isFavorited;
    setIsFavorited(newState);

    try {
      const res = await fetch("/api/favorites", {
        method: newState ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });

      if (!res.ok) {
        // Revert on error
        setIsFavorited(!newState);
        setToastMessage("Bir hata oluştu");
      } else {
        setToastMessage(newState ? "Favorilere eklendi" : "Favorilerden çıkarıldı");
        onFavoriteChange?.(newState);
      }
    } catch {
      setIsFavorited(!newState);
      setToastMessage("Bir hata oluştu");
    }

    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
    setTimeout(() => setIsAnimating(false), 300);
  }, [user, listingId, isFavorited, onFavoriteChange]);

  return (
    <div className="relative">
      <Link
        href={`/urun/${slug}`}
        className="group bg-surface-white rounded-lg border border-border-subtle hover:border-primary transition-all duration-300 hover:shadow-lg hover:-translate-y-1 relative block overflow-hidden"
      >
        {/* Favorite Button */}
        <button 
          onClick={handleFavoriteClick}
          className={`absolute top-3 right-3 z-10 p-2 rounded-full transition-all duration-300 ${
            isFavorited 
              ? "bg-red-500 text-white shadow-lg" 
              : "bg-white/90 text-text-secondary hover:text-red-500 hover:bg-white opacity-0 group-hover:opacity-100"
          } ${isAnimating ? "scale-125" : "scale-100"}`}
          aria-label={isFavorited ? "Favorilerden çıkar" : "Favorilere ekle"}
        >
          <span className={`material-symbols-outlined text-[20px] ${isFavorited ? "fill" : ""}`}>
            {isFavorited ? "favorite" : "favorite_border"}
          </span>
        </button>

        {/* Quick Add to Cart - Shows on Hover */}
        {listingId && (
          <button 
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              
              if (!user) {
                window.location.href = "/hesap";
                return;
              }

              if (!listingId || isAddingToCart) return;

              setIsAddingToCart(true);
              try {
                const res = await fetch("/api/cart", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    listingId,
                    quantity: 1,
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
                setIsAddingToCart(false);
                setShowToast(true);
                setTimeout(() => setShowToast(false), 2000);
              }
            }}
            disabled={isAddingToCart || !listingId}
            className="absolute bottom-[120px] left-1/2 -translate-x-1/2 z-10 px-4 py-2 bg-primary text-white font-medium rounded-full shadow-lg opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 whitespace-nowrap flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAddingToCart ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Ekleniyor...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
                Sepete Ekle
              </>
            )}
          </button>
        )}

        {/* Image */}
        <div className="aspect-square overflow-hidden bg-gray-100 relative">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQADAD8AkjR4nVsYk2BtPmJbjvqD6T9b6bk+h0R//9k="
          />
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Badges */}
          {badge && (
            <div className="flex gap-2 mb-2">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${
                badge === "Orijinal" 
                  ? "bg-primary/10 text-primary border border-primary/20" 
                  : badge === "Limited" 
                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                  : badge === "El Yapımı"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-background-ivory text-text-secondary border border-border-subtle"
              }`}>
                {badge === "Orijinal" && <span className="material-symbols-outlined text-[10px] mr-1">verified</span>}
                {badge === "Limited" && <span className="material-symbols-outlined text-[10px] mr-1">star</span>}
                {badge === "El Yapımı" && <span className="material-symbols-outlined text-[10px] mr-1">handyman</span>}
                {badge}
              </span>
            </div>
          )}

          {/* Title */}
          <h4 className="text-text-charcoal font-semibold text-base leading-tight truncate group-hover:text-primary transition-colors">
            {title}
          </h4>

          {/* Artist */}
          <p className="text-xs text-text-secondary mt-1 truncate">
            {artistSlug ? (
              <span 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.location.href = `/sanatsever/${artistSlug}`;
                }}
                className="hover:text-primary cursor-pointer transition-colors"
              >
                {artist}
              </span>
            ) : (
              artist
            )}
          </p>

          {/* Price */}
          <div className="flex items-center justify-between mt-3">
            <span className="text-lg font-bold text-text-charcoal">
              {price.toLocaleString("tr-TR")} ₺
            </span>
            {/* Free Shipping Badge */}
            {price > 500 && (
              <span className="text-[10px] text-green-600 flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[12px]">local_shipping</span>
                Ücretsiz Kargo
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <div className="px-4 py-3 bg-text-charcoal text-white rounded-lg shadow-xl flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">
              {toastMessage.includes("eklendi") ? "favorite" : toastMessage.includes("çıkarıldı") ? "favorite_border" : "error"}
            </span>
            {toastMessage}
          </div>
        </div>
      )}
    </div>
  );
}
