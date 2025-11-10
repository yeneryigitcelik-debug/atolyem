"use client";

import { useState } from "react";
import Image from "next/image";
import { getCloudflareImageUrl, imageVariants } from "@/lib/cloudflare-images-variants";

interface ImageItem {
  id?: string;
  url: string;
  alt?: string;
  sort: number;
  cfImageId?: string;
}

interface EnhancedImageGalleryProps {
  images: ImageItem[];
  onImagesChange: (images: ImageItem[]) => void;
  maxImages?: number;
}

export default function EnhancedImageGallery({
  images,
  onImagesChange,
  maxImages = 10,
}: EnhancedImageGalleryProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Görsel yüklenemedi");
    }

    const data = await response.json();
    return data.url;
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      alert(`Maksimum ${maxImages} görsel yükleyebilirsiniz`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    setUploading(true);

    try {
      const uploadPromises = filesToUpload.map((file) => uploadFile(file));
      const urls = await Promise.all(uploadPromises);

      const newImages = urls.map((url, index) => ({
        url,
        alt: filesToUpload[index].name,
        sort: images.length + index,
      }));

      onImagesChange([...images, ...newImages]);
    } catch (error: any) {
      alert(error.message || "Görsel yüklenirken bir hata oluştu");
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [moved] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, moved);
    newImages.forEach((img, idx) => {
      img.sort = idx;
    });
    onImagesChange(newImages);
  };

  // Cloudflare Image ID'yi URL'den çıkar veya cfImageId kullan
  const getImageId = (image: ImageItem): string | null => {
    if (image.cfImageId) return image.cfImageId;
    const match = image.url.match(/imagedelivery\.net\/[^/]+\/([^/]+)/);
    return match ? match[1] : null;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Ürün Görselleri
        </label>
        <span className="text-xs text-gray-500">
          {images.length} / {maxImages}
        </span>
      </div>

      {/* Görsel Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => {
            const imageId = getImageId(image);
            const thumbnailUrl = imageId
              ? getCloudflareImageUrl(imageId, imageVariants.thumbnail)
              : image.url;
            const cardUrl = imageId
              ? getCloudflareImageUrl(imageId, imageVariants.card)
              : image.url;

            return (
              <div
                key={index}
                className="group relative aspect-square overflow-hidden rounded-xl border-2 border-gray-200 bg-gray-100 hover:border-[#D97706] transition-all shadow-sm hover:shadow-lg"
                onMouseEnter={() => setSelectedImage(index)}
                onMouseLeave={() => setSelectedImage(null)}
              >
                <Image
                  src={selectedImage === index ? cardUrl : thumbnailUrl}
                  alt={image.alt || `Ürün görseli ${index + 1}`}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  unoptimized={!!imageId}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {index > 0 && (
                    <button
                      onClick={() => moveImage(index, index - 1)}
                      className="rounded-lg bg-white/95 backdrop-blur-sm p-2 shadow-lg hover:bg-white transition-colors"
                      title="Yukarı Taşı"
                    >
                      <span className="material-symbols-outlined text-base text-gray-700">arrow_upward</span>
                    </button>
                  )}
                  {index < images.length - 1 && (
                    <button
                      onClick={() => moveImage(index, index + 1)}
                      className="rounded-lg bg-white/95 backdrop-blur-sm p-2 shadow-lg hover:bg-white transition-colors"
                      title="Aşağı Taşı"
                    >
                      <span className="material-symbols-outlined text-base text-gray-700">arrow_downward</span>
                    </button>
                  )}
                  <button
                    onClick={() => removeImage(index)}
                    className="rounded-lg bg-red-500/95 backdrop-blur-sm p-2 text-white shadow-lg hover:bg-red-600 transition-colors"
                    title="Sil"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                </div>
                <div className="absolute bottom-2 left-2 bg-gradient-to-r from-[#D97706] to-[#92400E] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  #{index + 1}
                </div>
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-lg">
                    Ana Görsel
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Area */}
      {images.length < maxImages && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? "border-[#D97706] bg-[#D97706]/5"
              : "border-gray-300 hover:border-gray-400"
          }`}
        >
          <input
            type="file"
            id="image-upload"
            multiple
            accept="image/*"
            onChange={(e) => handleFiles(e.target.files)}
            disabled={uploading}
            className="hidden"
          />
          <label
            htmlFor="image-upload"
            className="cursor-pointer flex flex-col items-center gap-2"
          >
            <span className="material-symbols-outlined text-4xl text-gray-400">
              {uploading ? "hourglass_empty" : "cloud_upload"}
            </span>
            {uploading ? (
              <p className="text-sm text-gray-600">Yükleniyor...</p>
            ) : (
              <>
                <p className="text-sm font-medium text-gray-700">
                  Görsel sürükleyip bırakın veya tıklayın
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, WEBP (max 10MB)
                </p>
              </>
            )}
          </label>
        </div>
      )}
    </div>
  );
}

