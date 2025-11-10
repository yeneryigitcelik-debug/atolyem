import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * GET /api/coupons?code=xxx - Validate and get coupon info
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json({ error: "Coupon code required" }, { status: 400 });
    }

    const coupon = await db.coupon.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        seller: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
    });

    if (!coupon) {
      return NextResponse.json({ error: "Kupon bulunamadı" }, { status: 404 });
    }

    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validUntil) {
      return NextResponse.json({ error: "Kupon geçersiz veya süresi dolmuş" }, { status: 400 });
    }

    if (!coupon.isActive) {
      return NextResponse.json({ error: "Kupon aktif değil" }, { status: 400 });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({ error: "Kupon kullanım limitine ulaşılmış" }, { status: 400 });
    }

    return NextResponse.json({
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minPurchase: coupon.minPurchase,
        maxDiscount: coupon.maxDiscount,
        sellerId: coupon.sellerId,
        seller: coupon.seller,
      },
    });
  } catch (error: any) {
    console.error("Get coupon error:", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}

/**
 * POST /api/coupons/apply - Apply coupon to cart
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { code, cartTotalCents } = body;

    if (!code) {
      return NextResponse.json({ error: "Coupon code required" }, { status: 400 });
    }

    if (!cartTotalCents || cartTotalCents <= 0) {
      return NextResponse.json({ error: "Sepet tutarı geçersiz" }, { status: 400 });
    }

    const coupon = await db.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      return NextResponse.json({ error: "Kupon bulunamadı" }, { status: 404 });
    }

    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validUntil) {
      return NextResponse.json({ error: "Kupon geçersiz veya süresi dolmuş" }, { status: 400 });
    }

    if (!coupon.isActive) {
      return NextResponse.json({ error: "Kupon aktif değil" }, { status: 400 });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({ error: "Kupon kullanım limitine ulaşılmış" }, { status: 400 });
    }

    if (coupon.minPurchase && cartTotalCents < coupon.minPurchase) {
      return NextResponse.json(
        {
          error: `Minimum alışveriş tutarı: ${(coupon.minPurchase / 100).toLocaleString("tr-TR")} TL`,
        },
        { status: 400 }
      );
    }

    // Calculate discount
    let discountCents = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discountCents = Math.round((cartTotalCents * coupon.discountValue) / 100);
      if (coupon.maxDiscount && discountCents > coupon.maxDiscount) {
        discountCents = coupon.maxDiscount;
      }
    } else {
      discountCents = coupon.discountValue;
    }

    // Don't exceed cart total
    if (discountCents > cartTotalCents) {
      discountCents = cartTotalCents;
    }

    return NextResponse.json({
      success: true,
      discountCents,
      finalTotalCents: cartTotalCents - discountCents,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
    });
  } catch (error: any) {
    console.error("Apply coupon error:", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}

