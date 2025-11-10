"use client";

import { useState, useCallback } from "react";
import Image from "next/image";

/**
 * ImageUploader component for admin product forms
 * Supports drag & drop, multiple images, and Cloudflare Images upload
 */
interface ImageUploaderProps {
  images: Array<{ id?: string; url: string; alt?: string; sort: number }>;
  onImagesChange: (images: Array<{ url: string; alt?: string; sort: number }>) => void;
  maxImages?: number;
}

export default function ImageUploader({
  images,
  onImagesChange,
  maxImages = 10,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  /**
   * Uploads a file to Cloudflare Images via API
   */
  const uploadFile = useCallback(async (file: File): Promise<string> => {
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
  }, []);

  /**
   * Handles file selection and upload
   */
  const handleFiles = useCallback(
    async (files: FileList | null) => {
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
    },
    [images, maxImages, onImagesChange, uploadFile]
  );

  /**
   * Handles drag and drop events
   */
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  /**
   * Handles file drop
   */
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  /**
   * Removes an image from the list
   */
  const removeImage = useCallback(
    (index: number) => {
      const newImages = images.filter((_, i) => i !== index).map((img, i) => ({ ...img, sort: i }));
      onImagesChange(newImages);
    },
    [images, onImagesChange]
  );

  /**
   * Reorders images (moves image up or down)
   */
  const moveImage = useCallback(
    (index: number, direction: "up" | "down") => {
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= images.length) return;

      const newImages = [...images];
      [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
      const reordered = newImages.map((img, i) => ({ ...img, sort: i }));
      onImagesChange(reordered);
    },
    [images, onImagesChange]
  );

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">Ürün Görselleri</label>

      {/* Drag & Drop Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? "border-primary bg-primary/5"
            : "border-gray-300 hover:border-gray-400 bg-gray-50"
        } ${uploading ? "opacity-50 pointer-events-none" : ""}`}
      >
        <input
          type="file"
          id="image-upload"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={uploading || images.length >= maxImages}
        />
        <label
          htmlFor="image-upload"
          className="cursor-pointer flex flex-col items-center gap-2"
        >
          <span className="material-symbols-outlined text-4xl text-gray-400">cloud_upload</span>
          <span className="text-sm text-gray-600">
            {uploading
              ? "Yükleniyor..."
              : images.length >= maxImages
                ? `Maksimum ${maxImages} görsel yüklendi`
                : "Görselleri sürükleyip bırakın veya tıklayarak seçin"}
          </span>
          <span className="text-xs text-gray-500">
            JPG, PNG, GIF, WEBP (max 10MB per file)
          </span>
        </label>
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square relative rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                <Image
                  src={image.url}
                  alt={image.alt || `Görsel ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                  unoptimized={image.url.includes("imagedelivery.net")}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => moveImage(index, "up")}
                    disabled={index === 0}
                    className="opacity-0 group-hover:opacity-100 p-2 bg-white/90 rounded hover:bg-white transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Yukarı taşı"
                  >
                    <span className="material-symbols-outlined text-sm">arrow_upward</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => moveImage(index, "down")}
                    disabled={index === images.length - 1}
                    className="opacity-0 group-hover:opacity-100 p-2 bg-white/90 rounded hover:bg-white transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Aşağı taşı"
                  >
                    <span className="material-symbols-outlined text-sm">arrow_downward</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="opacity-0 group-hover:opacity-100 p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-opacity"
                    title="Sil"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </div>
              <div className="mt-1 text-xs text-center text-gray-500">
                Sıra: {image.sort + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hidden input for form submission (contains image URLs as JSON) */}
      <input
        type="hidden"
        name="images"
        value={JSON.stringify(images.map((img) => ({ url: img.url, alt: img.alt || "", sort: img.sort })))}
      />
    </div>
  );
}

