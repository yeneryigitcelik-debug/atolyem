"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { registerAction } from "./actions";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password.length < 8) {
      setError("Şifre en az 8 karakter olmalıdır");
      return;
    }

    setLoading(true);

    try {
      const result = await registerAction(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/login?registered=true");
      }
    } catch (err) {
      setError("Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    await signIn("google", { callbackUrl: "/" });
  };

  const handleFacebookSignIn = async () => {
    await signIn("facebook", { callbackUrl: "/" });
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col group/design-root overflow-hidden bg-[#FFF8F1] dark:bg-gray-900 font-display text-[#1F2937] dark:text-gray-100">
      <header className="flex h-16 w-full items-center justify-start px-4 md:px-8">
        <Link className="flex items-center gap-2" href="/">
          <svg
            className="h-6 w-6 text-[#D97706] dark:text-[#D97706]"
            fill="none"
            height="24"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
            <path d="M2 17l10 5 10-5"></path>
            <path d="M2 12l10 5 10-5"></path>
          </svg>
          <span className="text-xl font-bold text-[#1F2937] dark:text-gray-100">Atölyem.net</span>
        </Link>
      </header>

      <main className="flex h-full grow flex-col">
        <div className="flex flex-1 items-center justify-center py-10 px-4">
          <div className="grid w-full max-w-6xl grid-cols-1 gap-12 rounded-xl bg-white dark:bg-gray-800 shadow-lg lg:grid-cols-2 lg:p-8 border border-[#E5E7EB] dark:border-gray-700">
            <div className="hidden lg:flex w-full items-center justify-center">
              <div className="w-full h-full overflow-hidden bg-gray-100 dark:bg-gray-700 rounded-lg aspect-[4/5]">
                <div
                  className="w-full h-full bg-center bg-no-repeat bg-cover"
                  data-alt="An artisan carefully crafting a handmade ceramic pot in a warmly lit workshop"
                  style={{
                    backgroundImage:
                      'url("https://lh3.googleusercontent.com/aida-public/AB6AXuC4OshGE40OpB8ISiJkF4zJ-9qLhxn0gOMhD1q8dEYe35XE9YtETJDKoef_OflRk9UygbjhauqKVZFS8ANFbWV1MqDIWam51VlZZ74621lci5uCkgf9cnw49mfi-XTZyx_i4LY1-lI9l1oprE_R_b6SgB6CHSjvOsB9V6FbTrN5qKu6oN70ReIJeT5kWjI39pyA1SSKv44BE6do5TysHZycleev1E1SrHBqs9_6jSQQyUOb6gBBUOstBAFpY2NZYSlN5CfXb9rgJaYZ")',
                  }}
                ></div>
              </div>
            </div>

            <div className="flex flex-col justify-center py-8 px-4 sm:px-6">
              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-3">
                  <h1 className="text-4xl font-black leading-tight tracking-[-0.033em] text-[#1F2937] dark:text-gray-100">Atölyem.net'e Hoş Geldin!</h1>
                  <p className="text-base font-normal leading-normal text-gray-600 dark:text-gray-400">
                    Sanatçılar ve sanatseverler topluluğuna katılın.
                  </p>
                </div>

                {error && (
                  <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-800 dark:text-red-400">
                    {error}
                  </div>
                )}

                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                  <label className="flex flex-col w-full flex-1">
                    <p className="text-base font-medium leading-normal pb-2 text-[#1F2937] dark:text-gray-300">Ad Soyad</p>
                    <input
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#1F2937] dark:text-gray-100 focus:outline-0 focus:ring-2 focus:ring-[#D97706]/50 border border-[#E5E7EB] dark:border-gray-600 bg-white dark:bg-gray-800 h-14 placeholder:text-gray-400 dark:placeholder:text-gray-400 p-[15px] text-base font-normal leading-normal"
                      placeholder="Adınız ve Soyadınız"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </label>

                  <label className="flex flex-col w-full flex-1">
                    <p className="text-base font-medium leading-normal pb-2 text-[#1F2937] dark:text-gray-300">E-posta</p>
                    <input
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#1F2937] dark:text-gray-100 focus:outline-0 focus:ring-2 focus:ring-[#D97706]/50 border border-[#E5E7EB] dark:border-gray-600 bg-white dark:bg-gray-800 h-14 placeholder:text-gray-400 dark:placeholder:text-gray-400 p-[15px] text-base font-normal leading-normal"
                      placeholder="e-posta@adresiniz.com"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </label>

                  <label className="flex flex-col w-full flex-1">
                    <p className="text-base font-medium leading-normal pb-2 text-[#1F2937] dark:text-gray-300">Şifre Oluştur</p>
                    <div className="flex w-full flex-1 items-stretch rounded-lg border border-[#E5E7EB] dark:border-gray-600 focus-within:ring-2 focus-within:ring-[#D97706]/50">
                      <input
                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden text-[#1F2937] dark:text-gray-100 focus:outline-0 ring-0 border-0 bg-white dark:bg-gray-800 h-14 placeholder:text-gray-400 dark:placeholder:text-gray-400 p-[15px] rounded-l-lg pr-2 text-base font-normal leading-normal"
                        placeholder="En az 8 karakter"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                      />
                      <button
                        type="button"
                        className="text-gray-500 dark:text-gray-400 flex bg-white dark:bg-gray-800 items-center justify-center pr-[15px] rounded-r-lg hover:text-gray-700 dark:hover:text-gray-200"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <span className="material-symbols-outlined">
                          {showPassword ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                  </label>

                  <div className="flex flex-col gap-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center justify-center whitespace-nowrap h-12 px-6 rounded-lg bg-[#D97706] text-white text-base font-bold w-full hover:bg-[#92400E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                      {loading ? "Kayıt yapılıyor..." : "Hesap Oluştur"}
                    </button>

                    <div className="flex items-center gap-4">
                      <hr className="flex-grow border-t border-[#E5E7EB] dark:border-gray-600" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">veya</span>
                      <hr className="flex-grow border-t border-[#E5E7EB] dark:border-gray-600" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        className="flex items-center justify-center whitespace-nowrap h-12 px-6 rounded-lg bg-white dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-600 text-[#1F2937] dark:text-gray-100 text-base font-medium w-full hover:bg-[#FFF8F1] dark:hover:bg-gray-700 transition-colors gap-2 shadow-sm"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M21.35 11.1H12.18V13.83H18.69C18.36 17.64 15.19 19.27 12.19 19.27C8.36 19.27 5.03 16.25 5.03 12.55C5.03 8.85 8.36 5.83 12.19 5.83C14.73 5.83 16.04 6.84 16.94 7.72L19.33 5.34C17.13 3.39 14.82 2.67 12.19 2.67C6.98 2.67 2.86 6.75 2.86 12.02C2.86 17.29 6.98 21.37 12.19 21.37C17.48 21.37 21.52 17.1 21.52 12.21C21.52 11.77 21.45 11.43 21.35 11.1Z"
                            fill="#4285F4"
                          ></path>
                        </svg>
                        <span>Google ile Kayıt Ol</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleFacebookSignIn}
                        className="flex items-center justify-center whitespace-nowrap h-12 px-6 rounded-lg bg-[#1877F2] text-white text-base font-medium w-full hover:bg-[#166fe5] transition-colors gap-2 shadow-sm"
                      >
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3l-.5 3h-2.5v6.8c4.56-.93 8-4.96 8-9.8z"></path>
                        </svg>
                        <span>Facebook ile Kayıt Ol</span>
                      </button>
                    </div>
                  </div>
                </form>

                <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                  Zaten bir hesabın var mı?{" "}
                  <Link className="font-bold text-[#D97706] dark:text-[#D97706] hover:text-[#92400E] hover:underline" href="/login">
                    Giriş Yap
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

