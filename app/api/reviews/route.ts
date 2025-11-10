import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * GET /api/reviews?productId=xxx - Get reviews for a product
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    const reviews = await db.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate average rating
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    return NextResponse.json({
      reviews,
      averageRating: Math.round(avgRating * 10) / 10,
      totalCount: reviews.length,
    });
  } catch (error: any) {
    console.error("Get reviews error:", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}

/**
 * POST /api/reviews - Create a review
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { productId, orderId, rating, comment } = body;

    if (!productId || !rating) {
      return NextResponse.json({ error: "Product ID and rating required" }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    // Check if review already exists for this order
    if (orderId) {
      const existing = await db.review.findUnique({
        where: {
          productId_userId_orderId: {
            productId,
            userId: session.user.id,
            orderId,
          },
        },
      });

      if (existing) {
        return NextResponse.json({ error: "Bu sipariş için zaten yorum yaptınız" }, { status: 400 });
      }
    }

    // Verify order belongs to user and contains this product
    if (orderId) {
      const order = await db.order.findFirst({
        where: {
          id: orderId,
          userId: session.user.id,
          status: { in: ["COMPLETED", "SHIPPED"] },
        },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: true,
                },
              },
            },
          },
        },
      });

      if (!order) {
        return NextResponse.json({ error: "Sipariş bulunamadı veya yorum yapılamaz" }, { status: 400 });
      }

      const hasProduct = order.items.some((item) => item.variant.productId === productId);
      if (!hasProduct) {
        return NextResponse.json({ error: "Bu siparişte bu ürün bulunmuyor" }, { status: 400 });
      }
    }

    const review = await db.review.create({
      data: {
        productId,
        orderId: orderId || null,
        userId: session.user.id,
        rating,
        comment: comment || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({ review });
  } catch (error: any) {
    console.error("Create review error:", error);
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Bu ürün için zaten yorum yaptınız" }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}

