import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * GET /api/shipments?orderId=xxx - Get shipments for an order
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json({ error: "Order ID required" }, { status: 400 });
    }

    // Verify order belongs to user
    const order = await db.order.findFirst({
      where: {
        id: orderId,
        userId: session.user.id,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Sipariş bulunamadı" }, { status: 404 });
    }

    const shipments = await db.shipment.findMany({
      where: { orderId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ shipments });
  } catch (error: any) {
    console.error("Get shipments error:", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}

/**
 * POST /api/shipments - Create shipment (seller/admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, seller: { select: { id: true } } },
    });

    // Only sellers and admins can create shipments
    if (user?.role !== "ADMIN" && !user?.seller) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { orderId, carrier, trackingCode } = body;

    if (!orderId || !carrier) {
      return NextResponse.json({ error: "Order ID and carrier required" }, { status: 400 });
    }

    // Verify order exists and belongs to seller (if not admin)
    const order = await db.order.findFirst({
      where: {
        id: orderId,
        ...(user?.role !== "ADMIN"
          ? {
              items: {
                some: {
                  variant: {
                    product: {
                      sellerId: user.seller!.id,
                    },
                  },
                },
              },
            }
          : {}),
      },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    seller: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Sipariş bulunamadı veya yetkiniz yok" }, { status: 404 });
    }

    const shipment = await db.shipment.create({
      data: {
        orderId,
        carrier,
        trackingCode: trackingCode || null,
        status: "CREATED",
      },
    });

    // Update order status to SHIPPED if not already
    if (order.status !== "SHIPPED" && order.status !== "COMPLETED") {
      await db.order.update({
        where: { id: orderId },
        data: { status: "SHIPPED" },
      });
    }

    return NextResponse.json({ shipment });
  } catch (error: any) {
    console.error("Create shipment error:", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}

/**
 * PATCH /api/shipments - Update shipment status
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    // Only admins can update shipment status
    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { shipmentId, status } = body;

    if (!shipmentId || !status) {
      return NextResponse.json({ error: "Shipment ID and status required" }, { status: 400 });
    }

    const validStatuses = ["CREATED", "IN_TRANSIT", "DELIVERED", "RETURNED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const shipment = await db.shipment.update({
      where: { id: shipmentId },
      data: { status },
    });

    // If delivered, update order status
    if (status === "DELIVERED") {
      await db.order.update({
        where: { id: shipment.orderId },
        data: { status: "COMPLETED" },
      });
    }

    return NextResponse.json({ shipment });
  } catch (error: any) {
    console.error("Update shipment error:", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}

