"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface CreateVariantFormProps {
  productId: string;
  onVariantCreated?: () => void;
}

export default function CreateVariantForm({ productId, onVariantCreated }: CreateVariantFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("0");

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/seller/products/${productId}/variants`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sku: sku || `SKU-${Date.now()}`,
          priceCents: Math.round(parseFloat(price) * 100),
          stock: parseInt(stock) || 0,
        }),
      });

      if (!response.ok) {
        let errorMessage = "Varyant oluşturulamadı";
        try {
          const data = await response.json();
          errorMessage = data.error || errorMessage;
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      // Başarılı
      setSku("");
      setPrice("");
      setStock("0");
      if (onVariantCreated) {
        onVariantCreated();
      } else {
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Varyant oluşturulurken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="sku" className="block text-sm font-semibold text-gray-700 mb-2">
            SKU <span className="text-gray-500 font-normal">(Opsiyonel)</span>
          </label>
          <input
            type="text"
            id="sku"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:border-[#D97706] focus:outline-none focus:ring-2 focus:ring-[#D97706]/20"
            placeholder="Otomatik oluşturulacak"
          />
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-semibold text-gray-700 mb-2">
            Fiyat (TL) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₺</span>
            <input
              type="number"
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              step="0.01"
              min="0"
              required
              className="block w-full rounded-lg border border-gray-300 pl-8 pr-4 py-2 shadow-sm focus:border-[#D97706] focus:outline-none focus:ring-2 focus:ring-[#D97706]/20"
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
          <label htmlFor="stock" className="block text-sm font-semibold text-gray-700 mb-2">
            Stok <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="stock"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            min="0"
            required
            className="block w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:border-[#D97706] focus:outline-none focus:ring-2 focus:ring-[#D97706]/20"
            placeholder="0"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading || !price}
        className="w-full rounded-lg bg-gradient-to-r from-[#D97706] to-[#92400E] px-6 py-3 text-white font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Oluşturuluyor..." : "Varyant Oluştur"}
      </button>
    </div>
  );
}

