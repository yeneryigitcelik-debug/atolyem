import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * POST /api/favorites/sellers - Add seller to favorites
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sellerId } = await request.json();
    if (!sellerId) {
      return NextResponse.json({ error: "Seller ID required" }, { status: 400 });
    }

    // Check if already favorited
    const existing = await db.favoriteSeller.findUnique({
      where: {
        userId_sellerId: {
          userId: session.user.id,
          sellerId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Already favorited" }, { status: 400 });
    }

    await db.favoriteSeller.create({
      data: {
        userId: session.user.id,
        sellerId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Favorite seller add error:", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}

/**
 * DELETE /api/favorites/sellers - Remove seller from favorites
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sellerId } = await request.json();
    if (!sellerId) {
      return NextResponse.json({ error: "Seller ID required" }, { status: 400 });
    }

    await db.favoriteSeller.deleteMany({
      where: {
        userId: session.user.id,
        sellerId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Favorite seller remove error:", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}

/**
 * GET /api/favorites/sellers?sellerId=xxx - Check if seller is favorited
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ isFavorited: false });
    }

    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get("sellerId");

    if (!sellerId) {
      return NextResponse.json({ isFavorited: false });
    }

    const favorite = await db.favoriteSeller.findUnique({
      where: {
        userId_sellerId: {
          userId: session.user.id,
          sellerId,
        },
      },
    });

    return NextResponse.json({ isFavorited: !!favorite });
  } catch (error: any) {
    console.error("Favorite seller check error:", error);
    return NextResponse.json({ isFavorited: false });
  }
}

