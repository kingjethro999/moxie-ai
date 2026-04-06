"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getUserChats,
  createChat,
  deleteChat,
  updateChatTitle,
  getChatMessages,
  type Chat,
  type ChatMessage,
} from "@/lib/firebase-db";
import { useAuthStore } from "@/stores/authStore";

interface UseChatHistoryReturn {
  chats: Chat[];
  activeChatId: string | null;
  isLoading: boolean;
  newChat: (model?: string) => Promise<string>;
  selectChat: (chatId: string) => Promise<ChatMessage[]>;
  removeChat: (chatId: string) => Promise<void>;
  renameChat: (chatId: string, title: string) => Promise<void>;
  refreshChats: () => Promise<void>;
}

export function useChatHistory(): UseChatHistoryReturn {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const user = useAuthStore((state) => state.user);

  const loadChats = useCallback(async () => {
    if (!user) {
      setChats([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const userChats = await getUserChats(user.uid);
      setChats(userChats);
    } catch (err) {
      console.error("Failed to load chats:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  const newChat = useCallback(
    async (model: string = "moxie-deepseek-v3"): Promise<string> => {
      if (!user) throw new Error("Not authenticated");

      try {
        const chatId = await createChat("New Chat", model, user.uid);
        setActiveChatId(chatId);
        await loadChats();
        return chatId;
      } catch (err) {
        console.error("Failed to create chat:", err);
        throw err;
      }
    },
    [user, loadChats]
  );

  const selectChat = useCallback(
    async (chatId: string): Promise<ChatMessage[]> => {
      setActiveChatId(chatId);
      try {
        return await getChatMessages(chatId);
      } catch (err) {
        console.error("Failed to load messages:", err);
        return [];
      }
    },
    []
  );

  const removeChat = useCallback(
    async (chatId: string) => {
      try {
        await deleteChat(chatId);
        if (activeChatId === chatId) {
          setActiveChatId(null);
        }
        await loadChats();
      } catch (err) {
        console.error("Failed to delete chat:", err);
      }
    },
    [activeChatId, loadChats]
  );

  const renameChat = useCallback(
    async (chatId: string, title: string) => {
      try {
        await updateChatTitle(chatId, title);
        await loadChats();
      } catch (err) {
        console.error("Failed to rename chat:", err);
      }
    },
    [loadChats]
  );

  return {
    chats,
    activeChatId,
    isLoading,
    newChat,
    selectChat,
    removeChat,
    renameChat,
    refreshChats: loadChats,
  };
}
