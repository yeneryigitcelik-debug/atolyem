"use client";

import { useState } from "react";
import Link from "next/link";
import MessageComposer from "./MessageComposer";
import MessageList from "../../../messages/MessageList";

interface Conversation {
  id: string;
  productId: string | null;
  orderId: string | null;
  createdAt: string;
  updatedAt: string;
  otherParticipant: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    role: string;
  } | null;
  product: {
    id: string;
    title: string;
    slug: string;
    images: Array<{ url: string }>;
  } | null;
  lastMessage: {
    id: string;
    body: string | null;
    imageId: string | null;
    senderId: string;
    createdAt: string;
  } | null;
  unreadCount?: number;
}

interface InboxListProps {
  conversations: Conversation[];
  currentUserId: string;
}

export default function InboxList({ conversations, currentUserId }: InboxListProps) {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(
    conversations.length > 0 ? conversations[0].id : null
  );

  const selectedConversation = conversations.find((c) => c.id === selectedConversationId);

  return (
    <div className="flex gap-6 h-[calc(100vh-300px)] min-h-[600px]">
      {/* Konuşma Listesi */}
      <div className="w-80 flex-shrink-0 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-[#1F2937]">Gelen Mesajlar</h2>
          <p className="text-sm text-gray-500 mt-1">{conversations.length} konuşma</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center">
              <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">inbox</span>
              <p className="text-gray-500 text-sm">Gelen kutunuz boş</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {conversations.map((convo) => {
                const other = convo.otherParticipant;
                const isSelected = convo.id === selectedConversationId;
                const isUnread = (convo.unreadCount || 0) > 0;
                const productImage = convo.product?.images?.[0]?.url || "https://via.placeholder.com/200x200?text=Görsel+Yok";

                return (
                  <button
                    key={convo.id}
                    onClick={() => setSelectedConversationId(convo.id)}
                    className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                      isSelected ? "bg-[#D97706]/10 border-l-4 border-[#D97706]" : ""
                    } ${isUnread ? "bg-blue-50" : ""}`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-12 h-12 rounded-full bg-cover bg-center flex-shrink-0"
                        style={{
                          backgroundImage: other?.image
                            ? `url("${other.image}")`
                            : `url("https://lh3.googleusercontent.com/aida-public/AB6AXuDDoFd-5Lopq13T-VJrLgwgSt7uH3WDYxeEUTgjk2BUXy1HdMKoQ7Aftco9cHpc54mE-kkrDTu7DAjHnYauF54_iNFcTp9woSfkGwN0Dc9TRU_xslY2zqg2Vmm4qVCMnBnCKi1vu0bRR9aUoVF4mvYVeTdxifsNl49PQTKOhWb4fJJkjqZlXeWZSdinHELFarnoPT3p_jgD0JzCHE-SNsUl2cE9DP59vnhW2zncJ2ygxHzkjImID2c0-caDfiSMSn8H7rycDNSHCn0w")`,
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className={`font-medium truncate ${isUnread ? "font-bold" : ""}`}>
                            {other?.name || "Kullanıcı"}
                          </p>
                          {convo.lastMessage && (
                            <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                              {new Date(convo.lastMessage.createdAt).toLocaleTimeString("tr-TR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          )}
                        </div>
                        {convo.product && (
                          <p className="text-xs text-gray-500 truncate mb-1">{convo.product.title}</p>
                        )}
                        {convo.lastMessage && (
                          <div className="flex items-center justify-between">
                            <p className={`text-sm truncate ${isUnread ? "font-semibold text-[#1F2937]" : "text-gray-600"}`}>
                              {convo.lastMessage.body || "📷 Görsel"}
                            </p>
                            {isUnread && (
                              <span className="ml-2 flex-shrink-0 w-5 h-5 bg-[#D97706] text-white text-xs rounded-full flex items-center justify-center">
                                {convo.unreadCount}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Mesajlaşma Ekranı */}
      <div className="flex-1 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedConversation.otherParticipant && (
                  <>
                    <div
                      className="w-10 h-10 rounded-full bg-cover bg-center"
                      style={{
                        backgroundImage: selectedConversation.otherParticipant.image
                          ? `url("${selectedConversation.otherParticipant.image}")`
                          : `url("https://lh3.googleusercontent.com/aida-public/AB6AXuDDoFd-5Lopq13T-VJrLgwgSt7uH3WDYxeEUTgjk2BUXy1HdMKoQ7Aftco9cHpc54mE-kkrDTu7DAjHnYauF54_iNFcTp9woSfkGwN0Dc9TRU_xslY2zqg2Vmm4qVCMnBnCKi1vu0bRR9aUoVF4mvYVeTdxifsNl49PQTKOhWb4fJJkjqZlXeWZSdinHELFarnoPT3p_jgD0JzCHE-SNsUl2cE9DP59vnhW2zncJ2ygxHzkjImID2c0-caDfiSMSn8H7rycDNSHCn0w")`,
                      }}
                    />
                    <div>
                      <p className="font-semibold text-[#1F2937]">
                        {selectedConversation.otherParticipant.name}
                      </p>
                      {selectedConversation.product && (
                        <Link
                          href={`/products/${selectedConversation.product.slug}`}
                          className="text-xs text-[#D97706] hover:underline"
                        >
                          {selectedConversation.product.title}
                        </Link>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Mesaj Listesi */}
            <MessageList conversationId={selectedConversation.id} />

            {/* Mesaj Gönderme */}
            <MessageComposer
              conversationId={selectedConversation.id}
              onMessageSent={() => {
                // Refresh logic can be added here
              }}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <span className="material-symbols-outlined text-6xl text-gray-400 mb-4">inbox</span>
              <p className="text-gray-600">Bir konuşma seçin</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

