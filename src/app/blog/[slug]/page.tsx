import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import CommentSection from "@/components/blog/CommentSection";
import { formatDistanceToNow, format } from "date-fns";
import { tr } from "date-fns/locale";
import type { Metadata } from "next";
import { optionalAuth } from "@/lib/auth/require-auth";

// Dynamic metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({
    where: { slug, status: "PUBLISHED" },
    select: { title: true, excerpt: true, coverImageUrl: true },
  });

  if (!post) {
    return { title: "Yazı Bulunamadı | Atölyem" };
  }

  return {
    title: `${post.title} | Atölye Günlüğü`,
    description: post.excerpt || post.title,
    openGraph: {
      title: post.title,
      description: post.excerpt || post.title,
      images: post.coverImageUrl ? [post.coverImageUrl] : undefined,
    },
  };
}

// Generate static paths for published posts
export async function generateStaticParams() {
  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true },
    take: 50, // Limit for build time
  });

  return posts.map((post) => ({ slug: post.slug }));
}

async function getPost(slug: string) {
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
              bio: true,
            },
          },
        },
      },
      _count: {
        select: { comments: true },
      },
    },
  });

  return post;
}

async function getPostForEdit(slug: string) {
  const post = await prisma.blogPost.findUnique({
    where: { slug },
    select: {
      id: true,
      authorUserId: true,
    },
  });

  return post;
}

async function getRelatedPosts(currentSlug: string, category: string | null) {
  const posts = await prisma.blogPost.findMany({
    where: {
      status: "PUBLISHED",
      slug: { not: currentSlug },
      ...(category ? { category } : {}),
    },
    select: {
      slug: true,
      title: true,
      coverImageUrl: true,
      category: true,
    },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });

  return posts;
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

// Simple markdown-like rendering with XSS protection
function renderContent(content: string): React.ReactNode[] {
  // Split into paragraphs
  const paragraphs = content.split('\n\n');
  
  return paragraphs.map((paragraph, index) => {
    const trimmed = paragraph.trim();
    if (!trimmed) return null;

    // Headers
    if (trimmed.startsWith('### ')) {
      return (
        <h3 key={index} className="text-xl font-bold text-text-charcoal mt-8 mb-4">
          {escapeHtml(trimmed.slice(4))}
        </h3>
      );
    }
    if (trimmed.startsWith('## ')) {
      return (
        <h2 key={index} className="text-2xl font-bold text-text-charcoal mt-10 mb-4">
          {escapeHtml(trimmed.slice(3))}
        </h2>
      );
    }
    if (trimmed.startsWith('# ')) {
      return (
        <h1 key={index} className="text-3xl font-bold text-text-charcoal mt-10 mb-4">
          {escapeHtml(trimmed.slice(2))}
        </h1>
      );
    }

    // Bold headers (legacy format)
    if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
      return (
        <h3 key={index} className="text-xl font-bold text-text-charcoal mt-8 mb-4">
          {escapeHtml(trimmed.slice(2, -2))}
        </h3>
      );
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      return (
        <blockquote key={index} className="border-l-4 border-primary pl-4 my-6 italic text-text-secondary">
          {escapeHtml(trimmed.slice(2))}
        </blockquote>
      );
    }

    // Bullet list
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const items = trimmed.split('\n').filter(line => line.startsWith('- ') || line.startsWith('* '));
      return (
        <ul key={index} className="list-disc list-inside my-4 space-y-2 text-text-secondary">
          {items.map((item, i) => (
            <li key={i}>{renderInlineFormatting(item.slice(2))}</li>
          ))}
        </ul>
      );
    }

    // Numbered list
    if (/^\d+\.\s/.test(trimmed)) {
      const items = trimmed.split('\n').filter(line => /^\d+\.\s/.test(line));
      return (
        <ol key={index} className="list-decimal list-inside my-4 space-y-2 text-text-secondary">
          {items.map((item, i) => (
            <li key={i}>{renderInlineFormatting(item.replace(/^\d+\.\s/, ''))}</li>
          ))}
        </ol>
      );
    }

    // Regular paragraph with inline formatting
    return (
      <p key={index} className="text-text-secondary leading-relaxed mb-4">
        {renderInlineFormatting(trimmed)}
      </p>
    );
  }).filter(Boolean);
}

// Render inline formatting (bold, italic)
function renderInlineFormatting(text: string): React.ReactNode {
  // Escape HTML first
  const escaped = escapeHtml(text);
  
  // Process inline formatting
  // Bold: **text** or __text__
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  const boldRegex = /\*\*(.+?)\*\*|__(.+?)__/g;
  let match;

  while ((match = boldRegex.exec(escaped)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push(processItalics(escaped.slice(lastIndex, match.index)));
    }
    // Add bold text
    parts.push(
      <strong key={match.index} className="font-semibold text-text-charcoal">
        {processItalics(match[1] || match[2])}
      </strong>
    );
    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < escaped.length) {
    parts.push(processItalics(escaped.slice(lastIndex)));
  }

  return parts.length === 0 ? escaped : parts;
}

