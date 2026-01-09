import PageHeader from "@/components/ui/PageHeader";
import Link from "next/link";
import { optionalAuth } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/db/prisma";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  category: string | null;
  publishedAt: Date | null;
  author: {
    displayName: string | null;
    avatarUrl: string | null;
    publicProfile: {
      username: string;
      displayName: string | null;
      avatarUrl: string | null;
    } | null;
  };
}

export default async function BlogPage() {
  const authContext = await optionalAuth();
  const isLoggedIn = !!authContext;

  // Fetch real blog posts from database
  const posts = await prisma.blogPost.findMany({
    where: {
      status: "PUBLISHED",
    },
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
    },
    orderBy: { publishedAt: "desc" },
    take: 10,
  }) as BlogPost[];

  const featuredPost = posts.length > 0 ? posts[0] : null;
  const otherPosts = posts.slice(1);

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return new Intl.DateTimeFormat("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(date));
  };

  return (
    <>
      <PageHeader 
        title="Atölye Günlüğü" 
        description="Sanat dünyasından haberler, sanatçı röportajları ve ilham verici hikayeler."
      />

      {/* Auth Actions - Top Right */}
      {isLoggedIn && (
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 -mt-8 mb-4">
          <div className="flex justify-end gap-2">
            <Link
              href="/dashboard/blog/new"
              className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-full transition-colors whitespace-nowrap"
            >
              Yazı Oluştur
            </Link>
            <Link
              href="/dashboard/blog?status=DRAFT"
              className="px-4 py-2 bg-surface-white border border-border-subtle text-text-charcoal hover:border-primary hover:text-primary text-sm font-medium rounded-full transition-colors whitespace-nowrap"
            >
              Taslaklarım
            </Link>
            <Link
              href="/dashboard/blog"
              className="px-4 py-2 bg-surface-white border border-border-subtle text-text-charcoal hover:border-primary hover:text-primary text-sm font-medium rounded-full transition-colors whitespace-nowrap"
            >
              Yazılarım
            </Link>
          </div>
        </div>
      )}

      {/* No Posts - Empty State */}
      {posts.length === 0 && (
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center py-20 bg-surface-warm rounded-lg border border-border-subtle">
            <span className="material-symbols-outlined text-7xl text-border-subtle mb-6">edit_note</span>
            <h2 className="text-2xl font-bold text-text-charcoal mb-3">Henüz blog yazısı yok</h2>
            <p className="text-text-secondary mb-8 max-w-md mx-auto">
              Sanat dünyasından haberler, sanatçı röportajları ve ilham verici hikayeler yakında burada olacak.
            </p>
            {isLoggedIn && (
              <Link
                href="/dashboard/blog/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-md transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
                İlk Yazıyı Sen Oluştur
              </Link>
            )}
          </div>
        </section>
      )}

      {/* Featured Post */}
      {featuredPost && (
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link href={`/blog/${featuredPost.slug}`} className="group block">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-surface-white rounded-lg border border-border-subtle overflow-hidden hover:border-primary transition-all duration-300">
              <div className="aspect-video lg:aspect-auto overflow-hidden bg-surface-warm">
                {featuredPost.coverImageUrl ? (
                  <div
                    className="w-full h-full min-h-[300px] bg-cover bg-center group-hover:scale-105 transition-transform duration-700"
                    style={{ backgroundImage: `url('${featuredPost.coverImageUrl}')` }}
                  />
                ) : (
                  <div className="w-full h-full min-h-[300px] flex items-center justify-center">
                    <span className="material-symbols-outlined text-6xl text-border-subtle">image</span>
                  </div>
                )}
              </div>
              <div className="p-8 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4">
                  {featuredPost.category && (
                    <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">{featuredPost.category}</span>
                  )}
                  <span className="text-text-secondary text-sm">{formatDate(featuredPost.publishedAt)}</span>
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold text-text-charcoal group-hover:text-primary transition-colors mb-4">{featuredPost.title}</h2>
                <p className="text-text-secondary leading-relaxed mb-6">{featuredPost.excerpt}</p>
                <span className="inline-flex items-center text-primary font-medium group-hover:underline">
                  Devamını Oku
                  <span className="material-symbols-outlined ml-1 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </span>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* All Posts */}
      {otherPosts.length > 0 && (
        <section className="bg-surface-warm border-y border-border-subtle py-12">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-text-charcoal">Tüm Yazılar</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {otherPosts.map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
                  <article className="bg-surface-white rounded-lg border border-border-subtle overflow-hidden hover:border-primary transition-all duration-300 hover:shadow-md">
                    <div className="aspect-video overflow-hidden bg-surface-warm">
                      {post.coverImageUrl ? (
                        <div
                          className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                          style={{ backgroundImage: `url('${post.coverImageUrl}')` }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-4xl text-border-subtle">image</span>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        {post.category && (
                          <span className="px-2 py-0.5 bg-background-ivory text-text-secondary text-xs font-medium rounded">{post.category}</span>
                        )}
                        <span className="text-text-secondary text-xs">{formatDate(post.publishedAt)}</span>
                      </div>
                      <h3 className="text-lg font-bold text-text-charcoal group-hover:text-primary transition-colors mb-2">{post.title}</h3>
                      <p className="text-text-secondary text-sm line-clamp-2">{post.excerpt}</p>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
