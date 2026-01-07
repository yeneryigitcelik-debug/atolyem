"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import PageHeader from "@/components/ui/PageHeader";
import AccountSidebar from "@/components/layout/AccountSidebar";
import Link from "next/link";

const initialFavorites = [
  { 
    id: "1",
    title: "Soyut Kompozisyon", 
    artist: "Ayşe Demir", 
    artistSlug: "ayse-demir",
    price: 3500, 
    slug: "soyut-kompozisyon", 
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=400&fit=crop", 
    badge: "Orijinal" 
  },
  { 
    id: "2",
    title: "Mavi Harmoni", 
    artist: "Mehmet Kaya", 
    artistSlug: "mehmet-kaya",
    price: 2800, 
    slug: "mavi-harmoni", 
    image: "https://images.unsplash.com/photo-1549887534-1541e9326642?w=400&h=400&fit=crop", 
    badge: "Limited" 
  },
  { 
    id: "3",
    title: "Doğa Esintisi", 
    artist: "Sinem Demirtaş", 
    artistSlug: "sinem-demirtas",
    price: 4200, 
    slug: "doga-esintisi", 
    image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400&h=400&fit=crop", 
    badge: "Orijinal" 
  },
  { 
    id: "4",
    title: "Seramik Vazo", 
    artist: "Emre Arslan", 
    artistSlug: "emre-arslan",
    price: 1200, 
    slug: "seramik-vazo", 
    image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=400&fit=crop", 
    badge: "El İşi" 
  },
];

export default function FavorilerPage() {
  const { user, isLoading } = useAuth();
  const [favorites, setFavorites] = useState(initialFavorites);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleRemoveFavorite = async (id: string) => {
    setRemovingId(id);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    setFavorites(prev => prev.filter(item => item.id !== id));
    setRemovingId(null);
  };

  // Show login prompt if not authenticated
  if (!isLoading && !user) {
    return (
      <>
        <PageHeader title="Favorilerim" description="Beğendiğiniz eserleri burada saklayın." />
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-primary text-4xl">login</span>
            </div>
            <h2 className="text-xl font-bold text-text-charcoal mb-2">Giriş Yapın</h2>
            <p className="text-text-secondary mb-8 max-w-md mx-auto">
              Favorilerinizi görmek ve yönetmek için hesabınıza giriş yapmanız gerekmektedir.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link 
                href="/hesap" 
                className="inline-flex items-center justify-center px-8 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-md transition-colors"
              >
                Giriş Yap
              </Link>
              <Link 
                href="/kesfet" 
                className="inline-flex items-center justify-center px-8 py-3 border border-border-subtle text-text-charcoal hover:border-primary hover:text-primary font-semibold rounded-md transition-colors"
              >
                Keşfetmeye Başla
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <PageHeader title="Favorilerim" description="Beğendiğiniz eserleri burada saklayın." />
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-16">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="text-text-secondary mt-4">Yükleniyor...</p>
          </div>
        </div>
      </>
    );
  }

  const hasFavorites = favorites.length > 0;

  return (
    <>
      <PageHeader title="Favorilerim" description="Beğendiğiniz eserleri burada saklayın." />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <AccountSidebar activePage="favorilerim" />

          {/* Content */}
          <div className="lg:col-span-3">
            {hasFavorites ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <p className="text-text-secondary">{favorites.length} eser favorilerinizde</p>
                  <button 
                    onClick={() => setFavorites([])}
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
                        removingId === product.id ? 'opacity-50 scale-95' : ''
                      }`}
                    >
                      {/* Image */}
                      <Link href={`/urun/${product.slug}`} className="block relative aspect-square overflow-hidden">
                        <div 
                          className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                          style={{ backgroundImage: `url('${product.image}')` }}
                        />
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
                        <Link 
                          href={`/sanatci/${product.artistSlug}`}
                          className="text-sm text-text-secondary hover:text-primary transition-colors flex items-center gap-1 mt-1"
                        >
                          <span className="material-symbols-outlined text-[14px]">person</span>
                          {product.artist}
                        </Link>
                        <p className="font-bold text-text-charcoal mt-2">
                          {product.price.toLocaleString("tr-TR")} ₺
                        </p>
                        
                        {/* Actions */}
                        <div className="flex gap-2 mt-4">
                          <button className="flex-1 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-1">
                            <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                            Sepete Ekle
                          </button>
                          <button 
                            onClick={() => handleRemoveFavorite(product.id)}
                            disabled={removingId === product.id}
                            className="p-2 border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 rounded-md transition-colors"
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
              <div className="text-center py-16">
                <span className="material-symbols-outlined text-6xl text-border-subtle mb-4">favorite</span>
                <h2 className="text-xl font-bold text-text-charcoal mb-2">Henüz favori eklemediniz</h2>
                <p className="text-text-secondary mb-8">Beğendiğiniz eserleri favorilere ekleyerek takip edin.</p>
                <Link href="/kesfet" className="inline-flex px-8 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-md transition-colors">
                  Keşfetmeye Başla
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
