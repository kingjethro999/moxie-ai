"use client";

import { useState, useCallback, useRef } from "react";
import type { OllamaChatMessage } from "@/app/api/chat/route";
import {
  addMessage as saveMessage,
  type ChatMessage,
} from "@/lib/firebase-db";

export interface LocalMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  model?: string;
  imageBase64?: string | null;
  imageName?: string | null;
  fileType?: string | null;
  createdAt: number;
  isStreaming?: boolean;
}

interface StreamMetrics {
  model?: string;
  totalDuration?: number;
  evalCount?: number;
  evalDuration?: number;
  tokensPerSecond?: number;
}

interface UseChatReturn {
  messages: LocalMessage[];
  setMessages: React.Dispatch<React.SetStateAction<LocalMessage[]>>;
  isStreaming: boolean;
  error: string | null;
  metrics: StreamMetrics | null;
  sendMessage: (
    content: string,
    model: string,
    chatId: string | null,
    imageBase64?: string | null,
    imageName?: string | null,
    fileType?: string | null
  ) => Promise<void>;
  stopStreaming: () => void;
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<StreamMetrics | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const stopStreaming = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const sendMessage = useCallback(
    async (
      content: string,
      model: string,
      chatId: string | null,
      imageBase64?: string | null,
      imageName?: string | null,
      fileType?: string | null
    ) => {
      if (!content.trim() && !imageBase64) return;

      setError(null);
      setMetrics(null);

      // 1. Add user message to local state
      const userMsg: LocalMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: content.trim(),
        imageBase64: imageBase64 || null,
        imageName: imageName || null,
        fileType: fileType || null,
        createdAt: Date.now(),
      };

      setMessages((prev) => [...prev, userMsg]);

      // 2. Save user message to Firebase
      if (chatId) {
        try {
          await saveMessage(chatId, "user", content.trim(), model, imageBase64);
        } catch (err) {
          console.error("Failed to save user message:", err);
        }
      }

      // 3. Create placeholder assistant message
      const assistantId = `assistant-${Date.now()}`;
      const assistantMsg: LocalMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
        model,
        createdAt: Date.now(),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsStreaming(true);

      // 4. Build conversation history for Ollama (last 20 messages for context)
      const historyMessages: OllamaChatMessage[] = messages
        .slice(-20)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      historyMessages.push({ role: "user", content: content.trim() });

      // 5. Stream from Ollama
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: historyMessages,
            model,
            image: imageBase64 || null,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(
            errData.error || `Server error: ${response.status}`
          );
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response stream");

        const decoder = new TextDecoder();
        let fullContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value, { stream: true });
          const lines = text.split("\n").filter((l) => l.trim());

          for (const line of lines) {
            try {
              const parsed = JSON.parse(line);

              if (parsed.token) {
                fullContent += parsed.token;

                // Update the assistant message in real-time
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? { ...m, content: fullContent }
                      : m
                  )
                );
              }

              if (parsed.done) {
                // Calculate tokens/sec
                const tokensPerSecond =
                  parsed.eval_count && parsed.eval_duration
                    ? (parsed.eval_count / (parsed.eval_duration / 1e9))
                    : undefined;

                setMetrics({
                  model: parsed.model,
                  totalDuration: parsed.total_duration,
                  evalCount: parsed.eval_count,
                  evalDuration: parsed.eval_duration,
                  tokensPerSecond,
                });
              }
            } catch {
              // Skip bad JSON
            }
          }
        }

        // 6. Finalize: mark as not streaming
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: fullContent, isStreaming: false }
              : m
          )
        );

        // 7. Save assistant response to Firebase
        if (chatId && fullContent) {
          try {
            await saveMessage(chatId, "assistant", fullContent, model);
          } catch (err) {
            console.error("Failed to save assistant message:", err);
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
          // User stopped the stream
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, isStreaming: false } : m
            )
          );
        } else {
          const errorMsg =
            err instanceof Error ? err.message : "Something went wrong";
          setError(errorMsg);

          // Update the assistant message with error
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? {
                    ...m,
                    content: `⚠️ Error: ${errorMsg}`,
                    isStreaming: false,
                  }
                : m
            )
          );
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [messages]
  );

  return {
    messages,
    setMessages,
    isStreaming,
    error,
    metrics,
    sendMessage,
    stopStreaming,
  };
}
