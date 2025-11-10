"use client";

import { useState, useRef } from "react";

interface MessageComposerProps {
  conversationId: string;
  onMessageSent: () => void;
}

export default function MessageComposer({ conversationId, onMessageSent }: MessageComposerProps) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sendMessage = async (body?: string, imageId?: string) => {
    if (!body && !imageId) return;

    setSending(true);
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          body: body || null,
          imageId: imageId || null,
        }),
      });

      const data = await response.json();
      if (data.ok) {
        setMessage("");
        onMessageSent();
      } else {
        alert(data.error || "Mesaj gönderilemedi");
      }
    } catch (error) {
      console.error("Send message error:", error);
      alert("Mesaj gönderilirken bir hata oluştu");
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage(message.trim());
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Sadece görsel dosyaları yüklenebilir");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Dosya boyutu 10MB'dan küçük olmalıdır");
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Görsel yüklenemedi");
      }

      const uploadData = await uploadResponse.json();
      await sendMessage(undefined, uploadData.imageId);
    } catch (error) {
      console.error("Image upload error:", error);
      alert("Görsel yüklenirken bir hata oluştu");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="p-4 border-t border-gray-200 bg-white">
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={sending || uploadingImage}
          className="flex-shrink-0 p-2 text-gray-500 hover:text-[#D97706] transition-colors disabled:opacity-50"
          title="Görsel ekle"
        >
          <span className="material-symbols-outlined">image</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          placeholder="Mesaj yazın..."
          rows={1}
          className="flex-1 resize-none rounded-lg border border-gray-300 px-4 py-2 focus:border-[#D97706] focus:outline-none focus:ring-2 focus:ring-[#D97706]/20"
          disabled={sending || uploadingImage}
        />
        <button
          type="submit"
          disabled={(!message.trim() && !uploadingImage) || sending || uploadingImage}
          className="flex-shrink-0 px-6 py-2 bg-[#D97706] text-white rounded-lg hover:bg-[#92400E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {uploadingImage ? "Yükleniyor..." : sending ? "Gönderiliyor..." : "Gönder"}
        </button>
      </form>
    </div>
  );
}

