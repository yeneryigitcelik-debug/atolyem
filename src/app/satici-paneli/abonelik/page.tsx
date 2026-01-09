"use client";

import { useAuth } from "@/contexts/AuthContext";
import PageHeader from "@/components/ui/PageHeader";
import Link from "next/link";

export default function AbonelikPage() {
  const { user, isLoading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <>
        <PageHeader title="Abonelik" />
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
        <PageHeader title="Abonelik" />
        <div className="max-w-[500px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-surface-white rounded-lg border border-border-subtle p-8 text-center">
            <p className="text-text-secondary mb-4">Bu sayfaya erişmek için giriş yapın.</p>
            <Link href="/hesap?redirect=/satici-paneli/abonelik" className="inline-block px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-md transition-colors">
              Giriş Yap
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Abonelik Planları" />
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Coming Soon Message */}
        <div className="bg-surface-white rounded-lg border border-border-subtle p-12 text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-primary text-4xl">workspace_premium</span>
          </div>
          <h2 className="text-2xl font-bold text-text-charcoal mb-4">Abonelik Sistemi Yakında</h2>
          <p className="text-text-secondary max-w-md mx-auto mb-8">
            Satıcı abonelik planları üzerinde çalışıyoruz. Şu an için tüm sanatçılar eserlerini ücretsiz olarak listeleyebilir.
          </p>
          
          {/* Current Benefits */}
          <div className="bg-surface-warm rounded-lg p-6 text-left max-w-md mx-auto mb-8">
            <h3 className="font-semibold text-text-charcoal mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-green-500">check_circle</span>
              Şu an dahil olan özellikler
            </h3>
            <ul className="space-y-2 text-text-secondary">
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-green-500 text-[18px]">check</span>
                Sınırsız ürün listeleme
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-green-500 text-[18px]">check</span>
                Görsel yükleme
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-green-500 text-[18px]">check</span>
                Sipariş yönetimi
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-green-500 text-[18px]">check</span>
                Mesajlaşma
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-green-500 text-[18px]">check</span>
                İstatistik paneli
              </li>
            </ul>
          </div>

          <Link 
            href="/satici-paneli" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-md transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            Satıcı Paneline Dön
          </Link>
        </div>
      </div>
    </>
  );
}
