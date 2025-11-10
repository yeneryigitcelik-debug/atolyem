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
  // Environment variable'ları al ve trim et (boşluk karakterlerini temizle)
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID?.trim();
  let apiToken = process.env.CLOUDFLARE_IMAGES_API_TOKEN?.trim();
  
  // Token'ı temizle - tırnak işaretleri, boşluklar, yeni satırlar vb. kaldır
  if (apiToken) {
    // Tırnak işaretlerini kaldır
    apiToken = apiToken.replace(/^["']|["']$/g, '');
    // Başta/sonda boşlukları kaldır
    apiToken = apiToken.trim();
    // Yeni satır ve carriage return karakterlerini kaldır
    apiToken = apiToken.replace(/[\r\n]/g, '');
  }

  // Debug: Environment variable'ları kontrol et (sadece development'ta)
  if (process.env.NODE_ENV === "development") {
    console.log("Cloudflare Config Check:", {
      hasAccountId: !!accountId,
      hasApiToken: !!apiToken,
      accountIdLength: accountId?.length || 0,
      apiTokenLength: apiToken?.length || 0,
      accountIdPreview: accountId ? `${accountId.substring(0, 10)}...` : "yok",
      apiTokenPreview: apiToken ? `${apiToken.substring(0, 10)}...` : "yok",
      accountIdHasSpaces: accountId?.includes(" ") || false,
      apiTokenHasSpaces: apiToken?.includes(" ") || false,
    });
  }

  // Placeholder değer kontrolü
  if (accountId && (accountId.includes("your_account_id") || accountId.includes("placeholder") || accountId === "your_account_id_here")) {
    throw new Error(
      "CLOUDFLARE_ACCOUNT_ID placeholder değerinde! Lütfen .env dosyanızda gerçek Cloudflare Account ID'yi ekleyin. Cloudflare Dashboard > Sağ üst köşeden Account ID'yi kopyalayın."
    );
  }

  if (!accountId || !apiToken) {
    const missing = [];
    if (!accountId) missing.push("CLOUDFLARE_ACCOUNT_ID");
    if (!apiToken) missing.push("CLOUDFLARE_IMAGES_API_TOKEN");
    throw new Error(
      `${missing.join(" ve ")} environment variable'ları gerekli. Lütfen .env dosyanızı kontrol edin ve development server'ı yeniden başlatın.`
    );
  }

  // Token format kontrolü (Cloudflare API token'ları genellikle 40 karakter civarındadır)
  if (apiToken.length < 20) {
    throw new Error(
      "CLOUDFLARE_IMAGES_API_TOKEN geçersiz görünüyor (çok kısa). Lütfen Cloudflare Dashboard'dan yeni bir API Token oluşturun ve .env dosyanıza ekleyin."
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
  const apiUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`;
  
  if (process.env.NODE_ENV === "development") {
    console.log("Cloudflare API Request:", {
      url: apiUrl,
      method: "POST",
      hasAuthHeader: !!apiToken,
      tokenLength: apiToken?.length || 0,
      tokenPreview: apiToken ? `${apiToken.substring(0, 8)}...${apiToken.substring(apiToken.length - 4)}` : "yok",
      accountId: accountId,
      fileType: file instanceof File ? file.type : "Buffer",
      fileName: file instanceof File ? file.name : filename,
      fileSize: file instanceof File ? file.size : (file as Buffer).length,
    });
  }

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
    body: formData,
  });

  if (process.env.NODE_ENV === "development") {
    console.log("Cloudflare API Response:", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries()),
    });
  }

  if (!response.ok) {
    const errorText = await response.text();
    
    if (process.env.NODE_ENV === "development") {
      console.error("Cloudflare API Error Response:", {
        status: response.status,
        errorText: errorText,
        url: apiUrl,
        accountId: accountId,
        tokenPreview: apiToken ? `${apiToken.substring(0, 8)}...${apiToken.substring(apiToken.length - 4)}` : "yok",
      });
    }
    
    let errorMessage = `Cloudflare Images upload failed: ${response.status} ${errorText}`;
    
    // Authentication hatası için özel mesaj
    if (response.status === 400 || response.status === 401 || response.status === 403) {
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.errors && errorData.errors[0]?.code === 10001) {
          errorMessage = `❌ Cloudflare API Token kimlik doğrulama hatası (Code: 10001)\n\n` +
            `Bu hata, API token'ınızın doğru çalışmadığını gösteriyor. Lütfen şunları yapın:\n\n` +
            `1. Cloudflare Dashboard'a gidin: https://dash.cloudflare.com/profile/api-tokens\n` +
            `2. Mevcut token'ı silin ve YENİ bir token oluşturun\n` +
            `3. Token oluştururken şu izinleri verin:\n` +
            `   - Account → Cloudflare Images → Edit\n` +
            `4. Yeni token'ı kopyalayın (tam olarak, boşluksuz)\n` +
            `5. .env dosyasında CLOUDFLARE_IMAGES_API_TOKEN değerini güncelleyin\n` +
            `6. Development server'ı DURDURUN (Ctrl+C) ve YENİDEN BAŞLATIN (npm run dev)\n\n` +
            `📖 Detaylı rehber: CLOUDFLARE_API_TOKEN_SETUP.md dosyasına bakın\n\n` +
            `Hata detayı: ${errorText}`;
        } else if (errorData.errors && errorData.errors[0]?.message) {
          // Diğer hata kodları için
          errorMessage = `Cloudflare API Hatası: ${errorData.errors[0].message}\n` +
            `Hata Kodu: ${errorData.errors[0].code || "bilinmiyor"}\n` +
            `Detay: ${errorText}`;
        }
      } catch (e) {
        // JSON parse hatası, orijinal mesajı kullan
        if (process.env.NODE_ENV === "development") {
          console.error("Error parsing Cloudflare error response:", e);
        }
      }
    }
    
    throw new Error(errorMessage);
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
  
  if (process.env.NODE_ENV === "development") {
    console.log("Account Hash Check:", {
      hasAccountHash: !!accountHash,
      accountHashLength: accountHash?.length || 0,
      accountHashPreview: accountHash ? `${accountHash.substring(0, 10)}...` : "yok",
    });
  }
  
  if (!accountHash) {
    // Account hash yoksa, image ID'yi direkt kullanabiliriz
    // veya API'den account bilgisini çekebiliriz
    throw new Error(
      "CLOUDFLARE_ACCOUNT_HASH environment variable gerekli. Cloudflare dashboard'dan alabilirsiniz. Lütfen .env dosyanızı kontrol edin ve development server'ı yeniden başlatın."
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
  // Environment variable'ları al ve trim et (boşluk karakterlerini temizle)
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID?.trim();
  let apiToken = process.env.CLOUDFLARE_IMAGES_API_TOKEN?.trim();
  
  // Token'ı temizle - tırnak işaretleri, boşluklar, yeni satırlar vb. kaldır
  if (apiToken) {
    // Tırnak işaretlerini kaldır
    apiToken = apiToken.replace(/^["']|["']$/g, '');
    // Başta/sonda boşlukları kaldır
    apiToken = apiToken.trim();
    // Yeni satır ve carriage return karakterlerini kaldır
    apiToken = apiToken.replace(/[\r\n]/g, '');
  }

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

