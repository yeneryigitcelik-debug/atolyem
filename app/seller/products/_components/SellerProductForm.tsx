"use client";

import { useState, useActionState } from "react";
import Link from "next/link";
import EnhancedImageGallery from "./EnhancedImageGallery";
import CreateVariantForm from "./CreateVariantForm";
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
    images?: Array<{ id?: string; url: string; alt?: string; sort: number; cfImageId?: string }>;
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
  const [images, setImages] = useState<Array<{ id?: string; url: string; alt?: string; sort: number; cfImageId?: string }>>(
    defaultValues?.images?.map((img) => ({ 
      id: img.id, 
      url: img.url, 
      alt: img.alt, 
      sort: img.sort,
      cfImageId: (img as any).cfImageId 
    })) || []
  );
  
  const [state, formAction] = useActionState(
    (prevState: any, formData: FormData) => updateSellerProductAction(productId, prevState, formData),
    null
  );

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-6 rounded-xl border border-gray-200 bg-white p-8 shadow-lg">
        {/* Hidden input for images */}
        <input
          type="hidden"
          name="images"
          value={JSON.stringify(images.map((img) => ({ 
            url: img.url, 
            alt: img.alt, 
            sort: img.sort,
            cfImageId: img.cfImageId 
          })))}
        />
        
        {state && "error" in state && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined">error</span>
              <span>{state.error}</span>
            </div>
          </div>
        )}

        {/* Temel Bilgiler */}
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <h2 className="text-xl font-bold text-gray-900">Temel Bilgiler</h2>
            <p className="text-sm text-gray-600 mt-1">Ürünün temel bilgilerini düzenleyin</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                Ürün Başlığı <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                defaultValue={defaultValues?.title}
                className="block w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:border-[#D97706] focus:outline-none focus:ring-2 focus:ring-[#D97706]/20 transition-all"
                placeholder="Örn: El Yapımı Seramik Vazo"
              />
            </div>

            <div>
              <label htmlFor="categoryId" className="block text-sm font-semibold text-gray-700 mb-2">
                Kategori
              </label>
              <select
                id="categoryId"
                name="categoryId"
                defaultValue={defaultValues?.categoryId}
                className="block w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:border-[#D97706] focus:outline-none focus:ring-2 focus:ring-[#D97706]/20 transition-all"
              >
                <option value="">Kategori Seçiniz</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center h-full pt-8">
                <input
                  type="checkbox"
                  name="isActive"
                  defaultChecked={defaultValues?.isActive ?? true}
                  className="rounded border-gray-300 text-[#D97706] focus:ring-[#D97706] w-5 h-5"
                />
                <span className="ml-3 text-sm font-medium text-gray-700">Ürünü Aktif Olarak Göster</span>
              </label>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                Ürün Açıklaması
              </label>
              <textarea
                id="description"
                name="description"
                rows={5}
                defaultValue={defaultValues?.description}
                className="block w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:border-[#D97706] focus:outline-none focus:ring-2 focus:ring-[#D97706]/20 transition-all resize-none"
                placeholder="Ürününüz hakkında detaylı bilgi verin..."
              />
            </div>
          </div>
        </div>

        {/* Görseller */}
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <h2 className="text-xl font-bold text-gray-900">Ürün Görselleri</h2>
            <p className="text-sm text-gray-600 mt-1">Ürününüz için görseller ekleyin (en fazla 10 görsel)</p>
          </div>
          <EnhancedImageGallery images={images} onImagesChange={setImages} />
        </div>

        {/* Fiyat ve Stok */}
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <h2 className="text-xl font-bold text-gray-900">Fiyat ve Stok</h2>
            <p className="text-sm text-gray-600 mt-1">Ürün fiyatını ve stok miktarını düzenleyin</p>
          </div>
          {defaultValues?.variants && defaultValues.variants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {defaultValues.variants.map((variant) => (
                <div
                  key={variant.id}
                  className="rounded-xl border-2 border-[#D97706]/20 bg-gradient-to-br from-[#FFF8F1] to-white p-6 shadow-sm"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-medium text-gray-500 uppercase">SKU</span>
                      <p className="text-sm font-bold text-gray-900 mt-1">{variant.sku}</p>
                    </div>
                    <div className="rounded-full bg-[#D97706]/10 px-3 py-1">
                      <span className="text-xs font-semibold text-[#D97706]">Varyant</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor={`price-${variant.id}`}
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Fiyat (TL) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₺</span>
                        <input
                          type="number"
                          id={`price-${variant.id}`}
                          name={`variant-price-${variant.id}`}
                          step="0.01"
                          min="0"
                          defaultValue={(variant.priceCents / 100).toFixed(2)}
                          className="block w-full rounded-lg border border-gray-300 pl-8 pr-4 py-3 shadow-sm focus:border-[#D97706] focus:outline-none focus:ring-2 focus:ring-[#D97706]/20 transition-all"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor={`stock-${variant.id}`}
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Stok <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        id={`stock-${variant.id}`}
                        name={`variant-stock-${variant.id}`}
                        min="0"
                        defaultValue={variant.stock}
                        className="block w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:border-[#D97706] focus:outline-none focus:ring-2 focus:ring-[#D97706]/20 transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border-2 border-yellow-200 bg-yellow-50 p-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-yellow-600">info</span>
                  <div>
                    <p className="text-sm font-semibold text-yellow-900 mb-1">Varyant Bulunamadı</p>
                    <p className="text-sm text-yellow-800">
                      Bu ürün için henüz varyant tanımlanmamış. Fiyat ve stok düzenlemek için önce bir varyant oluşturmanız gerekiyor.
                    </p>
                  </div>
                </div>
                <div className="border-t border-yellow-300 pt-4">
                  <p className="text-sm font-semibold text-yellow-900 mb-3">İlk Varyantı Oluşturun</p>
                  <CreateVariantForm productId={productId} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
          {cancelHref && (
            <Link
              href={cancelHref}
              className="rounded-lg border-2 border-gray-300 px-6 py-3 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              İptal
            </Link>
          )}
          <button
            type="submit"
            className="rounded-lg bg-gradient-to-r from-[#D97706] to-[#92400E] px-8 py-3 text-white font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}

