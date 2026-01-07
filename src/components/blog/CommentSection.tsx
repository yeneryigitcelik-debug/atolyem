"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userUsername: string;
  content: string;
  createdAt: string;
  likes: number;
  isLiked: boolean;
  replies: Comment[];
}

interface CommentSectionProps {
  postSlug: string;
  initialComments?: Comment[];
}

// Mock data - replace with actual API calls
const mockComments: Comment[] = [
  {
    id: "1",
    userId: "u1",
    userName: "Elif Yıldız",
    userAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    userUsername: "elif-yildiz",
    content: "Harika bir yazı olmuş! Sinem Demirtaş'ın eserlerini her zaman çok beğeniyorum. Atölyesini görmek ne güzel bir deneyim olmuş.",
    createdAt: "2 saat önce",
    likes: 12,
    isLiked: false,
    replies: [
      {
        id: "1-1",
        userId: "u2",
        userName: "Ahmet Kara",
        userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
        userUsername: "ahmet-kara",
        content: "Kesinlikle katılıyorum! Ben de yakında atölyesini ziyaret etmeyi planlıyorum.",
        createdAt: "1 saat önce",
        likes: 3,
        isLiked: false,
        replies: [],
      },
    ],
  },
  {
    id: "2",
    userId: "u3",
    userName: "Selin Demir",
    userAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop",
    userUsername: "selin-demir",
    content: '"Doğanın düzensizliğindeki mükemmelliği arıyorum" sözü çok etkileyici. Sanatta bu tür bir felsefik yaklaşım her zaman ilham verici oluyor.',
    createdAt: "5 saat önce",
    likes: 8,
    isLiked: true,
    replies: [],
  },
  {
    id: "3",
    userId: "u4",
    userName: "Mert Yılmaz",
    userAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
    userUsername: "mert-yilmaz",
    content: "Bu tarz röportajları çok seviyorum. Sanatçıların düşünce dünyasına açılan bir pencere gibi. Daha fazla içerik bekliyoruz! 🎨",
    createdAt: "1 gün önce",
    likes: 15,
    isLiked: false,
    replies: [],
  },
];

function SingleComment({
  comment,
  isReply = false,
  onReply,
}: {
  comment: Comment;
  isReply?: boolean;
  onReply: (commentId: string) => void;
}) {
  const [liked, setLiked] = useState(comment.isLiked);
  const [likeCount, setLikeCount] = useState(comment.likes);

  const handleLike = () => {
    if (liked) {
      setLikeCount((prev) => prev - 1);
    } else {
      setLikeCount((prev) => prev + 1);
    }
    setLiked(!liked);
  };

  return (
    <div className={`flex gap-3 ${isReply ? "ml-12 mt-4" : ""}`}>
      <Link
        href={`/sanatsever/${comment.userUsername}`}
        className="shrink-0"
      >
        <div className="w-10 h-10 rounded-full overflow-hidden hover:ring-2 hover:ring-primary transition-all">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url('${comment.userAvatar}')` }}
          />
        </div>
      </Link>
      <div className="flex-grow">
        <div className="bg-background-ivory rounded-2xl px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <Link
              href={`/sanatsever/${comment.userUsername}`}
              className="font-semibold text-text-charcoal hover:text-primary transition-colors"
            >
              {comment.userName}
            </Link>
            <span className="text-xs text-text-secondary">{comment.createdAt}</span>
          </div>
          <p className="text-text-secondary">{comment.content}</p>
        </div>
        <div className="flex items-center gap-4 mt-2 ml-2">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 text-sm transition-colors ${
              liked ? "text-red-500" : "text-text-secondary hover:text-red-500"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: liked ? "'FILL' 1" : "'FILL' 0" }}>
              favorite
            </span>
            {likeCount > 0 && <span>{likeCount}</span>}
          </button>
          {!isReply && (
            <button
              onClick={() => onReply(comment.id)}
              className="flex items-center gap-1 text-sm text-text-secondary hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">reply</span>
              Yanıtla
            </button>
          )}
        </div>
        {/* Replies */}
        {comment.replies.length > 0 && (
          <div className="mt-2">
            {comment.replies.map((reply) => (
              <SingleComment
                key={reply.id}
                comment={reply}
                isReply
                onReply={onReply}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CommentSection({ postSlug, initialComments }: CommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>(initialComments || mockComments);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setSubmitting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    const comment: Comment = {
      id: `new-${Date.now()}`,
      userId: user.id,
      userName: user.user_metadata?.full_name || "Kullanıcı",
      userAvatar: user.user_metadata?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
      userUsername: user.email?.split("@")[0] || "user",
      content: newComment,
      createdAt: "Az önce",
      likes: 0,
      isLiked: false,
      replies: [],
    };

    setComments((prev) => [comment, ...prev]);
    setNewComment("");
    setSubmitting(false);
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim() || !user) return;

    setSubmitting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    const reply: Comment = {
      id: `reply-${Date.now()}`,
      userId: user.id,
      userName: user.user_metadata?.full_name || "Kullanıcı",
      userAvatar: user.user_metadata?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
      userUsername: user.email?.split("@")[0] || "user",
      content: replyContent,
      createdAt: "Az önce",
      likes: 0,
      isLiked: false,
      replies: [],
    };

    setComments((prev) =>
      prev.map((comment) =>
        comment.id === parentId
          ? { ...comment, replies: [...comment.replies, reply] }
          : comment
      )
    );
    setReplyContent("");
    setReplyingTo(null);
    setSubmitting(false);
  };

  const handleReply = (commentId: string) => {
    setReplyingTo(commentId);
    setReplyContent("");
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

        {/* Comment Input */}
        {user ? (
          <form onSubmit={handleSubmitComment} className="mb-8">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                <div
                  className="w-full h-full bg-cover bg-center bg-primary/10 flex items-center justify-center"
                  style={
                    user.user_metadata?.avatar_url
                      ? { backgroundImage: `url('${user.user_metadata.avatar_url}')` }
                      : {}
                  }
                >
                  {!user.user_metadata?.avatar_url && (
                    <span className="text-primary font-semibold">
                      {user.user_metadata?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                    </span>
                  )}
                </div>
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

        {/* Comments List */}
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id}>
              <SingleComment comment={comment} onReply={handleReply} />
              
              {/* Reply Input */}
              {replyingTo === comment.id && user && (
                <div className="ml-12 mt-4 flex gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                    <div
                      className="w-full h-full bg-cover bg-center bg-primary/10 flex items-center justify-center"
                      style={
                        user.user_metadata?.avatar_url
                          ? { backgroundImage: `url('${user.user_metadata.avatar_url}')` }
                          : {}
                      }
                    >
                      {!user.user_metadata?.avatar_url && (
                        <span className="text-primary font-semibold text-sm">
                          {user.user_metadata?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                        </span>
                      )}
                    </div>
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
                        Yanıtla
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {comments.length === 0 && (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-5xl text-border-subtle mb-4">
              chat
            </span>
            <p className="text-text-secondary">Henüz yorum yok. İlk yorumu siz yapın!</p>
          </div>
        )}
      </div>
    </section>
  );
}

