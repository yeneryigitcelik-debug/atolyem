import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";

// DELETE /api/blog/[slug]/comments/[commentId] - Delete a comment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; commentId: string }> }
) {
  try {
    const { slug, commentId } = await params;
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the blog post
    const post = await prisma.blogPost.findUnique({
      where: { slug },
      select: { id: true, authorUserId: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }

    // Find the comment
    const comment = await prisma.blogComment.findUnique({
      where: { id: commentId },
      select: { id: true, postId: true, authorUserId: true },
    });

    if (!comment || comment.postId !== post.id) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Check permission: comment author or post author can delete
    const isCommentAuthor = comment.authorUserId === user.id;
    const isPostAuthor = post.authorUserId === user.id;

    if (!isCommentAuthor && !isPostAuthor) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete the comment (cascade will handle replies)
    await prisma.blogComment.delete({
      where: { id: commentId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

