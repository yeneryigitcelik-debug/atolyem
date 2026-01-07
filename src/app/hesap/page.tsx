"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import AccountSidebar from "@/components/layout/AccountSidebar";
import Link from "next/link";

type AuthMode = "login" | "register" | "forgot";

export default function HesapPage() {
  const { user, profile, isLoading, signIn, signUp, signInWithGoogle, resetPassword } = useAuth();
  const router = useRouter();
  
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const { error } = await signIn(email, password);
    
    if (error) {
      setError(error.message === "Invalid login credentials" 
        ? "E-posta veya şifre hatalı" 
        : error.message);
    } else {
      router.push("/");
    }
    
    setSubmitting(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır");
      setSubmitting(false);
      return;
    }

    const { error } = await signUp(email, password, { full_name: fullName });
    
    if (error) {
      console.error("Registration error:", error);
      
      if (error.message.includes("already registered") || error.message.includes("already exists")) {
        setError("Bu e-posta adresi zaten kayıtlı");
      } else if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
        setError(
          "❌ Supabase'e bağlanılamıyor!\n\n" +
          "Lütfen şunları kontrol edin:\n" +
          "1. .env.local dosyasında NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_ANON_KEY değerlerini gerçek Supabase bilgilerinizle değiştirin\n" +
          "2. SUPABASE_SETUP.md dosyasındaki adımları takip edin\n" +
          "3. Development server'ı yeniden başlatın (Ctrl+C sonra npm run dev)"
        );
      } else if (error.message.includes("Invalid API key") || error.message.includes("Missing") || error.message.includes("yapılandırması eksik")) {
        setError(
          "❌ Supabase yapılandırması eksik!\n\n" +
          "Lütfen .env.local dosyanızı açın ve placeholder değerleri gerçek Supabase bilgilerinizle değiştirin.\n\n" +
          "Detaylı bilgi için SUPABASE_SETUP.md dosyasına bakın."
        );
      } else {
        setError(error.message || "Kayıt işlemi başarısız oldu. Lütfen tekrar deneyin.");
      }
    } else {
      setSuccess("Kayıt başarılı! Lütfen e-posta adresinizi doğrulayın.");
      setMode("login");
      setEmail("");
      setPassword("");
      setFullName("");
    }
    
    setSubmitting(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const { error } = await resetPassword(email);
    
    if (error) {
      setError(error.message);
    } else {
      setSuccess("Şifre sıfırlama linki e-posta adresinize gönderildi.");
    }
    
    setSubmitting(false);
  };

  const handleGoogleLogin = async () => {
    setError(null);
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error.message);
    }
  };

  if (isLoading) {
    return (
      <>
        <PageHeader title="Hesabım" />
        <div className="max-w-[500px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-surface-white rounded-lg border border-border-subtle p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="text-text-secondary mt-4">Yükleniyor...</p>
          </div>
        </div>
      </>
    );
  }

  // Logged in view
  if (user) {
    return (
      <>
        <PageHeader title="Hesabım" />

        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <AccountSidebar activePage="hesap" />

            {/* Content */}
            <div className="lg:col-span-3">
              <div className="bg-surface-white rounded-lg border border-border-subtle p-8">
                <h2 className="text-xl font-bold text-text-charcoal mb-6">Profil Bilgileri</h2>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-charcoal mb-2">Ad Soyad</label>
                      <input 
                        type="text" 
                        defaultValue={user.user_metadata?.full_name || ""} 
                        className="w-full px-4 py-3 border border-border-subtle rounded-md focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-charcoal mb-2">E-posta</label>
                      <input 
                        type="email" 
                        value={user.email || ""} 
                        disabled 
                        className="w-full px-4 py-3 border border-border-subtle rounded-md bg-background-ivory text-text-secondary"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-charcoal mb-2">Telefon</label>
                    <input 
                      type="tel" 
                      placeholder="+90 (5XX) XXX XX XX"
                      className="w-full px-4 py-3 border border-border-subtle rounded-md focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="pt-4">
                    <button className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-md transition-colors">
                      Değişiklikleri Kaydet
                    </button>
                  </div>
                </div>

                <hr className="border-border-subtle my-8" />

                <h3 className="text-lg font-bold text-text-charcoal mb-4">Hesap Güvenliği</h3>
                <div className="flex items-center justify-between p-4 bg-background-ivory rounded-md">
                  <div>
                    <p className="font-medium text-text-charcoal">Şifre</p>
                    <p className="text-sm text-text-secondary">Son değişiklik: Bilinmiyor</p>
                  </div>
                  <button className="px-4 py-2 border border-border-subtle text-text-charcoal hover:border-primary hover:text-primary rounded-md transition-colors">
                    Şifre Değiştir
                  </button>
                </div>

                {/* Become Artist CTA - only show if user is not an artist */}
                {!profile?.isArtist && (
                  <>
                    <hr className="border-border-subtle my-8" />
                    <div className="bg-primary/5 rounded-lg p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-primary text-2xl">palette</span>
                        </div>
                        <div className="flex-grow">
                          <h3 className="font-bold text-text-charcoal mb-1">Sanatçı Ol</h3>
                          <p className="text-sm text-text-secondary mb-4">
                            Eserlerinizi binlerce sanat severle buluşturun. Hemen sanatçı profilinizi oluşturun!
                          </p>
                          <Link
                            href="/sanatci-ol"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white font-medium rounded-md transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">add_circle</span>
                            Sanatçı Profili Oluştur
                          </Link>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Not logged in - show auth forms
  return (
    <>
      <PageHeader title="Hesabım" />

      <div className="max-w-[500px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-surface-white rounded-lg border border-border-subtle p-8">
          {/* Tabs */}
          {mode !== "forgot" && (
            <div className="flex mb-6 border-b border-border-subtle">
              <button
                onClick={() => { setMode("login"); setError(null); setSuccess(null); }}
                className={`flex-1 pb-3 text-center font-medium transition-colors ${
                  mode === "login" 
                    ? "text-primary border-b-2 border-primary" 
                    : "text-text-secondary hover:text-text-charcoal"
                }`}
              >
                Giriş Yap
              </button>
              <button
                onClick={() => { setMode("register"); setError(null); setSuccess(null); }}
                className={`flex-1 pb-3 text-center font-medium transition-colors ${
                  mode === "register" 
                    ? "text-primary border-b-2 border-primary" 
                    : "text-text-secondary hover:text-text-charcoal"
                }`}
              >
                Kayıt Ol
              </button>
            </div>
          )}

          {mode === "forgot" && (
            <button
              onClick={() => { setMode("login"); setError(null); setSuccess(null); }}
              className="flex items-center gap-1 text-text-secondary hover:text-primary transition-colors mb-6"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Geri Dön
            </button>
          )}

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm whitespace-pre-line">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-600 text-sm">
              {success}
            </div>
          )}

          {/* Login Form */}
          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-charcoal mb-2">E-posta</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-border-subtle rounded-md focus:outline-none focus:border-primary" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-charcoal mb-2">Şifre</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-border-subtle rounded-md focus:outline-none focus:border-primary" 
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-border-subtle"
                  />
                  <span className="text-text-secondary">Beni hatırla</span>
                </label>
                <button 
                  type="button"
                  onClick={() => { setMode("forgot"); setError(null); setSuccess(null); }}
                  className="text-primary hover:underline"
                >
                  Şifremi unuttum
                </button>
              </div>
              <button 
                type="submit" 
                disabled={submitting}
                className="w-full py-3 bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-white font-semibold rounded-md transition-colors"
              >
                {submitting ? "Giriş yapılıyor..." : "Giriş Yap"}
              </button>
            </form>
          )}

          {/* Register Form */}
          {mode === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-charcoal mb-2">Ad Soyad</label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-border-subtle rounded-md focus:outline-none focus:border-primary" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-charcoal mb-2">E-posta</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-border-subtle rounded-md focus:outline-none focus:border-primary" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-charcoal mb-2">Şifre</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="En az 6 karakter"
                  className="w-full px-4 py-3 border border-border-subtle rounded-md focus:outline-none focus:border-primary" 
                />
              </div>
              <button 
                type="submit" 
                disabled={submitting}
                className="w-full py-3 bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-white font-semibold rounded-md transition-colors"
              >
                {submitting ? "Kayıt yapılıyor..." : "Kayıt Ol"}
              </button>
              <p className="text-xs text-text-secondary text-center">
                Kayıt olarak <Link href="/gizlilik" className="text-primary hover:underline">Gizlilik Politikası</Link>&apos;nı kabul etmiş olursunuz.
              </p>
            </form>
          )}

          {/* Forgot Password Form */}
          {mode === "forgot" && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <h2 className="text-xl font-bold text-text-charcoal mb-2">Şifremi Unuttum</h2>
              <p className="text-text-secondary text-sm mb-4">E-posta adresinizi girin, size şifre sıfırlama linki gönderelim.</p>
              <div>
                <label className="block text-sm font-medium text-text-charcoal mb-2">E-posta</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-border-subtle rounded-md focus:outline-none focus:border-primary" 
                />
              </div>
              <button 
                type="submit" 
                disabled={submitting}
                className="w-full py-3 bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-white font-semibold rounded-md transition-colors"
              >
                {submitting ? "Gönderiliyor..." : "Şifre Sıfırlama Linki Gönder"}
              </button>
            </form>
          )}

          {/* Divider */}
          {mode !== "forgot" && (
            <>
              <div className="relative my-6">
                <hr className="border-border-subtle" />
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface-white px-4 text-sm text-text-secondary">veya</span>
              </div>

              {/* Google Login */}
              <button 
                onClick={handleGoogleLogin}
                className="w-full py-3 bg-surface-white border border-border-subtle text-text-charcoal font-medium rounded-md hover:border-primary transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google ile devam et
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
