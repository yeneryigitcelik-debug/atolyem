"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ChatComposer from "./ChatComposer";
import MessageList from "./MessageList";

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
}

export default function MessagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      fetchConversations();
      // 30 saniyede bir polling
      const interval = setInterval(fetchConversations, 30000);
      
      // URL'den conversation parametresini kontrol et
      const urlParams = new URLSearchParams(window.location.search);
      const conversationParam = urlParams.get("conversation");
      if (conversationParam) {
        setSelectedConversationId(conversationParam);
      }
      
      return () => clearInterval(interval);
    }
  }, [status, router]);

  const fetchConversations = async () => {
    try {
      const response = await fetch("/api/conversations/me");
      const data = await response.json();
      if (data.ok) {
        setConversations(data.items);
        // İlk konuşmayı seç
        if (data.items.length > 0 && !selectedConversationId) {
          setSelectedConversationId(data.items[0].id);
        }
      }
    } catch (error) {
      console.error("Fetch conversations error:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectedConversation = conversations.find((c) => c.id === selectedConversationId);
  const [messageSentTrigger, setMessageSentTrigger] = useState(0);

  if (status === "loading" || loading) {
    return (
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden" style={{ backgroundColor: "#FFF8F1" }}>
        <div className="layout-container flex h-full grow flex-col">
          <div className="flex flex-1 justify-center px-4 sm:px-8 md:px-12 lg:px-20 xl:px-40 py-5">
            <div className="layout-content-container flex w-full max-w-[1280px] flex-1 flex-col">
              <main className="flex-1 my-8">
                <div className="text-center py-12">
                  <p className="text-gray-600">Yükleniyor...</p>
                </div>
              </main>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden" style={{ backgroundColor: "#FFF8F1" }}>
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center px-4 sm:px-8 md:px-12 lg:px-20 xl:px-40 py-5">
          <div className="layout-content-container flex w-full max-w-[1280px] flex-1 flex-col">
            <main className="flex-1 my-8">
              <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-[#1F2937] mb-6">Mesajlarım</h1>

                <div className="flex gap-6 h-[calc(100vh-300px)] min-h-[600px]">
                  {/* Konuşma Listesi */}
                  <div className="w-80 flex-shrink-0 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-gray-200">
                      <h2 className="font-semibold text-[#1F2937]">Konuşmalar</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      {conversations.length === 0 ? (
                        <div className="p-8 text-center">
                          <p className="text-gray-500 text-sm">Henüz konuşmanız yok</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-100">
                          {conversations.map((convo) => {
                            const other = convo.otherParticipant;
                            const isSelected = convo.id === selectedConversationId;
                            const productImage = convo.product?.images?.[0]?.url || "https://via.placeholder.com/200x200?text=Görsel+Yok";

                            return (
                              <button
                                key={convo.id}
                                onClick={() => setSelectedConversationId(convo.id)}
                                className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                                  isSelected ? "bg-[#D97706]/10 border-l-4 border-[#D97706]" : ""
                                }`}
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
                                      <p className="font-medium text-[#1F2937] truncate">
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
                                      <p className="text-sm text-gray-600 truncate">
                                        {convo.lastMessage.body || "📷 Görsel"}
                                      </p>
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
                        <div className="p-4 border-b border-gray-200 flex items-center gap-3">
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
                                  <p className="text-xs text-gray-500">{selectedConversation.product.title}</p>
                                )}
                              </div>
                            </>
                          )}
                        </div>

                        {/* Mesaj Listesi */}
                        <MessageList 
                          conversationId={selectedConversation.id} 
                          onMessageSent={messageSentTrigger}
                        />

                        {/* Mesaj Gönderme */}
                        <ChatComposer
                          conversationId={selectedConversation.id}
                          onMessageSent={() => {
                            fetchConversations();
                            setMessageSentTrigger(prev => prev + 1);
                          }}
                        />
                      </>
                    ) : (
                      <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                          <span className="material-symbols-outlined text-6xl text-gray-400 mb-4">chat_bubble_outline</span>
                          <p className="text-gray-600">Bir konuşma seçin</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
