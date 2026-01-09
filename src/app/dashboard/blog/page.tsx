"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  category: string | null;
  status: "DRAFT" | "PUBLISHED";
  publishedAt: string | null;
  createdAt: string;
  commentCount: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function BlogDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "DRAFT" | "PUBLISHED">("all");
  const [deleteModal, setDeleteModal] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/hesap?redirect=/dashboard/blog");
      return;
    }

    if (user) {
      fetchPosts();
    }
  }, [user, authLoading, filter]);

  const fetchPosts = async (page = 1) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        authorId: user!.id,
      });
      
      if (filter !== "all") {
        params.append("status", filter);
      }

      const response = await fetch(`/api/blog?${params}`);
      if (!response.ok) {
        throw new Error("Blog yazıları yüklenemedi");
      }

      const data = await response.json();
      setPosts(data.posts);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (slug: string) => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/blog/${slug}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Silme işlemi başarısız");
      }

      setPosts((prev) => prev.filter((p) => p.slug !== slug));
      setDeleteModal(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setDeleting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background-ivory">
      {/* Header */}
      <div className="bg-surface-white border-b border-border-subtle">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-text-charcoal">Blog Yazılarım</h1>
              <p className="text-text-secondary mt-1">Blog yazılarınızı yönetin ve yeni içerik oluşturun.</p>
            </div>
            <Link
              href="/dashboard/blog/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined text-xl">add</span>
              Yeni Yazı
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              filter === "all"
                ? "bg-primary text-white"
                : "bg-surface-white border border-border-subtle text-text-charcoal hover:border-primary"
            }`}
          >
            Tümü
          </button>
          <button
            onClick={() => setFilter("PUBLISHED")}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              filter === "PUBLISHED"
                ? "bg-primary text-white"
                : "bg-surface-white border border-border-subtle text-text-charcoal hover:border-primary"
            }`}
          >
            Yayında
          </button>
          <button
            onClick={() => setFilter("DRAFT")}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              filter === "DRAFT"
                ? "bg-primary text-white"
                : "bg-surface-white border border-border-subtle text-text-charcoal hover:border-primary"
            }`}
          >
            Taslak
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Posts List */}
        {!isLoading && posts.length === 0 && (
          <div className="bg-surface-white rounded-xl border border-border-subtle p-12 text-center">
            <span className="material-symbols-outlined text-6xl text-border-subtle mb-4">article</span>
            <h2 className="text-xl font-bold text-text-charcoal mb-2">Henüz blog yazınız yok</h2>
            <p className="text-text-secondary mb-6">
              İlk blog yazınızı oluşturarak başlayın.
            </p>
            <Link
              href="/dashboard/blog/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined">add</span>
              İlk Yazıyı Oluştur
            </Link>
          </div>
        )}

        {!isLoading && posts.length > 0 && (
          <div className="bg-surface-white rounded-xl border border-border-subtle overflow-hidden">
            <div className="divide-y divide-border-subtle">
              {posts.map((post) => (
                <div key={post.id} className="p-6 hover:bg-surface-warm transition-colors">
                  <div className="flex items-start gap-4">
                    {/* Cover thumbnail */}
                    <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-background-ivory">
                      {post.coverImageUrl ? (
                        <div
                          className="w-full h-full bg-cover bg-center"
                          style={{ backgroundImage: `url('${post.coverImageUrl}')` }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-3xl text-border-subtle">image</span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded ${
                            post.status === "PUBLISHED"
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {post.status === "PUBLISHED" ? "Yayında" : "Taslak"}
                        </span>
                        {post.category && (
                          <span className="px-2 py-0.5 bg-background-ivory text-text-secondary text-xs rounded">
                            {post.category}
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-text-charcoal mb-1 line-clamp-1">{post.title}</h3>
                      <p className="text-text-secondary text-sm line-clamp-1">{post.excerpt || "Özet yok"}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-text-secondary">
                        <span>
                          {post.publishedAt
                            ? `Yayınlandı: ${formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true, locale: tr })}`
                            : `Oluşturuldu: ${formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: tr })}`}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">chat_bubble</span>
                          {post.commentCount} yorum
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="p-2 text-text-secondary hover:text-primary transition-colors"
                        title="Görüntüle"
                        target="_blank"
                      >
                        <span className="material-symbols-outlined">visibility</span>
                      </Link>
                      <Link
                        href={`/dashboard/blog/${post.id}/edit`}
                        className="p-2 text-text-secondary hover:text-primary transition-colors"
                        title="Düzenle"
                      >
                        <span className="material-symbols-outlined">edit</span>
                      </Link>
                      <button
                        onClick={() => setDeleteModal(post.slug)}
                        className="p-2 text-text-secondary hover:text-red-500 transition-colors"
                        title="Sil"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => fetchPosts(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-4 py-2 border border-border-subtle rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:border-primary transition-colors"
            >
              Önceki
            </button>
            <span className="text-text-secondary text-sm px-4">
              Sayfa {pagination.page} / {pagination.totalPages}
            </span>
            <button
              onClick={() => fetchPosts(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="px-4 py-2 border border-border-subtle rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:border-primary transition-colors"
            >
              Sonraki
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-white rounded-xl p-6 max-w-md w-full animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-red-600">delete</span>
              </div>
              <div>
                <h3 className="font-bold text-text-charcoal">Yazıyı Sil</h3>
                <p className="text-text-secondary text-sm">Bu işlem geri alınamaz.</p>
              </div>
            </div>
            <p className="text-text-secondary mb-6">
              Bu blog yazısını silmek istediğinizden emin misiniz? Tüm yorumlar da silinecektir.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal(null)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 border border-border-subtle rounded-lg font-medium hover:border-primary transition-colors"
              >
                İptal
              </button>
              <button
                onClick={() => handleDelete(deleteModal)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Siliniyor...
                  </>
                ) : (
                  "Evet, Sil"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




