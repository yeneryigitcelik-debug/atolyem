"use client";

import { useState, useActionState } from "react";
import Link from "next/link";
import ImageUploader from "@/app/admin/products/_components/ImageUploader";
import { updateSellerProductAction } from "../actions";

/**
 * Seller product form component with ImageUploader integration
 * Used for editing seller products
 */
interface SellerProductFormProps {
  productId: string;
  defaultValues?: {
    title?: string;
    slug?: string;
    description?: string;
    categoryId?: string;
    isActive?: boolean;
    images?: Array<{ id?: string; url: string; alt?: string; sort: number }>;
    variants?: Array<{ id: string; sku: string; priceCents: number; stock: number }>;
  };
  categories: Array<{ id: string; name: string }>;
  submitLabel?: string;
  cancelHref?: string;
}

export default function SellerProductForm({
  productId,
  defaultValues,
  categories,
  submitLabel = "Güncelle",
  cancelHref,
}: SellerProductFormProps) {
  const [images, setImages] = useState<Array<{ url: string; alt?: string; sort: number }>>(
    defaultValues?.images?.map((img) => ({ url: img.url, alt: img.alt, sort: img.sort })) || []
  );
  
  const [state, formAction] = useActionState(
    (prevState: any, formData: FormData) => updateSellerProductAction(productId, prevState, formData),
    null
  );

  return (
    <form action={formAction} className="space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      {state && "error" in state && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">{state.error}</div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Başlık
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            defaultValue={defaultValues?.title}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#D97706] focus:outline-none focus:ring-[#D97706]"
          />
        </div>
        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
            Slug
          </label>
          <input
            type="text"
            id="slug"
            name="slug"
            required
            defaultValue={defaultValues?.slug}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#D97706] focus:outline-none focus:ring-[#D97706]"
            placeholder="ornek-urun"
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Açıklama
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={defaultValues?.description}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#D97706] focus:outline-none focus:ring-[#D97706]"
        />
      </div>

      <div>
        <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
          Kategori
        </label>
        <select
          id="categoryId"
          name="categoryId"
          defaultValue={defaultValues?.categoryId}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#D97706] focus:outline-none focus:ring-[#D97706]"
        >
          <option value="">Seçiniz</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={defaultValues?.isActive ?? true}
            className="rounded border-gray-300 text-[#D97706] focus:ring-[#D97706]"
          />
          <span className="ml-2 text-sm text-gray-700">Aktif</span>
        </label>
      </div>

      <ImageUploader images={images} onImagesChange={setImages} />

      {defaultValues?.variants && defaultValues.variants.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Fiyat Düzenleme</h3>
          <div className="space-y-4">
            {defaultValues.variants.map((variant) => (
              <div
                key={variant.id}
                className="rounded-md border border-gray-200 bg-white p-4"
              >
                <div className="mb-2">
                  <span className="text-sm font-medium text-gray-700">SKU: </span>
                  <span className="text-sm text-gray-900">{variant.sku}</span>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor={`price-${variant.id}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Fiyat (TL)
                    </label>
                    <input
                      type="number"
                      id={`price-${variant.id}`}
                      name={`variant-price-${variant.id}`}
                      step="0.01"
                      min="0"
                      defaultValue={(variant.priceCents / 100).toFixed(2)}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#D97706] focus:outline-none focus:ring-[#D97706]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`stock-${variant.id}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Stok
                    </label>
                    <input
                      type="number"
                      id={`stock-${variant.id}`}
                      name={`variant-stock-${variant.id}`}
                      min="0"
                      defaultValue={variant.stock}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#D97706] focus:outline-none focus:ring-[#D97706]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <button
          type="submit"
          className="rounded-md bg-[#D97706] px-4 py-2 text-white hover:bg-[#92400E] transition-colors"
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

