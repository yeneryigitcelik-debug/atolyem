"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/app/components/Header";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Şifre sıfırlama işlemi burada yapılacak
    setSubmitted(true);
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden" style={{ backgroundColor: '#FFF8F1' }}>
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center px-4 sm:px-8 md:px-12 lg:px-20 xl:px-40 py-5">
          <div className="layout-content-container flex w-full max-w-[1280px] flex-1 flex-col">
            <Header />

            <main className="flex-1 my-8">
              <div className="max-w-md mx-auto px-4">
                <h1 className="text-3xl font-bold text-[#1F2937] mb-2">Şifremi Unuttum</h1>
                <p className="text-gray-600 mb-8">
                  E-posta adresinize şifre sıfırlama bağlantısı göndereceğiz.
                </p>

                {submitted ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                    <p className="text-green-800 mb-4">
                      Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. 
                      Lütfen e-posta kutunuzu kontrol edin.
                    </p>
                    <Link
                      href="/login"
                      className="text-[#D97706] hover:underline font-medium"
                    >
                      Giriş sayfasına dön
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        E-posta Adresi
                      </label>
                      <input
                        type="email"
                        id="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#D97706] focus:outline-none focus:ring-2 focus:ring-[#D97706]/20"
                        placeholder="ornek@email.com"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full rounded-md bg-[#D97706] px-4 py-2 text-white hover:bg-[#92400E] transition-colors font-medium"
                    >
                      Şifre Sıfırlama Bağlantısı Gönder
                    </button>
                    <div className="text-center">
                      <Link
                        href="/login"
                        className="text-sm text-[#D97706] hover:underline"
                      >
                        Giriş sayfasına dön
                      </Link>
                    </div>
                  </form>
                )}
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

