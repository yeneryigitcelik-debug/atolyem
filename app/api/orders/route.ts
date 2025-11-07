import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Sepeti bul
    const cart = await db.order.findFirst({
      where: {
        userId: session.user.id,
        status: "CART",
      },
      include: {
        items: {
          include: {
            variant: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "Sepet boş" }, { status: 400 });
    }

    // Stok kontrolü
    for (const item of cart.items) {
      if (item.variant.stock < item.qty) {
        return NextResponse.json(
          { error: `${item.variant.sku} için yeterli stok yok` },
          { status: 400 }
        );
      }
    }

    // Stokları düş ve siparişi PENDING'e al
    await db.$transaction(async (tx) => {
      for (const item of cart.items) {
        await tx.variant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.qty } },
        });
      }

      await tx.order.update({
        where: { id: cart.id },
        data: { status: "PENDING" },
      });
    });

    return NextResponse.json({ success: true, orderId: cart.id });
  } catch (error) {
    console.error("Order POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

