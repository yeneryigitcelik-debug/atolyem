/**
 * Profile Comments API Routes
 * GET /api/users/[userId]/comments - Get comments on a profile
 * POST /api/users/[userId]/comments - Add a comment to a profile
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/require-auth";
import {
  createProfileCommentSchema,
  profileCommentsQuerySchema,
} from "@/lib/api/validation";
import { ZodError } from "zod";
import { UnauthorizedError } from "@/lib/api/errors";

type RouteContext = { params: Promise<{ userId: string }> };

/**
 * GET /api/users/[userId]/comments
 * Get comments on a user's profile (public, with pagination)
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { userId } = await context.params;
    const { searchParams } = new URL(request.url);

    // Validate query params
    const query = profileCommentsQuerySchema.parse({
      cursor: searchParams.get("cursor") || undefined,
      limit: searchParams.get("limit") || 20,
    });

    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!userExists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch comments with cursor-based pagination
    const comments = await prisma.profileComment.findMany({
      where: { profileUserId: userId },
      orderBy: { createdAt: "desc" },
      take: query.limit + 1, // Fetch one extra to check if there's more
      ...(query.cursor
        ? {
            cursor: { id: query.cursor },
            skip: 1,
          }
        : {}),
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
            publicProfile: {
              select: {
                username: true,
              },
            },
          },
        },
      },
    });

    // Check if there are more comments
    const hasMore = comments.length > query.limit;
    const returnComments = hasMore ? comments.slice(0, -1) : comments;
    const nextCursor = hasMore
      ? returnComments[returnComments.length - 1]?.id
      : null;

    // Format response
    const formattedComments = returnComments.map((comment) => ({
      id: comment.id,
      body: comment.body,
      createdAt: comment.createdAt.toISOString(),
      author: {
        userId: comment.author.id,
        displayName: comment.author.displayName || "Anonim",
        avatarUrl: comment.author.avatarUrl,
        username: comment.author.publicProfile?.username,
      },
    }));

    return NextResponse.json({
      comments: formattedComments,
      nextCursor,
      hasMore,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error fetching profile comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users/[userId]/comments
 * Add a comment to a user's profile (requires authentication)
 */
export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { userId: profileUserId } = await context.params;

    // Require authentication
    const { user } = await requireAuth();

    // Prevent users from commenting on their own profile
    if (profileUserId === user.id) {
      return NextResponse.json(
        { error: "Kendi profilinize yorum yazamazsınız" },
        { status: 403 }
      );
    }

    // Check if target profile exists
    const profileUser = await prisma.user.findUnique({
      where: { id: profileUserId },
      select: { id: true },
    });

    if (!profileUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Parse and validate request body
    const body = await request.json();
    const data = createProfileCommentSchema.parse(body);

    // Create the comment
    const comment = await prisma.profileComment.create({
      data: {
        profileUserId,
        authorUserId: user.id,
        body: data.body,
      },
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
            publicProfile: {
              select: {
                username: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(
      {
        comment: {
          id: comment.id,
          body: comment.body,
          createdAt: comment.createdAt.toISOString(),
          author: {
            userId: comment.author.id,
            displayName: comment.author.displayName || "Anonim",
            avatarUrl: comment.author.avatarUrl,
            username: comment.author.publicProfile?.username,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        { error: "Giriş yapmanız gerekiyor" },
        { status: 401 }
      );
    }

    console.error("Error creating profile comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}

