"use client";

import {
  MessageSquare,
  Plus,
  Trash2,
  Folder,
} from "lucide-react";
import type { Chat } from "@/lib/firebase-db";

interface ChatSidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  isLoading: boolean;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
}

export default function ChatSidebar({
  chats,
  activeChatId,
  isLoading,
  onNewChat,
  onSelectChat,
  onDeleteChat,
}: ChatSidebarProps) {
  // Group chats by date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  const todayChats = chats.filter((c) => c.updatedAt >= today.getTime());
  const yesterdayChats = chats.filter(
    (c) => c.updatedAt >= yesterday.getTime() && c.updatedAt < today.getTime()
  );
  const olderChats = chats.filter((c) => c.updatedAt < yesterday.getTime());

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between py-3 px-4">
        <span className="uppercase text-[10px] font-bold tracking-wider text-zinc-500">
          Explorer
        </span>
        <button
          onClick={onNewChat}
          className="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.08] rounded transition-colors"
          title="New Chat"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-3">
        {/* New Chat CTA */}
        <button
          onClick={onNewChat}
          className="flex items-center gap-2 w-full text-left px-2 py-2 text-sm font-medium text-indigo-400 hover:bg-indigo-500/10 rounded-md transition-colors border border-dashed border-indigo-500/30"
        >
          <Plus className="w-4 h-4" />
          <span>New Chat</span>
        </button>

        {isLoading ? (
          <div className="space-y-2 px-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-7 bg-white/[0.04] rounded animate-pulse"
              />
            ))}
          </div>
        ) : chats.length === 0 ? (
          <div className="text-center py-8 text-xs text-zinc-500">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p>No chats yet.</p>
            <p>Start a new conversation!</p>
          </div>
        ) : (
          <>
            <ChatGroup
              label="Today"
              chats={todayChats}
              activeChatId={activeChatId}
              onSelectChat={onSelectChat}
              onDeleteChat={onDeleteChat}
            />
            <ChatGroup
              label="Yesterday"
              chats={yesterdayChats}
              activeChatId={activeChatId}
              onSelectChat={onSelectChat}
              onDeleteChat={onDeleteChat}
            />
            <ChatGroup
              label="Earlier"
              chats={olderChats}
              activeChatId={activeChatId}
              onSelectChat={onSelectChat}
              onDeleteChat={onDeleteChat}
            />
          </>
        )}
      </div>
    </div>
  );
}

function ChatGroup({
  label,
  chats,
  activeChatId,
  onSelectChat,
  onDeleteChat,
}: {
  label: string;
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
}) {
  if (chats.length === 0) return null;

  return (
    <div>
      <div className="text-[10px] text-zinc-600 uppercase tracking-wider px-2 mb-1 font-medium">
        {label}
      </div>
      <div className="flex flex-col gap-0.5">
        {chats.map((chat) => {
          const isActive = chat.id === activeChatId;
          return (
            <div
              key={chat.id}
              className={`group flex items-center gap-2 w-full text-left text-xs py-1.5 px-2 rounded cursor-pointer transition-colors ${
                isActive
                  ? "text-indigo-400 bg-indigo-500/10"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
              }`}
              onClick={() => onSelectChat(chat.id)}
            >
              <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-60" />
              <span className="truncate flex-1">{chat.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteChat(chat.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-0.5 text-zinc-500 hover:text-red-400 transition-all"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
