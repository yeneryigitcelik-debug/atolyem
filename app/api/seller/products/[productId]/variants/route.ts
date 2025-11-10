import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await params;
    const { sku, priceCents, stock } = await request.json();

    if (typeof priceCents !== "number" || typeof stock !== "number") {
      return NextResponse.json(
        { error: "Geçersiz fiyat veya stok değeri" },
        { status: 400 }
      );
    }

    // Check if the user is the seller of this product
    const product = await db.product.findUnique({
      where: { id: productId },
      select: { sellerId: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Ürün bulunamadı" }, { status: 404 });
    }

    const seller = await db.seller.findUnique({
      where: { userId: userId },
      select: { id: true },
    });

    if (!seller || product.sellerId !== seller.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Generate SKU if not provided
    const finalSku = sku || `SKU-${productId}-${Date.now()}`;

    // Create the variant
    const variant = await db.variant.create({
      data: {
        productId: productId,
        sku: finalSku,
        priceCents,
        stock,
      },
    });

    revalidatePath(`/seller/products/${productId}/edit`);
    revalidatePath(`/seller/products`);

    return NextResponse.json({ success: true, variant });
  } catch (error: any) {
    console.error("Error creating variant:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Bu SKU zaten kullanılıyor" },
        { status: 400 }
      );
    }
    
    // Daha detaylı hata mesajı
    const errorMessage = error.message || "Varyant oluşturulurken bir hata oluştu";
    return NextResponse.json(
      { error: errorMessage, details: process.env.NODE_ENV === "development" ? error.stack : undefined },
      { status: 500 }
    );
  }
}

