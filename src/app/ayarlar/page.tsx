"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import PageHeader from "@/components/ui/PageHeader";
import AccountSidebar from "@/components/layout/AccountSidebar";
import Link from "next/link";

export default function AyarlarPage() {
  const { user, isLoading } = useAuth();
  
  const [notifications, setNotifications] = useState({
    email: true,
    orders: true,
    promotions: false,
    newsletter: true,
  });
  
  const [privacy, setPrivacy] = useState({
    profilePublic: true,
    showActivity: true,
    showFavorites: false,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  if (!isLoading && !user) {
    return (
      <>
        <PageHeader title="Ayarlar" />
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-primary text-4xl">login</span>
            </div>
            <h2 className="text-xl font-bold text-text-charcoal mb-2">Giriş Yapın</h2>
            <p className="text-text-secondary mb-8">Ayarlarınızı görmek için hesabınıza giriş yapın.</p>
            <Link 
              href="/hesap" 
              className="inline-flex px-8 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-md transition-colors"
            >
              Giriş Yap
            </Link>
          </div>
        </div>
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <PageHeader title="Ayarlar" />
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-16">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="text-text-secondary mt-4">Yükleniyor...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Ayarlar" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <AccountSidebar activePage="ayarlar" />

          {/* Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Notifications */}
            <div className="bg-surface-white rounded-lg border border-border-subtle p-6">
              <h2 className="text-lg font-bold text-text-charcoal mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">notifications</span>
                Bildirim Tercihleri
              </h2>
              
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 bg-background-ivory rounded-lg cursor-pointer">
                  <div>
                    <p className="font-medium text-text-charcoal">E-posta Bildirimleri</p>
                    <p className="text-sm text-text-secondary">Genel e-posta bildirimlerini al</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.email}
                    onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                    className="w-5 h-5 accent-primary"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-background-ivory rounded-lg cursor-pointer">
                  <div>
                    <p className="font-medium text-text-charcoal">Sipariş Güncellemeleri</p>
                    <p className="text-sm text-text-secondary">Sipariş durumu değişikliklerinde bildirim al</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.orders}
                    onChange={(e) => setNotifications({ ...notifications, orders: e.target.checked })}
                    className="w-5 h-5 accent-primary"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-background-ivory rounded-lg cursor-pointer">
                  <div>
                    <p className="font-medium text-text-charcoal">Promosyonlar & İndirimler</p>
                    <p className="text-sm text-text-secondary">Özel kampanya ve indirimlerden haberdar ol</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.promotions}
                    onChange={(e) => setNotifications({ ...notifications, promotions: e.target.checked })}
                    className="w-5 h-5 accent-primary"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-background-ivory rounded-lg cursor-pointer">
                  <div>
                    <p className="font-medium text-text-charcoal">Bülten</p>
                    <p className="text-sm text-text-secondary">Haftalık sanat haberleri ve önerileri</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.newsletter}
                    onChange={(e) => setNotifications({ ...notifications, newsletter: e.target.checked })}
                    className="w-5 h-5 accent-primary"
                  />
                </label>
              </div>
            </div>

            {/* Privacy */}
            <div className="bg-surface-white rounded-lg border border-border-subtle p-6">
              <h2 className="text-lg font-bold text-text-charcoal mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">lock</span>
                Gizlilik Ayarları
              </h2>
              
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 bg-background-ivory rounded-lg cursor-pointer">
                  <div>
                    <p className="font-medium text-text-charcoal">Profil Görünürlüğü</p>
                    <p className="text-sm text-text-secondary">Profiliniz herkes tarafından görülebilir</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacy.profilePublic}
                    onChange={(e) => setPrivacy({ ...privacy, profilePublic: e.target.checked })}
                    className="w-5 h-5 accent-primary"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-background-ivory rounded-lg cursor-pointer">
                  <div>
                    <p className="font-medium text-text-charcoal">Aktivite Gösterimi</p>
                    <p className="text-sm text-text-secondary">Satın alma ve yorum aktivitelerinizi göster</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacy.showActivity}
                    onChange={(e) => setPrivacy({ ...privacy, showActivity: e.target.checked })}
                    className="w-5 h-5 accent-primary"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-background-ivory rounded-lg cursor-pointer">
                  <div>
                    <p className="font-medium text-text-charcoal">Favorileri Göster</p>
                    <p className="text-sm text-text-secondary">Favori listeni profilinde göster</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacy.showFavorites}
                    onChange={(e) => setPrivacy({ ...privacy, showFavorites: e.target.checked })}
                    className="w-5 h-5 accent-primary"
                  />
                </label>
              </div>
            </div>

            {/* Password */}
            <div className="bg-surface-white rounded-lg border border-border-subtle p-6">
              <h2 className="text-lg font-bold text-text-charcoal mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">key</span>
                Şifre & Güvenlik
              </h2>
              
              <div className="flex items-center justify-between p-4 bg-background-ivory rounded-lg">
                <div>
                  <p className="font-medium text-text-charcoal">Şifre</p>
                  <p className="text-sm text-text-secondary">Son değişiklik: Bilinmiyor</p>
                </div>
                <button className="px-4 py-2 border border-border-subtle text-text-charcoal hover:border-primary hover:text-primary rounded-md transition-colors">
                  Şifre Değiştir
                </button>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="w-full py-4 bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">save</span>
                  Değişiklikleri Kaydet
                </>
              )}
            </button>

            {/* Danger Zone */}
            <div className="bg-red-50 rounded-lg border border-red-200 p-6">
              <h2 className="text-lg font-bold text-red-600 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined">warning</span>
                Tehlikeli Bölge
              </h2>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-text-charcoal">Hesabı Sil</p>
                  <p className="text-sm text-text-secondary">Bu işlem geri alınamaz. Tüm verileriniz silinir.</p>
                </div>
                <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-md transition-colors"
                >
                  Hesabı Sil
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative bg-surface-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-text-charcoal mb-4">Hesabınızı silmek istediğinize emin misiniz?</h3>
            <p className="text-text-secondary mb-6">
              Bu işlem geri alınamaz. Tüm verileriniz, siparişleriniz ve favorileriniz kalıcı olarak silinecektir.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 border border-border-subtle text-text-charcoal hover:border-primary rounded-lg transition-colors"
              >
                Vazgeç
              </button>
              <button className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors">
                Evet, Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
