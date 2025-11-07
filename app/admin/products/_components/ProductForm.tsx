"use client";

import { useState, useActionState } from "react";
import Link from "next/link";
import ImageUploader from "./ImageUploader";
import { productFormAction } from "./productFormActions";

/**
 * Product form component with ImageUploader integration
 * Used in both create and edit pages
 */
interface ProductFormProps {
  mode: "create" | "edit";
  productId?: string;
  defaultValues?: {
    title?: string;
    slug?: string;
    description?: string;
    sellerId?: string;
    categoryId?: string;
    isActive?: boolean;
    images?: Array<{ id?: string; url: string; alt?: string; sort: number }>;
  };
  categories: Array<{ id: string; name: string }>;
  sellers: Array<{ id: string; displayName: string; user: { email: string } }>;
  submitLabel?: string;
  cancelHref?: string;
}

export default function ProductForm({
  mode,
  productId,
  defaultValues,
  categories,
  sellers,
  submitLabel = "Kaydet",
  cancelHref,
}: ProductFormProps) {
  const [images, setImages] = useState<Array<{ url: string; alt?: string; sort: number }>>(
    defaultValues?.images?.map((img) => ({ url: img.url, alt: img.alt, sort: img.sort })) || []
  );
  
  const [state, formAction] = useActionState(productFormAction, null);

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
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
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
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
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
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="sellerId" className="block text-sm font-medium text-gray-700">
            Satıcı
          </label>
          <select
            id="sellerId"
            name="sellerId"
            required
            defaultValue={defaultValues?.sellerId}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
          >
            <option value="">Seçiniz</option>
            {sellers.map((seller) => (
              <option key={seller.id} value={seller.id}>
                {seller.displayName} ({seller.user.email})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
            Kategori
          </label>
          <select
            id="categoryId"
            name="categoryId"
            defaultValue={defaultValues?.categoryId}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
          >
            <option value="">Seçiniz</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={defaultValues?.isActive ?? true}
            className="rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span className="ml-2 text-sm text-gray-700">Aktif</span>
        </label>
      </div>

      <ImageUploader images={images} onImagesChange={setImages} />

      {/* Hidden input for productId in edit mode */}
      {mode === "edit" && productId && (
        <input type="hidden" name="_productId" value={productId} />
      )}

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

