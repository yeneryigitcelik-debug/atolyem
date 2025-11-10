import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * POST /api/favorites/products - Add product to favorites
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await request.json();
    if (!productId) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    // Check if already favorited
    const existing = await db.favoriteProduct.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Already favorited" }, { status: 400 });
    }

    await db.favoriteProduct.create({
      data: {
        userId: session.user.id,
        productId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Favorite add error:", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}

/**
 * DELETE /api/favorites/products - Remove product from favorites
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await request.json();
    if (!productId) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    await db.favoriteProduct.deleteMany({
      where: {
        userId: session.user.id,
        productId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Favorite remove error:", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}

/**
 * GET /api/favorites/products?productId=xxx - Check if product is favorited
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ isFavorited: false });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ isFavorited: false });
    }

    const favorite = await db.favoriteProduct.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
    });

    return NextResponse.json({ isFavorited: !!favorite });
  } catch (error: any) {
    console.error("Favorite check error:", error);
    return NextResponse.json({ isFavorited: false });
  }
}

