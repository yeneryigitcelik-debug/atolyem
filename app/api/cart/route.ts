import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCart, updateCartItem, removeFromCart } from "@/lib/orderService";

/**
 * GET /api/cart - Get user's cart
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cart = await getCart(session.user.id);
    if (!cart) {
      return NextResponse.json({ items: [], totalCents: 0 });
    }

    return NextResponse.json({
      items: cart.items,
      totalCents: cart.totalCents,
    });
  } catch (error: any) {
    console.error("Cart GET error:", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}

/**
 * PATCH /api/cart - Update cart item quantity
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { itemId, qty } = body;

    if (!itemId || typeof qty !== "number" || qty < 1) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    await updateCartItem(session.user.id, itemId, qty);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Cart PATCH error:", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}

/**
 * DELETE /api/cart - Remove item from cart
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { itemId } = body;

    if (!itemId) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    await removeFromCart(session.user.id, itemId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Cart DELETE error:", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}
