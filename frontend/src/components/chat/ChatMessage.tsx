"use client";

import { Terminal, Copy, Check, FileText } from "lucide-react";
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
        {/* Attachment Card */}
        {isUser && message.imageBase64 && (
          <div className={`flex gap-2 mb-2 ${isUser ? "justify-end" : "justify-start"}`}>
            <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-2xl w-48 text-left">
              <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0 overflow-hidden">
                {message.fileType?.startsWith("image/") ? (
                  <img src={message.imageBase64} className="object-cover w-full h-full" alt="Attached" />
                ) : (
                  <FileText className="w-5 h-5 text-blue-400" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-white truncate">{message.imageName || "Attached File"}</p>
                <p className="text-[10px] text-zinc-500 uppercase">{message.imageName?.split(".").pop() || "FILE"}</p>
              </div>
            </div>
          </div>
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
