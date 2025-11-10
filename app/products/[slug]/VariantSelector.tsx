"use client";

import { useState, useEffect, useActionState } from "react";
import { addToCart, type AddToCartResult } from "@/app/cart/actions";

interface Variant {
  id: string;
  sku: string;
  priceCents: number;
  stock: number;
  attributes?: any;
}

interface VariantSelectorProps {
  variants: Variant[];
  productTitle: string;
  disabled?: boolean;
}

export default function VariantSelector({ variants, productTitle, disabled }: VariantSelectorProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    variants.length > 0 ? variants[0].id : null
  );
  const [state, formAction] = useActionState<AddToCartResult | null, FormData>(addToCart, null);
  const [showSuccess, setShowSuccess] = useState(false);

  const selectedVariant = variants.find((v) => v.id === selectedVariantId);
  const isOutOfStock = selectedVariant ? selectedVariant.stock === 0 : true;
  const isLowStock = selectedVariant ? selectedVariant.stock > 0 && selectedVariant.stock <= 5 : false;

  // Başarı mesajını göster
  useEffect(() => {
    if (state?.success && !showSuccess) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [state?.success, showSuccess]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!selectedVariantId || isOutOfStock || disabled) {
      e.preventDefault();
      return;
    }
  };

  return (
    <div className="space-y-4">
      {/* Varyant Seçimi */}
      {variants.length > 1 && (
        <div>
          <label className="mb-2 block text-sm font-medium text-[#1F2937]">
            Varyant Seçin
          </label>
          <div className="space-y-2">
            {variants.map((variant) => {
              const isSelected = selectedVariantId === variant.id;
              const variantDisabled = variant.stock === 0;
              return (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => setSelectedVariantId(variant.id)}
                  disabled={variantDisabled}
                  className={`w-full rounded-md border p-3 text-left transition-colors ${
                    isSelected
                      ? "border-[#D97706] bg-[#FFF8F1] ring-2 ring-[#D97706]"
                      : "border-gray-300 bg-white hover:border-gray-400"
                  } ${variantDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-[#1F2937]">{variant.sku}</div>
                      <div className="text-sm text-gray-600">
                        {(variant.priceCents / 100).toLocaleString("tr-TR", {
                          style: "currency",
                          currency: "TRY",
                        })}
                      </div>
                    </div>
                    <div className="text-right">
                      {variant.stock === 0 ? (
                        <span className="text-xs font-medium text-red-600">Stokta Yok</span>
                      ) : variant.stock <= 5 ? (
                        <span className="text-xs font-medium text-orange-600">
                          Son {variant.stock} adet
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">Stokta</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Seçili Varyant Bilgisi */}
      {selectedVariant && (
        <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-[#1F2937]">
                Seçili: {selectedVariant.sku}
              </div>
              <div className="text-sm text-gray-600">
                {(selectedVariant.priceCents / 100).toLocaleString("tr-TR", {
                  style: "currency",
                  currency: "TRY",
                })}
              </div>
            </div>
            <div className="text-right">
              {isOutOfStock ? (
                <span className="text-sm font-medium text-red-600">Stokta Yok</span>
              ) : isLowStock ? (
                <span className="text-sm font-medium text-orange-600">
                  Son {selectedVariant.stock} adet
                </span>
              ) : (
                <span className="text-sm text-gray-600">
                  {selectedVariant.stock} adet stokta
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sepete Ekle Formu */}
      <form action={formAction} onSubmit={handleSubmit}>
        <input type="hidden" name="variantId" value={selectedVariantId || ""} />
        <input type="hidden" name="qty" value="1" />
        <button
          type="submit"
          disabled={!selectedVariantId || isOutOfStock || disabled}
          className="w-full rounded-md bg-[#D97706] px-4 py-3 text-sm font-medium text-white hover:bg-[#92400E] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isOutOfStock
            ? "Stokta Yok"
            : disabled
            ? "Kendi Ürününüzü Satın Alamazsınız"
            : "Sepete Ekle"}
        </button>
      </form>

      {/* Hata Mesajı */}
      {state?.error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3">
          <p className="text-sm text-red-800">{state.error}</p>
        </div>
      )}

      {/* Başarı Mesajı */}
      {showSuccess && (
        <div className="rounded-md bg-green-50 border border-green-200 p-3">
          <p className="text-sm text-green-800">
            ✓ {productTitle} sepete eklendi!
          </p>
        </div>
      )}
    </div>
  );
}

