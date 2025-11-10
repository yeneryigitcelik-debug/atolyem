import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadImageToCloudflare } from "@/lib/cloudflare-images";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 });
    }

    // Dosya tipi kontrolü - hem MIME type hem de uzantı kontrolü
    const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
    
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf("."));
    const isValidMimeType = file.type && allowedMimeTypes.includes(file.type.toLowerCase());
    const isValidExtension = allowedExtensions.includes(fileExtension);
    
    if (!isValidMimeType && !isValidExtension) {
      return NextResponse.json(
        { 
          error: "Sadece görsel dosyaları yüklenebilir (JPG, PNG, GIF, WEBP, SVG)",
          details: `Dosya tipi: ${file.type || "bilinmiyor"}, Uzantı: ${fileExtension || "yok"}`
        }, 
        { status: 400 }
      );
    }

    // Dosya boyutu kontrolü (max 10MB - Cloudflare Images limiti)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Dosya boyutu 10MB'dan küçük olmalıdır" }, { status: 400 });
    }

    // Cloudflare Images'a yükle
    try {
      if (process.env.NODE_ENV === "development") {
        console.log("Starting Cloudflare upload for file:", file.name, "Size:", file.size);
      }
      const result = await uploadImageToCloudflare(file, file.name);
      if (process.env.NODE_ENV === "development") {
        console.log("Cloudflare upload successful:", { id: result.id, url: result.url });
      }

      if (!result || !result.url || !result.id) {
        console.error("Cloudflare upload result:", result);
        return NextResponse.json(
          {
            error: "Görsel yüklendi ancak geçersiz yanıt alındı. Lütfen tekrar deneyin.",
          },
          { status: 500 }
        );
      }

      // Cloudflare Images'dan dönen URL'i kullan
      return NextResponse.json({
        url: result.url,
        imageId: result.id,
        filename: file.name,
      });
    } catch (cloudflareError: any) {
      console.error("Cloudflare upload error:", {
        message: cloudflareError.message,
        stack: cloudflareError.stack,
        name: cloudflareError.name,
      });
      
      // Cloudflare hatalarını daha anlaşılır hale getir
      let errorMessage = "Görsel yüklenirken bir hata oluştu";
      
      if (cloudflareError.message) {
        if (cloudflareError.message.includes("CLOUDFLARE_ACCOUNT_ID") || 
            cloudflareError.message.includes("CLOUDFLARE_IMAGES_API_TOKEN")) {
          errorMessage = cloudflareError.message || "Cloudflare yapılandırması eksik. Lütfen .env dosyanızı kontrol edin ve development server'ı yeniden başlatın.";
        } else if (cloudflareError.message.includes("CLOUDFLARE_ACCOUNT_HASH")) {
          errorMessage = cloudflareError.message || "Cloudflare hesap hash'i eksik. Lütfen .env dosyanızı kontrol edin ve development server'ı yeniden başlatın.";
        } else if (cloudflareError.message.includes("upload failed")) {
          errorMessage = `Cloudflare'e yükleme başarısız: ${cloudflareError.message}`;
        } else {
          errorMessage = cloudflareError.message;
        }
      }
      
      return NextResponse.json(
        {
          error: errorMessage,
          details: process.env.NODE_ENV === "development" ? cloudflareError.message : undefined,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        error: error.message || "Dosya yüklenirken bir hata oluştu",
      },
      { status: 500 }
    );
  }
}

