"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

interface ProductImageProps {
  src?: string; // URL (fallback)
  cfImageId?: string; // Cloudflare Images ID (preferred)
  variant?: string; // Image variant (default: "public" or "card")
  alt: string;
  className?: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  width?: number;
  height?: number;
}

export default function ProductImage({
  src,
  cfImageId,
  variant = "public",
  alt,
  className = "",
  fill,
  sizes,
  priority,
  width,
  height,
}: ProductImageProps) {
  const [hasError, setHasError] = useState(false);
  
  // Cloudflare Images URL'i oluştur (cfImageId varsa öncelikli)
  const accountHash = process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_HASH;
  const cloudflareUrl = cfImageId && accountHash
    ? `https://imagedelivery.net/${accountHash}/${cfImageId}/${variant}`
    : null;
  
  const imgSrc = cloudflareUrl || src || "";
  const [displaySrc, setDisplaySrc] = useState(imgSrc);

  // Eğer src veya cfImageId değişirse, state'i güncelle ve hatayı sıfırla
  useEffect(() => {
    const newSrc = cloudflareUrl || src || "";
    if (displaySrc !== newSrc) {
      setDisplaySrc(newSrc);
      setHasError(false);
    }
  }, [src, cfImageId, variant, cloudflareUrl, displaySrc]);

  // Cloudflare Images URL formatını kontrol et
  const isCloudflareUrl = Boolean(displaySrc && displaySrc.startsWith("https://imagedelivery.net/"));
  const isPlaceholder = Boolean(displaySrc && displaySrc.includes("placeholder"));
  
  // Eğer src boşsa veya hata varsa placeholder göster
  const finalSrc = hasError || !displaySrc || (!isCloudflareUrl && displaySrc.includes("/uploads/"))
    ? "https://via.placeholder.com/800x800?text=Görsel+Yok"
    : displaySrc;

  // Cloudflare Images için unoptimized kullan (CDN zaten optimize ediyor)
  const shouldUnoptimize = isPlaceholder || isCloudflareUrl;

  // Next.js Image component'inde onError yok, bu yüzden error boundary kullanıyoruz
  if (fill) {
    return (
      <div className={className || "relative h-full w-full"}>
        {hasError ? (
          <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
            <span>Görsel yüklenemedi</span>
          </div>
        ) : (
          <Image
            src={finalSrc}
            alt={alt}
            fill
            className="object-cover"
            sizes={sizes}
            priority={priority}
            unoptimized={shouldUnoptimize}
          />
        )}
      </div>
    );
  }

  return (
    <>
      {hasError ? (
        <div className={`flex items-center justify-center bg-gray-100 text-gray-400 ${className}`} style={{ width, height }}>
          <span>Görsel yüklenemedi</span>
        </div>
      ) : (
        <Image
          src={finalSrc}
          alt={alt}
          width={width || 800}
          height={height || 800}
          className={className}
          priority={priority}
          unoptimized={shouldUnoptimize}
        />
      )}
    </>
  );
}

