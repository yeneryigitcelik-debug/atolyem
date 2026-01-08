"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { ConversationListSkeleton, MessageSkeleton } from "@/components/ui/Skeleton";
import Link from "next/link";
import Image from "next/image";

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  isRead: boolean;
  sender: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
  };
}

interface Conversation {
  id: string;
  participant: {
    id: string;
    name: string;
    username?: string;
    avatar: string | null;
    isArtist: boolean;
  };
  lastMessage: Message | null;
  updatedAt: string;
  unreadCount?: number;
}

export default function MesajlarPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    if (!user) return;
    
    setLoadingConversations(true);
    try {
      const res = await fetch("/api/messages");
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch (err) {
      console.error("Error fetching conversations:", err);
    } finally {
      setLoadingConversations(false);
    }
  }, [user]);

  // Fetch messages for selected conversation
  const fetchMessages = useCallback(async (conversationId: string) => {
    if (!user) return;
    
    setLoadingMessages(true);
    try {
      const res = await fetch(`/api/messages/${conversationId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      setLoadingMessages(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchConversations();
    } else if (!authLoading) {
      setLoadingConversations(false);
    }
  }, [user, authLoading, fetchConversations]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
    }
  }, [selectedConversation, fetchMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || sendingMessage) return;

    setSendingMessage(true);
    const messageContent = newMessage;
    setNewMessage("");

    try {
      const res = await fetch(`/api/messages/${selectedConversation}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: messageContent }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, data.message]);
        // Refresh conversations to update last message
        fetchConversations();
      } else {
        setNewMessage(messageContent); // Restore message if failed
      }
    } catch (err) {
      console.error("Error sending message:", err);
      setNewMessage(messageContent);
    } finally {
      setSendingMessage(false);
    }
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.participant.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConv = conversations.find((c) => c.id === selectedConversation);

  // Format date for display
  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
    } else if (diffDays === 1) {
      return "Dün";
    } else if (diffDays < 7) {
      return date.toLocaleDateString("tr-TR", { weekday: "long" });
    } else {
      return date.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
    }
  };

  // Show login prompt if not authenticated
  if (!authLoading && !user) {
    return (
      <>
        <PageHeader title="Mesajlarım" />
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <EmptyState
            icon="mail"
            title="Giriş Yapın"
            description="Mesajlarınızı görmek için hesabınıza giriş yapmanız gerekmektedir."
            actionLabel="Giriş Yap"
            actionHref="/hesap"
          />
        </div>
      </>
    );
  }

  if (authLoading) {
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
                {loadingConversations ? (
                  <ConversationListSkeleton count={5} />
                ) : filteredConversations.length > 0 ? (
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
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                          {conv.participant.avatar ? (
                            <Image
                              src={conv.participant.avatar}
                              alt={conv.participant.name}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary/10">
                              <span className="text-primary font-bold">
                                {conv.participant.name[0]?.toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
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
                          {conv.lastMessage && (
                            <span className="text-xs text-text-secondary shrink-0">
                              {formatMessageTime(conv.lastMessage.createdAt)}
                            </span>
                          )}
                        </div>
                        {conv.lastMessage && (
                          <p className="text-sm text-text-secondary truncate mt-1">
                            {conv.lastMessage.senderId === user?.id && (
                              <span className="text-text-secondary">Siz: </span>
                            )}
                            {conv.lastMessage.content}
                          </p>
                        )}
                      </div>
                    </button>
                  ))
                ) : conversations.length === 0 ? (
                  <div className="p-8 text-center">
                    <span className="material-symbols-outlined text-4xl text-border-subtle mb-2">chat</span>
                    <p className="text-text-secondary text-sm">Henüz mesajınız yok</p>
                    <p className="text-text-secondary text-xs mt-1">Bir sanatçıya mesaj göndererek başlayın</p>
                  </div>
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
                      href={selectedConv.participant.username ? `/sanatsever/${selectedConv.participant.username}` : "#"}
                      className="flex items-center gap-3 flex-grow hover:opacity-80 transition-opacity"
                    >
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
                          {selectedConv.participant.avatar ? (
                            <Image
                              src={selectedConv.participant.avatar}
                              alt={selectedConv.participant.name}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary/10">
                              <span className="text-primary font-bold text-sm">
                                {selectedConv.participant.name[0]?.toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-text-charcoal">{selectedConv.participant.name}</span>
                          {selectedConv.participant.isArtist && (
                            <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] font-medium rounded">Sanatçı</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {loadingMessages ? (
                      <>
                        <MessageSkeleton isOwn={false} />
                        <MessageSkeleton isOwn={true} />
                        <MessageSkeleton isOwn={false} />
                      </>
                    ) : messages.length > 0 ? (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.senderId === user?.id ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${
                              message.senderId === user?.id
                                ? "bg-primary text-white rounded-br-md"
                                : "bg-background-ivory text-text-charcoal rounded-bl-md"
                            }`}
                          >
                            <p>{message.content}</p>
                            <p
                              className={`text-[10px] mt-1 ${
                                message.senderId === user?.id ? "text-white/70" : "text-text-secondary"
                              }`}
                            >
                              {formatMessageTime(message.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <span className="material-symbols-outlined text-4xl text-border-subtle mb-2">chat_bubble</span>
                        <p className="text-text-secondary text-sm">Henüz mesaj yok</p>
                        <p className="text-text-secondary text-xs mt-1">Bir mesaj göndererek konuşmaya başlayın</p>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-border-subtle">
                    <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Mesajınızı yazın..."
                        className="flex-1 px-4 py-2.5 border border-border-subtle rounded-full focus:outline-none focus:border-primary"
                        disabled={sendingMessage}
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim() || sendingMessage}
                        className="p-2.5 bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-white rounded-full transition-colors"
                      >
                        {sendingMessage ? (
                          <span className="material-symbols-outlined animate-spin">sync</span>
                        ) : (
                          <span className="material-symbols-outlined">send</span>
                        )}
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <span className="material-symbols-outlined text-6xl text-border-subtle mb-4">chat</span>
                    <p className="text-text-secondary">
                      {conversations.length > 0 ? "Bir konuşma seçin" : "Henüz mesajınız yok"}
                    </p>
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
