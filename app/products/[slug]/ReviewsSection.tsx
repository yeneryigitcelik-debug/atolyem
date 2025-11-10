"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

interface ReviewsSectionProps {
  productId: string;
  productTitle: string;
}

export default function ReviewsSection({ productId, productTitle }: ReviewsSectionProps) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const loadReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?productId=${productId}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews);
        setAverageRating(data.averageRating);
        setTotalCount(data.totalCount);
      }
    } catch (error) {
      console.error("Load reviews error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user || rating === 0) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          rating,
          comment: comment.trim() || null,
        }),
      });

      if (res.ok) {
        setShowForm(false);
        setRating(0);
        setComment("");
        loadReviews();
      } else {
        const data = await res.json();
        setError(data.error || "Yorum eklenirken bir hata oluştu");
      }
    } catch (error) {
      console.error("Submit review error:", error);
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mt-8">
        <div className="text-center text-gray-600">Yorumlar yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1F2937]">Yorumlar</h2>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`text-xl ${star <= Math.round(averageRating) ? "text-yellow-400" : "text-gray-300"}`}
                >
                  ★
                </span>
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {averageRating > 0 ? averageRating.toFixed(1) : "Henüz yok"} ({totalCount} yorum)
            </span>
          </div>
        </div>
        {session?.user && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="rounded-md bg-[#D97706] px-4 py-2 text-sm font-medium text-white hover:bg-[#92400E] transition-colors"
          >
            Yorum Yap
          </button>
        )}
      </div>

      {/* Review Form */}
      {showForm && session?.user && (
        <form onSubmit={handleSubmit} className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-[#1F2937]">Puan</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-2xl transition-colors ${
                    star <= rating ? "text-yellow-400" : "text-gray-300 hover:text-yellow-300"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-[#1F2937]">Yorum</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="Yorumunuzu yazın (opsiyonel)"
            />
          </div>
          {error && (
            <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-2">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting || rating === 0}
              className="rounded-md bg-[#D97706] px-4 py-2 text-sm font-medium text-white hover:bg-[#92400E] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? "Gönderiliyor..." : "Gönder"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setRating(0);
                setComment("");
                setError(null);
              }}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              İptal
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <p className="text-gray-600">Henüz yorum yapılmamış.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`text-sm ${star <= review.rating ? "text-yellow-400" : "text-gray-300"}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {review.user.name || review.user.email.split("@")[0]}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString("tr-TR")}
                </span>
              </div>
              {review.comment && <p className="text-sm text-gray-700">{review.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

