"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import PageHeader from "@/components/ui/PageHeader";
import AccountSidebar from "@/components/layout/AccountSidebar";
import Link from "next/link";

// Username validation regex
const USERNAME_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export default function AyarlarPage() {
  const { user, profile, isLoading, refreshProfile } = useAuth();
  
  const [notifications, setNotifications] = useState({
    email: true,
    orders: true,
    promotions: false,
    newsletter: true,
  });
  
  const [privacy, setPrivacy] = useState({
    profilePublic: true,
    showActivity: true,
    showFavorites: true,
  });

  // Username state
  const [username, setUsername] = useState("");
  const [originalUsername, setOriginalUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken" | "invalid" | "unchanged">("unchanged");
  const [isEditingUsername, setIsEditingUsername] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load initial values from profile
  useEffect(() => {
    if (profile) {
      setUsername(profile.username);
      setOriginalUsername(profile.username);
      setPrivacy({
        profilePublic: profile.isPublic,
        showActivity: true, // TODO: Add to profile model if needed
        showFavorites: true, // Will be updated when we add showFavorites to AuthContext
      });
    }
  }, [profile]);

  // Fetch current showFavorites from API (profile might not have it in AuthContext yet)
  useEffect(() => {
    if (user) {
      fetch("/api/me/profile")
        .then((res) => res.json())
        .then((data) => {
          if (data.profile) {
            setPrivacy((prev) => ({
              ...prev,
              profilePublic: data.profile.isPublic,
              showFavorites: data.profile.showFavorites ?? true,
            }));
          }
        })
        .catch(console.error);
    }
  }, [user]);

  // Debounced username availability check
  const checkUsernameAvailability = useCallback(async (value: string) => {
    if (value === originalUsername.toLowerCase()) {
      setUsernameStatus("unchanged");
      return;
    }

    if (value.length < 3) {
      setUsernameStatus("invalid");
      return;
    }
    
    if (!USERNAME_REGEX.test(value)) {
      setUsernameStatus("invalid");
      return;
    }

    setUsernameStatus("checking");
    
    try {
      const res = await fetch(`/api/profiles/check-username?username=${encodeURIComponent(value)}`);
      const data = await res.json();
      
      if (data.available) {
        setUsernameStatus("available");
      } else {
        setUsernameStatus("taken");
      }
    } catch {
      setUsernameStatus("idle");
    }
  }, [originalUsername]);

  // Debounce username check
  useEffect(() => {
    if (!isEditingUsername || !username) return;
    
    const timer = setTimeout(() => {
      checkUsernameAvailability(username.toLowerCase());
    }, 500);

    return () => clearTimeout(timer);
  }, [username, isEditingUsername, checkUsernameAvailability]);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Prepare the update payload
      const updateData: Record<string, unknown> = {
        isPublic: privacy.profilePublic,
        showFavorites: privacy.showFavorites,
      };

      // Include username if it changed
      if (username !== originalUsername && usernameStatus === "available") {
        updateData.username = username.toLowerCase();
      }

      const res = await fetch("/api/me/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === "USERNAME_TAKEN") {
          setUsernameStatus("taken");
          setErrorMessage("Bu kullanıcı adı zaten alınmış");
        } else {
          setErrorMessage(data.error || "Ayarlar kaydedilirken bir hata oluştu");
        }
        return;
      }

      // Update local state on success
      if (data.profile?.username) {
        setOriginalUsername(data.profile.username);
        setUsername(data.profile.username);
        setIsEditingUsername(false);
        setUsernameStatus("unchanged");
      }

      setSuccessMessage("Ayarlar başarıyla kaydedildi");
      
      // Refresh the profile in auth context
      await refreshProfile();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Save settings error:", error);
      setErrorMessage("Ayarlar kaydedilirken bir hata oluştu");
    } finally {
      setIsSaving(false);
    }
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
            {/* Success/Error Messages */}
            {successMessage && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center gap-2">
                <span className="material-symbols-outlined">check_circle</span>
                {successMessage}
              </div>
            )}
            {errorMessage && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
                <span className="material-symbols-outlined">error</span>
                {errorMessage}
              </div>
            )}

            {/* Username Settings */}
            <div className="bg-surface-white rounded-lg border border-border-subtle p-6">
              <h2 className="text-lg font-bold text-text-charcoal mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">alternate_email</span>
                Kullanıcı Adı
              </h2>
              
              <div className="space-y-4">
                {!isEditingUsername ? (
                  <div className="flex items-center justify-between p-4 bg-background-ivory rounded-lg">
                    <div>
                      <p className="font-medium text-text-charcoal">@{originalUsername}</p>
                      <p className="text-sm text-text-secondary">atolyem.net/sanatsever/{originalUsername}</p>
                    </div>
                    <button 
                      onClick={() => setIsEditingUsername(true)}
                      className="px-4 py-2 border border-border-subtle text-text-charcoal hover:border-primary hover:text-primary rounded-md transition-colors"
                    >
                      Değiştir
                    </button>
                  </div>
                ) : (
                  <div className="p-4 bg-background-ivory rounded-lg space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-text-charcoal mb-2">
                        Yeni Kullanıcı Adı
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">@</span>
                        <input 
                          type="text" 
                          value={username}
                          onChange={(e) => {
                            const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
                            setUsername(value);
                            if (value === originalUsername) {
                              setUsernameStatus("unchanged");
                            } else {
                              setUsernameStatus("idle");
                            }
                          }}
                          minLength={3}
                          maxLength={30}
                          placeholder="kullanici-adi"
                          className={`w-full pl-9 pr-10 py-3 border rounded-md focus:outline-none transition-colors ${
                            usernameStatus === "available" 
                              ? "border-green-500 focus:border-green-500" 
                              : usernameStatus === "taken" || usernameStatus === "invalid"
                              ? "border-red-500 focus:border-red-500"
                              : "border-border-subtle focus:border-primary"
                          }`}
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          {usernameStatus === "checking" && (
                            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          )}
                          {usernameStatus === "available" && (
                            <span className="material-symbols-outlined text-green-500 text-xl">check_circle</span>
                          )}
                          {(usernameStatus === "taken" || usernameStatus === "invalid") && (
                            <span className="material-symbols-outlined text-red-500 text-xl">cancel</span>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-text-secondary mt-2">
                        {usernameStatus === "unchanged" && (
                          <span>Mevcut kullanıcı adınız</span>
                        )}
                        {usernameStatus === "available" && (
                          <span className="text-green-600">✓ Bu kullanıcı adı müsait</span>
                        )}
                        {usernameStatus === "taken" && (
                          <span className="text-red-600">✗ Bu kullanıcı adı zaten alınmış</span>
                        )}
                        {usernameStatus === "invalid" && username.length > 0 && (
                          <span className="text-red-600">✗ Geçersiz format (sadece küçük harf, rakam ve tire)</span>
                        )}
                        {usernameStatus === "idle" && username.length > 0 && username.length < 3 && (
                          <span className="text-amber-600">En az 3 karakter olmalı</span>
                        )}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => {
                          setIsEditingUsername(false);
                          setUsername(originalUsername);
                          setUsernameStatus("unchanged");
                        }}
                        className="px-4 py-2 border border-border-subtle text-text-charcoal hover:border-red-500 hover:text-red-500 rounded-md transition-colors"
                      >
                        İptal
                      </button>
                    </div>
                  </div>
                )}
                <p className="text-xs text-text-secondary">
                  Kullanıcı adınız profilinizin URL&apos;sinde kullanılır. Değiştirdiğinizde eski bağlantılar çalışmaz.
                </p>
              </div>
            </div>

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
                    <p className="text-sm text-text-secondary">Favori listeni profilinde herkese göster</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacy.showFavorites}
                    onChange={(e) => setPrivacy({ ...privacy, showFavorites: e.target.checked })}
                    className="w-5 h-5 accent-primary"
                  />
                </label>
                <p className="text-xs text-text-secondary px-4">
                  Bu ayar açıksa, profilinizi ziyaret edenler favori listelerinizi görebilir.
                </p>
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
