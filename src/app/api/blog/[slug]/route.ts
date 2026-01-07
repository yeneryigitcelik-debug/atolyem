import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";
import { updateBlogPostSchema } from "@/lib/api/validation";

// GET /api/blog/[slug] - Get a single blog post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    const post = await prisma.blogPost.findUnique({
      where: { slug },
      include: {
        author: {
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
        _count: {
          select: { comments: true },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }

    // Check access: drafts are only visible to the author
    if (post.status === "DRAFT" && post.authorUserId !== user?.id) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }

    return NextResponse.json({
      post: {
        id: post.id,
        slug: post.slug,
        title: post.title,
        content: post.content,
        excerpt: post.excerpt,
        coverImageUrl: post.coverImageUrl,
        category: post.category,
        status: post.status,
        publishedAt: post.publishedAt,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        author: {
          id: post.author.id,
          displayName: post.author.publicProfile?.displayName || post.author.displayName || "Anonim",
          username: post.author.publicProfile?.username || null,
          avatarUrl: post.author.publicProfile?.avatarUrl || post.author.avatarUrl,
        },
        commentCount: post._count.comments,
        isOwner: user?.id === post.authorUserId,
      },
    });
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/blog/[slug] - Update a blog post
export async function PATCH(
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

    const existingPost = await prisma.blogPost.findUnique({
      where: { slug },
      select: { id: true, authorUserId: true, status: true, publishedAt: true },
    });

    if (!existingPost) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }

    if (existingPost.authorUserId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = updateBlogPostSchema.parse(body);

    // Handle publishing logic
    let publishedAt = existingPost.publishedAt;
    if (validatedData.status === "PUBLISHED" && existingPost.status === "DRAFT") {
      publishedAt = new Date();
    }

    // Generate excerpt if content changed and no excerpt provided
    let excerpt = validatedData.excerpt;
    if (validatedData.content && excerpt === undefined) {
      excerpt = validatedData.content.slice(0, 200).replace(/[#*_`]/g, "") + "...";
    }

    const post = await prisma.blogPost.update({
      where: { id: existingPost.id },
      data: {
        title: validatedData.title,
        content: validatedData.content,
        excerpt,
        coverImageUrl: validatedData.coverImageUrl,
        category: validatedData.category,
        status: validatedData.status,
        publishedAt,
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
                displayName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ post });
  } catch (error) {
    console.error("Error updating blog post:", error);
    
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Validation error", details: error }, { status: 400 });
    }
    
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/blog/[slug] - Delete a blog post
export async function DELETE(
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

    const existingPost = await prisma.blogPost.findUnique({
      where: { slug },
      select: { id: true, authorUserId: true },
    });

    if (!existingPost) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }

    if (existingPost.authorUserId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.blogPost.delete({
      where: { id: existingPost.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting blog post:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

