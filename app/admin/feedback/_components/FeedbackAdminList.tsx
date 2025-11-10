"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/components/ui/ToastProvider";

interface Feedback {
  id: string;
  rating: number;
  category: string;
  comment: string | null;
  status: string;
  createdAt: string;
  seller: {
    id: string;
    displayName: string;
  };
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  order: {
    id: string;
  } | null;
}

interface FeedbackAdminListProps {
  feedbacks: Feedback[];
}

const categoryLabels: Record<string, string> = {
  GENERAL: "Genel",
  PRODUCT_QUALITY: "Ürün Kalitesi",
  SHIPPING: "Kargo",
  COMMUNICATION: "İletişim",
  PRICING: "Fiyatlandırma",
};

export default function FeedbackAdminList({ feedbacks }: FeedbackAdminListProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, setIsPending] = useState<string | null>(null);

  const handleReview = async (feedbackId: string, action: "approve" | "reject", note?: string) => {
    setIsPending(feedbackId);

    try {
      const response = await fetch(`/api/admin/feedback/${feedbackId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          note: note || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "İşlem başarısız");
      }

      showToast(
        action === "approve" ? "Geri bildirim onaylandı" : "Geri bildirim reddedildi",
        "success"
      );
      router.refresh();
    } catch (error: any) {
      showToast(error.message || "Bir hata oluştu", "error");
    } finally {
      setIsPending(null);
    }
  };

  if (feedbacks.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">check_circle</span>
        <p className="text-gray-500">Onay bekleyen geri bildirim yok</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-[#1F2937]">Onay Bekleyen Geri Bildirimler</h2>
      </div>
      <div className="divide-y divide-gray-200">
        {feedbacks.map((feedback) => (
          <div key={feedback.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={`text-lg ${
                          i < feedback.rating ? "text-yellow-400" : "text-gray-300"
                        }`}
                      >
                        ⭐
                      </span>
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {categoryLabels[feedback.category] || feedback.category}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Satıcı:</strong> {feedback.seller.displayName}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Kullanıcı:</strong> {feedback.user.name || feedback.user.email}
                </p>
                {feedback.order && (
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Sipariş:</strong> #{feedback.order.id.substring(0, 8)}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(feedback.createdAt).toLocaleDateString("tr-TR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>

            {feedback.comment && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-gray-700 whitespace-pre-wrap">{feedback.comment}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => handleReview(feedback.id, "approve")}
                disabled={isPending === feedback.id}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isPending === feedback.id ? "İşleniyor..." : "Onayla"}
              </button>
              <button
                onClick={() => {
                  const note = prompt("Red nedeni (opsiyonel):");
                  if (note !== null) {
                    handleReview(feedback.id, "reject", note);
                  }
                }}
                disabled={isPending === feedback.id}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Reddet
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

