"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email veya şifre hatalı");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-x-hidden bg-[#FFF8F1] p-4 font-display dark:bg-gray-900 sm:p-6 lg:p-8">
      <div className="flex w-full max-w-md flex-col items-center">
        <div className="mb-8">
          <img
            alt="Atölyem.net logo"
            className="h-10 w-auto"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB5awAI0VfZJ9pBI7uz3mOVw9jwCOehzABL0gBTKiHlxYjpDm6GSOdGKxUDPfdYT2j1Xt9ANnDf7Ok5R66NCR7rxkTImLMgwmDiZlcKZATbuZT3Um5wiE33DFfLeAGYj-GHjwIwDTGE0IRJFKk8Z__FtkQIsGWKi1-OoPRPJaKofjayyjY1N96Zs0ZMx-GzUHPTXKJNsSmnkR2sCCyQfijz-E9BdRpOAzbL16aSgVVxwA5IUHlEZuBm-xS9cQ1HMdJ_ZsEeNSZfk_F8"
          />
        </div>
        <div className="w-full rounded-xl border border-[#E5E7EB] bg-white p-8 shadow-md dark:border-gray-700 dark:bg-gray-800">
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-[#1F2937] dark:text-gray-100">
              Tekrar Hoş Geldin
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Hesabına giriş yaparak devam et.
            </p>
          </div>

          {error && (
            <div className="mt-6 rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <label className="flex flex-col">
              <p className="pb-2 text-sm font-medium text-[#1F2937] dark:text-gray-300">E-posta</p>
              <input
                className="form-input h-12 w-full flex-1 resize-none overflow-hidden rounded-lg border border-[#E5E7EB] bg-white p-3 text-base font-normal leading-normal text-[#1F2937] placeholder:text-gray-400 focus:border-[#D97706] focus:outline-0 focus:ring-2 focus:ring-[#D97706]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-400 dark:focus:border-[#D97706]"
                placeholder="E-posta adresinizi girin"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>

            <label className="flex flex-col">
              <p className="pb-2 text-sm font-medium text-[#1F2937] dark:text-gray-300">Şifre</p>
              <div className="relative flex w-full items-center">
                <input
                  className="form-input h-12 w-full flex-1 resize-none overflow-hidden rounded-lg border border-[#E5E7EB] bg-white p-3 pr-12 text-base font-normal leading-normal text-[#1F2937] placeholder:text-gray-400 focus:border-[#D97706] focus:outline-0 focus:ring-2 focus:ring-[#D97706]/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-400 dark:focus:border-[#D97706]"
                  placeholder="Şifrenizi girin"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  aria-label="Toggle password visibility"
                  className="absolute right-0 flex h-12 w-12 items-center justify-center text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? "visibility" : "visibility_off"}
                  </span>
                </button>
              </div>
            </label>

            <div className="flex items-center justify-end">
              <Link
                className="text-sm font-medium text-[#D97706] dark:text-[#D97706] underline-offset-4 hover:underline hover:text-[#92400E]"
                href="/forgot-password"
              >
                Şifremi Unuttum?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center rounded-lg bg-[#D97706] px-6 text-base font-semibold text-white transition-colors hover:bg-[#92400E] focus:outline-none focus:ring-2 focus:ring-[#D97706] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
            Hesabın yok mu?{" "}
            <Link
              className="font-semibold text-[#D97706] dark:text-[#D97706] underline-offset-4 hover:underline hover:text-[#92400E]"
              href="/register"
            >
              Kayıt Ol
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

