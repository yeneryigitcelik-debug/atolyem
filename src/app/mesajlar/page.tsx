"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import PageHeader from "@/components/ui/PageHeader";
import Link from "next/link";

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  isRead: boolean;
}

interface Conversation {
  id: string;
  participant: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    isOnline: boolean;
    isArtist: boolean;
  };
  lastMessage: {
    content: string;
    createdAt: string;
    isRead: boolean;
    senderId: string;
  };
  unreadCount: number;
}

// Mock data
const mockConversations: Conversation[] = [
  {
    id: "1",
    participant: {
      id: "u1",
      name: "Sinem Demirtaş",
      username: "sinem-demirtas",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      isOnline: true,
      isArtist: true,
    },
    lastMessage: {
      content: "Merhaba! Siparişiniz hazırlandı, yarın kargoya verilecek.",
      createdAt: "10:30",
      isRead: false,
      senderId: "u1",
    },
    unreadCount: 2,
  },
  {
    id: "2",
    participant: {
      id: "u2",
      name: "Mehmet Demir",
      username: "mehmet-demir",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      isOnline: false,
      isArtist: true,
    },
    lastMessage: {
      content: "Özel tasarım için teşekkür ederim, çok güzel olmuş!",
      createdAt: "Dün",
      isRead: true,
      senderId: "me",
    },
    unreadCount: 0,
  },
  {
    id: "3",
    participant: {
      id: "u3",
      name: "Elif Yıldız",
      username: "elif-yildiz",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
      isOnline: true,
      isArtist: false,
    },
    lastMessage: {
      content: "O sanatçının atölyesini ziyaret ettin mi? Nasıldı?",
      createdAt: "2 gün önce",
      isRead: true,
      senderId: "u3",
    },
    unreadCount: 0,
  },
];

const mockMessages: Record<string, Message[]> = {
  "1": [
    { id: "m1", content: "Merhaba, siparişim ne zaman hazırlanır?", senderId: "me", createdAt: "09:15", isRead: true },
    { id: "m2", content: "Merhaba! Siparişiniz üzerinde çalışıyorum.", senderId: "u1", createdAt: "09:45", isRead: true },
    { id: "m3", content: "Yaklaşık 2-3 gün içinde hazır olur.", senderId: "u1", createdAt: "09:46", isRead: true },
    { id: "m4", content: "Harika, teşekkür ederim!", senderId: "me", createdAt: "10:00", isRead: true },
    { id: "m5", content: "Rica ederim! Size en güzel şekilde ulaştıracağım.", senderId: "u1", createdAt: "10:15", isRead: true },
    { id: "m6", content: "Merhaba! Siparişiniz hazırlandı, yarın kargoya verilecek.", senderId: "u1", createdAt: "10:30", isRead: false },
  ],
  "2": [
    { id: "m1", content: "Merhaba, özel bir seramik vazo yaptırabilir miyim?", senderId: "me", createdAt: "Pazartesi", isRead: true },
    { id: "m2", content: "Tabii ki! Nasıl bir tasarım düşünüyorsunuz?", senderId: "u2", createdAt: "Pazartesi", isRead: true },
    { id: "m3", content: "Mavi tonlarında, geometrik desenli olsun istiyorum.", senderId: "me", createdAt: "Salı", isRead: true },
    { id: "m4", content: "Anladım, size birkaç eskiz hazırlayayım.", senderId: "u2", createdAt: "Salı", isRead: true },
    { id: "m5", content: "Özel tasarım için teşekkür ederim, çok güzel olmuş!", senderId: "me", createdAt: "Dün", isRead: true },
  ],
  "3": [
    { id: "m1", content: "Selam! Geçen paylaştığın blog yazısı çok güzeldi.", senderId: "u3", createdAt: "3 gün önce", isRead: true },
    { id: "m2", content: "Teşekkür ederim! Sinem Demirtaş'ın atölyesini yazdım.", senderId: "me", createdAt: "3 gün önce", isRead: true },
    { id: "m3", content: "O sanatçının atölyesini ziyaret ettin mi? Nasıldı?", senderId: "u3", createdAt: "2 gün önce", isRead: true },
  ],
};

