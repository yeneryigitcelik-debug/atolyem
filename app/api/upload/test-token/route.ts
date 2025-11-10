import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Cloudflare API Token'ı test eder
 * Bu endpoint, token'ın doğru çalışıp çalışmadığını kontrol eder
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
      return NextResponse.json(
        {
          error: "Missing environment variables",
          missing: {
            accountId: !accountId,
            apiToken: !apiToken,
          },
        },
        { status: 500 }
      );
    }

    // Token formatını kontrol et
    const tokenChars = apiToken.split('');
    const hasInvalidChars = tokenChars.some(char => {
      const code = char.charCodeAt(0);
      // Sadece alfanumerik karakterler ve bazı özel karakterler kabul edilir
      return !((code >= 48 && code <= 57) || // 0-9
               (code >= 65 && code <= 90) || // A-Z
               (code >= 97 && code <= 122) || // a-z
               char === '-' || char === '_' || char === '.');
    });

    // Cloudflare API'ye test isteği gönder
    // Account bilgilerini çekmek için basit bir istek
    const testUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}`;
    
    const authHeader = `Bearer ${apiToken}`;
    
    console.log("Testing Cloudflare API Token...", {
      url: testUrl,
      accountId: accountId,
      tokenLength: apiToken.length,
      tokenPreview: `${apiToken.substring(0, 8)}...${apiToken.substring(apiToken.length - 4)}`,
      tokenHasInvalidChars: hasInvalidChars,
      authHeaderLength: authHeader.length,
      authHeaderPreview: `${authHeader.substring(0, 20)}...`,
      tokenFirstChar: apiToken[0],
      tokenLastChar: apiToken[apiToken.length - 1],
      tokenCharCodes: apiToken.substring(0, 10).split('').map(c => c.charCodeAt(0)),
    });

    const response = await fetch(testUrl, {
      method: "GET",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    });

    const responseText = await response.text();
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = { raw: responseText };
    }

    console.log("Cloudflare API Test Response:", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      data: responseData,
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: "Token authentication failed",
          status: response.status,
          details: responseData,
          message: responseData.errors?.[0]?.message || "Unknown error",
        },
        { status: response.status }
      );
    }

    // Token çalışıyor, şimdi Images API'yi test et
    const imagesTestUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`;
    const imagesResponse = await fetch(imagesTestUrl, {
      method: "GET",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    });

    const imagesResponseText = await imagesResponse.text();
    let imagesResponseData;
    try {
      imagesResponseData = JSON.parse(imagesResponseText);
    } catch (e) {
      imagesResponseData = { raw: imagesResponseText };
    }

    return NextResponse.json({
      success: true,
      accountTest: {
        status: response.status,
        ok: response.ok,
        data: responseData,
      },
      imagesApiTest: {
        status: imagesResponse.status,
        ok: imagesResponse.ok,
        data: imagesResponseData,
        hasAccess: imagesResponse.ok,
      },
      message: imagesResponse.ok
        ? "✅ Token doğru çalışıyor ve Images API'ye erişim var!"
        : "⚠️ Token çalışıyor ancak Images API'ye erişim yok. İzinleri kontrol edin.",
    });
  } catch (error: any) {
    console.error("Token test error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unknown error",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

