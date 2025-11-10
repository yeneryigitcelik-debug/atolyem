import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Cloudflare Images Direct Upload endpoint
 * Returns a direct upload URL that clients can POST to directly
 * 
 * API: https://api.cloudflare.com/client/v4/accounts/:accountId/images/v1/direct_upload
 * 
 * Note: Cloudflare Images API v1 kullanıyor. Direct upload için özel bir endpoint var.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID?.trim();
    let apiToken = process.env.CLOUDFLARE_IMAGES_API_TOKEN?.trim();

    // Token'ı temizle
    if (apiToken) {
      apiToken = apiToken.replace(/^["']|["']$/g, '');
      apiToken = apiToken.trim();
      apiToken = apiToken.replace(/[\r\n]/g, '');
    }

    if (!accountId || !apiToken) {
      return NextResponse.json(
        {
          error: "Cloudflare configuration missing",
          details: "CLOUDFLARE_ACCOUNT_ID ve CLOUDFLARE_IMAGES_API_TOKEN gerekli",
        },
        { status: 500 }
      );
    }

    // Cloudflare Direct Upload API'ye istek gönder
    // Not: Cloudflare API v1 kullanıyor, v2 değil
    const directUploadUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1/direct_upload`;

    if (process.env.NODE_ENV === "development") {
      console.log("Requesting Cloudflare direct upload URL...", {
        accountId: accountId,
        url: directUploadUrl,
      });
    }

    const response = await fetch(directUploadUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requireSignedURLs: false, // Public images
      }),
    });

    const responseText = await response.text();
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = { raw: responseText };
    }

    if (process.env.NODE_ENV === "development") {
      console.log("Cloudflare direct upload response:", {
        status: response.status,
        ok: response.ok,
        data: responseData,
      });
    }

    if (!response.ok) {
      // Daha detaylı hata mesajı oluştur
      let errorMessage = "Failed to get direct upload URL";
      
      if (responseData.errors && responseData.errors[0]) {
        const cfError = responseData.errors[0];
        errorMessage = cfError.message || errorMessage;
        
        // Authentication hatası için özel mesaj
        if (cfError.code === 10001) {
          errorMessage = "Cloudflare API Token kimlik doğrulama hatası. Lütfen API token'ınızı kontrol edin.";
        } else if (cfError.code === 6003) {
          errorMessage = "Invalid request headers. API token formatı hatalı olabilir.";
        }
      }
      
      return NextResponse.json(
        {
          error: errorMessage,
          status: response.status,
          details: responseData,
          cloudflareError: responseData.errors?.[0] || null,
        },
        { status: response.status }
      );
    }

    if (!responseData.success || !responseData.result) {
      let errorMessage = "Invalid response from Cloudflare";
      
      if (responseData.errors && responseData.errors[0]) {
        errorMessage = responseData.errors[0].message || errorMessage;
      }
      
      return NextResponse.json(
        {
          error: errorMessage,
          details: responseData,
          cloudflareError: responseData.errors?.[0] || null,
        },
        { status: 500 }
      );
    }

    const { id, uploadURL } = responseData.result;

    return NextResponse.json({
      id,
      uploadURL,
    });
  } catch (error: any) {
    console.error("Direct upload error:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to get direct upload URL",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

