"use client";

import { useState } from "react";
import Link from "next/link";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  category: string | null;
  publishedAt: string | null;
  author: {
    displayName: string | null;
    avatarUrl: string | null;
    publicProfile: {
      username: string;
      displayName: string;
      avatarUrl: string | null;
    } | null;
  };
  commentCount: number;
}

interface BlogPostsGridProps {
  initialPosts: BlogPost[];
  initialTotal: number;
  category?: string;
  featuredSlug?: string;
}

function formatDateTR(dateString: string | null): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  const months = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
  ];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

function getAuthorName(author: BlogPost["author"]): string {
  return author.publicProfile?.displayName || author.displayName || "Anonim";
}

function getDefaultCover(category: string | null): string {
  const defaultImages: Record<string, string> = {
    "Rehber": "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&h=400&fit=crop",
    "Röportaj": "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600&h=400&fit=crop",
    "Trend": "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&h=400&fit=crop",
    "Bakım": "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&h=400&fit=crop",
    "Dekorasyon": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop",
    "Topluluk": "https://images.unsplash.com/photo-1544413660-299165566b1d?w=600&h=400&fit=crop",
  };
  return defaultImages[category || ""] || "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&h=400&fit=crop";
}

export default function BlogPostsGrid({
  initialPosts,
  initialTotal,
  category,
  featuredSlug,
}: BlogPostsGridProps) {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialTotal > initialPosts.length);

  const loadMore = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: (page + 1).toString(),
        limit: "9",
      });

      if (category) {
        params.append("category", category);
      }

      const res = await fetch(`/api/blog?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load posts");

      const data = await res.json();
      
      // Filter out featured post and already loaded posts
      const existingSlugs = new Set(posts.map((p) => p.slug));
      const filteredPosts = data.posts.filter(
        (post: BlogPost) => post.slug !== featuredSlug && !existingSlugs.has(post.slug)
      );

      setPosts((prev) => [...prev, ...filteredPosts]);
      setPage((p) => p + 1);
      setHasMore(data.pagination.page < data.pagination.totalPages);
    } catch (error) {
      console.error("Error loading more posts:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
            <article className="bg-surface-white rounded-lg border border-border-subtle overflow-hidden hover:border-primary transition-all duration-300 hover:shadow-md">
              <div className="aspect-video overflow-hidden">
                <div
                  className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                  style={{ backgroundImage: `url('${post.coverImageUrl || getDefaultCover(post.category)}')` }}
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  {post.category && (
                    <span className="px-2 py-0.5 bg-background-ivory text-text-secondary text-xs font-medium rounded">{post.category}</span>
                  )}
                  <span className="text-text-secondary text-xs">{formatDateTR(post.publishedAt)}</span>
                </div>
                <h3 className="text-lg font-bold text-text-charcoal group-hover:text-primary transition-colors mb-2">{post.title}</h3>
                <p className="text-text-secondary text-sm line-clamp-2">{post.excerpt}</p>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border-subtle">
                  <span className="text-text-secondary text-xs">{getAuthorName(post.author)}</span>
                  <span className="text-text-secondary text-xs flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">chat_bubble</span>
                    {post.commentCount}
                  </span>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
      {hasMore && (
        <div className="text-center mt-12">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-8 py-3 bg-surface-white border border-border-subtle text-text-charcoal hover:border-primary hover:text-primary transition-colors font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Yükleniyor..." : "Daha Fazla Yükle"}
          </button>
        </div>
      )}
    </>
  );
}

