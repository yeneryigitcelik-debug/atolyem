"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ProfileImageUploaderProps {
  userId: string;
  currentImage?: string | null;
  type: "avatar" | "banner";
}

export default function ProfileImageUploader({
  userId,
  currentImage,
  type,
}: ProfileImageUploaderProps) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Dosya tipi kontrolü
    if (!file.type.startsWith("image/")) {
      alert("Sadece görsel dosyaları yüklenebilir");
      return;
    }

    // Dosya boyutu kontrolü (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("Dosya boyutu 10MB'dan küçük olmalıdır");
      return;
    }

    // Preview oluştur
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Yükle
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const response = await fetch(`/api/user/${userId}/profile-image`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Görsel yüklenemedi");
      }

      router.refresh();
      setPreview(null);
    } catch (error: any) {
      alert(error.message || "Görsel yüklenirken bir hata oluştu");
      setPreview(null);
    } finally {
      setUploading(false);
      if (e.target) {
        e.target.value = "";
      }
    }
  };

  const displayImage = preview || currentImage;

  if (type === "avatar") {
    return (
      <div className="relative group">
        <div
          className="mx-auto size-32 rounded-full border-4 border-[#f6f7f8] bg-cover bg-center bg-no-repeat dark:border-[#111921] transition-opacity"
          style={{
            backgroundImage: displayImage ? `url("${displayImage}")` : undefined,
            backgroundColor: displayImage ? "transparent" : "#e5e7eb",
          }}
        >
          {!displayImage && (
            <div className="flex items-center justify-center h-full text-gray-400 text-2xl">
              <span className="material-symbols-outlined">person</span>
            </div>
          )}
        </div>
        <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
          />
          <span className="text-white text-sm font-medium">
            {uploading ? "Yükleniyor..." : "Değiştir"}
          </span>
        </label>
      </div>
    );
  }

  // Banner
  return (
    <div className="relative group">
      <div
        className="h-64 w-full rounded-xl bg-cover bg-center bg-no-repeat bg-gray-200"
        style={{
          backgroundImage: displayImage ? `url("${displayImage}")` : undefined,
        }}
      >
        {!displayImage && (
          <div className="flex items-center justify-center h-full text-gray-400">
            <span className="material-symbols-outlined text-4xl">image</span>
          </div>
        )}
      </div>
      <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
        />
        <span className="text-white text-sm font-medium px-4 py-2 bg-black/50 rounded-lg">
          {uploading ? "Yükleniyor..." : "Arka Plan Fotoğrafı Değiştir"}
        </span>
      </label>
    </div>
  );
}

