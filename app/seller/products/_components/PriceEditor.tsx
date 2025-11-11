"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface PriceEditorProps {
  productId: string;
  variantId: string;
  currentPrice: number; // priceCents
  currentStock: number;
}

export default function PriceEditor({
  productId,
  variantId,
  currentPrice,
  currentStock,
}: PriceEditorProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [price, setPrice] = useState((currentPrice / 100).toFixed(2));
  const [stock, setStock] = useState(currentStock.toString());
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/seller/products/${productId}/variants/${variantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceCents: Math.round(parseFloat(price) * 100),
          stock: parseInt(stock),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Fiyat güncellenemedi");
      }

      setIsEditing(false);
      router.refresh();
    } catch (error: any) {
      alert(error.message || "Fiyat güncellenirken bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setPrice((currentPrice / 100).toFixed(2));
    setStock(currentStock.toString());
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            step="0.01"
            min="0"
            className="w-20 rounded border border-gray-300 px-2 py-1 text-sm"
            placeholder="Fiyat"
          />
          <span className="text-sm text-gray-600">TL</span>
        </div>
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            min="0"
            className="w-16 rounded border border-gray-300 px-2 py-1 text-sm"
            placeholder="Stok"
          />
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded bg-[#D97706] px-2 py-1 text-xs text-white hover:bg-[#92400E] disabled:opacity-50"
        >
          {saving ? "Kaydediliyor..." : "Kaydet"}
        </button>
        <button
          onClick={handleCancel}
          disabled={saving}
          className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          İptal
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="font-medium">
        {(currentPrice / 100).toLocaleString("tr-TR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}{" "}
        TL
      </span>
      <span className="text-xs text-gray-500">(Stok: {currentStock})</span>
      <button
        onClick={() => setIsEditing(true)}
        className="text-xs text-[#D97706] hover:text-[#92400E]"
      >
        Düzenle
      </button>
    </div>
  );
}




