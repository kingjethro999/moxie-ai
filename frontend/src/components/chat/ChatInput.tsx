"use client";

import { useState, useRef, useCallback, type KeyboardEvent } from "react";
import { Send, Image as ImageIcon, X, Square } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface ChatInputProps {
  onSend: (content: string, imageBase64?: string | null) => void;
  onStop: () => void;
  isStreaming: boolean;
  isVisionModel: boolean;
  selectedModel: string;
  placeholder?: string;
  hasLeftPadding?: boolean;
}

export default function ChatInput({
  onSend,
  onStop,
  isStreaming,
  isVisionModel,
  placeholder = "Ask Moxie anything...",
  hasLeftPadding = false,
}: ChatInputProps) {
  const { user, loading } = useAuth();
  const [input, setInput] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = useCallback(() => {
    if (isStreaming) {
      onStop();
      return;
    }

    if (!input.trim() && !imageBase64) return;

    if (!loading && !user) {
      const message = encodeURIComponent(input.trim());
      window.location.href = `/auth/login?message=${message}`;
      return;
    }

    onSend(input, imageBase64);
    setInput("");
    setImageBase64(null);
    setImageName(null);
  }, [input, imageBase64, isStreaming, onSend, onStop, user, loading]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    setImageName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageBase64(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const removeImage = useCallback(() => {
    setImageBase64(null);
    setImageName(null);
  }, []);

  return (
    <div className="space-y-3">
      {imageBase64 && (
        <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl">
          <img
            src={imageBase64}
            alt="Preview"
            className="w-16 h-16 rounded-lg object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white truncate">{imageName}</p>
            <p className="text-xs text-zinc-500">Ready to analyze</p>
          </div>
          <button
            onClick={removeImage}
            className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="relative flex items-end gap-2 px-2 py-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-colors shrink-0"
          title="Attach image"
        >
          <ImageIcon className="w-5 h-5" />
        </button>

        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={imageBase64 ? "Describe what you want to know..." : placeholder}
            className={`w-full bg-transparent px-4 py-3 pr-12 text-sm text-white placeholder-zinc-500 focus:outline-none resize-none min-h-[24px] max-h-40 ${hasLeftPadding ? 'pl-28' : ''}`}
            rows={1}
            style={{
              height: "auto",
              overflow: "hidden",
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = Math.min(target.scrollHeight, 160) + "px";
            }}
          />
        </div>

        <button
          onClick={handleSend}
          disabled={!input.trim() && !imageBase64 && !isStreaming}
          className={`p-2 rounded-full transition-all shrink-0 ${
            isStreaming
              ? "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
              : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600 disabled:opacity-30 disabled:cursor-not-allowed"
          }`}
        >
          {isStreaming ? (
            <Square className="w-4 h-4" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}
