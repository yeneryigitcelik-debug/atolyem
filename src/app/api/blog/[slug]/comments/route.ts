import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";

// GET /api/blog/[slug]/comments - Get comments for a blog post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // First, find the blog post
    const post = await prisma.blogPost.findUnique({
      where: { slug },
    });

    if (!post) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }

    // Get comments with user info and replies
    const comments = await prisma.blogComment.findMany({
      where: {
        postId: post.id,
        parentId: null, // Only top-level comments
        isApproved: true,
      },
      include: {
        user: {
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
        replies: {
          where: { isApproved: true },
          include: {
            user: {
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
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/blog/[slug]/comments - Create a new comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { content, parentId } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Comment content is required" }, { status: 400 });
    }

    // Find the blog post
    const post = await prisma.blogPost.findUnique({
      where: { slug },
    });

    if (!post) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }

    // If this is a reply, verify parent comment exists
    if (parentId) {
      const parentComment = await prisma.blogComment.findUnique({
        where: { id: parentId },
      });

      if (!parentComment || parentComment.postId !== post.id) {
        return NextResponse.json({ error: "Parent comment not found" }, { status: 404 });
      }
    }

    // Create the comment
    const comment = await prisma.blogComment.create({
      data: {
        postId: post.id,
        userId: user.id,
        parentId: parentId || null,
        content: content.trim(),
        isApproved: true, // Auto-approve for now
      },
      include: {
        user: {
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

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

