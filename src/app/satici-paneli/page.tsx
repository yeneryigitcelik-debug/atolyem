"use client";

import { useAuth } from "@/contexts/AuthContext";
import PageHeader from "@/components/ui/PageHeader";
import { StatsCardSkeleton } from "@/components/ui/Skeleton";
import Link from "next/link";
import { useEffect, useState } from "react";

interface SellerStats {
  activeProducts: number;
  pendingOrders: number;
  monthlySales: number;
  totalViews: number;
}

interface SubscriptionInfo {
  plan: string | null;
  listingsThisPeriod: number;
  listingLimit: number;
}

export default function SaticiPaneliPage() {
  const { user, profile, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      
      try {
        // Fetch seller stats
        const [statsRes, subRes] = await Promise.all([
          fetch("/api/seller/stats").catch(() => null),
          fetch("/api/subscription").catch(() => null),
        ]);

        if (statsRes?.ok) {
          const data = await statsRes.json();
          setStats(data.stats);
        } else {
          // Default stats if API not available
          setStats({
            activeProducts: 0,
            pendingOrders: 0,
            monthlySales: 0,
            totalViews: 0,
          });
        }

        if (subRes?.ok) {
          const data = await subRes.json();
          setSubscriptionInfo(data.subscription);
        }
      } catch (err) {
        console.error("Error fetching seller data:", err);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchData();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <>
        <PageHeader title="Satıcı Paneli" />
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-surface-white rounded-lg border border-border-subtle p-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse" />
              <div className="space-y-2">
                <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {[1, 2, 3, 4].map(i => <StatsCardSkeleton key={i} />)}
          </div>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <PageHeader title="Satıcı Paneli" />

        <div className="max-w-[500px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-surface-white rounded-lg border border-border-subtle p-8 text-center">
            <span className="material-symbols-outlined text-6xl text-primary mb-4">storefront</span>
            <h2 className="text-xl font-bold text-text-charcoal mb-4">Satıcı Paneline Erişim</h2>
            <p className="text-text-secondary mb-8">Satıcı panelinize erişmek için giriş yapın veya sanatçı başvurusunda bulunun.</p>
            <div className="space-y-4">
              <Link href="/hesap?redirect=/satici-paneli" className="block w-full py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-md transition-colors text-center">
                Giriş Yap
              </Link>
              <Link href="/sanatci-ol" className="block w-full py-3 bg-surface-white border border-border-subtle text-text-charcoal hover:border-primary hover:text-primary font-semibold rounded-md transition-colors text-center">
                Sanatçı Ol
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  // User is logged in but not an artist
  if (!profile?.isArtist) {
    return (
      <>
        <PageHeader title="Satıcı Paneli" />

        <div className="max-w-[600px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-surface-white rounded-lg border border-border-subtle p-8 text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-primary text-4xl">palette</span>
            </div>
            <h2 className="text-2xl font-bold text-text-charcoal mb-4">Sanatçı Profilinizi Oluşturun</h2>
            <p className="text-text-secondary mb-8 max-w-md mx-auto">
              Satıcı panelini kullanabilmek için önce sanatçı profilinizi oluşturmanız gerekmektedir. 
              Birkaç dakika içinde eserlerinizi satışa sunmaya başlayabilirsiniz.
            </p>
            <Link 
              href="/sanatci-ol" 
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-md transition-colors"
            >
              <span className="material-symbols-outlined">add_circle</span>
              Sanatçı Profilimi Oluştur
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Satıcı Paneli" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome */}
        <div className="bg-surface-white rounded-lg border border-border-subtle p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {profile?.avatarUrl ? (
                <div
                  className="w-12 h-12 rounded-full bg-cover bg-center border border-border-subtle"
                  style={{ backgroundImage: `url('${profile.avatarUrl}')` }}
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold text-lg">
                    {profile?.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
                  </span>
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold text-text-charcoal">
                  Hoş geldin, {profile?.displayName || "Satıcı"}!
                </h2>
                <p className="text-text-secondary">Satıcı panelinize hoş geldiniz.</p>
              </div>
            </div>
            {subscriptionInfo?.plan && (
              <div className="hidden sm:block">
                <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                  subscriptionInfo.plan === "PREMIUM" 
                    ? "bg-primary/10 text-primary" 
                    : "bg-gray-100 text-text-secondary"
                }`}>
                  {subscriptionInfo.plan === "PREMIUM" ? "Premium" : "Basic"} Plan
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-surface-white rounded-lg border border-border-subtle p-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined text-primary">inventory_2</span>
              <p className="text-3xl font-bold text-text-charcoal">{stats?.activeProducts || 0}</p>
            </div>
            <p className="text-text-secondary text-sm">Aktif Ürün</p>
          </div>
          <div className="bg-surface-white rounded-lg border border-border-subtle p-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined text-amber-500">pending</span>
              <p className="text-3xl font-bold text-text-charcoal">{stats?.pendingOrders || 0}</p>
            </div>
            <p className="text-text-secondary text-sm">Bekleyen Sipariş</p>
          </div>
          <div className="bg-surface-white rounded-lg border border-border-subtle p-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined text-green-500">payments</span>
              <p className="text-3xl font-bold text-text-charcoal">{(stats?.monthlySales || 0).toLocaleString("tr-TR")} TL</p>
            </div>
            <p className="text-text-secondary text-sm">Bu Ay Satış</p>
          </div>
          <div className="bg-surface-white rounded-lg border border-border-subtle p-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined text-blue-500">visibility</span>
              <p className="text-3xl font-bold text-text-charcoal">{stats?.totalViews || 0}</p>
            </div>
            <p className="text-text-secondary text-sm">Toplam Görüntülenme</p>
          </div>
        </div>

        {/* Subscription Info */}
        {subscriptionInfo && (
          <div className="bg-surface-white rounded-lg border border-border-subtle p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-text-charcoal mb-1">Abonelik Durumu</h3>
                {subscriptionInfo.plan ? (
                  <p className="text-text-secondary text-sm">
                    Bu ay {subscriptionInfo.listingsThisPeriod} / {subscriptionInfo.listingLimit === -1 ? "Sınırsız" : subscriptionInfo.listingLimit} ürün
                  </p>
                ) : (
                  <p className="text-text-secondary text-sm">Aboneliğiniz bulunmuyor</p>
                )}
              </div>
              <Link
                href="/satici-paneli/abonelik"
                className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary font-medium rounded-md transition-colors"
              >
                {subscriptionInfo.plan ? "Yönet" : "Plan Seç"}
              </Link>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-surface-white rounded-lg border border-border-subtle p-8 mb-8">
          <h2 className="text-xl font-bold text-text-charcoal mb-6">Hızlı İşlemler</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Link href="/sell/new" className="flex flex-col items-center gap-2 p-6 border border-border-subtle rounded-lg hover:border-primary hover:text-primary transition-colors group">
              <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">add_circle</span>
              <span className="text-sm font-medium text-center">Ürün Ekle</span>
            </Link>
            <Link href="/sell" className="flex flex-col items-center gap-2 p-6 border border-border-subtle rounded-lg hover:border-primary hover:text-primary transition-colors group">
              <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">inventory_2</span>
              <span className="text-sm font-medium text-center">Ürünlerim</span>
            </Link>
            <Link href="/satici-paneli/siparisler" className="flex flex-col items-center gap-2 p-6 border border-border-subtle rounded-lg hover:border-primary hover:text-primary transition-colors group">
              <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">receipt_long</span>
              <span className="text-sm font-medium text-center">Siparişler</span>
            </Link>
            <Link href="/mesajlar" className="flex flex-col items-center gap-2 p-6 border border-border-subtle rounded-lg hover:border-primary hover:text-primary transition-colors group">
              <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">mail</span>
              <span className="text-sm font-medium text-center">Mesajlar</span>
            </Link>
            <Link href="/satici-paneli/abonelik" className="flex flex-col items-center gap-2 p-6 border border-border-subtle rounded-lg hover:border-primary hover:text-primary transition-colors group">
              <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">workspace_premium</span>
              <span className="text-sm font-medium text-center">Abonelik</span>
            </Link>
          </div>
        </div>

        {/* Getting Started Checklist */}
        {(stats?.activeProducts || 0) === 0 && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
            <h3 className="font-bold text-text-charcoal mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">lightbulb</span>
              Başlarken
            </h3>
            <ul className="space-y-3 text-text-secondary">
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px] text-green-500">check_circle</span>
                <span>Hesabınızı oluşturdunuz</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px] text-green-500">check_circle</span>
                <span>Sanatçı profilinizi oluşturdunuz</span>
              </li>
              <li className="flex items-center gap-3">
                {subscriptionInfo?.plan ? (
                  <span className="material-symbols-outlined text-[20px] text-green-500">check_circle</span>
                ) : (
                  <span className="material-symbols-outlined text-[20px] text-border-subtle">radio_button_unchecked</span>
                )}
                <span>
                  Abonelik planı seçin
                  {!subscriptionInfo?.plan && (
                    <Link href="/satici-paneli/abonelik" className="ml-2 text-primary hover:underline">
                      Plan Seç →
                    </Link>
                  )}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px] text-border-subtle">radio_button_unchecked</span>
                <span>
                  İlk ürününüzü ekleyin
                  <Link href="/sell/new" className="ml-2 text-primary hover:underline">
                    Ürün Ekle →
                  </Link>
                </span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </>
  );
}
