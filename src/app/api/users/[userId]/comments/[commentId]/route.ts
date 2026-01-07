/**
 * Profile Comment Deletion API Route
 * DELETE /api/users/[userId]/comments/[commentId] - Delete a comment
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/require-auth";
import { UnauthorizedError } from "@/lib/api/errors";

type RouteContext = { params: Promise<{ userId: string; commentId: string }> };

/**
 * DELETE /api/users/[userId]/comments/[commentId]
 * Delete a comment (author or profile owner can delete)
 */
export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { userId: profileUserId, commentId } = await context.params;

    // Require authentication
    const { user } = await requireAuth();

    // Find the comment
    const comment = await prisma.profileComment.findUnique({
      where: { id: commentId },
      select: {
        id: true,
        profileUserId: true,
        authorUserId: true,
      },
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Verify the comment belongs to this profile
    if (comment.profileUserId !== profileUserId) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Check permission: either comment author or profile owner can delete
    const canDelete =
      comment.authorUserId === user.id || comment.profileUserId === user.id;

    if (!canDelete) {
      return NextResponse.json(
        { error: "You do not have permission to delete this comment" },
        { status: 403 }
      );
    }

    // Delete the comment
    await prisma.profileComment.delete({
      where: { id: commentId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        { error: "Giriş yapmanız gerekiyor" },
        { status: 401 }
      );
    }

    console.error("Error deleting profile comment:", error);
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}