// Process italic formatting
function processItalics(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  const italicRegex = /\*(.+?)\*|_(.+?)_/g;
  let match;

  while ((match = italicRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <em key={match.index} className="italic">
        {match[1] || match[2]}
      </em>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length === 0 ? text : parts;
}

// Escape HTML to prevent XSS
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, postForEdit, authContext] = await Promise.all([
    getPost(slug),
    getPostForEdit(slug),
    optionalAuth(),
  ]);

  // 404 if post doesn't exist or is draft (drafts need API auth check)
  if (!post || post.status === "DRAFT") {
    notFound();
  }

  const isAuthor = authContext?.user.id === postForEdit?.authorUserId;
  const relatedPosts = await getRelatedPosts(slug, post.category);
  const authorName = post.author.publicProfile?.displayName || post.author.displayName || "Anonim";
  const authorUsername = post.author.publicProfile?.username;
  const authorAvatar = post.author.publicProfile?.avatarUrl || post.author.avatarUrl;
  const coverImage = post.coverImageUrl || getDefaultCover(post.category);

  return (
    <>
      {/* Hero */}
      <div className="bg-surface-warm border-b border-border-subtle">
        <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <nav className="flex items-center gap-2 text-sm text-text-secondary mb-6">
            <Link href="/" className="hover:text-primary transition-colors">Ana Sayfa</Link>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="text-text-charcoal line-clamp-1">{post.title}</span>
          </nav>
          <div className="flex items-center gap-3 mb-4">
            {post.category && (
              <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">{post.category}</span>
            )}
            {post.publishedAt && (
              <span className="text-text-secondary text-sm">
                {format(post.publishedAt, "d MMMM yyyy", { locale: tr })}
              </span>
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-text-charcoal flex-1">{post.title}</h1>
            {isAuthor && postForEdit && (
              <Link
                href={`/dashboard/blog/${postForEdit.id}/edit`}
                className="px-4 py-2 bg-surface-white border border-border-subtle text-text-charcoal hover:border-primary hover:text-primary text-sm font-medium rounded-full transition-colors whitespace-nowrap flex items-center gap-2 shrink-0"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
                Düzenle
              </Link>
            )}
          </div>
          
          {/* Author */}
          <div className="flex items-center gap-3">
            {authorUsername ? (
              <Link href={`/sanatsever/${authorUsername}`} className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
                  {authorAvatar ? (
                    <div
                      className="w-full h-full bg-cover bg-center"
                      style={{ backgroundImage: `url('${authorAvatar}')` }}
                    />
                  ) : (
                    <span className="text-primary font-semibold">
                      {authorName[0]?.toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-text-charcoal font-medium group-hover:text-primary transition-colors">{authorName}</p>
                  <p className="text-text-secondary text-sm">@{authorUsername}</p>
                </div>
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-semibold">
                    {authorName[0]?.toUpperCase()}
                  </span>
                </div>
                <p className="text-text-charcoal font-medium">{authorName}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Featured Image */}
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 -mt-0">
        <div className="aspect-video rounded-lg overflow-hidden shadow-lg">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url('${coverImage}')` }}
          />
        </div>
      </div>

      {/* Content */}
      <article className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg max-w-none">
          {renderContent(post.content)}
        </div>

        {/* Share */}
        <div className="flex items-center gap-4 mt-12 pt-8 border-t border-border-subtle">
          <span className="text-text-secondary text-sm">Paylaş:</span>
          <button 
            className="p-2 text-text-secondary hover:text-primary transition-colors"
            title="Twitter'da Paylaş"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
          </button>
          <button 
            className="p-2 text-text-secondary hover:text-primary transition-colors"
            title="LinkedIn'de Paylaş"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
          </button>
          <button 
            className="p-2 text-text-secondary hover:text-primary transition-colors"
            title="Linki Kopyala"
          >
            <span className="material-symbols-outlined text-xl">link</span>
          </button>
        </div>
      </article>

      {/* Comments Section */}
      <CommentSection postSlug={slug} />

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="bg-surface-warm border-t border-border-subtle py-12">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-text-charcoal mb-8">İlgili Yazılar</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map((relatedPost) => (
                <Link key={relatedPost.slug} href={`/blog/${relatedPost.slug}`} className="group">
                  <article className="bg-surface-white rounded-lg border border-border-subtle overflow-hidden hover:border-primary transition-all duration-300">
                    <div className="aspect-video overflow-hidden">
                      <div
                        className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                        style={{ backgroundImage: `url('${relatedPost.coverImageUrl || getDefaultCover(relatedPost.category)}')` }}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-text-charcoal group-hover:text-primary transition-colors">{relatedPost.title}</h3>
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
