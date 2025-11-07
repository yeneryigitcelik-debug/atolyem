"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createVariantAction, updateVariantAction } from "@/app/admin/products/actions";

/**
 * Variant form component
 */
interface VariantFormProps {
  mode: "create" | "edit";
  productId: string;
  variantId?: string;
  defaultValues?: {
    sku?: string;
    priceCents?: number;
    stock?: number;
    attributes?: any;
  };
  submitLabel?: string;
  cancelHref?: string;
}

export default function VariantForm({
  mode,
  productId,
  variantId,
  defaultValues,
  submitLabel = "Kaydet",
  cancelHref,
}: VariantFormProps) {
  const action = mode === "create"
    ? (prevState: any, formData: FormData) => createVariantAction(productId, prevState, formData)
    : (prevState: any, formData: FormData) => updateVariantAction(variantId!, prevState, formData);

  const [state, formAction] = useActionState(action, null);

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      {state && "error" in state && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800">{state.error}</div>
      )}

      <div>
        <label htmlFor="sku" className="block text-sm font-medium text-gray-700">
          SKU
        </label>
        <input
          type="text"
          id="sku"
          name="sku"
          required
          defaultValue={defaultValues?.sku}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
        />
      </div>
      <div>
        <label htmlFor="priceCents" className="block text-sm font-medium text-gray-700">
          Fiyat (Kuruş)
        </label>
        <input
          type="number"
          id="priceCents"
          name="priceCents"
          required
          min="0"
          defaultValue={defaultValues?.priceCents}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
        />
        <p className="mt-1 text-xs text-gray-500">Örnek: 199900 = 1999.00 TL</p>
      </div>
      <div>
        <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
          Stok
        </label>
        <input
          type="number"
          id="stock"
          name="stock"
          required
          min="0"
          defaultValue={defaultValues?.stock ?? 0}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
        />
      </div>
      <div>
        <label htmlFor="attributes" className="block text-sm font-medium text-gray-700">
          Özellikler (JSON - Opsiyonel)
        </label>
        <textarea
          id="attributes"
          name="attributes"
          rows={4}
          defaultValue={defaultValues?.attributes ? JSON.stringify(defaultValues.attributes, null, 2) : ""}
          placeholder='{"renk": "kırmızı", "boyut": "L"}'
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
        />
      </div>
      <div className="flex gap-4">
        <button
          type="submit"
          className="rounded-md bg-primary px-4 py-2 text-white hover:bg-secondary transition-colors"
        >
          {submitLabel}
        </button>
        {cancelHref && (
          <Link
            href={cancelHref}
            className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
          >
            İptal
          </Link>
        )}
      </div>
    </form>
  );
}

