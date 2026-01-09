"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

const CATEGORIES = [
  "Rehber",
  "Röportaj",
  "Trend",
  "Bakım",
  "Dekorasyon",
  "Topluluk",
  "Teknik",
  "İlham",
];

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  category: string | null;
  status: "DRAFT" | "PUBLISHED";
}

export default function EditBlogPostPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/hesap?redirect=/dashboard/blog/${postId}/edit`);
      return;
    }

    if (user && postId) {
      fetchPost();
    }
  }, [user, authLoading, postId]);

  const fetchPost = async () => {
    setLoading(true);
    setError(null);

    try {
      // First, we need to get the post by ID
      // Since our API is slug-based, we'll fetch the user's posts and find by ID
      const response = await fetch(`/api/blog?authorId=${user!.id}&limit=100`);
      
      if (!response.ok) {
        throw new Error("Yazı bulunamadı");
      }

      const data = await response.json();
      const foundPost = data.posts.find((p: BlogPost) => p.id === postId);

      if (!foundPost) {
        throw new Error("Yazı bulunamadı veya erişim yetkiniz yok");
      }

      // Now fetch full content by slug
      const detailResponse = await fetch(`/api/blog/${foundPost.slug}`);
      if (!detailResponse.ok) {
        throw new Error("Yazı detayları yüklenemedi");
      }

      const detailData = await detailResponse.json();
      const fullPost = detailData.post;

      setPost(fullPost);
      setTitle(fullPost.title);
      setContent(fullPost.content);
      setExcerpt(fullPost.excerpt || "");
      setCoverImageUrl(fullPost.coverImageUrl || "");
      setCategory(fullPost.category || "");
      setStatus(fullPost.status);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (publishStatus?: "DRAFT" | "PUBLISHED") => {
    if (!title.trim() || !content.trim()) {
      setError("Başlık ve içerik gereklidir.");
      return;
    }

    if (!post) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/blog/${post.slug}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          excerpt: excerpt.trim() || null,
          coverImageUrl: coverImageUrl.trim() || null,
          category: category || null,
          status: publishStatus || status,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Yazı güncellenemedi");
      }

      const data = await response.json();
      
      if (publishStatus === "PUBLISHED" || status === "PUBLISHED") {
        router.push(`/blog/${data.post.slug}`);
      } else {
        router.push("/dashboard/blog");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (error && !post) {
    return (
      <div className="min-h-screen bg-background-ivory flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-border-subtle mb-4">error</span>
          <h2 className="text-xl font-bold text-text-charcoal mb-2">{error}</h2>
          <Link
            href="/dashboard/blog"
            className="text-primary hover:underline"
          >
            Blog Paneline Dön
          </Link>
        </div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background-ivory">
      {/* Header */}
      <div className="bg-surface-white border-b border-border-subtle sticky top-0 z-10">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/blog"
                className="p-2 hover:bg-background-ivory rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-text-charcoal">Yazıyı Düzenle</h1>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  status === "PUBLISHED" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                }`}>
                  {status === "PUBLISHED" ? "Yayında" : "Taslak"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className={`px-4 py-2 border rounded-lg font-medium text-sm transition-colors ${
                  previewMode
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border-subtle text-text-charcoal hover:border-primary"
                }`}
              >
                <span className="material-symbols-outlined text-[18px] mr-1 align-middle">
                  {previewMode ? "edit" : "visibility"}
                </span>
                {previewMode ? "Düzenle" : "Önizle"}
              </button>
              {status === "DRAFT" && (
                <button
                  onClick={() => handleSubmit("DRAFT")}
                  disabled={submitting}
                  className="px-4 py-2 border border-border-subtle text-text-charcoal hover:border-primary rounded-lg font-medium text-sm transition-colors"
                >
                  Taslak Kaydet
                </button>
              )}
              <button
                onClick={() => handleSubmit(status === "DRAFT" ? "PUBLISHED" : undefined)}
                disabled={submitting}
                className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Kaydediliyor...
                  </>
                ) : status === "DRAFT" ? (
                  <>
                    <span className="material-symbols-outlined text-[18px]">publish</span>
                    Yayınla
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">save</span>
                    Kaydet
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Editor */}
          <div className="lg:col-span-2">
            {previewMode ? (
              <div className="bg-surface-white rounded-xl border border-border-subtle p-8">
                <h1 className="text-3xl font-bold text-text-charcoal mb-4">{title || "Başlık"}</h1>
                {excerpt && <p className="text-text-secondary text-lg mb-6">{excerpt}</p>}
                {coverImageUrl && (
                  <div className="aspect-video rounded-lg overflow-hidden mb-8">
                    <img src={coverImageUrl} alt={title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="prose prose-lg max-w-none">
                  {content.split('\n\n').map((p, i) => (
                    <p key={i} className="text-text-secondary mb-4">{p}</p>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-text-charcoal mb-2">
                    Başlık <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Yazınız için dikkat çekici bir başlık..."
                    className="w-full px-4 py-3 border border-border-subtle rounded-lg focus:outline-none focus:border-primary text-lg font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-charcoal mb-2">
                    Özet
                  </label>
                  <textarea
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Kısa bir özet (opsiyonel)..."
                    rows={2}
                    className="w-full px-4 py-3 border border-border-subtle rounded-lg focus:outline-none focus:border-primary resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-charcoal mb-2">
                    İçerik <span className="text-red-500">*</span>
                  </label>
                  <div className="border border-border-subtle rounded-lg overflow-hidden">
                    <div className="bg-surface-warm border-b border-border-subtle px-4 py-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setContent(content + "**kalın**")}
                        className="p-1.5 hover:bg-surface-white rounded text-text-secondary hover:text-text-charcoal"
                        title="Kalın"
                      >
                        <span className="material-symbols-outlined text-[18px]">format_bold</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setContent(content + "*italik*")}
                        className="p-1.5 hover:bg-surface-white rounded text-text-secondary hover:text-text-charcoal"
                        title="İtalik"
                      >
                        <span className="material-symbols-outlined text-[18px]">format_italic</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setContent(content + "\n\n## Başlık\n\n")}
                        className="p-1.5 hover:bg-surface-white rounded text-text-secondary hover:text-text-charcoal"
                        title="Başlık"
                      >
                        <span className="material-symbols-outlined text-[18px]">title</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setContent(content + "\n\n> Alıntı metni\n\n")}
                        className="p-1.5 hover:bg-surface-white rounded text-text-secondary hover:text-text-charcoal"
                        title="Alıntı"
                      >
                        <span className="material-symbols-outlined text-[18px]">format_quote</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setContent(content + "\n\n- Liste öğesi\n- Liste öğesi\n\n")}
                        className="p-1.5 hover:bg-surface-white rounded text-text-secondary hover:text-text-charcoal"
                        title="Liste"
                      >
                        <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span>
                      </button>
                    </div>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Yazınızı buraya yazın..."
                      rows={20}
                      className="w-full px-4 py-3 focus:outline-none resize-none"
                    />
                  </div>
                  <p className="text-xs text-text-secondary mt-2">
                    Markdown formatı desteklenir: **kalın**, *italik*, ## başlık, &gt; alıntı, - liste
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-surface-white rounded-xl border border-border-subtle p-6 space-y-6 sticky top-24">
              <div>
                <label className="block text-sm font-medium text-text-charcoal mb-2">
                  Kapak Resmi URL
                </label>
                <input
                  type="url"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 border border-border-subtle rounded-lg focus:outline-none focus:border-primary text-sm"
                />
                {coverImageUrl && (
                  <div className="mt-2 aspect-video rounded-lg overflow-hidden bg-background-ivory">
                    <img
                      src={coverImageUrl}
                      alt="Kapak önizleme"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-charcoal mb-2">
                  Kategori
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 border border-border-subtle rounded-lg focus:outline-none focus:border-primary text-sm bg-white"
                >
                  <option value="">Kategori seçin...</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {status === "PUBLISHED" && (
                <div className="pt-4 border-t border-border-subtle">
                  <Link
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    className="flex items-center gap-2 text-primary hover:underline text-sm"
                  >
                    <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                    Yayındaki yazıyı görüntüle
                  </Link>
                </div>
              )}

              <div className="pt-4 border-t border-border-subtle">
                <p className="text-xs text-text-secondary">
                  Slug: <span className="font-mono">{post.slug}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}




