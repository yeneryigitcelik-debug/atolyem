/**
 * GET /api/blog - Get blog posts with pagination and category filter
 * POST /api/blog - Create a new blog post
 */

import { NextRequest, NextResponse } from "next/server";
import { withRequestContext } from "@/interface/middleware/with-request-context";
import { requireAuth, optionalAuth } from "@/lib/auth/require-auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";
import { createBlogPostSchema, blogPostQuerySchema } from "@/lib/api/validation";
import { slugify, generateUniqueSlug } from "@/domain/value-objects/slug";

export const GET = withRequestContext(async (request: NextRequest, { requestId }) => {
  const authContext = await optionalAuth();
  const searchParams = Object.fromEntries(request.nextUrl.searchParams);
  const query = blogPostQuerySchema.parse(searchParams);

  const skip = (query.page - 1) * query.limit;

  // Build where clause
  const where: {
    status: "PUBLISHED";
    category?: string | null;
    authorUserId?: string;
  } = {
    status: "PUBLISHED",
  };

  if (query.category) {
    where.category = query.category;
  }

  // If status is provided and user is viewing their own posts
  if (query.status && authContext?.user) {
    where.authorUserId = authContext.user.id;
  }

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      include: {
        author: {
          select: {
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
      orderBy: { publishedAt: "desc" },
      skip,
      take: query.limit,
    }),
    prisma.blogPost.count({ where }),
  ]);

  return NextResponse.json(
    {
      posts: posts.map((post) => ({
        id: post.id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        coverImageUrl: post.coverImageUrl,
        category: post.category,
        publishedAt: post.publishedAt?.toISOString() || null,
        author: post.author,
        commentCount: post._count.comments,
      })),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    },
    { headers: { "x-request-id": requestId } }
  );
});

// POST /api/blog - Create a new blog post
export const POST = withRequestContext(async (request: NextRequest, { requestId, logger }) => {
  const { user } = await requireAuth();

  const body = await request.json();
  const validatedData = createBlogPostSchema.parse(body);

  // Generate slug from title
  const baseSlug = slugify(validatedData.title);
  
  // Get existing slugs to ensure uniqueness
  const existingPosts = await prisma.blogPost.findMany({
    where: {
      slug: {
        startsWith: baseSlug,
      },
    },
    select: { slug: true },
  });
  
  const existingSlugs = existingPosts.map((p) => p.slug);
  const slug = generateUniqueSlug(baseSlug, existingSlugs);

  // Generate excerpt if not provided
  const excerpt = validatedData.excerpt || validatedData.content.slice(0, 200).replace(/[#*_`]/g, "") + "...";

  const post = await prisma.blogPost.create({
    data: {
      authorUserId: user.id,
      slug,
      title: validatedData.title,
      content: validatedData.content,
      excerpt,
      coverImageUrl: validatedData.coverImageUrl,
      category: validatedData.category,
      status: validatedData.status,
      publishedAt: validatedData.status === "PUBLISHED" ? new Date() : null,
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

  logger.info("Blog post created", { postId: post.id, slug: post.slug });

  return NextResponse.json({ post }, { status: 201, headers: { "x-request-id": requestId } });
});
