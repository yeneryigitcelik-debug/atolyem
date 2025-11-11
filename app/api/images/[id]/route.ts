import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type RouteHandlerContext = {
  params: Promise<{ id: string }>;
};

/**
 * DELETE /api/images/[id]
 * Deletes an image from Cloudflare Images
 * 
 * API: https://api.cloudflare.com/client/v4/accounts/:accountId/images/v1/:id
 */
export async function DELETE(
  request: NextRequest,
  context: RouteHandlerContext
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await props.params;
    const imageId = params.id;
    
    if (!imageId) {
      return NextResponse.json({ error: "Image ID required" }, { status: 400 });
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

    // Cloudflare Images API'den görseli sil
    const deleteUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1/${imageId}`;

    if (process.env.NODE_ENV === "development") {
      console.log("Deleting Cloudflare image...", {
        imageId: imageId,
        accountId: accountId,
        url: deleteUrl,
      });
    }

    const response = await fetch(deleteUrl, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${apiToken}`,
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

    if (process.env.NODE_ENV === "development") {
      console.log("Cloudflare delete response:", {
        status: response.status,
        ok: response.ok,
        data: responseData,
      });
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Failed to delete image",
          status: response.status,
          details: responseData,
        },
        { status: response.status }
      );
    }

    if (!responseData.success) {
      return NextResponse.json(
        {
          error: "Failed to delete image",
          details: responseData.errors || responseData,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete image error:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to delete image",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
