"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";

export interface UploadedImage {
  id: string;
  url: string;
  sortOrder: number;
  isPrimary: boolean;
  altText?: string | null;
}

interface UploadProgress {
  file: File;
  progress: number;
  error?: string;
  retrying?: boolean;
}

interface ImageUploaderProps {
  listingSlug: string | null;
  images: UploadedImage[];
  onImagesChange: (images: UploadedImage[]) => void;
  onEnsureListing?: () => Promise<string | null>;
  maxImages?: number;
  disabled?: boolean;
}

export default function ImageUploader({
  listingSlug,
  images,
  onImagesChange,
  onEnsureListing,
  maxImages = 8,
  disabled = false,
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Map<string, UploadProgress>>(new Map());
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [currentSlug, setCurrentSlug] = useState<string | null>(listingSlug);

  // Keep currentSlug in sync with prop
  useEffect(() => {
    if (listingSlug) {
      setCurrentSlug(listingSlug);
    }
  }, [listingSlug]);

  const canUploadMore = images.length < maxImages;

  const uploadFile = useCallback(
    async (file: File, sortOrder: number, isPrimary: boolean, slug: string): Promise<UploadedImage | null> => {
      const fileId = `${file.name}-${Date.now()}`;
      setUploadProgress((prev) =>
        new Map(prev).set(fileId, { file, progress: 0 })
      );

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("sortOrder", sortOrder.toString());
        formData.append("isPrimary", isPrimary.toString());

        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            const current = prev.get(fileId);
            if (!current) return prev;
            const newProgress = Math.min(current.progress + 10, 90);
            return new Map(prev).set(fileId, { ...current, progress: newProgress });
          });
        }, 100);

        const uploadRes = await fetch(`/api/listings/${slug}/media`, {
          method: "POST",
          body: formData,
        });

        clearInterval(progressInterval);

        if (!uploadRes.ok) {
          const data = await uploadRes.json();
          throw new Error(data.error?.message || data.error || "Görsel yüklenemedi");
        }

        const uploadData = await uploadRes.json();
        setUploadProgress((prev) => {
          const newMap = new Map(prev);
          newMap.delete(fileId);
          return newMap;
        });

        return uploadData.media;
      } catch (error) {
        setUploadProgress((prev) => {
          const current = prev.get(fileId);
          if (!current) return prev;
          return new Map(prev).set(fileId, {
            ...current,
            progress: 0,
            error: error instanceof Error ? error.message : "Yükleme hatası",
          });
        });
        return null;
      }
    },
    []
  );

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      if (disabled || !canUploadMore) return;

      const fileArray = Array.from(files);
      const remainingSlots = maxImages - images.length;
      const filesToUpload = fileArray.slice(0, remainingSlots);

      if (filesToUpload.length === 0) {
        return;
      }

      // Validate files
      const validFiles: File[] = [];
      for (const file of filesToUpload) {
        if (!file.type.startsWith("image/")) {
          continue;
        }
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
          continue;
        }
        if (file.size > 10 * 1024 * 1024) {
          continue;
        }
        validFiles.push(file);
      }

      if (validFiles.length === 0) {
        return;
      }

      // Ensure listing exists before uploading
      let activeSlug = currentSlug;
      if (!activeSlug && onEnsureListing) {
        activeSlug = await onEnsureListing();
        if (activeSlug) {
          setCurrentSlug(activeSlug);
        }
      }

      if (!activeSlug) {
        // Show error if we couldn't get a slug
        const fileId = `error-${Date.now()}`;
        setUploadProgress((prev) =>
          new Map(prev).set(fileId, { 
            file: validFiles[0], 
            progress: 0, 
            error: "Önce ürün bilgilerini kaydedin" 
          })
        );
        return;
      }

      // Upload files sequentially
      const newImages: UploadedImage[] = [];
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        const sortOrder = images.length + newImages.length;
        const isPrimary = images.length === 0 && newImages.length === 0;
        const uploaded = await uploadFile(file, sortOrder, isPrimary, activeSlug);
        if (uploaded) {
          newImages.push(uploaded);
        }
      }

      if (newImages.length > 0) {
        onImagesChange([...images, ...newImages]);
      }
    },
    [currentSlug, disabled, canUploadMore, maxImages, images, uploadFile, onImagesChange, onEnsureListing]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
      e.target.value = ""; // Reset input
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && canUploadMore) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || !canUploadMore) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handleDelete = async (imageId: string) => {
    if (!currentSlug || disabled) return;

    try {
      const res = await fetch(`/api/listings/${currentSlug}/media/${imageId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Görsel silinemedi");
      }

      const newImages = images.filter((img) => img.id !== imageId);
      // If deleted was primary and there are other images, set first as primary
      const deletedImage = images.find((img) => img.id === imageId);
      if (deletedImage?.isPrimary && newImages.length > 0) {
        await handleSetPrimary(newImages[0].id);
      } else {
        onImagesChange(newImages);
      }
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    if (!currentSlug || disabled) return;

    try {
      const res = await fetch(`/api/listings/${currentSlug}/media/${imageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPrimary: true }),
      });

      if (!res.ok) {
        throw new Error("Ana görsel ayarlanamadı");
      }

      onImagesChange(
        images.map((img) => ({
          ...img,
          isPrimary: img.id === imageId,
        }))
      );
    } catch (error) {
      console.error("Error setting primary:", error);
    }
  };

  const handleRetry = async (fileId: string) => {
    const progress = uploadProgress.get(fileId);
    if (!progress || !currentSlug) return;

    setUploadProgress((prev) => {
      const current = prev.get(fileId);
      if (!current) return prev;
      return new Map(prev).set(fileId, { ...current, retrying: true, error: undefined });
    });

    const sortOrder = images.length;
    const isPrimary = images.length === 0;
    const uploaded = await uploadFile(progress.file, sortOrder, isPrimary, currentSlug);

    if (uploaded) {
      onImagesChange([...images, uploaded]);
      setUploadProgress((prev) => {
        const newMap = new Map(prev);
        newMap.delete(fileId);
        return newMap;
      });
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragOverItem = (index: number) => {
    setDragOverIndex(index);
  };

  const handleDropItem = async (dropIndex: number) => {
    if (draggedIndex === null || draggedIndex === dropIndex || !currentSlug) return;

    const newImages = [...images];
    const [draggedItem] = newImages.splice(draggedIndex, 1);
    newImages.splice(dropIndex, 0, draggedItem);

    // Update sort orders
    const updatedImages = newImages.map((img, index) => ({
      ...img,
      sortOrder: index,
    }));

    onImagesChange(updatedImages);

    // Update backend
    try {
      await fetch(`/api/listings/${currentSlug}/media/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaIds: updatedImages.map((img) => img.id),
        }),
      });
    } catch (error) {
      console.error("Error reordering images:", error);
      // Revert on error
      onImagesChange(images);
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const uploadingCount = uploadProgress.size;
  const hasErrors = Array.from(uploadProgress.values()).some((p) => p.error);

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {canUploadMore && (
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-lg transition-all ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border-subtle hover:border-primary/50"
          } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleFileSelect}
            disabled={disabled || !canUploadMore}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || !canUploadMore}
            className="w-full py-8 px-4 flex flex-col items-center justify-center gap-2 text-text-secondary hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-4xl">
              {isDragging ? "cloud_upload" : "add_photo_alternate"}
            </span>
            <div className="text-center">
              <p className="font-medium text-text-charcoal">
                {isDragging ? "Görselleri buraya bırakın" : "Görsel ekle veya sürükle-bırak"}
              </p>
              <p className="text-sm mt-1">
                JPEG, PNG, WebP (max 10MB) • {images.length}/{maxImages} görsel
              </p>
            </div>
          </button>
        </div>
      )}

      {/* Upload Progress */}
      {uploadingCount > 0 && (
        <div className="space-y-2">
          {Array.from(uploadProgress.entries()).map(([fileId, progress]) => (
            <div
              key={fileId}
              className="bg-surface-white border border-border-subtle rounded-lg p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-text-charcoal truncate flex-1">
                  {progress.file.name}
                </span>
                {progress.error ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-red-500">{progress.error}</span>
                    <button
                      onClick={() => handleRetry(fileId)}
                      disabled={progress.retrying}
                      className="text-xs text-primary hover:text-primary-dark disabled:opacity-50"
                    >
                      {progress.retrying ? "Yeniden deneniyor..." : "Yeniden Dene"}
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-text-secondary">{progress.progress}%</span>
                )}
              </div>
              {!progress.error && (
                <div className="w-full bg-background-ivory rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${progress.progress}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Images Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((img, index) => (
            <div
              key={img.id}
              draggable={!disabled}
              onDragStart={() => handleDragStart(index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => {
                e.preventDefault();
                handleDragOverItem(index);
              }}
              onDrop={(e) => {
                e.preventDefault();
                handleDropItem(index);
              }}
              className={`relative group border-2 rounded-lg overflow-hidden transition-all ${
                draggedIndex === index
                  ? "opacity-50 scale-95"
                  : dragOverIndex === index
                  ? "border-primary scale-105"
                  : "border-border-subtle"
              } ${img.isPrimary ? "ring-2 ring-primary" : ""}`}
            >
              {/* Image */}
              <div className="aspect-square relative bg-gray-100">
                <Image
                  src={img.url}
                  alt={img.altText || `Görsel ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                  unoptimized={img.url.includes('supabase.co')}
                />

                {/* Primary Badge */}
                {img.isPrimary && (
                  <div className="absolute top-2 left-2 bg-primary text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">star</span>
                    Ana Görsel
                  </div>
                )}

                {/* Drag Handle */}
                {!disabled && images.length > 1 && (
                  <div className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-[18px]">drag_indicator</span>
                  </div>
                )}

                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {!img.isPrimary && (
                    <button
                      onClick={() => handleSetPrimary(img.id)}
                      className="px-3 py-1.5 bg-white text-text-charcoal rounded text-sm font-medium hover:bg-primary hover:text-white transition-colors"
                      title="Ana görsel yap"
                    >
                      <span className="material-symbols-outlined text-[16px] align-middle mr-1">
                        star
                      </span>
                      Ana Yap
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(img.id)}
                    className="px-3 py-1.5 bg-red-500 text-white rounded text-sm font-medium hover:bg-red-600 transition-colors"
                    title="Sil"
                  >
                    <span className="material-symbols-outlined text-[16px] align-middle">delete</span>
                  </button>
                </div>
              </div>

              {/* Image Number */}
              <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Text */}
      {images.length === 0 && !canUploadMore && (
        <p className="text-sm text-text-secondary text-center py-4">
          Maksimum {maxImages} görsel yüklenebilir
        </p>
      )}

      {images.length > 0 && images.length < maxImages && (
        <p className="text-xs text-text-secondary text-center">
          {images.length}/{maxImages} görsel yüklendi • Sürükle-bırak ile sıralayabilirsiniz
        </p>
      )}

      {images.length >= maxImages && (
        <p className="text-xs text-amber-600 text-center">
          Maksimum {maxImages} görsel limitine ulaştınız
        </p>
      )}
    </div>
  );
}


