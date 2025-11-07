/**
 * Client-side Cloudflare Images URL helper
 * NEXT_PUBLIC_ prefix'li env variable'ları kullanır
 */

export function getCloudflareImageUrl(
  imageId: string,
  variant: string = "public"
): string {
  const accountHash = process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_HASH;
  
  if (!accountHash) {
    console.warn("NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_HASH environment variable gerekli");
    return "";
  }

  return `https://imagedelivery.net/${accountHash}/${imageId}/${variant}`;
}

