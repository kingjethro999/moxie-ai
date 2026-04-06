"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  Menu, 
  X, 
  ChevronDown,
  Crown,
  LogOut,
  Settings,
  Plus,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { useChatHistory } from "@/hooks/useChatHistory";
import { useModels } from "@/hooks/useModels";
import ChatMessage from "@/components/chat/ChatMessage";
import ChatInput from "@/components/chat/ChatInput";
import { AuthGuard } from "@/components/AuthGuard";
import { useAuthStore } from "@/stores/authStore";
import Image from "next/image";

export default function ChatPage() {
  return (
    <AuthGuard>
      <ChatContent />
    </AuthGuard>
  );
}

function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pendingMessage = searchParams.get("message");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState(
    "I am Moxie, your AI assistant. I help with coding, debugging, answering questions, and having thoughtful conversations. I'm direct, helpful, and strive to give accurate information."
  );

  const {
    messages,
    setMessages,
    isStreaming,
    error,
    sendMessage,
    stopStreaming,
  } = useChat();

  const {
    chats,
    activeChatId,
    isLoading: chatsLoading,
    newChat,
    selectChat,
    removeChat,
    refreshChats,
  } = useChatHistory();

  const {
    models,
    selectedModel,
    setSelectedModel,
    isLoading: modelsLoading,
    isVisionModel,
  } = useModels();

  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pendingMessage && !isStreaming && messages.length === 0) {
      sendMessage(pendingMessage, selectedModel, activeChatId);
    }
  }, [pendingMessage, isStreaming, messages.length, sendMessage, selectedModel, activeChatId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleNewChat = useCallback(async () => {
    const chatId = await newChat(selectedModel);
    setMessages([]);
    router.push(`/chat/${chatId}`);
  }, [newChat, selectedModel, setMessages, router]);

  const handleSelectChat = useCallback(
    async (chatId: string) => {
      const msgs = await selectChat(chatId);
      setMessages(
        msgs.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          model: m.model,
          imageBase64: m.imageBase64 || null,
          createdAt: m.createdAt,
          isStreaming: false,
        }))
      );
      setSidebarOpen(false);
    },
    [selectChat, setMessages]
  );

  const handleSend = useCallback(
    async (content: string, imageBase64?: string | null) => {
      let chatId = activeChatId;

      if (!chatId) {
        chatId = await newChat(selectedModel);
        router.push(`/chat/${chatId}`);
      }

      await sendMessage(content, selectedModel, chatId, imageBase64);
      await refreshChats();
    },
    [activeChatId, selectedModel, newChat, sendMessage, refreshChats, router]
  );

  const handleSignOut = useCallback(async () => {
    await signOut();
    router.push("/login");
  }, [signOut, router]);

  return (
    <div className="flex h-screen bg-[#1a1a1a] text-white overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "w-72" : "w-0"} bg-[#1a1a1a] border-r border-white/10 flex flex-col transition-all duration-200 overflow-hidden shrink-0`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3">
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="px-3 pb-2">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-zinc-300 hover:bg-white/10 rounded-xl transition-colors"
          >
            <Plus className="w-5 h-5" />
            New chat
          </button>
        </div>

        {/* Recent Chats */}
        <div className="flex-1 overflow-y-auto px-3 py-2">
          {chatsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-white/5 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : chats.length === 0 ? (
            <p className="text-zinc-600 text-sm px-3 py-2">No chats yet</p>
          ) : (
            <div className="space-y-1">
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => handleSelectChat(chat.id)}
                  className={`w-full text-left px-3 py-2.5 text-sm rounded-xl transition-colors ${
                    activeChatId === chat.id
                      ? "bg-white/10 text-white"
                      : "text-zinc-400 hover:bg-white/5 hover:text-zinc-300"
                  }`}
                >
                  <span className="block truncate">{chat.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Section */}
        <div className="p-3 border-t border-white/10">
          <button 
            onClick={() => setSettingsOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-zinc-400 hover:bg-white/5 hover:text-zinc-300 rounded-xl transition-colors"
          >
            <Settings className="w-5 h-5" />
            Settings
          </button>
          
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-zinc-400 hover:bg-white/5 hover:text-zinc-300 rounded-xl transition-colors mt-1"
          >
            <LogOut className="w-5 h-5" />
            Log out
          </button>
          
          {user && (
            <div className="flex items-center gap-3 mt-2 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-medium text-zinc-300">
                {user.email?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-zinc-300 truncate">{user.email}</p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0d0d0d] relative">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <button className="flex items-center gap-2 px-3 py-1.5 text-lg font-medium text-zinc-100 hover:bg-white/10 rounded-lg transition-colors">
              Moxie
              <ChevronDown className="w-4 h-4 text-zinc-500" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-200 hover:bg-white/10 rounded-lg transition-colors">
              <Crown className="w-4 h-4 text-yellow-500" />
              Upgrade
            </button>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-8">
            {messages.length === 0 ? (
              <EmptyState onNewChat={handleNewChat} />
            ) : (
              <div className="space-y-6">
                {messages.map((msg) => (
                  <ChatMessage key={msg.id} message={msg} />
                ))}
                {isStreaming && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 overflow-hidden">
                      <Image src="/icon.png" alt="Moxie" width={32} height={32} className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-white">Moxie</span>
                        <span className="text-xs text-zinc-500">thinking...</span>
                      </div>
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="px-4 pb-2">
            <div className="max-w-3xl mx-auto p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          </div>
        )}

        {/* Input Bar with Model Selector */}
        <div className="shrink-0 px-4 pb-6 pt-2">
          <div className="max-w-3xl mx-auto">
            <div className="relative bg-[#1f1f1f] rounded-full border border-white/10 hover:border-white/20 transition-colors">
              {/* Model Selector - inside input like Claude */}
              <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="bg-zinc-800 text-zinc-300 text-xs px-3 py-1.5 rounded-full focus:outline-none hover:bg-zinc-700 transition-colors cursor-pointer border border-white/10"
                >
                  {models.map((model) => (
                    <option key={model.id} value={model.id} className="bg-[#1a1a1a]">
                      {model.label.split("—")[0].trim()}
                    </option>
                  ))}
                </select>
              </div>
              <ChatInput
                onSend={handleSend}
                onStop={stopStreaming}
                isStreaming={isStreaming}
                isVisionModel={isVisionModel}
                selectedModel={selectedModel}
                placeholder="Ask Moxie anything..."
                hasLeftPadding={true}
              />
            </div>
            <p className="text-center text-xs text-zinc-600 mt-3">
              Moxie may display inaccurate info. Double-check important responses.
            </p>
          </div>
        </div>

        {/* Settings Modal */}
        {settingsOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h2 className="text-lg font-semibold">Settings</h2>
                <button 
                  onClick={() => setSettingsOpen(false)}
                  className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-4 space-y-6">
                {/* System Prompt Setting */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Moxie Profile / System Prompt
                  </label>
                  <textarea
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white/20 resize-none min-h-[100px]"
                    placeholder="Describe how Moxie should behave..."
                  />
                  <p className="text-xs text-zinc-500 mt-2">
                    This defines how Moxie introduces itself and responds to you.
                  </p>
                </div>

                {/* Logout Button */}
                <div className="pt-4 border-t border-white/10">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    Log out
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function EmptyState({ onNewChat }: { onNewChat: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center pt-16">
      <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-6 overflow-hidden">
        <Image src="/icon.png" alt="Moxie" width={64} height={64} className="object-cover" />
      </div>
      <h1 className="text-3xl font-semibold text-white mb-3">Good afternoon</h1>
      <p className="text-zinc-500 text-base max-w-md mb-8">
        Ask Moxie anything about code, debug errors, or just chat.
      </p>
    </div>
  );
}

