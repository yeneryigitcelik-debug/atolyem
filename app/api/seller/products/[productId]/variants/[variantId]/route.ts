import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string; variantId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session?.user as any)?.id;
    const { productId, variantId } = await params;

    const user = await db.user.findUnique({
      where: { id: userId },
      include: { seller: true },
    });

    if (!user?.seller) {
      return NextResponse.json({ error: "Satıcı hesabı bulunamadı" }, { status: 403 });
    }

    // Variant'ın bu satıcıya ait olduğunu kontrol et
    const variant = await db.variant.findUnique({
      where: { id: variantId },
      include: { product: true },
    });

    if (!variant || variant.productId !== productId || variant.product.sellerId !== user.seller.id) {
      return NextResponse.json({ error: "Yetkiniz yok" }, { status: 403 });
    }

    const body = await request.json();
    const { priceCents, stock } = body;

    if (priceCents === undefined || stock === undefined) {
      return NextResponse.json({ error: "Fiyat ve stok gereklidir" }, { status: 400 });
    }

    if (priceCents < 0 || stock < 0) {
      return NextResponse.json({ error: "Fiyat ve stok negatif olamaz" }, { status: 400 });
    }

    await db.variant.update({
      where: { id: variantId },
      data: {
        priceCents: Math.round(priceCents),
        stock: parseInt(stock),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Variant update error:", error);
    return NextResponse.json(
      { error: error.message || "Fiyat güncellenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}




