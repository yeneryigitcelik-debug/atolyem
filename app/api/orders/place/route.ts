import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { placeOrder } from "@/lib/orderService";

/**
 * POST /api/orders/place - Place an order (CART → PENDING)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { addressId } = body;

    if (!addressId) {
      return NextResponse.json({ error: "Address ID required" }, { status: 400 });
    }

    const result = await placeOrder(session.user.id, addressId);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Place order error:", error);
    return NextResponse.json(
      { error: error.message || "Internal error" },
      { status: error.code === "CART_NOT_FOUND" || error.code === "EMPTY_CART" ? 400 : 500 }
    );
  }
}

