/**
 * POST /api/users/[userId]/follow - Follow a user
 * DELETE /api/users/[userId]/follow - Unfollow a user
 * GET /api/users/[userId]/follow - Check if current user follows this user
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, optionalAuth } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/db/prisma";
import { NotFoundError, ForbiddenError } from "@/lib/api/errors";

// Check follow status (public - returns isFollowing for logged in users)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const auth = await optionalAuth();

    if (!auth) {
      return NextResponse.json({ isFollowing: false });
    }

    const isFollowing = await prisma.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId: auth.user.id,
          followingId: userId,
        },
      },
    });

    return NextResponse.json({ isFollowing: !!isFollowing });
  } catch (error) {
    console.error("Error checking follow status:", error);
    return NextResponse.json({ isFollowing: false });
  }
}

// Follow a user
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: userIdToFollow } = await params;
    const { user } = await requireAuth();

    // Check user is not trying to follow themselves
    if (user.id === userIdToFollow) {
      throw new ForbiddenError("Kendini takip edemezsin");
    }

    // Check target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userIdToFollow },
      select: { id: true },
    });

    if (!targetUser) {
      throw new NotFoundError("Kullanıcı");
    }

    // Check if already following
    const existingFollow = await prisma.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId: user.id,
          followingId: userIdToFollow,
        },
      },
    });

    if (existingFollow) {
      return NextResponse.json({ message: "Zaten takip ediyorsun", isFollowing: true });
    }

    // Create follow relationship
    await prisma.userFollow.create({
      data: {
        followerId: user.id,
        followingId: userIdToFollow,
      },
    });

    return NextResponse.json({ message: "Takip edildi", isFollowing: true }, { status: 201 });
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    console.error("Error following user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Unfollow a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: userIdToUnfollow } = await params;
    const { user } = await requireAuth();

    await prisma.userFollow.deleteMany({
      where: {
        followerId: user.id,
        followingId: userIdToUnfollow,
      },
    });

    return NextResponse.json({ message: "Takipten çıkıldı", isFollowing: false });
  } catch (error) {
    console.error("Error unfollowing user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
