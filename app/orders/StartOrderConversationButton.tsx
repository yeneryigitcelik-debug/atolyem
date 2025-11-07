"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface StartOrderConversationButtonProps {
  orderId: string;
  sellerId: string;
}

export default function StartOrderConversationButton({ orderId, sellerId }: StartOrderConversationButtonProps) {
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
          orderId,
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
      className="px-4 py-2 text-sm font-medium rounded-lg text-[#ec6d13] bg-[#ec6d13]/10 dark:bg-[#ec6d13]/20 hover:bg-[#ec6d13]/20 dark:hover:bg-[#ec6d13]/30 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? "Yükleniyor..." : "Satıcıya Soru Sor"}
    </button>
  );
}

