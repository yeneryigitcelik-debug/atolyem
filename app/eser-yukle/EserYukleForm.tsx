"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createEserAction } from "./actions";
import { useToast } from "@/app/components/ui/ToastProvider";

interface Category {
  id: string;
  name: string;
  parent?: {
    name: string;
  } | null;
}

interface EserYukleFormProps {
  categories: Category[];
}

export default function EserYukleForm({ categories }: EserYukleFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      // Dosya tipi kontrolü
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
      const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
      
      const invalidFiles = files.filter(file => {
        const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf("."));
        const isValidMimeType = file.type && allowedTypes.includes(file.type.toLowerCase());
        const isValidExtension = allowedExtensions.includes(fileExtension);
        return !isValidMimeType && !isValidExtension;
      });
      
      if (invalidFiles.length > 0) {
        setError(`Geçersiz dosya tipi: ${invalidFiles.map(f => f.name).join(", ")}. Sadece görsel dosyaları (JPG, PNG, GIF, WEBP, SVG) yükleyebilirsiniz.`);
        return;
      }
      
      // Dosya boyutu kontrolü (max 10MB)
      const oversizedFiles = files.filter(file => file.size > 10 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        setError(`Dosya boyutu çok büyük: ${oversizedFiles.map(f => f.name).join(", ")}. Maksimum dosya boyutu 10MB'dır.`);
        return;
      }
      
      setImages(files);
      const previews = files.map((file) => URL.createObjectURL(file));
      setImagePreviews(previews);
      setError(null); // Hata varsa temizle
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (formData: FormData) => {
    setError(null);

    startTransition(async () => {
      try {
        // Önce görselleri yükle
        const uploadedImages: string[] = [];
        for (let i = 0; i < images.length; i++) {
          const image = images[i];
          setUploadProgress(`Görsel ${i + 1}/${images.length} yükleniyor...`);
          
          const uploadFormData = new FormData();
          uploadFormData.append("file", image);

          try {
            const uploadResponse = await fetch("/api/upload", {
              method: "POST",
              body: uploadFormData,
            });

            if (!uploadResponse.ok) {
              const errorData = await uploadResponse.json().catch(() => ({ error: "Bilinmeyen hata" }));
              const errorMsg = errorData.error || `Görsel ${i + 1} yüklenirken bir hata oluştu (${uploadResponse.status})`;
              console.error("Upload error:", errorMsg, errorData);
              throw new Error(errorMsg);
            }

            const uploadData = await uploadResponse.json();
            if (!uploadData.url) {
              console.error("Upload data:", uploadData);
              throw new Error(`Görsel ${i + 1} yüklendi ancak URL alınamadı`);
            }
            uploadedImages.push(uploadData.url);
          } catch (err: any) {
            console.error(`Image ${i + 1} upload error:`, err);
            // Yüklenen görselleri temizle
            uploadedImages.forEach((url) => {
              // Cloudflare'den silme işlemi yapılabilir ama şimdilik sadece hata göster
            });
            throw new Error(
              err.message || `Görsel ${i + 1} yüklenirken bir hata oluştu: ${err.toString()}`
            );
          }
        }
        
        setUploadProgress("Görseller yüklendi, eser kaydediliyor...");

        // Görselleri formData'ya ekle
        uploadedImages.forEach((url, index) => {
          formData.append(`imageUrl_${index}`, url);
        });
        formData.append("imageCount", uploadedImages.length.toString());

        const result = await createEserAction(formData);
        if (result?.error) {
          setError(result.error);
          showToast(result.error, "error");
        } else if (result?.success) {
          // Başarılı mesajı göster
          showToast("Ürününüz başarıyla onaya gönderildi", "success");
          // Kısa bir gecikme sonrası yönlendir
          setTimeout(() => {
            router.push("/seller/products");
            router.refresh();
          }, 1500);
        }
      } catch (err: any) {
        console.error("Form submit error:", err);
        const errorMessage = err.message || "Bir hata oluştu";
        setError(errorMessage);
        showToast(errorMessage, "error");
      } finally {
        setUploadProgress("");
      }
    });
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-800 dark:text-red-400">
          <p className="font-semibold">Hata:</p>
          <p>{error}</p>
        </div>
      )}
      {uploadProgress && (
        <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 p-3 text-sm text-blue-800 dark:text-blue-400">
          {uploadProgress}
        </div>
      )}

      <form action={handleSubmit} className="space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        {/* Temel Bilgiler */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-[#1F2937] border-b border-gray-200 pb-2">Temel Bilgiler</h2>
          
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Eser Adı *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#D97706] focus:outline-none focus:ring-2 focus:ring-[#D97706]/20"
              placeholder="Örn: El Yapımı Seramik Vazo"
            />
          </div>

          <div>
            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
              Kategori *
            </label>
            <select
              id="categoryId"
              name="categoryId"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#D97706] focus:outline-none focus:ring-2 focus:ring-[#D97706]/20"
            >
              <option value="">Kategori seçiniz</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.parent ? `${cat.parent.name} > ${cat.name}` : cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Eserin Hikayesi *
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={6}
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#D97706] focus:outline-none focus:ring-2 focus:ring-[#D97706]/20"
              placeholder="Eserinizin hikayesini, yapım sürecini, ilham kaynağınızı anlatın..."
            />
            <p className="mt-1 text-xs text-gray-500">Eserinizin hikayesini detaylı bir şekilde anlatın</p>
          </div>
        </div>

        {/* Görseller */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-[#1F2937] border-b border-gray-200 pb-2">Görseller</h2>
          
          <div>
            <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-1">
              Eser Görselleri *
            </label>
            <input
              type="file"
              id="images"
              name="images"
              accept="image/*"
              multiple
              required={images.length === 0}
              onChange={handleImageChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#D97706] focus:outline-none focus:ring-2 focus:ring-[#D97706]/20"
            />
            <p className="mt-1 text-xs text-gray-500">Birden fazla görsel seçebilirsiniz (max 10MB/görsel)</p>
          </div>

          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Varyant Bilgileri */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-[#1F2937] border-b border-gray-200 pb-2">Varyant Bilgileri</h2>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-1">
                Boyut
              </label>
              <input
                type="text"
                id="size"
                name="size"
                className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#D97706] focus:outline-none focus:ring-2 focus:ring-[#D97706]/20"
                placeholder="Örn: 20x30 cm"
              />
            </div>
            <div>
              <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
                Renk
              </label>
              <input
                type="text"
                id="color"
                name="color"
                className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#D97706] focus:outline-none focus:ring-2 focus:ring-[#D97706]/20"
                placeholder="Örn: Mavi, Kırmızı"
              />
            </div>
            <div>
              <label htmlFor="material" className="block text-sm font-medium text-gray-700 mb-1">
                Malzeme
              </label>
              <input
                type="text"
                id="material"
                name="material"
                className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#D97706] focus:outline-none focus:ring-2 focus:ring-[#D97706]/20"
                placeholder="Örn: Seramik, Ahşap"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-1">
                SKU (Stok Kodu) *
              </label>
              <input
                type="text"
                id="sku"
                name="sku"
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#D97706] focus:outline-none focus:ring-2 focus:ring-[#D97706]/20"
                placeholder="Örn: SER-001"
              />
            </div>
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Fiyat (TL) *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                required
                min="0"
                step="0.01"
                className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#D97706] focus:outline-none focus:ring-2 focus:ring-[#D97706]/20"
                placeholder="0.00"
              />
            </div>
            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
                Stok Adedi *
              </label>
              <input
                type="number"
                id="stock"
                name="stock"
                required
                min="0"
                className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#D97706] focus:outline-none focus:ring-2 focus:ring-[#D97706]/20"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Durum */}
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked
              className="rounded border-gray-300 text-[#D97706] focus:ring-[#D97706]"
            />
            <span className="ml-2 text-sm text-gray-700">Eseri aktif olarak yayınla</span>
          </label>
        </div>

        {/* Butonlar */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 rounded-md bg-[#D97706] px-6 py-3 text-white hover:bg-[#92400E] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Yükleniyor..." : "Eseri Yükle"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-md border border-gray-300 px-6 py-3 text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          >
            İptal
          </button>
        </div>
      </form>
    </div>
  );
}

