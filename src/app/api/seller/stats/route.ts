import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";
import { startOfMonth, endOfMonth } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's shop
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: user.id },
      select: { shopId: true },
    });

    if (!sellerProfile?.shopId) {
      return NextResponse.json({
        stats: {
          activeProducts: 0,
          pendingOrders: 0,
          monthlySales: 0,
          totalViews: 0,
        },
      });
    }

    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    // Fetch stats in parallel
    const [activeProducts, pendingOrders, monthlySalesData, totalViews] = await Promise.all([
      // Count active (published) listings
      prisma.listing.count({
        where: {
          shopId: sellerProfile.shopId,
          status: "PUBLISHED",
        },
      }),

      // Count pending orders
      prisma.orderItem.count({
        where: {
          listing: {
            shopId: sellerProfile.shopId,
          },
          order: {
            status: { in: ["PENDING", "PROCESSING"] },
          },
        },
      }),

      // Calculate monthly sales (sum of completed orders this month)
      prisma.orderItem.aggregate({
        where: {
          listing: {
            shopId: sellerProfile.shopId,
          },
          order: {
            status: { in: ["COMPLETED", "SHIPPED", "DELIVERED"] },
            createdAt: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
        },
        _sum: {
          totalPriceMinor: true,
        },
      }),

      // Total views (sum of all listing views)
      prisma.listing.aggregate({
        where: {
          shopId: sellerProfile.shopId,
        },
        _sum: {
          viewCount: true,
        },
      }),
    ]);

    return NextResponse.json({
      stats: {
        activeProducts,
        pendingOrders,
        monthlySales: (monthlySalesData._sum.totalPriceMinor || 0) / 100, // Convert from minor to major currency
        totalViews: totalViews._sum.viewCount || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching seller stats:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

