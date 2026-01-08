"use client";

import { useAuth } from "@/contexts/AuthContext";
import PageHeader from "@/components/ui/PageHeader";
import Link from "next/link";

export default function SaticiPaneliPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <>
        <PageHeader title="Satıcı Paneli" />
        <div className="max-w-[500px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-surface-white rounded-lg border border-border-subtle p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="text-text-secondary mt-4">Yükleniyor...</p>
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

  return (
    <>
      <PageHeader title="Satıcı Paneli" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome */}
        <div className="bg-surface-white rounded-lg border border-border-subtle p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-bold text-lg">
                {user.user_metadata?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-charcoal">
                Hoş geldin, {user.user_metadata?.full_name || "Satıcı"}!
              </h2>
              <p className="text-text-secondary">Satıcı panelinize hoş geldiniz.</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-surface-white rounded-lg border border-border-subtle p-6">
            <p className="text-3xl font-bold text-text-charcoal">0</p>
            <p className="text-text-secondary text-sm">Aktif Ürün</p>
          </div>
          <div className="bg-surface-white rounded-lg border border-border-subtle p-6">
            <p className="text-3xl font-bold text-text-charcoal">0</p>
            <p className="text-text-secondary text-sm">Bekleyen Sipariş</p>
          </div>
          <div className="bg-surface-white rounded-lg border border-border-subtle p-6">
            <p className="text-3xl font-bold text-text-charcoal">0 TL</p>
            <p className="text-text-secondary text-sm">Bu Ay Satış</p>
          </div>
          <div className="bg-surface-white rounded-lg border border-border-subtle p-6">
            <p className="text-3xl font-bold text-text-charcoal">0</p>
            <p className="text-text-secondary text-sm">Toplam Görüntülenme</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-surface-white rounded-lg border border-border-subtle p-8">
          <h2 className="text-xl font-bold text-text-charcoal mb-6">Hızlı İşlemler</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="flex flex-col items-center gap-2 p-6 border border-border-subtle rounded-lg hover:border-primary hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-2xl">add_circle</span>
              <span className="text-sm font-medium">Ürün Ekle</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-6 border border-border-subtle rounded-lg hover:border-primary hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-2xl">inventory_2</span>
              <span className="text-sm font-medium">Ürünlerim</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-6 border border-border-subtle rounded-lg hover:border-primary hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-2xl">receipt_long</span>
              <span className="text-sm font-medium">Siparişler</span>
            </button>
            <Link href="/satici-paneli/abonelik" className="flex flex-col items-center gap-2 p-6 border border-border-subtle rounded-lg hover:border-primary hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-2xl">workspace_premium</span>
              <span className="text-sm font-medium">Abonelik</span>
            </Link>
          </div>
        </div>

        {/* Getting Started */}
        <div className="mt-8 bg-primary/5 border border-primary/20 rounded-lg p-6">
          <h3 className="font-bold text-text-charcoal mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">lightbulb</span>
            Başlarken
          </h3>
          <ul className="space-y-2 text-text-secondary">
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-green-500">check_circle</span>
              Hesabınızı oluşturdunuz
            </li>
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-border-subtle">radio_button_unchecked</span>
              Profil bilgilerinizi tamamlayın
            </li>
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-border-subtle">radio_button_unchecked</span>
              İlk ürününüzü ekleyin
            </li>
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-border-subtle">radio_button_unchecked</span>
              Ödeme bilgilerinizi girin
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
