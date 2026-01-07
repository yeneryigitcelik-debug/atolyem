import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";
import { createBlogCommentSchema, blogCommentsQuerySchema } from "@/lib/api/validation";

// GET /api/blog/[slug]/comments - Get comments for a blog post with pagination
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const searchParams = request.nextUrl.searchParams;
    const query = blogCommentsQuerySchema.parse({
      page: searchParams.get("page") ?? 1,
      limit: searchParams.get("limit") ?? 20,
    });

    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Find the blog post
    const post = await prisma.blogPost.findUnique({
      where: { slug },
      select: { id: true, status: true, authorUserId: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }

    // Check access: drafts are only visible to the author
    if (post.status === "DRAFT" && post.authorUserId !== user?.id) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }

    // Get top-level comments with pagination
    const [comments, total] = await Promise.all([
      prisma.blogComment.findMany({
        where: {
          postId: post.id,
          parentId: null, // Only top-level comments
          isApproved: true,
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
          replies: {
            where: { isApproved: true },
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
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.blogComment.count({
        where: {
          postId: post.id,
          parentId: null,
          isApproved: true,
        },
      }),
    ]);

    // Format comments for response
    const formattedComments = comments.map((comment) => ({
      id: comment.id,
      body: comment.body,
      createdAt: comment.createdAt,
      author: {
        id: comment.author.id,
        displayName: comment.author.publicProfile?.displayName || comment.author.displayName || "Anonim",
        username: comment.author.publicProfile?.username || null,
        avatarUrl: comment.author.publicProfile?.avatarUrl || comment.author.avatarUrl,
      },
      isOwner: user?.id === comment.authorUserId,
      replies: comment.replies.map((reply) => ({
        id: reply.id,
        body: reply.body,
        createdAt: reply.createdAt,
        author: {
          id: reply.author.id,
          displayName: reply.author.publicProfile?.displayName || reply.author.displayName || "Anonim",
          username: reply.author.publicProfile?.username || null,
          avatarUrl: reply.author.publicProfile?.avatarUrl || reply.author.avatarUrl,
        },
        isOwner: user?.id === reply.authorUserId,
      })),
    }));

    return NextResponse.json({
      comments: formattedComments,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    });
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
      return NextResponse.json({ error: "Yorum yapmak için giriş yapmalısınız" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createBlogCommentSchema.parse(body);

    // Find the blog post
    const post = await prisma.blogPost.findUnique({
      where: { slug },
      select: { id: true, status: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Blog yazısı bulunamadı" }, { status: 404 });
    }

    // Can only comment on published posts
    if (post.status !== "PUBLISHED") {
      return NextResponse.json({ error: "Bu yazıya yorum yapılamaz" }, { status: 403 });
    }

    // If this is a reply, verify parent comment exists
    if (validatedData.parentId) {
      const parentComment = await prisma.blogComment.findUnique({
        where: { id: validatedData.parentId },
        select: { id: true, postId: true, parentId: true },
      });

      if (!parentComment || parentComment.postId !== post.id) {
        return NextResponse.json({ error: "Yanıt yapılacak yorum bulunamadı" }, { status: 404 });
      }

      // Prevent nested replies (only 1 level deep)
      if (parentComment.parentId) {
        return NextResponse.json({ error: "İç içe yanıtlar desteklenmiyor" }, { status: 400 });
      }
    }

    // Create the comment
    const comment = await prisma.blogComment.create({
      data: {
        postId: post.id,
        authorUserId: user.id,
        parentId: validatedData.parentId || null,
        body: validatedData.body.trim(),
        isApproved: true, // Auto-approve for now
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

    return NextResponse.json({
      comment: {
        id: comment.id,
        body: comment.body,
        createdAt: comment.createdAt,
        author: {
          id: comment.author.id,
          displayName: comment.author.publicProfile?.displayName || comment.author.displayName || "Anonim",
          username: comment.author.publicProfile?.username || null,
          avatarUrl: comment.author.publicProfile?.avatarUrl || comment.author.avatarUrl,
        },
        isOwner: true,
        replies: [],
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Geçersiz yorum içeriği" }, { status: 400 });
    }
    
    return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
  }
}
