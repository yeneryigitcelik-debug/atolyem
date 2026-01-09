"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import PageHeader from "@/components/ui/PageHeader";
import AccountSidebar from "@/components/layout/AccountSidebar";
import EmptyState from "@/components/ui/EmptyState";
import { FavoriteCardSkeleton } from "@/components/ui/Skeleton";
import Link from "next/link";
import Image from "next/image";

interface FavoriteItem {
  id: string;
  listingId: string;
  title: string;
  slug: string;
  price: number;
  currency: string;
  image: string | null;
  artist: string;
  artistSlug: string | null;
  badge: string | null;
}

export default function FavorilerPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch("/api/favorites");
      if (res.ok) {
        const data = await res.json();
        setFavorites(data.favorites || []);
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Favoriler yüklenemedi");
      }
    } catch (err) {
      console.error("Error fetching favorites:", err);
      setError("Favoriler yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading, fetchFavorites]);

  const handleRemoveFavorite = async (listingId: string) => {
    setRemovingId(listingId);
    
    try {
      const res = await fetch(`/api/favorites?listingId=${listingId}`, {
        method: "DELETE",
      });
      
      if (res.ok) {
        setFavorites(prev => prev.filter(item => item.listingId !== listingId));
      } else {
        console.error("Failed to remove favorite");
      }
    } catch (err) {
      console.error("Error removing favorite:", err);
    } finally {
      setRemovingId(null);
    }
  };

  const handleRemoveAll = async () => {
    if (!confirm("Tüm favorileri silmek istediğinize emin misiniz?")) return;
    
    for (const fav of favorites) {
      await handleRemoveFavorite(fav.listingId);
    }
  };

  const handleAddToCart = async (listingId: string) => {
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, quantity: 1 }),
      });
      
      if (res.ok) {
        alert("Ürün sepete eklendi!");
      } else {
        const data = await res.json();
        alert(data.error || "Sepete eklenemedi");
      }
    } catch (err) {
      console.error("Error adding to cart:", err);
      alert("Bir hata oluştu");
    }
  };

  // Show login prompt if not authenticated
  if (!authLoading && !user) {
    return (
      <>
        <PageHeader title="Favorilerim" description="Beğendiğiniz eserleri burada saklayın." />
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <EmptyState
            icon="login"
            title="Giriş Yapın"
            description="Favorilerinizi görmek ve yönetmek için hesabınıza giriş yapmanız gerekmektedir."
            actionLabel="Giriş Yap"
            actionHref="/hesap"
            secondaryLabel="Keşfetmeye Başla"
            secondaryHref="/kesfet"
          />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Favorilerim" description="Beğendiğiniz eserleri burada saklayın." />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <AccountSidebar activePage="favorilerim" />

          {/* Content */}
          <div className="lg:col-span-3">
            {loading || authLoading ? (
              // Loading skeleton
              <>
                <div className="flex items-center justify-between mb-6">
                  <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <FavoriteCardSkeleton key={i} />
                  ))}
                </div>
              </>
            ) : error ? (
              // Error state
              <EmptyState
                icon="error"
                title="Bir Hata Oluştu"
                description={error}
                actionLabel="Tekrar Dene"
                onAction={fetchFavorites}
              />
            ) : favorites.length > 0 ? (
              // Favorites list
              <>
                <div className="flex items-center justify-between mb-6">
                  <p className="text-text-secondary">{favorites.length} eser favorilerinizde</p>
                  <button 
                    onClick={handleRemoveAll}
                    className="text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
                    Tümünü Kaldır
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {favorites.map((product) => (
                    <div 
                      key={product.id} 
                      className={`bg-surface-white rounded-xl border border-border-subtle overflow-hidden group transition-all ${
                        removingId === product.listingId ? 'opacity-50 scale-95' : ''
                      }`}
                    >
                      {/* Image */}
                      <Link href={`/urun/${product.slug}`} className="block relative aspect-square overflow-hidden">
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt={product.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            unoptimized={product.image.includes('supabase.co')}
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <span className="material-symbols-outlined text-4xl text-gray-300">image</span>
                          </div>
                        )}
                        {product.badge && (
                          <span className="absolute top-3 left-3 px-2 py-1 rounded-md text-xs font-medium bg-surface-white/90 text-text-charcoal">
                            {product.badge}
                          </span>
                        )}
                      </Link>
                      
                      {/* Content */}
                      <div className="p-4">
                        <Link href={`/urun/${product.slug}`}>
                          <h3 className="font-semibold text-text-charcoal hover:text-primary transition-colors line-clamp-1">
                            {product.title}
                          </h3>
                        </Link>
                        {product.artistSlug ? (
                          <Link 
                            href={`/sanatsever/${product.artistSlug}`}
                            className="text-sm text-text-secondary hover:text-primary transition-colors flex items-center gap-1 mt-1"
                          >
                            <span className="material-symbols-outlined text-[14px]">person</span>
                            {product.artist}
                          </Link>
                        ) : (
                          <p className="text-sm text-text-secondary flex items-center gap-1 mt-1">
                            <span className="material-symbols-outlined text-[14px]">person</span>
                            {product.artist}
                          </p>
                        )}
                        <p className="font-bold text-text-charcoal mt-2">
                          {product.price.toLocaleString("tr-TR")} ₺
                        </p>
                        
                        {/* Actions */}
                        <div className="flex gap-2 mt-4">
                          <button 
                            onClick={() => handleAddToCart(product.listingId)}
                            className="flex-1 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                            Sepete Ekle
                          </button>
                          <button 
                            onClick={() => handleRemoveFavorite(product.listingId)}
                            disabled={removingId === product.listingId}
                            className="p-2 border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 rounded-md transition-colors disabled:opacity-50"
                            title="Favorilerden Kaldır"
                          >
                            <span className="material-symbols-outlined text-[20px]">heart_minus</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              // Empty state
              <EmptyState
                icon="favorite"
                title="Henüz favori eklemediniz"
                description="Beğendiğiniz eserleri favorilere ekleyerek takip edin."
                actionLabel="Keşfetmeye Başla"
                actionHref="/kesfet"
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
