"use client";

import { useState, useRef } from "react";
import Image from "next/image";

interface DirectImageUploaderProps {
  onUploadComplete: (imageId: string, imageUrl: string) => void;
  onUploadError?: (error: string) => void;
  maxSize?: number; // bytes
  acceptedTypes?: string[];
  multiple?: boolean;
  className?: string;
}

/**
 * Direct Image Uploader Component
 * Uses Cloudflare Images Direct Upload API for secure client-side uploads
 */
export default function DirectImageUploader({
  onUploadComplete,
  onUploadError,
  maxSize = 10 * 1024 * 1024, // 10MB default
  acceptedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"],
  multiple = false,
  className = "",
}: DirectImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const accountHash = process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_HASH;

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!acceptedTypes.includes(file.type)) {
      onUploadError?.(
        `Geçersiz dosya tipi. İzin verilen tipler: ${acceptedTypes.join(", ")}`
      );
      return;
    }

    // Validate file size
    if (file.size > maxSize) {
      onUploadError?.(`Dosya boyutu çok büyük. Maksimum: ${Math.round(maxSize / 1024 / 1024)}MB`);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Start upload
    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    setProgress(10);

    try {
      // Use existing upload endpoint (works with Cloudflare Images API)
      const formData = new FormData();
      formData.append("file", file);

      setProgress(30);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      setProgress(60);

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json().catch(() => ({
          error: "Görsel yüklenemedi",
        }));
        
        // Detaylı hata mesajı oluştur
        let errorMessage = errorData.error || "Görsel yüklenemedi";
        
        if (errorData.details) {
          errorMessage += `: ${errorData.details}`;
        }
        
        console.error("Upload error:", errorData);
        throw new Error(errorMessage);
      }

      setProgress(80);

      const uploadResult = await uploadResponse.json();

      if (!uploadResult.imageId || !uploadResult.url) {
        throw new Error("Görsel yüklendi ancak geçersiz yanıt alındı");
      }

      // Extract image ID from URL or use returned imageId
      // URL format: https://imagedelivery.net/{hash}/{id}/{variant}
      const imageId = uploadResult.imageId;
      const imageUrl = uploadResult.url;

      setProgress(100);
      onUploadComplete(imageId, imageUrl);
    } catch (error: any) {
      console.error("Upload error:", error);
      onUploadError?.(error.message || "Görsel yüklenirken bir hata oluştu");
    } finally {
      setUploading(false);
      setProgress(0);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const fakeEvent = {
        target: { files: [file] },
      } as any;
      handleFileSelect(fakeEvent);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className={className}>
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(",")}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />

        {uploading ? (
          <div className="space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600">Yükleniyor... {progress}%</p>
          </div>
        ) : preview ? (
          <div className="space-y-2">
            <div className="relative w-full h-48 rounded-lg overflow-hidden">
              <Image
                src={preview}
                alt="Preview"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <p className="text-sm text-gray-600">
              Yeni görsel seçmek için tıklayın veya sürükleyip bırakın
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="text-sm text-gray-600">
              Görsel yüklemek için tıklayın veya sürükleyip bırakın
            </p>
            <p className="text-xs text-gray-500">
              Maksimum {Math.round(maxSize / 1024 / 1024)}MB
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

