import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * Generate weekly sales & commission report for seller
 * Writes to SellerPayoutLedger
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      include: { seller: true },
    });

    if (!user?.seller) {
      return NextResponse.json(
        { error: "Seller account not found" },
        { status: 403 }
      );
    }

    const sellerId = user.seller.id;
    const commissionBps = user.seller.commissionBps || 1500;

    // Get last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get completed orders with seller's products
    const sellerProducts = await db.product.findMany({
      where: { sellerId },
      select: { id: true },
    });
    const productIds = sellerProducts.map((p) => p.id);

    const sellerVariants = await db.variant.findMany({
      where: { productId: { in: productIds } },
      select: { id: true },
    });
    const variantIds = sellerVariants.map((v) => v.id);

    const completedOrders = await db.order.findMany({
      where: {
        status: "COMPLETED",
        items: {
          some: {
            variantId: { in: variantIds },
          },
        },
        createdAt: { gte: sevenDaysAgo },
      },
      include: {
        items: {
          where: {
            variantId: { in: variantIds },
          },
        },
      },
    });

    // Calculate totals
    let totalSalesCents = 0;
    let totalCommissionCents = 0;

    completedOrders.forEach((order) => {
      const sellerItems = order.items.filter((item) =>
        variantIds.includes(item.variantId)
      );
      const sellerTotalCents = sellerItems.reduce(
        (sum, item) => sum + item.priceCents * item.qty,
        0
      );
      totalSalesCents += sellerTotalCents;
      totalCommissionCents += Math.floor(
        (sellerTotalCents * commissionBps) / 10000
      );
    });

    // Write to SellerPayoutLedger
    if (totalCommissionCents > 0) {
      await db.sellerPayoutLedger.create({
        data: {
          sellerId,
          type: "credit",
          amountCents: totalCommissionCents,
          note: `Haftalık komisyon raporu (${sevenDaysAgo.toLocaleDateString("tr-TR")} - ${new Date().toLocaleDateString("tr-TR")})`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      period: {
        start: sevenDaysAgo.toISOString(),
        end: new Date().toISOString(),
      },
      stats: {
        orderCount: completedOrders.length,
        totalSalesCents,
        totalCommissionCents,
        commissionRate: commissionBps / 100,
      },
    });
  } catch (error: any) {
    console.error("Weekly report error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

