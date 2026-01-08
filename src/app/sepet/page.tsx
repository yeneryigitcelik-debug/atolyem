"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import PageHeader from "@/components/ui/PageHeader";
import Link from "next/link";

interface CartItem {
  id: string;
  listingId: string;
  title: string;
  artist: string;
  artistSlug?: string;
  price: number;
  image?: string;
  slug: string;
  quantity: number;
}

export default function SepetPage() {
  const { user, isLoading } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [subtotal, setSubtotal] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [total, setTotal] = useState(0);

  // Fetch cart from API
  useEffect(() => {
    if (!isLoading && user) {
      fetchCart();
    } else if (!isLoading && !user) {
      setLoading(false);
    }
  }, [user, isLoading]);

  const fetchCart = async () => {
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        const cart = data.cart;
        
        // Handle case where cart or items might be undefined
        const items: CartItem[] = (cart?.items || []).map((item: any) => ({
          id: item.id,
          listingId: item.listingId || item.listing?.id,
          title: item.listing?.title || "",
          artist: item.listing?.shop?.shopName || "",
          artistSlug: item.listing?.shop?.ownerUsername || item.listing?.shop?.shopSlug,
          price: (item.unitPriceMinor || item.effectivePriceMinor || 0) / 100,
          image: item.listing?.thumbnail || item.listing?.media?.[0]?.url,
          slug: item.listing?.slug || "",
          quantity: item.quantity || 1,
        }));
        setCartItems(items);
        setSubtotal((cart?.subtotalMinor || 0) / 100);
        // Shipping and grand total not provided by API, calculate from subtotal
        const calculatedShipping = 0; // Free shipping for now
        setShipping(calculatedShipping);
        setTotal((cart?.subtotalMinor || 0) / 100 + calculatedShipping);
      }
    } catch (err) {
      console.error("Error fetching cart:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (id: string) => {
    setRemovingId(id);
    try {
      const res = await fetch(`/api/cart/items/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchCart();
      }
    } catch (err) {
      console.error("Error removing item:", err);
    } finally {
      setRemovingId(null);
    }
  };

  const handleClearCart = async () => {
    if (!confirm("Sepeti tamamen boşaltmak istediğinize emin misiniz?")) return;
    
    try {
      for (const item of cartItems) {
        await fetch(`/api/cart/items/${item.id}`, { method: "DELETE" });
      }
      await fetchCart();
    } catch (err) {
      console.error("Error clearing cart:", err);
    }
  };

  // Show login prompt if not authenticated
  if (!isLoading && !user) {
    return (
      <>
        <PageHeader title="Sepetim" />
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-primary text-4xl">login</span>
            </div>
            <h2 className="text-xl font-bold text-text-charcoal mb-2">Giriş Yapın</h2>
            <p className="text-text-secondary mb-8 max-w-md mx-auto">
              Sepetinizi görmek ve alışverişe devam etmek için hesabınıza giriş yapmanız gerekmektedir.
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

  if (isLoading || loading) {
    return (
      <>
        <PageHeader title="Sepetim" />
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-16">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="text-text-secondary mt-4">Yükleniyor...</p>
          </div>
        </div>
      </>
    );
  }

  const hasItems = cartItems.length > 0;

  return (
    <>
      <PageHeader title="Sepetim" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {hasItems ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-text-secondary">{cartItems.length} ürün</p>
                {cartItems.length > 0 && (
                  <button 
                    onClick={handleClearCart}
                    className="text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
                    Sepeti Boşalt
                  </button>
                )}
              </div>

              {cartItems.map((item) => (
                <div 
                  key={item.id} 
                  className={`bg-surface-white rounded-lg border border-border-subtle p-6 transition-all ${
                    removingId === item.id ? 'opacity-50 scale-98' : ''
                  }`}
                >
                  <div className="flex gap-4 sm:gap-6">
                    {/* Product Image */}
                    <Link href={`/urun/${item.slug}`} className="shrink-0">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-gray-100">
                        {item.image ? (
                          <div 
                            className="w-full h-full bg-cover bg-center hover:scale-105 transition-transform" 
                            style={{ backgroundImage: `url('${item.image}')` }} 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-gray-400">image</span>
                          </div>
                        )}
                      </div>
                    </Link>
                    
                    {/* Product Info */}
                    <div className="flex-grow min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <Link href={`/urun/${item.slug}`}>
                            <h3 className="font-semibold text-text-charcoal hover:text-primary transition-colors line-clamp-1">
                              {item.title}
                            </h3>
                          </Link>
                          {item.artistSlug ? (
                            <Link 
                              href={`/sanatsever/${item.artistSlug}`}
                              className="text-sm text-text-secondary hover:text-primary transition-colors"
                            >
                              {item.artist}
                            </Link>
                          ) : (
                            <span className="text-sm text-text-secondary">{item.artist}</span>
                          )}
                        </div>
                        
                        {/* Remove Button */}
                        <button 
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={removingId === item.id}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1 shrink-0"
                          title="Sepetten Kaldır"
                        >
                          <span className="material-symbols-outlined">delete</span>
                          <span className="hidden sm:inline text-sm font-medium">Kaldır</span>
                        </button>
                      </div>
                      
                      {/* Price & Quantity */}
                      <div className="mt-4 flex items-center justify-between">
                        <div className="text-sm text-text-secondary">
                          Adet: <span className="font-medium text-text-charcoal">{item.quantity}</span>
                        </div>
                        <p className="font-bold text-lg text-text-charcoal">
                          {(item.price * item.quantity).toLocaleString("tr-TR")} ₺
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div>
              <div className="bg-surface-white rounded-lg border border-border-subtle p-6 sticky top-24">
                <h3 className="font-bold text-text-charcoal mb-6">Sipariş Özeti</h3>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Ara Toplam ({cartItems.length} ürün)</span>
                    <span className="text-text-charcoal">{subtotal.toLocaleString("tr-TR")} ₺</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Kargo</span>
                    <span className="text-text-charcoal">{shipping === 0 ? "Ücretsiz" : `${shipping} ₺`}</span>
                  </div>
                  {shipping > 0 && (
                    <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg">
                      <span className="material-symbols-outlined text-primary text-[18px]">local_shipping</span>
                      <p className="text-xs text-primary">
                        <strong>{(500 - subtotal).toLocaleString("tr-TR")} ₺</strong> daha ekleyin, kargo ücretsiz!
                      </p>
                    </div>
                  )}
                  <hr className="border-border-subtle" />
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-text-charcoal">Toplam</span>
                    <span className="text-text-charcoal">{total.toLocaleString("tr-TR")} ₺</span>
                  </div>
                </div>
                
                <button className="w-full mt-6 py-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined">lock</span>
                  Güvenli Ödemeye Geç
                </button>
                
                <Link href="/kesfet" className="flex items-center justify-center gap-1 mt-4 text-sm text-primary hover:text-primary-dark transition-colors">
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  Alışverişe Devam Et
                </Link>

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t border-border-subtle">
                  <div className="flex items-center justify-center gap-6 text-text-secondary">
                    <div className="flex items-center gap-1 text-xs">
                      <span className="material-symbols-outlined text-[16px]">verified_user</span>
                      Güvenli Ödeme
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <span className="material-symbols-outlined text-[16px]">autorenew</span>
                      Kolay İade
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-6xl text-border-subtle mb-4">shopping_bag</span>
            <h2 className="text-xl font-bold text-text-charcoal mb-2">Sepetiniz boş</h2>
            <p className="text-text-secondary mb-8">Harika eserleri keşfetmeye başlayın.</p>
            <Link href="/kesfet" className="inline-flex px-8 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-md transition-colors">
              Keşfetmeye Başla
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
