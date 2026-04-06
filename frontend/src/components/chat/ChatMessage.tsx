"use client";

import { Terminal, Brain, ChevronDown, ChevronUp, FileText } from "lucide-react";
import { useState } from "react";
import type { LocalMessage } from "@/hooks/useChat";

interface ChatMessageProps {
  message: LocalMessage;
}

function ThinkingSection({ thinking, isStreaming }: { thinking: string; isStreaming?: boolean }) {
  const [expanded, setExpanded] = useState(true);
  
  if (!thinking) return null;
  
  return (
    <div className="mb-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-400 transition-colors"
      >
        <Brain className="w-3.5 h-3.5" />
        <span className="font-medium">
          {isStreaming ? "Thinking..." : "Thought process"}
        </span>
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>
      
      {expanded && (
        <div className="mt-2 p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
          <div className="text-xs text-zinc-500 font-mono leading-relaxed whitespace-pre-wrap">
            {thinking}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-4 ${isUser ? "flex-row-reverse" : ""}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
          <Terminal className="w-4 h-4 text-zinc-500" />
        </div>
      )}

      <div className={`flex-1 max-w-2xl ${isUser ? "text-right" : ""}`}>
        {/* Thinking Section - Only for assistant */}
        {!isUser && message.thinking && (
          <ThinkingSection 
            thinking={message.thinking} 
            isStreaming={message.isStreaming && !message.thinkingComplete} 
          />
        )}
        
        {/* Attachment Card */}
        {isUser && message.imageBase64 && (
          <div className={`flex gap-2 mb-2 ${isUser ? "justify-end" : "justify-start"}`}>
            <div className="flex items-center gap-3 p-3 bg-zinc-800 border border-zinc-700 rounded-2xl w-48 text-left">
              <div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center shrink-0 overflow-hidden">
                {message.fileType?.startsWith("image/") ? (
                  <img src={message.imageBase64} className="object-cover w-full h-full" alt="Attached" />
                ) : (
                  <FileText className="w-5 h-5 text-zinc-500" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-zinc-200 truncate">{message.imageName || "Attached File"}</p>
                <p className="text-[10px] text-zinc-500 uppercase">{message.imageName?.split(".").pop() || "FILE"}</p>
              </div>
            </div>
          </div>
        )}
        <div
          className={`inline-block text-left px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? "bg-zinc-200 text-zinc-900 rounded-br-md"
              : "bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-bl-md"
          }`}
        >
          {message.content}
          {message.isStreaming && (
            <span className="inline-block w-2 h-4 bg-zinc-500 animate-pulse ml-1" />
          )}
        </div>
        {!isUser && message.model && (
          <p className="text-xs text-zinc-600 mt-1">{message.model}</p>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 text-zinc-500 text-xs font-bold">
          U
        </div>
      )}
    </div>
  );
}
