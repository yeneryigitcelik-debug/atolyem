import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Kullanıcının sepetini bul (CART durumundaki sipariş)
    const cart = await db.order.findFirst({
      where: {
        userId: session.user.id,
        status: "CART",
      },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: { orderBy: { sort: "asc" }, take: 1 },
                  },
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ items: cart?.items || [] });
  } catch (error) {
    console.error("Cart GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { variantId, qty } = await request.json();

    if (!variantId || !qty || qty < 1) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Variant'ı kontrol et
    const variant = await db.variant.findUnique({
      where: { id: variantId },
      include: { product: true },
    });

    if (!variant) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 });
    }

    if (variant.stock < qty) {
      return NextResponse.json({ error: "Yeterli stok yok" }, { status: 400 });
    }

    // Sepeti bul veya oluştur
    let cart = await db.order.findFirst({
      where: {
        userId: session.user.id,
        status: "CART",
      },
    });

    if (!cart) {
      cart = await db.order.create({
        data: {
          userId: session.user.id,
          status: "CART",
          totalCents: 0,
        },
      });
    }

    // Aynı variant zaten sepette var mı kontrol et
    const existingItem = await db.orderItem.findFirst({
      where: {
        orderId: cart.id,
        variantId,
      },
    });

    if (existingItem) {
      // Miktarı güncelle
      await db.orderItem.update({
        where: { id: existingItem.id },
        data: { qty: existingItem.qty + qty },
      });
    } else {
      // Yeni item ekle
      await db.orderItem.create({
        data: {
          orderId: cart.id,
          variantId,
          qty,
          priceCents: variant.priceCents,
        },
      });
    }

    // Toplamı güncelle
    const items = await db.orderItem.findMany({
      where: { orderId: cart.id },
    });
    const totalCents = items.reduce((sum, item) => sum + item.priceCents * item.qty, 0);
    await db.order.update({
      where: { id: cart.id },
      data: { totalCents },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cart POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { itemId, qty } = await request.json();

    if (!itemId || qty < 1) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const item = await db.orderItem.findUnique({
      where: { id: itemId },
      include: {
        order: true,
        variant: true,
      },
    });

    if (!item || item.order.userId !== session.user.id || item.order.status !== "CART") {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    if (item.variant.stock < qty) {
      return NextResponse.json({ error: "Yeterli stok yok" }, { status: 400 });
    }

    await db.orderItem.update({
      where: { id: itemId },
      data: { qty },
    });

    // Toplamı güncelle
    const items = await db.orderItem.findMany({
      where: { orderId: item.orderId },
    });
    const totalCents = items.reduce((sum, i) => sum + i.priceCents * i.qty, 0);
    await db.order.update({
      where: { id: item.orderId },
      data: { totalCents },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cart PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { itemId } = await request.json();

    if (!itemId) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const item = await db.orderItem.findUnique({
      where: { id: itemId },
      include: { order: true },
    });

    if (!item || item.order.userId !== session.user.id || item.order.status !== "CART") {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    await db.orderItem.delete({
      where: { id: itemId },
    });

    // Toplamı güncelle
    const items = await db.orderItem.findMany({
      where: { orderId: item.orderId },
    });
    const totalCents = items.reduce((sum, i) => sum + i.priceCents * i.qty, 0);
    await db.order.update({
      where: { id: item.orderId },
      data: { totalCents },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cart DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

