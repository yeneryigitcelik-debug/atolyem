"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface FavoriteSellerButtonProps {
  sellerId: string;
}

export default function FavoriteSellerButton({ sellerId }: FavoriteSellerButtonProps) {
  const { data: session } = useSession();
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user) {
      setLoading(false);
      return;
    }

    fetch(`/api/favorites/sellers?sellerId=${sellerId}`)
      .then((res) => res.json())
      .then((data) => {
        setIsFavorited(data.isFavorited);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [sellerId, session]);

  const handleToggle = async () => {
    if (!session?.user || updating) return;

    setUpdating(true);
    setError(null);
    try {
      const method = isFavorited ? "DELETE" : "POST";
      const res = await fetch("/api/favorites/sellers", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerId }),
      });

      if (res.ok) {
        setIsFavorited(!isFavorited);
      } else {
        const data = await res.json();
        setError(data.error || "İşlem başarısız oldu. Lütfen tekrar deneyin.");
      }
    } catch (error) {
      console.error("Favorite seller toggle error:", error);
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setUpdating(false);
    }
  };

  if (!session?.user || loading) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleToggle}
        disabled={updating}
        className="flex items-center gap-2 px-4 py-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label={isFavorited ? "Favorilerden çıkar" : "Favorilere ekle"}
      >
        <span className={`material-symbols-outlined ${isFavorited ? "text-red-500 fill-current" : "text-gray-600"}`}>
          favorite
        </span>
        <span className="text-sm font-medium">
          {isFavorited ? "Favorilerden Çıkar" : "Favorilere Ekle"}
        </span>
      </button>
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-2">
          <p className="text-xs text-red-800">{error}</p>
        </div>
      )}
    </div>
  );
}

