"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

interface Author {
  id: string;
  displayName: string;
  username: string | null;
  avatarUrl: string | null;
}

interface Comment {
  id: string;
  body: string;
  createdAt: string;
  author: Author;
  isOwner: boolean;
  replies: Comment[];
}

interface CommentSectionProps {
  postSlug: string;
}

function SingleComment({
  comment,
  isReply = false,
  onReply,
  onDelete,
  isPostAuthor,
}: {
  comment: Comment;
  isReply?: boolean;
  onReply: (commentId: string) => void;
  onDelete: (commentId: string) => void;
  isPostAuthor: boolean;
}) {
  const { user } = useAuth();
  const canDelete = comment.isOwner || isPostAuthor;

  return (
    <div className={`flex gap-3 ${isReply ? "ml-12 mt-4" : ""}`}>
      {comment.author.username ? (
        <Link
          href={`/sanatsever/${comment.author.username}`}
          className="shrink-0"
        >
          <div className="w-10 h-10 rounded-full overflow-hidden hover:ring-2 hover:ring-primary transition-all bg-primary/10 flex items-center justify-center">
            {comment.author.avatarUrl ? (
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url('${comment.author.avatarUrl}')` }}
              />
            ) : (
              <span className="text-primary font-semibold">
                {comment.author.displayName[0]?.toUpperCase()}
              </span>
            )}
          </div>
        </Link>
      ) : (
        <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center shrink-0">
          <span className="text-primary font-semibold">
            {comment.author.displayName[0]?.toUpperCase()}
          </span>
        </div>
      )}
      <div className="flex-grow">
        <div className="bg-background-ivory rounded-2xl px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            {comment.author.username ? (
              <Link
                href={`/sanatsever/${comment.author.username}`}
                className="font-semibold text-text-charcoal hover:text-primary transition-colors"
              >
                {comment.author.displayName}
              </Link>
            ) : (
              <span className="font-semibold text-text-charcoal">
                {comment.author.displayName}
              </span>
            )}
            <span className="text-xs text-text-secondary">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: tr })}
            </span>
          </div>
          <p className="text-text-secondary">{comment.body}</p>
        </div>
        <div className="flex items-center gap-4 mt-2 ml-2">
          {!isReply && user && (
            <button
              onClick={() => onReply(comment.id)}
              className="flex items-center gap-1 text-sm text-text-secondary hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">reply</span>
              Yanıtla
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => onDelete(comment.id)}
              className="flex items-center gap-1 text-sm text-text-secondary hover:text-red-500 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
              Sil
            </button>
          )}
        </div>
        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2">
            {comment.replies.map((reply) => (
              <SingleComment
                key={reply.id}
                comment={reply}
                isReply
                onReply={onReply}
                onDelete={onDelete}
                isPostAuthor={isPostAuthor}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CommentSection({ postSlug }: CommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{ page: number; totalPages: number } | null>(null);
  const [isPostAuthor, setIsPostAuthor] = useState(false);

  const fetchComments = useCallback(async (page = 1) => {
    setLoading(page === 1);
    setError(null);

    try {
      const response = await fetch(`/api/blog/${postSlug}/comments?page=${page}&limit=20`);
      if (!response.ok) {
        throw new Error("Yorumlar yüklenemedi");
      }

      const data = await response.json();
      
      if (page === 1) {
        setComments(data.comments);
      } else {
        setComments((prev) => [...prev, ...data.comments]);
      }
      
      setPagination({
        page: data.pagination.page,
        totalPages: data.pagination.totalPages,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  }, [postSlug]);

  // Check if current user is the post author
  const checkPostAuthor = useCallback(async () => {
    if (!user) {
      setIsPostAuthor(false);
      return;
    }

    try {
      const response = await fetch(`/api/blog/${postSlug}`);
      if (response.ok) {
        const data = await response.json();
        setIsPostAuthor(data.post.isOwner);
      }
    } catch {
      // Ignore errors
    }
  }, [postSlug, user]);

  useEffect(() => {
    fetchComments();
    checkPostAuthor();
  }, [fetchComments, checkPostAuthor]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/blog/${postSlug}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          body: newComment.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Yorum gönderilemedi");
      }

      const data = await response.json();
      setComments((prev) => [data.comment, ...prev]);
      setNewComment("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim() || !user) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/blog/${postSlug}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          body: replyContent.trim(),
          parentId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Yanıt gönderilemedi");
      }

      const data = await response.json();
      
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === parentId
            ? { ...comment, replies: [...comment.replies, data.comment] }
            : comment
        )
      );
      setReplyContent("");
      setReplyingTo(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("Bu yorumu silmek istediğinizden emin misiniz?")) return;

    try {
      const response = await fetch(`/api/blog/${postSlug}/comments/${commentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Yorum silinemedi");
      }

      // Remove from state (check both top-level and replies)
      setComments((prev) =>
        prev
          .filter((c) => c.id !== commentId)
          .map((c) => ({
            ...c,
            replies: c.replies.filter((r) => r.id !== commentId),
          }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    }
  };

  const handleReply = (commentId: string) => {
    setReplyingTo(commentId);
    setReplyContent("");
  };

  const loadMore = () => {
    if (pagination && pagination.page < pagination.totalPages) {
      fetchComments(pagination.page + 1);
    }
  };

  return (
    <section className="bg-surface-white border-t border-border-subtle py-12">
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-text-charcoal flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">forum</span>
            Yorumlar
            <span className="text-lg font-normal text-text-secondary">({comments.length})</span>
          </h2>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Comment Input */}
        {user ? (
          <form onSubmit={handleSubmitComment} className="mb-8">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-primary/10 flex items-center justify-center">
                {user.user_metadata?.avatar_url ? (
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: `url('${user.user_metadata.avatar_url}')` }}
                  />
                ) : (
                  <span className="text-primary font-semibold">
                    {user.user_metadata?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-grow">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Düşüncelerinizi paylaşın..."
                  rows={3}
                  className="w-full px-4 py-3 border border-border-subtle rounded-xl focus:outline-none focus:border-primary resize-none transition-colors"
                />
                <div className="flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={!newComment.trim() || submitting}
                    className="px-6 py-2.5 bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Gönderiliyor...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px]">send</span>
                        Yorum Yap
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="bg-background-ivory rounded-xl p-6 mb-8 text-center">
            <span className="material-symbols-outlined text-4xl text-text-secondary mb-2">
              chat_bubble
            </span>
            <p className="text-text-secondary mb-4">Yorum yapmak için giriş yapmanız gerekiyor.</p>
            <Link
              href="/hesap"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">login</span>
              Giriş Yap
            </Link>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Comments List */}
        {!loading && (
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id}>
                <SingleComment
                  comment={comment}
                  onReply={handleReply}
                  onDelete={handleDelete}
                  isPostAuthor={isPostAuthor}
                />
                
                {/* Reply Input */}
                {replyingTo === comment.id && user && (
                  <div className="ml-12 mt-4 flex gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-primary/10 flex items-center justify-center">
                      {user.user_metadata?.avatar_url ? (
                        <div
                          className="w-full h-full bg-cover bg-center"
                          style={{ backgroundImage: `url('${user.user_metadata.avatar_url}')` }}
                        />
                      ) : (
                        <span className="text-primary font-semibold text-sm">
                          {user.user_metadata?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-grow">
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Yanıtınızı yazın..."
                        rows={2}
                        autoFocus
                        className="w-full px-4 py-2 border border-border-subtle rounded-xl focus:outline-none focus:border-primary resize-none text-sm transition-colors"
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={() => setReplyingTo(null)}
                          className="px-4 py-1.5 text-text-secondary hover:text-text-charcoal font-medium rounded-lg transition-colors text-sm"
                        >
                          İptal
                        </button>
                        <button
                          onClick={() => handleSubmitReply(comment.id)}
                          disabled={!replyContent.trim() || submitting}
                          className="px-4 py-1.5 bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-white font-medium rounded-lg transition-colors text-sm"
                        >
                          {submitting ? "Gönderiliyor..." : "Yanıtla"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && comments.length === 0 && (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-5xl text-border-subtle mb-4">
              chat
            </span>
            <p className="text-text-secondary">Henüz yorum yok. İlk yorumu siz yapın!</p>
          </div>
        )}

        {/* Load More */}
        {!loading && pagination && pagination.page < pagination.totalPages && (
          <div className="text-center mt-8">
            <button
              onClick={loadMore}
              className="px-6 py-2.5 border border-border-subtle text-text-charcoal hover:border-primary rounded-lg font-medium transition-colors"
            >
              Daha Fazla Yükle
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
