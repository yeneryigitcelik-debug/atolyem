"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSellerAction } from "./actions";

export default function CreateSellerForm({ user }: { user: any }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await createSellerAction(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      // Action içinde redirect yapılıyor, buraya gelmez
      router.refresh();
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden" style={{ backgroundColor: "#FFF8F1" }}>
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center px-4 sm:px-8 md:px-12 lg:px-20 xl:px-40 py-5">
          <div className="layout-content-container flex w-full max-w-[1280px] flex-1 flex-col">
            <main className="flex-1 my-8">
              <div className="mx-auto max-w-2xl">
                <h1 className="mb-6 text-3xl font-bold text-[#1F2937]">Atölyeni Oluştur</h1>
                <p className="mb-8 text-gray-600">
                  Atölyenizi oluşturarak ürünlerinizi satmaya başlayabilirsiniz. Komisyon oranı %15 olarak belirlenmiştir.
                </p>

                {error && (
                  <div className="mb-4 rounded-md bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-800 dark:text-red-400">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                        Atölye Adı
                      </label>
                      <input
                        type="text"
                        id="displayName"
                        name="displayName"
                        required
                        minLength={2}
                        maxLength={100}
                        placeholder="Örn: Ahmet'in Atölyesi"
                        disabled={loading}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#D97706] focus:outline-none focus:ring-2 focus:ring-[#D97706]/20 disabled:opacity-50"
                      />
                      <p className="mt-1 text-xs text-gray-500">Bu isim müşteriler tarafından görünecektir</p>
                    </div>

                    <div className="flex gap-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 rounded-md bg-[#D97706] px-4 py-2 text-white hover:bg-[#92400E] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? "Oluşturuluyor..." : "Atölyemi Oluştur"}
                      </button>
                      <Link
                        href="/"
                        className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 text-center transition-colors font-medium"
                      >
                        İptal
                      </Link>
                    </div>
                  </div>
                </form>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

