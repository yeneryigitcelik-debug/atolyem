/**
 * Cloudflare Images API utility
 * 
 * Cloudflare Images API dokümantasyonu:
 * https://developers.cloudflare.com/images/cloudflare-images/api-request/
 */

interface CloudflareImageUploadResponse {
  result: {
    id: string;
    filename: string;
    uploaded: string;
    requireSignedURLs: boolean;
    variants: string[];
  };
  success: boolean;
  errors: any[];
  messages: any[];
}

interface CloudflareImageInfo {
  id: string;
  filename: string;
  uploaded: string;
  requireSignedURLs: boolean;
  variants: string[];
}

/**
 * Cloudflare Images'a görsel yükler
 */
export async function uploadImageToCloudflare(
  file: File | Buffer,
  filename?: string
): Promise<{ id: string; url: string; variants: string[] }> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_IMAGES_API_TOKEN;

  if (!accountId || !apiToken) {
    throw new Error(
      "CLOUDFLARE_ACCOUNT_ID ve CLOUDFLARE_IMAGES_API_TOKEN environment variable'ları gerekli"
    );
  }

  // File'ı FormData'ya çevir
  const formData = new FormData();
  
  if (file instanceof File) {
    formData.append("file", file);
  } else {
    // Buffer ise Blob'a çevir
    const blob = new Blob([file as BlobPart]);
    formData.append("file", blob, filename || "image.jpg");
  }

  // Cloudflare Images API'ye yükle
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Cloudflare Images upload failed: ${response.status} ${errorText}`
    );
  }

  const data: CloudflareImageUploadResponse = await response.json();

  if (!data.success || !data.result) {
    throw new Error(
      `Cloudflare Images upload failed: ${JSON.stringify(data.errors)}`
    );
  }

  const imageInfo = data.result;

  // Account hash'i environment variable'dan al veya API'den çek
  // Not: Account hash genellikle account ID ile aynı değil
  // Cloudflare dashboard'dan veya API'den alınabilir
  const accountHash = process.env.CLOUDFLARE_ACCOUNT_HASH;
  
  if (!accountHash) {
    // Account hash yoksa, image ID'yi direkt kullanabiliriz
    // veya API'den account bilgisini çekebiliriz
    throw new Error(
      "CLOUDFLARE_ACCOUNT_HASH environment variable gerekli. Cloudflare dashboard'dan alabilirsiniz."
    );
  }

  // Varsayılan variant (genellikle "public" veya boş)
  // Cloudflare Images varsayılan variant'ları: public, thumbnail, avatar, etc.
  const defaultVariant = process.env.CLOUDFLARE_IMAGES_VARIANT || "public";
  
  // Image URL'i oluştur
  // Format: https://imagedelivery.net/{account_hash}/{image_id}/{variant}
  const imageUrl = `https://imagedelivery.net/${accountHash}/${imageInfo.id}/${defaultVariant}`;

  return {
    id: imageInfo.id,
    url: imageUrl,
    variants: imageInfo.variants,
  };
}

/**
 * Cloudflare Images'dan görsel URL'i oluşturur
 * Farklı variant'lar için (thumbnail, avatar, etc.)
 */
export function getCloudflareImageUrl(
  imageId: string,
  variant: string = "public"
): string {
  const accountHash = process.env.CLOUDFLARE_ACCOUNT_HASH;
  
  if (!accountHash) {
    throw new Error("CLOUDFLARE_ACCOUNT_HASH environment variable gerekli");
  }

  return `https://imagedelivery.net/${accountHash}/${imageId}/${variant}`;
}

/**
 * Cloudflare Images'dan görsel siler
 */
export async function deleteImageFromCloudflare(imageId: string): Promise<void> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_IMAGES_API_TOKEN;

  if (!accountId || !apiToken) {
    throw new Error(
      "CLOUDFLARE_ACCOUNT_ID ve CLOUDFLARE_IMAGES_API_TOKEN environment variable'ları gerekli"
    );
  }

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1/${imageId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Cloudflare Images delete failed: ${response.status} ${errorText}`
    );
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(
      `Cloudflare Images delete failed: ${JSON.stringify(data.errors)}`
    );
  }
}

