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

  const handleStartConversation = async () => {
    if (!session?.user) {
      router.push("/login");
      return;
    }

    setLoading(true);
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
      if (data.ok) {
        router.push(`/messages?conversation=${data.conversationId}`);
      } else {
        alert(data.error || "Konuşma başlatılamadı");
      }
    } catch (error) {
      console.error("Start conversation error:", error);
      alert("Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleStartConversation}
      disabled={loading}
      className="mt-4 w-full rounded-md border border-[#D97706] px-4 py-2 text-sm font-medium text-[#D97706] hover:bg-[#D97706]/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? "Yükleniyor..." : "Satıcıya Sor"}
    </button>
  );
}