export default function MesajlarPage() {
  const { user, isLoading } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<string | null>("1");
  const [newMessage, setNewMessage] = useState("");
  const [conversations] = useState<Conversation[]>(mockConversations);
  const [messages, setMessages] = useState<Record<string, Message[]>>(mockMessages);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const newMsg: Message = {
      id: `new-${Date.now()}`,
      content: newMessage,
      senderId: "me",
      createdAt: "Az önce",
      isRead: false,
    };

    setMessages((prev) => ({
      ...prev,
      [selectedConversation]: [...(prev[selectedConversation] || []), newMsg],
    }));
    setNewMessage("");
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.participant.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConv = conversations.find((c) => c.id === selectedConversation);
  const currentMessages = selectedConversation ? messages[selectedConversation] || [] : [];

  // Show login prompt if not authenticated
  if (!isLoading && !user) {
    return (
      <>
        <PageHeader title="Mesajlarım" />
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-primary text-4xl">mail</span>
            </div>
            <h2 className="text-xl font-bold text-text-charcoal mb-2">Giriş Yapın</h2>
            <p className="text-text-secondary mb-8 max-w-md mx-auto">
              Mesajlarınızı görmek için hesabınıza giriş yapmanız gerekmektedir.
            </p>
            <Link
              href="/hesap"
              className="inline-flex items-center justify-center px-8 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-md transition-colors"
            >
              Giriş Yap
            </Link>
          </div>
        </div>
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <PageHeader title="Mesajlarım" />
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-16">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="text-text-secondary mt-4">Yükleniyor...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Mesajlarım" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-surface-white rounded-xl border border-border-subtle overflow-hidden" style={{ height: "calc(100vh - 280px)", minHeight: "500px" }}>
          <div className="flex h-full">
            {/* Conversations List */}
            <div className={`w-full md:w-80 lg:w-96 border-r border-border-subtle flex flex-col ${mobileShowChat ? "hidden md:flex" : "flex"}`}>
              {/* Search */}
              <div className="p-4 border-b border-border-subtle">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-secondary text-[20px]">
                    search
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Konuşma ara..."
                    className="w-full pl-10 pr-4 py-2.5 border border-border-subtle rounded-lg focus:outline-none focus:border-primary text-sm"
                  />
                </div>
              </div>

              {/* Conversations */}
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.length > 0 ? (
                  filteredConversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => {
                        setSelectedConversation(conv.id);
                        setMobileShowChat(true);
                      }}
                      className={`w-full p-4 flex items-start gap-3 hover:bg-background-ivory transition-colors text-left ${
                        selectedConversation === conv.id ? "bg-primary/5 border-l-2 border-primary" : ""
                      }`}
                    >
                      <div className="relative shrink-0">
                        <div className="w-12 h-12 rounded-full overflow-hidden">
                          <div
                            className="w-full h-full bg-cover bg-center"
                            style={{ backgroundImage: `url('${conv.participant.avatar}')` }}
                          />
                        </div>
                        {conv.participant.isOnline && (
                          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-surface-white" />
                        )}
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="font-semibold text-text-charcoal truncate">{conv.participant.name}</span>
                            {conv.participant.isArtist && (
                              <span className="material-symbols-outlined text-primary text-[14px]" title="Sanatçı">
                                palette
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-text-secondary shrink-0">{conv.lastMessage.createdAt}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2 mt-1">
                          <p className={`text-sm truncate ${conv.unreadCount > 0 ? "text-text-charcoal font-medium" : "text-text-secondary"}`}>
                            {conv.lastMessage.senderId === "me" && (
                              <span className="text-text-secondary">Siz: </span>
                            )}
                            {conv.lastMessage.content}
                          </p>
                          {conv.unreadCount > 0 && (
                            <span className="shrink-0 w-5 h-5 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <span className="material-symbols-outlined text-4xl text-border-subtle mb-2">search_off</span>
                    <p className="text-text-secondary text-sm">Konuşma bulunamadı</p>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col ${!mobileShowChat ? "hidden md:flex" : "flex"}`}>
              {selectedConv ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-border-subtle flex items-center gap-3">
                    <button
                      onClick={() => setMobileShowChat(false)}
                      className="md:hidden p-1 -ml-1 text-text-secondary hover:text-text-charcoal"
                    >
                      <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <Link
                      href={selectedConv.participant.isArtist ? `/sanatci/${selectedConv.participant.username}` : `/sanatsever/${selectedConv.participant.username}`}
                      className="flex items-center gap-3 flex-grow hover:opacity-80 transition-opacity"
                    >
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full overflow-hidden">
                          <div
                            className="w-full h-full bg-cover bg-center"
                            style={{ backgroundImage: `url('${selectedConv.participant.avatar}')` }}
                          />
                        </div>
                        {selectedConv.participant.isOnline && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-surface-white" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-text-charcoal">{selectedConv.participant.name}</span>
                          {selectedConv.participant.isArtist && (
                            <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] font-medium rounded">Sanatçı</span>
                          )}
                        </div>
                        <p className="text-xs text-text-secondary">
                          {selectedConv.participant.isOnline ? "Çevrimiçi" : "Çevrimdışı"}
                        </p>
                      </div>
                    </Link>
                    <button className="p-2 text-text-secondary hover:text-text-charcoal hover:bg-background-ivory rounded-lg transition-colors">
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {currentMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderId === "me" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${
                            message.senderId === "me"
                              ? "bg-primary text-white rounded-br-md"
                              : "bg-background-ivory text-text-charcoal rounded-bl-md"
                          }`}
                        >
                          <p>{message.content}</p>
                          <p
                            className={`text-[10px] mt-1 ${
                              message.senderId === "me" ? "text-white/70" : "text-text-secondary"
                            }`}
                          >
                            {message.createdAt}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-border-subtle">
                    <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                      <button
                        type="button"
                        className="p-2 text-text-secondary hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                      >
                        <span className="material-symbols-outlined">attach_file</span>
                      </button>
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Mesajınızı yazın..."
                        className="flex-1 px-4 py-2.5 border border-border-subtle rounded-full focus:outline-none focus:border-primary"
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="p-2.5 bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-white rounded-full transition-colors"
                      >
                        <span className="material-symbols-outlined">send</span>
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <span className="material-symbols-outlined text-6xl text-border-subtle mb-4">chat</span>
                    <p className="text-text-secondary">Bir konuşma seçin</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

