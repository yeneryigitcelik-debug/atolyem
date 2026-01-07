"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import Link from "next/link";
import { useState } from "react";

export default function SanatciOlPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [shopName, setShopName] = useState("");
  const [artType, setArtType] = useState("");
  const [bio, setBio] = useState("");
  const [instagram, setInstagram] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push("/hesap");
      return;
    }
    
    setIsSubmitting(true);
    // Simulating API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    // In real implementation, this would create the seller profile
    router.push("/satici-paneli");
  };

  return (
    <>
      <PageHeader 
        title="Sanatçı Ol" 
        description="Eserlerinizi binlerce sanat severle buluşturun."
        badge="Hemen Başla"
      />

      {/* Benefits */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-primary text-3xl">storefront</span>
            </div>
            <h3 className="text-lg font-bold text-text-charcoal mb-2">Kendi Dükkanınız</h3>
            <p className="text-text-secondary">Özelleştirilebilir mağaza sayfası ile markanızı oluşturun.</p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-primary text-3xl">payments</span>
            </div>
            <h3 className="text-lg font-bold text-text-charcoal mb-2">Kolay Ödeme</h3>
            <p className="text-text-secondary">Satışlarınız her ay düzenli olarak hesabınıza aktarılır.</p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-primary text-3xl">groups</span>
            </div>
            <h3 className="text-lg font-bold text-text-charcoal mb-2">Geniş Kitle</h3>
            <p className="text-text-secondary">Binlerce sanat sever tarafından keşfedilme şansı.</p>
          </div>
        </div>

        {/* Profile Creation Form or Login Prompt */}
        <div className="max-w-[600px] mx-auto">
          {isLoading ? (
            <div className="bg-surface-white rounded-lg border border-border-subtle p-8 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="text-text-secondary mt-4">Yükleniyor...</p>
            </div>
          ) : !user ? (
            // Not logged in - show login prompt
            <div className="bg-surface-white rounded-lg border border-border-subtle p-8 text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-primary text-4xl">login</span>
              </div>
              <h2 className="text-xl font-bold text-text-charcoal mb-2">Giriş Yapın</h2>
              <p className="text-text-secondary mb-6">
                Sanatçı profili oluşturabilmek için önce hesabınıza giriş yapmanız gerekmektedir.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/hesap"
                  className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-md transition-colors"
                >
                  Giriş Yap
                </Link>
                <Link
                  href="/hesap"
                  className="px-6 py-3 border border-border-subtle text-text-charcoal hover:border-primary hover:text-primary font-semibold rounded-md transition-colors"
                >
                  Kayıt Ol
                </Link>
              </div>
            </div>
          ) : (
            // Logged in - show profile creation form
            <div className="bg-surface-white rounded-lg border border-border-subtle p-8">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border-subtle">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold text-lg">
                    {user.user_metadata?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-text-charcoal">
                    {user.user_metadata?.full_name || "Kullanıcı"}
                  </p>
                  <p className="text-sm text-text-secondary">{user.email}</p>
                </div>
              </div>

              <h2 className="text-xl font-bold text-text-charcoal mb-6">Sanatçı Profilinizi Oluşturun</h2>
              
              <form onSubmit={handleCreateProfile} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-text-charcoal mb-2">
                    Mağaza / Sanatçı Adı *
                  </label>
                  <input 
                    type="text" 
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    required
                    placeholder="Örn: Sinem Demirtaş Atölyesi"
                    className="w-full px-4 py-3 border border-border-subtle rounded-md focus:outline-none focus:border-primary" 
                  />
                  <p className="text-xs text-text-secondary mt-1">Bu isim profilinizde ve eserlerinizde görünecek.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-charcoal mb-2">
                    Sanat Dalı *
                  </label>
                  <select 
                    value={artType}
                    onChange={(e) => setArtType(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-border-subtle rounded-md focus:outline-none focus:border-primary text-text-charcoal"
                  >
                    <option value="">Seçiniz</option>
                    <option value="resim">Resim</option>
                    <option value="seramik">Seramik</option>
                    <option value="heykel">Heykel</option>
                    <option value="fotograf">Fotoğraf</option>
                    <option value="tekstil">Tekstil</option>
                    <option value="cam">Cam Sanatı</option>
                    <option value="taki">Takı & Aksesuar</option>
                    <option value="dijital">Dijital Sanat</option>
                    <option value="diger">Diğer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-charcoal mb-2">
                    Kendinizi Tanıtın
                  </label>
                  <textarea 
                    rows={4} 
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-4 py-3 border border-border-subtle rounded-md focus:outline-none focus:border-primary resize-none" 
                    placeholder="Sanat yolculuğunuz, ilham kaynaklarınız..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-charcoal mb-2">
                    Instagram Kullanıcı Adı (Opsiyonel)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">@</span>
                    <input 
                      type="text" 
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      className="w-full pl-8 pr-4 py-3 border border-border-subtle rounded-md focus:outline-none focus:border-primary" 
                      placeholder="kullanici_adi"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <input 
                    type="checkbox" 
                    id="terms" 
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    required
                    className="mt-1" 
                  />
                  <label htmlFor="terms" className="text-sm text-text-secondary">
                    <Link href="/satis-kurallari" className="text-primary hover:underline">Satış kurallarını</Link> ve{" "}
                    <Link href="/gizlilik" className="text-primary hover:underline">gizlilik politikasını</Link> okudum, kabul ediyorum.
                  </label>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting || !acceptedTerms || !shopName || !artType}
                  className="w-full py-4 bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-white font-semibold rounded-md transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Oluşturuluyor...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">add_circle</span>
                      Sanatçı Profilimi Oluştur
                    </>
                  )}
                </button>
              </form>

              <p className="text-xs text-text-secondary text-center mt-4">
                Profil oluşturduktan sonra hemen eser yüklemeye başlayabilirsiniz.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-primary py-16">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-white">500+</p>
              <p className="text-white/80">Aktif Sanatçı</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white">10K+</p>
              <p className="text-white/80">Satılan Eser</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white">%85</p>
              <p className="text-white/80">Sanatçı Payı</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white">4.9</p>
              <p className="text-white/80">Ortalama Puan</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-text-charcoal text-center mb-12">Sıkça Sorulan Sorular</h2>
        <div className="max-w-[800px] mx-auto space-y-4">
          <div className="bg-surface-white rounded-lg border border-border-subtle p-6">
            <h3 className="font-bold text-text-charcoal mb-2">Sanatçı olmak için ücret ödenmeli mi?</h3>
            <p className="text-text-secondary">Hayır, sanatçı profili oluşturmak tamamen ücretsizdir. Sadece satış yaptığınızda küçük bir komisyon alınır.</p>
          </div>
          <div className="bg-surface-white rounded-lg border border-border-subtle p-6">
            <h3 className="font-bold text-text-charcoal mb-2">Komisyon oranı nedir?</h3>
            <p className="text-text-secondary">Her satıştan %15 platform komisyonu alınır. Kazancınızın %85&apos;i size aittir.</p>
          </div>
          <div className="bg-surface-white rounded-lg border border-border-subtle p-6">
            <h3 className="font-bold text-text-charcoal mb-2">Ödemeler nasıl yapılır?</h3>
            <p className="text-text-secondary">Satışlarınız her ayın 15&apos;inde IBAN hesabınıza aktarılır. Minimum ödeme tutarı 100 TL&apos;dir.</p>
          </div>
          <div className="bg-surface-white rounded-lg border border-border-subtle p-6">
            <h3 className="font-bold text-text-charcoal mb-2">Ne tür ürünler satabilirim?</h3>
            <p className="text-text-secondary">El yapımı, tasarımı size ait, vintage veya sanat malzemeleri kategorilerinde ürünler satabilirsiniz.</p>
          </div>
        </div>
      </section>
    </>
  );
}
