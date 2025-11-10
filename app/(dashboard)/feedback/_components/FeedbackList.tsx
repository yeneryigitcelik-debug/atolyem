"use client";

interface Feedback {
  id: string;
  rating: number;
  category: string;
  comment: string | null;
  status: string;
  adminNote: string | null;
  createdAt: string;
  reviewedAt: string | null;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  order: {
    id: string;
  } | null;
}

interface FeedbackListProps {
  feedbacks: Feedback[];
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};

const statusLabels: Record<string, string> = {
  PENDING: "Beklemede",
  APPROVED: "Onaylandı",
  REJECTED: "Reddedildi",
};

const categoryLabels: Record<string, string> = {
  GENERAL: "Genel",
  PRODUCT_QUALITY: "Ürün Kalitesi",
  SHIPPING: "Kargo",
  COMMUNICATION: "İletişim",
  PRICING: "Fiyatlandırma",
};

export default function FeedbackList({ feedbacks }: FeedbackListProps) {
  if (feedbacks.length === 0) {
    return (
      <div className="text-center py-12">
        <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">feedback</span>
        <p className="text-gray-500">Henüz geri bildiriminiz yok</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {feedbacks.map((feedback) => (
        <div
          key={feedback.id}
          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-3">
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
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    statusColors[feedback.status] || statusColors.PENDING
                  }`}
                >
                  {statusLabels[feedback.status] || feedback.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">
                {feedback.user.name || feedback.user.email}
                {feedback.order && ` • Sipariş #${feedback.order.id.substring(0, 8)}`}
              </p>
            </div>
            <span className="text-xs text-gray-500">
              {new Date(feedback.createdAt).toLocaleDateString("tr-TR")}
            </span>
          </div>

          {feedback.comment && (
            <p className="text-gray-700 mb-3 bg-gray-50 rounded p-3">{feedback.comment}</p>
          )}

          {feedback.adminNote && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs font-medium text-gray-600 mb-1">Admin Notu:</p>
              <p className="text-sm text-gray-700">{feedback.adminNote}</p>
              {feedback.reviewedAt && (
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(feedback.reviewedAt).toLocaleDateString("tr-TR")}
                </p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

