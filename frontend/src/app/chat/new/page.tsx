"use client";

import { useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useChat } from "@/hooks/useChat";
import { useChatHistory } from "@/hooks/useChatHistory";
import { useAuthStore } from "@/stores/authStore";
import { AuthGuard } from "@/components/AuthGuard";

function NewChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pendingMessage = searchParams.get("message");
  const { setMessages } = useChat();
  const { newChat } = useChatHistory();
  const user = useAuthStore((state) => state.user);
  const initialized = useAuthStore((state) => state.initialized);

  const createAndNavigate = useCallback(async () => {
    if (!user || !initialized) return;
    
    const chatId = await newChat("moxie-deepseek-v3");
    setMessages([]);
    
    if (pendingMessage) {
      router.replace(`/chat/${chatId}?message=${encodeURIComponent(pendingMessage)}`);
    } else {
      router.replace(`/chat/${chatId}`);
    }
  }, [newChat, setMessages, router, pendingMessage, user, initialized]);

  useEffect(() => {
    if (initialized && user) {
      createAndNavigate();
    }
  }, [createAndNavigate, initialized, user]);

  return (
    <div className="flex items-center justify-center h-screen bg-[#0a0a0b]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-zinc-600 border-t-zinc-300 rounded-full animate-spin" />
        <p className="text-zinc-500 text-sm">
          {pendingMessage ? "Starting conversation..." : "Creating new chat..."}
        </p>
      </div>
    </div>
  );
}

export default function NewChatPage() {
  return (
    <AuthGuard>
      <Suspense fallback={
        <div className="flex items-center justify-center h-screen bg-[#0a0a0b]">
          <div className="w-8 h-8 border-2 border-zinc-600 border-t-zinc-300 rounded-full animate-spin" />
        </div>
      }>
        <NewChatContent />
      </Suspense>
    </AuthGuard>
  );
}
