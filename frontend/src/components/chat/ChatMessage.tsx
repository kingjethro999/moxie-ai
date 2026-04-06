"use client";

import { Terminal, Copy, Check } from "lucide-react";
import { useState, useCallback } from "react";
import type { LocalMessage } from "@/hooks/useChat";

interface ChatMessageProps {
  message: LocalMessage;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-4 ${isUser ? "flex-row-reverse" : ""}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
          <Terminal className="w-4 h-4 text-zinc-400" />
        </div>
      )}

      <div className={`flex-1 max-w-2xl ${isUser ? "text-right" : ""}`}>
        {isUser && message.imageBase64 && (
          <img
            src={message.imageBase64}
            alt="Attached"
            className="rounded-xl max-h-64 ml-auto mb-2"
          />
        )}
        <div
          className={`inline-block text-left px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? "bg-white text-black rounded-br-md"
              : "bg-white/5 border border-white/10 text-zinc-300 rounded-bl-md"
          }`}
        >
          {message.content}
          {message.isStreaming && (
            <span className="inline-block w-2 h-4 bg-zinc-400 animate-pulse ml-1" />
          )}
        </div>
        {!isUser && message.model && (
          <p className="text-xs text-zinc-500 mt-1">{message.model}</p>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-white/10 flex items-center justify-center shrink-0 text-zinc-400 text-xs font-bold">
          U
        </div>
      )}
    </div>
  );
}
