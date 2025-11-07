"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { getCloudflareImageUrl } from "@/lib/cloudflare-images-client";

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  body: string | null;
  imageId: string | null;
  createdAt: string;
}

interface MessageListProps {
  conversationId: string;
}

export default function MessageList({ conversationId }: MessageListProps) {
  const { data: session } = useSession();
  const currentUserId = (session?.user as any)?.id;
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const fetchMessages = async (cursor?: string) => {
    try {
      const url = cursor
        ? `/api/conversations/${conversationId}/messages?cursor=${cursor}&take=30`
        : `/api/conversations/${conversationId}/messages?take=30`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.ok) {
        if (cursor) {
          setMessages((prev) => [...prev, ...data.items]);
        } else {
          setMessages(data.items);
        }
        setNextCursor(data.nextCursor);
      }
    } catch (error) {
      console.error("Fetch messages error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (conversationId) {
      setLoading(true);
      setMessages([]);
      setNextCursor(null);
      fetchMessages();
      // 30 saniyede bir polling
      const interval = setInterval(() => fetchMessages(), 30000);
      return () => clearInterval(interval);
    }
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadMore = () => {
    if (nextCursor) {
      fetchMessages(nextCursor);
    }
  };

  if (loading && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
      {nextCursor && (
        <div className="text-center">
          <button
            onClick={loadMore}
            className="text-sm text-[#D97706] hover:underline"
          >
            Daha fazla mesaj yükle
          </button>
        </div>
      )}
      {messages.map((message) => {
        const isOwn = message.senderId === currentUserId;
        return (
          <div
            key={message.id}
            className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                isOwn
                  ? "bg-[#D97706] text-white"
                  : "bg-white text-[#1F2937] border border-gray-200"
              }`}
            >
              {message.body && <p className="text-sm whitespace-pre-wrap">{message.body}</p>}
              {message.imageId && (
                <div className="mt-2">
                  <Image
                    src={getCloudflareImageUrl(message.imageId, "public")}
                    alt="Mesaj görseli"
                    width={400}
                    height={400}
                    className="rounded-lg max-w-full h-auto"
                    unoptimized
                  />
                </div>
              )}
              <p
                className={`text-xs mt-1 ${
                  isOwn ? "text-white/70" : "text-gray-500"
                }`}
              >
                {new Date(message.createdAt).toLocaleTimeString("tr-TR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}

