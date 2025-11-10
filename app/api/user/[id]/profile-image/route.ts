import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { uploadImageToCloudflare } from "@/lib/cloudflare-images";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = (session?.user as any)?.id;

    // Sadece kendi profilini düzenleyebilir
    if (userId !== id) {
      return NextResponse.json({ error: "Yetkiniz yok" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string;

    if (!file) {
      return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 });
    }

    // Dosya tipi kontrolü
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Geçersiz dosya tipi" }, { status: 400 });
    }

    // Dosya boyutu kontrolü (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Dosya boyutu 10MB'dan küçük olmalıdır" }, { status: 400 });
    }

    // Cloudflare'e yükle
    const uploadResult = await uploadImageToCloudflare(file);

    // Database'i güncelle
    if (type === "avatar") {
      await db.user.update({
        where: { id },
        data: { image: uploadResult.url },
      });
    } else if (type === "banner") {
      // User model'inde bannerImage alanı var
      await db.user.update({
        where: { id },
        data: { bannerImage: uploadResult.url },
      });
      
      // Eğer seller varsa, seller'da da güncelle (tutarlılık için)
      const user = await db.user.findUnique({
        where: { id },
        include: { seller: true },
      });
      
      if (user?.seller) {
        await db.seller.update({
          where: { id: user.seller.id },
          data: { bannerImage: uploadResult.url },
        });
      }
    }

    return NextResponse.json({
      success: true,
      url: uploadResult.url,
    });
  } catch (error: any) {
    console.error("Profile image upload error:", error);
    return NextResponse.json(
      { error: error.message || "Görsel yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

