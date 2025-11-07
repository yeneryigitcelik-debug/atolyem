"use client";

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
}

export default function ProductImage({ src, alt, className = "" }: ProductImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        // Eğer zaten placeholder değilse, placeholder'a geç
        if (!target.src.includes("placeholder")) {
          target.src = "https://via.placeholder.com/400x533?text=Görsel+Yok";
        }
      }}
    />
  );
}

