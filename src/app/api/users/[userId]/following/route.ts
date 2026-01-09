/**
 * GET /api/users/[userId]/following - Get users that this user follows (paginated)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { paginationSchema } from "@/lib/api/validation";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const { page, limit } = paginationSchema.parse(searchParams);

    const skip = (page - 1) * limit;

    // Check user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
    }

    const [following, total] = await Promise.all([
      prisma.userFollow.findMany({
        where: { followerId: userId },
        include: {
          following: {
            select: {
              id: true,
              displayName: true,
              avatarUrl: true,
              publicProfile: {
                select: {
                  username: true,
                  displayName: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.userFollow.count({ where: { followerId: userId } }),
    ]);

    return NextResponse.json({
      following: following.map((f) => ({
        userId: f.following.id,
        username: f.following.publicProfile?.username,
        displayName: f.following.publicProfile?.displayName || f.following.displayName,
        avatarUrl: f.following.publicProfile?.avatarUrl || f.following.avatarUrl,
        followedAt: f.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching following:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}




