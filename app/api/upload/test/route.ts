import { NextResponse } from "next/server";

/**
 * Debug endpoint to check Cloudflare configuration
 * GET /api/upload/test
 */
export async function GET() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_IMAGES_API_TOKEN;
  const accountHash = process.env.CLOUDFLARE_ACCOUNT_HASH;
  const variant = process.env.CLOUDFLARE_IMAGES_VARIANT || "public";
  const nextPublicHash = process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_HASH;

  return NextResponse.json({
    config: {
      CLOUDFLARE_ACCOUNT_ID: accountId ? `${accountId.substring(0, 10)}...` : "EKSIK",
      CLOUDFLARE_IMAGES_API_TOKEN: apiToken ? `${apiToken.substring(0, 10)}...` : "EKSIK",
      CLOUDFLARE_ACCOUNT_HASH: accountHash ? `${accountHash.substring(0, 10)}...` : "EKSIK",
      CLOUDFLARE_IMAGES_VARIANT: variant,
      NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_HASH: nextPublicHash ? `${nextPublicHash.substring(0, 10)}...` : "EKSIK",
    },
    status: {
      hasAccountId: !!accountId,
      hasApiToken: !!apiToken,
      hasAccountHash: !!accountHash,
      hasNextPublicHash: !!nextPublicHash,
      allConfigured: !!(accountId && apiToken && accountHash),
    },
    message: !!(accountId && apiToken && accountHash)
      ? "Tüm yapılandırmalar mevcut"
      : "Eksik yapılandırmalar var. Lütfen .env dosyanızı kontrol edin.",
  });
}

