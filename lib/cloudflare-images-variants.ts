/**
 * Cloudflare Images variant helper
 * Farklı kullanım senaryoları için optimize edilmiş görsel varyantları
 */

const accountHash = process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_HASH || process.env.CLOUDFLARE_ACCOUNT_HASH;

export interface ImageVariantConfig {
  name: string;
  width?: number;
  height?: number;
  fit?: "cover" | "contain" | "scale-down" | "crop" | "pad";
  quality?: number; // 1-100
  format?: "auto" | "avif" | "webp" | "jpeg" | "png" | "gif";
}

/**
 * Cloudflare Images URL'i oluşturur
 * Variant parametreleri ile optimize edilmiş görsel URL'i döner
 * Cloudflare Images Transform API kullanır
 */
export function getCloudflareImageUrl(
  imageId: string,
  config: ImageVariantConfig | string = "public"
): string {
  if (!accountHash) {
    console.warn("CLOUDFLARE_ACCOUNT_HASH environment variable gerekli");
    return "";
  }

  // Eğer string ise, basit variant adı olarak kullan
  if (typeof config === "string") {
    return `https://imagedelivery.net/${accountHash}/${imageId}/${config}`;
  }

  // Object ise, Transform API parametreleri ile URL oluştur
  // Cloudflare Images Transform API: /{variant}?width=X&height=Y&fit=Z&quality=Q&format=F
  const { name, width, height, fit, quality, format } = config;
  const baseUrl = `https://imagedelivery.net/${accountHash}/${imageId}/${name}`;
  
  const params = new URLSearchParams();
  if (width) params.append("width", width.toString());
  if (height) params.append("height", height.toString());
  if (fit) params.append("fit", fit);
  if (quality) params.append("quality", quality.toString());
  if (format) params.append("format", format);

  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Önceden tanımlanmış varyantlar
 */
export const imageVariants = {
  thumbnail: {
    name: "thumbnail",
    width: 200,
    height: 200,
    fit: "cover" as const,
    quality: 80,
    format: "auto" as const,
  },
  card: {
    name: "card",
    width: 400,
    height: 400,
    fit: "cover" as const,
    quality: 85,
    format: "auto" as const,
  },
  hero: {
    name: "hero",
    width: 1200,
    height: 800,
    fit: "cover" as const,
    quality: 90,
    format: "auto" as const,
  },
  gallery: {
    name: "gallery",
    width: 800,
    height: 800,
    fit: "contain" as const,
    quality: 90,
    format: "auto" as const,
  },
  public: {
    name: "public",
    width: 800,
    height: 800,
    fit: "cover" as const,
    quality: 85,
    format: "auto" as const,
  },
};

