"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface CouponInputProps {
  cartTotalCents: number;
  onCouponApplied: (discountCents: number, couponCode: string) => void;
}

export default function CouponInput({ cartTotalCents, onCouponApplied }: CouponInputProps) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountCents: number;
  } | null>(null);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/coupons/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          cartTotalCents,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAppliedCoupon({
          code: code.trim().toUpperCase(),
          discountCents: data.discountCents,
        });
        onCouponApplied(data.discountCents, code.trim().toUpperCase());
        setCode("");
      } else {
        const data = await res.json();
        setError(data.error || "Kupon uygulanamadı");
      }
    } catch (error) {
      console.error("Apply coupon error:", error);
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setAppliedCoupon(null);
    onCouponApplied(0, "");
    setCode("");
    setError(null);
  };

  if (appliedCoupon) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-green-800">
              ✓ Kupon uygulandı: {appliedCoupon.code}
            </p>
            <p className="text-xs text-green-600">
              İndirim: {(appliedCoupon.discountCents / 100).toLocaleString("tr-TR")} TL
            </p>
          </div>
          <button
            onClick={handleRemove}
            className="text-xs text-green-800 hover:text-green-900 underline"
          >
            Kaldır
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold">Kupon Kodu</h2>
      <form onSubmit={handleApply} className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Kupon kodunu girin"
          className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !code.trim()}
          className="rounded-md bg-[#D97706] px-4 py-2 text-sm font-medium text-white hover:bg-[#92400E] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Kontrol Ediliyor..." : "Uygula"}
        </button>
      </form>
      {error && (
        <div className="mt-2 rounded-md bg-red-50 border border-red-200 p-2">
          <p className="text-xs text-red-800">{error}</p>
        </div>
      )}
    </div>
  );
}

