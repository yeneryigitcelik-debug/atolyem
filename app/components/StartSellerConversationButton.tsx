"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface StartSellerConversationButtonProps {
  sellerId: string;
  productId?: string;
  className?: string;
  variant?: "default" | "outline";
}

export default function StartSellerConversationButton({
  sellerId,
  productId,
  className = "",
  variant = "default",
}: StartSellerConversationButtonProps) {
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
          sellerId,
          productId: productId || undefined,
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

  const baseClasses =
    variant === "outline"
      ? "inline-flex items-center justify-center rounded-lg border border-[#D97706] px-6 py-2.5 text-sm font-bold text-[#D97706] shadow-sm transition-colors hover:bg-[#D97706]/10 disabled:opacity-50 disabled:cursor-not-allowed"
      : "inline-flex items-center justify-center rounded-lg bg-[#D97706] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#92400E] disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleStartConversation}
        disabled={loading}
        className={`${baseClasses} ${className}`}
        aria-label="Satıcıya mesaj gönder"
      >
        {loading ? (
          <>
            <span className="material-symbols-outlined mr-2 animate-spin">sync</span>
            Yükleniyor...
          </>
        ) : (
          <>
            <span className="material-symbols-outlined mr-2">chat_bubble_outline</span>
            Mesaj Gönder
          </>
        )}
      </button>
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-2">
          <p className="text-xs text-red-800">{error}</p>
        </div>
      )}
    </div>
  );
}

