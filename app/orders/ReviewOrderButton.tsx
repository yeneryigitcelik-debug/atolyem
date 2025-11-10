"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface ReviewOrderButtonProps {
  orderId: string;
  sellerId: string;
  sellerName: string;
}

export default function ReviewOrderButton({ orderId, sellerId, sellerName }: ReviewOrderButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  if (!session?.user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/reviews/sellers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sellerId,
          orderId,
          rating,
          comment: comment.trim() || null,
        }),
      });

      if (res.ok) {
        setShowForm(false);
        setRating(0);
        setComment("");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Yorum eklenirken bir hata oluştu");
      }
    } catch (error) {
      console.error("Submit seller review error:", error);
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setSubmitting(false);
    }
  };

  if (showForm) {
    return (
      <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-900">Satıcıyı Değerlendir: {sellerName}</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="mb-2 block text-xs font-medium text-gray-700">Puan</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-lg transition-colors ${
                    star <= rating ? "text-yellow-400" : "text-gray-300 hover:text-yellow-300"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <div className="mb-3">
            <label className="mb-2 block text-xs font-medium text-gray-700">Yorum</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
              placeholder="Yorumunuzu yazın (opsiyonel)"
            />
          </div>
          {error && (
            <div className="mb-3 rounded-md bg-red-50 border border-red-200 p-2">
              <p className="text-xs text-red-800">{error}</p>
            </div>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting || rating === 0}
              className="rounded-md bg-[#D97706] px-3 py-1 text-xs font-medium text-white hover:bg-[#92400E] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
              className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              İptal
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowForm(true)}
      className="px-4 py-2 text-sm font-medium rounded-lg text-white bg-[#ec6d13] hover:bg-opacity-90"
    >
      Satıcıyı Değerlendir
    </button>
  );
}

