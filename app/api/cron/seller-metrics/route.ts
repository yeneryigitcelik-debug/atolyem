import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Cron job to calculate monthly seller metrics
 * Should be called daily or weekly via Vercel Cron or external service
 * 
 * Usage:
 * - Vercel Cron: Add to vercel.json
 * - External: Call this endpoint with Authorization header
 */
export async function GET(request: NextRequest) {
  // Simple auth check (in production, use proper auth)
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentYear = now.getFullYear();

    // Get all sellers
    const sellers = await db.seller.findMany({
      select: { id: true },
    });

    let processed = 0;
    let errors = 0;

    for (const seller of sellers) {
      try {
        // Get seller's product IDs
        const sellerProducts = await db.product.findMany({
          where: { sellerId: seller.id },
          select: { id: true },
        });

        const productIds = sellerProducts.map((p) => p.id);

        if (productIds.length === 0) {
          // No products, create empty metrics
          await (db as any).sellerMetrics?.upsert({
            where: {
              sellerId_month_year: {
                sellerId: seller.id,
                month: currentMonth,
                year: currentYear,
              },
            },
            update: {},
            create: {
              sellerId: seller.id,
              month: currentMonth,
              year: currentYear,
              totalSales: 0,
              totalRevenueCents: 0,
              completedOrders: 0,
              canceledOrders: 0,
              averageOrderValueCents: 0,
            },
          });
          processed++;
          continue;
        }

        // Get seller's variant IDs
        const sellerVariants = await db.variant.findMany({
          where: { productId: { in: productIds } },
          select: { id: true },
        });

        const variantIds = sellerVariants.map((v) => v.id);

        // Calculate date range for current month
        const monthStart = new Date(currentYear, currentMonth - 1, 1);
        const monthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59);

        // Get orders for this month
        const orders = await db.order.findMany({
          where: {
            items: {
              some: {
                variantId: { in: variantIds },
              },
            },
            createdAt: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
          include: {
            items: {
              where: {
                variantId: { in: variantIds },
              },
            },
          },
        });

        // Calculate metrics
        const completedOrders = orders.filter((o) => o.status === "COMPLETED");
        const canceledOrders = orders.filter((o) => o.status === "CANCELED");

        const totalSales = completedOrders.length;
        const totalRevenueCents = completedOrders.reduce((sum, order) => {
          const sellerItems = order.items.filter((item) =>
            variantIds.includes(item.variantId)
          );
          return sum + sellerItems.reduce((s, item) => s + item.priceCents * item.qty, 0);
        }, 0);

        const averageOrderValueCents =
          totalSales > 0 ? Math.round(totalRevenueCents / totalSales) : 0;

        // Upsert metrics
        await (db as any).sellerMetrics?.upsert({
          where: {
            sellerId_month_year: {
              sellerId: seller.id,
              month: currentMonth,
              year: currentYear,
            },
          },
          update: {
            totalSales,
            totalRevenueCents,
            completedOrders: completedOrders.length,
            canceledOrders: canceledOrders.length,
            averageOrderValueCents,
            updatedAt: new Date(),
          },
          create: {
            sellerId: seller.id,
            month: currentMonth,
            year: currentYear,
            totalSales,
            totalRevenueCents,
            completedOrders: completedOrders.length,
            canceledOrders: canceledOrders.length,
            averageOrderValueCents,
          },
        });

        processed++;
      } catch (error: any) {
        console.error(`Error processing seller ${seller.id}:`, error);
        errors++;
      }
    }

    return NextResponse.json({
      success: true,
      processed,
      errors,
      month: currentMonth,
      year: currentYear,
    });
  } catch (error: any) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

