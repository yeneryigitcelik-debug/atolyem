"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import AccountSidebar from "@/components/layout/AccountSidebar";
import Link from "next/link";

export default function ProfilDuzenlePage() {
  const { user, profile, isLoading, refreshProfile } = useAuth();
  const router = useRouter();
  
  // Form state
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [showFavorites, setShowFavorites] = useState(true);
  
  // Image state
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  
  // UI state
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/hesap?redirect=/profil-duzenle");
    }
  }, [isLoading, user, router]);

  // Load initial data
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || "");
      setUsername(profile.username || "");
      setBio(profile.bio || "");
      setLocation(profile.location || "");
      setWebsiteUrl(profile.websiteUrl || "");
      setInstagramHandle(profile.instagramHandle || "");
      setIsPublic(profile.isPublic !== false);
      setShowFavorites(profile.showFavorites !== false);
      setAvatarPreview(profile.avatarUrl || null);
      setBannerPreview(profile.bannerUrl || null);
    }
  }, [profile]);

  // Check username availability with debounce
  useEffect(() => {
    if (!username || username === profile?.username) {
      setUsernameAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingUsername(true);
      try {
        const res = await fetch(`/api/profiles/check-username?username=${encodeURIComponent(username)}`);
        const data = await res.json();
        setUsernameAvailable(data.available);
      } catch {
        setUsernameAvailable(null);
      } finally {
        setCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username, profile?.username]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Profil fotoğrafı 5MB'dan küçük olmalıdır");
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError("Banner görseli 10MB'dan küçük olmalıdır");
        return;
      }
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (file: File, type: "avatar" | "banner"): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    const res = await fetch("/api/me/upload-image", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Resim yüklenemedi");
    }

    const data = await res.json();
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      // Upload images if changed
      let newAvatarUrl = profile?.avatarUrl;
      let newBannerUrl = profile?.bannerUrl;

      if (avatarFile) {
        newAvatarUrl = await uploadImage(avatarFile, "avatar");
      }

      if (bannerFile) {
        newBannerUrl = await uploadImage(bannerFile, "banner");
      }

      // Update profile
      const res = await fetch("/api/me/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          username: username !== profile?.username ? username : undefined,
          bio: bio || null,
          location: location || null,
          websiteUrl: websiteUrl || null,
          instagramHandle: instagramHandle || null,
          isPublic,
          showFavorites,
          avatarUrl: newAvatarUrl,
          bannerUrl: newBannerUrl,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Profil güncellenemedi");
      }

      setSuccess("Profil başarıyla güncellendi!");
      setAvatarFile(null);
      setBannerFile(null);
      
      // Refresh profile in context
      await refreshProfile();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <PageHeader title="Profil Düzenle" />
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
    // Redirect handled by useEffect above
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Profil Düzenle" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <AccountSidebar activePage="profil-duzenle" />

          {/* Content */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit}>
              {/* Banner Section */}
              <div className="bg-surface-white rounded-lg border border-border-subtle overflow-hidden mb-6">
                <div className="relative">
                  {/* Banner Preview */}
                  <div 
                    className="h-48 md:h-64 bg-cover bg-center bg-gradient-to-r from-primary/20 to-primary/10"
                    style={bannerPreview ? { backgroundImage: `url('${bannerPreview}')` } : {}}
                  >
                    <div className="absolute inset-0 bg-black/20" />
                  </div>
                  
                  {/* Banner Upload Button */}
                  <button
                    type="button"
                    onClick={() => bannerInputRef.current?.click()}
                    className="absolute bottom-4 right-4 px-4 py-2 bg-white/90 hover:bg-white text-text-charcoal font-medium rounded-lg shadow-lg transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[20px]">add_photo_alternate</span>
                    Kapak Fotoğrafı Ekle
                  </button>
                  <input
                    ref={bannerInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleBannerChange}
                    className="hidden"
                  />

                  {/* Avatar Section - Positioned over banner */}
                  <div className="absolute -bottom-16 left-8">
                    <div className="relative">
                      <div 
                        className="w-32 h-32 rounded-full bg-cover bg-center bg-surface-white border-4 border-surface-white shadow-xl"
                        style={avatarPreview ? { backgroundImage: `url('${avatarPreview}')` } : {}}
                      >
                        {!avatarPreview && (
                          <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary text-4xl">person</span>
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        className="absolute bottom-0 right-0 w-10 h-10 bg-primary hover:bg-primary-dark text-white rounded-full shadow-lg transition-colors flex items-center justify-center"
                      >
                        <span className="material-symbols-outlined text-[20px]">photo_camera</span>
                      </button>
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Content - with padding for avatar */}
                <div className="pt-20 pb-8 px-8">
                  {/* Messages */}
                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 flex items-start gap-3">
                      <span className="material-symbols-outlined text-[20px] mt-0.5">error</span>
                      <span>{error}</span>
                    </div>
                  )}
                  {success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-600 flex items-start gap-3">
                      <span className="material-symbols-outlined text-[20px] mt-0.5">check_circle</span>
                      <span>{success}</span>
                    </div>
                  )}

                  <div className="space-y-6">
                    {/* Display Name */}
                    <div>
                      <label className="block text-sm font-medium text-text-charcoal mb-2">
                        Görünen Ad <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        required
                        maxLength={100}
                        placeholder="Adınız veya takma adınız"
                        className="w-full px-4 py-3 border border-border-subtle rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    {/* Username */}
                    <div>
                      <label className="block text-sm font-medium text-text-charcoal mb-2">
                        Kullanıcı Adı <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">@</span>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                          required
                          maxLength={50}
                          placeholder="kullanici-adi"
                          className="w-full pl-10 pr-12 py-3 border border-border-subtle rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                        {checkingUsername && (
                          <span className="absolute right-4 top-1/2 -translate-y-1/2">
                            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          </span>
                        )}
                        {!checkingUsername && usernameAvailable === true && (
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500">
                            <span className="material-symbols-outlined text-[20px]">check_circle</span>
                          </span>
                        )}
                        {!checkingUsername && usernameAvailable === false && (
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500">
                            <span className="material-symbols-outlined text-[20px]">cancel</span>
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-text-secondary">
                        Profil URL&apos;niz: atolyem.net/sanatsever/{username || "kullanici-adi"}
                      </p>
                      {usernameAvailable === false && (
                        <p className="mt-1 text-xs text-red-500">Bu kullanıcı adı zaten alınmış</p>
                      )}
                    </div>

                    {/* Bio */}
                    <div>
                      <label className="block text-sm font-medium text-text-charcoal mb-2">Hakkında</label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        maxLength={500}
                        rows={4}
                        placeholder="Kendinizden ve sanat ilgi alanlarınızdan bahsedin..."
                        className="w-full px-4 py-3 border border-border-subtle rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                      />
                      <p className="mt-1 text-xs text-text-secondary text-right">{bio.length}/500</p>
                    </div>

                    {/* Location */}
                    <div>
                      <label className="block text-sm font-medium text-text-charcoal mb-2">Konum</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
                          <span className="material-symbols-outlined text-[20px]">location_on</span>
                        </span>
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          maxLength={100}
                          placeholder="İstanbul, Türkiye"
                          className="w-full pl-12 pr-4 py-3 border border-border-subtle rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>

                    {/* Social Links */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-text-charcoal mb-2">Website</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
                            <span className="material-symbols-outlined text-[20px]">language</span>
                          </span>
                          <input
                            type="url"
                            value={websiteUrl}
                            onChange={(e) => setWebsiteUrl(e.target.value)}
                            placeholder="https://website.com"
                            className="w-full pl-12 pr-4 py-3 border border-border-subtle rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-charcoal mb-2">Instagram</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">@</span>
                          <input
                            type="text"
                            value={instagramHandle}
                            onChange={(e) => setInstagramHandle(e.target.value.replace(/^@/, ""))}
                            maxLength={30}
                            placeholder="instagram_kullanici"
                            className="w-full pl-10 pr-4 py-3 border border-border-subtle rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Privacy */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-text-charcoal">Gizlilik Ayarları</h3>
                      
                      {/* Public Profile Toggle */}
                      <div className="p-4 bg-background-ivory rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-text-charcoal">Herkese Açık Profil</p>
                            <p className="text-sm text-text-secondary mt-1">
                              Profiliniz diğer kullanıcılar tarafından görülebilir
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setIsPublic(!isPublic)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              isPublic ? "bg-primary" : "bg-gray-300"
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                isPublic ? "translate-x-6" : "translate-x-1"
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                      
                      {/* Show Favorites Toggle */}
                      <div className="p-4 bg-background-ivory rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-text-charcoal">Favorileri Göster</p>
                            <p className="text-sm text-text-secondary mt-1">
                              Favori listeniz profilinizde herkese açık görünsün
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowFavorites(!showFavorites)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              showFavorites ? "bg-primary" : "bg-gray-300"
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                showFavorites ? "translate-x-6" : "translate-x-1"
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
                      <Link
                        href={profile?.username ? `/sanatsever/${profile.username}` : "/hesap"}
                        className="text-text-secondary hover:text-primary transition-colors"
                      >
                        Profili Görüntüle
                      </Link>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => router.back()}
                          className="px-6 py-3 border border-border-subtle text-text-charcoal hover:border-primary hover:text-primary font-medium rounded-lg transition-colors"
                        >
                          İptal
                        </button>
                        <button
                          type="submit"
                          disabled={saving || usernameAvailable === false}
                          className="px-6 py-3 bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                        >
                          {saving ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Kaydediliyor...
                            </>
                          ) : (
                            <>
                              <span className="material-symbols-outlined text-[20px]">save</span>
                              Değişiklikleri Kaydet
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-primary/5 rounded-lg p-6">
                <h3 className="font-semibold text-text-charcoal mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">tips_and_updates</span>
                  Profil İpuçları
                </h3>
                <ul className="space-y-2 text-sm text-text-secondary">
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[16px] text-primary mt-0.5">check</span>
                    Kapak fotoğrafı için 1500x500 piksel boyutunda bir görsel kullanın
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[16px] text-primary mt-0.5">check</span>
                    Profil fotoğrafınız yüzünüzün net göründüğü bir fotoğraf olsun
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[16px] text-primary mt-0.5">check</span>
                    &quot;Hakkında&quot; bölümünde sanat ilgi alanlarınızı belirtin
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[16px] text-primary mt-0.5">check</span>
                    Sosyal medya bağlantılarınızı ekleyerek daha fazla etkileşim alın
                  </li>
                </ul>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

