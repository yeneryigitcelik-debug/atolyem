"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface StartConversationButtonProps {
  productId: string;
  sellerId: string;
}

export default function StartConversationButton({ productId, sellerId }: StartConversationButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartConversation = async () => {
    if (!session?.user) {
      router.push("/login");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          sellerId,
        }),
      });

      const data = await response.json();
      if (response.ok && data.conversationId) {
        router.push(`/messages?conversation=${data.conversationId}`);
      } else {
        setError(data.error || "Konuşma başlatılamadı. Lütfen tekrar deneyin.");
      }
    } catch (error) {
      console.error("Start conversation error:", error);
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleStartConversation}
        disabled={loading}
        className="w-full rounded-md border border-[#D97706] px-4 py-2 text-sm font-medium text-[#D97706] hover:bg-[#D97706]/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Satıcıya soru sormak için konuşma başlat"
      >
        {loading ? "Yükleniyor..." : "Satıcıya Sor"}
      </button>
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-2">
          <p className="text-xs text-red-800">{error}</p>
        </div>
      )}
    </div>
  );
}

