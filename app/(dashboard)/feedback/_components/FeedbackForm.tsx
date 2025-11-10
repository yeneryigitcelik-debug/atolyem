"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/components/ui/ToastProvider";
import { createFeedback } from "../actions";

interface Order {
  id: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  items: Array<{
    variant: {
      product: {
        id: string;
        title: string;
        sellerId: string;
      };
    };
  }>;
}

interface FeedbackFormProps {
  sellerId: string;
  recentOrders: Order[];
}

export default function FeedbackForm({ sellerId, recentOrders }: FeedbackFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    orderId: "",
    rating: 5,
    category: "GENERAL" as const,
    comment: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.comment.trim()) {
      showToast("Lütfen geri bildirim metni girin", "error");
      return;
    }

    startTransition(async () => {
      try {
        const result = await createFeedback({
          sellerId,
          orderId: formData.orderId || undefined,
          rating: formData.rating,
          category: formData.category,
          comment: formData.comment,
        });

        if (result.error) {
          showToast(result.error, "error");
        } else {
          showToast("Geri bildiriminiz başarıyla gönderildi. Admin onayı bekleniyor.", "success");
          setFormData({
            orderId: "",
            rating: 5,
            category: "GENERAL",
            comment: "",
          });
          router.refresh();
        }
      } catch (error: any) {
        showToast(error.message || "Bir hata oluştu", "error");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="orderId" className="block text-sm font-medium text-gray-700 mb-2">
          Sipariş (Opsiyonel)
        </label>
        <select
          id="orderId"
          value={formData.orderId}
          onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#D97706] focus:outline-none focus:ring-2 focus:ring-[#D97706]/20"
        >
          <option value="">Genel geri bildirim</option>
          {recentOrders.map((order) => (
            <option key={order.id} value={order.id}>
              Sipariş #{order.id.substring(0, 8)} - {order.user.name || order.user.email} -{" "}
              {new Date(order.items[0]?.variant.product.title || "").toLocaleDateString("tr-TR")}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
          Kategori
        </label>
        <select
          id="category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#D97706] focus:outline-none focus:ring-2 focus:ring-[#D97706]/20"
          required
        >
          <option value="GENERAL">Genel</option>
          <option value="PRODUCT_QUALITY">Ürün Kalitesi</option>
          <option value="SHIPPING">Kargo</option>
          <option value="COMMUNICATION">İletişim</option>
          <option value="PRICING">Fiyatlandırma</option>
        </select>
      </div>

      <div>
        <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-2">
          Puan: {formData.rating} ⭐
        </label>
        <input
          type="range"
          id="rating"
          min="1"
          max="5"
          value={formData.rating}
          onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>1 ⭐</span>
          <span>5 ⭐</span>
        </div>
      </div>

      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
          Geri Bildirim Metni *
        </label>
        <textarea
          id="comment"
          value={formData.comment}
          onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
          rows={5}
          required
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#D97706] focus:outline-none focus:ring-2 focus:ring-[#D97706]/20"
          placeholder="Geri bildiriminizi detaylı olarak yazın..."
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-[#D97706] px-6 py-3 text-white hover:bg-[#92400E] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? "Gönderiliyor..." : "Geri Bildirim Gönder"}
      </button>
    </form>
  );
}

