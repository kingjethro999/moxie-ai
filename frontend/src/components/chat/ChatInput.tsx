"use client";

import { useState, useRef, useCallback, type KeyboardEvent } from "react";
import { Send, Square, Plus, FileText, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface ChatInputProps {
  onSend: (content: string, imageBase64?: string | null, imageName?: string | null, fileType?: string | null) => void;
  onStop: () => void;
  isStreaming: boolean;
  isVisionModel: boolean;
  selectedModel: string;
  placeholder?: string;
}

export default function ChatInput({
  onSend,
  onStop,
  isStreaming,
  models, // Accept models list
  selectedModel,
  setSelectedModel,
  placeholder = "Ask Moxie anything...",
}: any) {
  const { user, loading } = useAuth();
  const [input, setInput] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
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

    onSend(input, imageBase64, imageName, fileType);
    setInput("");
    setImageBase64(null);
    setImageName(null);
    setFileType(null);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }, [input, imageBase64, isStreaming, onSend, onStop, user, loading]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const processFile = (file: File) => {
    setImageName(file.name);
    setFileType(file.type);
    const reader = new FileReader();
    reader.onload = (e) => setImageBase64(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const clearFile = () => {
    setImageBase64(null);
    setImageName(null);
    setFileType(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const isImage = fileType?.startsWith("image/");
  const fileExtension = imageName?.split(".").pop()?.toUpperCase() || "FILE";

return (
    <div className="relative bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl focus-within:border-zinc-700 transition-all">
      {/* File Preview Area - Sits above the text */}
      {(imageBase64 || imageName) && (
        <div className="flex flex-wrap gap-2 px-5 pt-4">
          <div className="group relative flex items-center gap-3 p-2 bg-zinc-800 border border-zinc-700 rounded-lg w-fit max-w-[200px] animate-in fade-in slide-in-from-bottom-2">
            {isImage ? (
              <img src={imageBase64 || undefined} alt="Preview" className="w-10 h-10 rounded-lg object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-zinc-700 flex items-center justify-center">
                <FileText className="w-5 h-5 text-zinc-400" />
              </div>
            )}
            <div className="flex flex-col min-w-0 pr-6">
              <span className="text-xs font-medium text-zinc-200 truncate">{imageName || "Document"}</span>
              <span className="text-[10px] text-zinc-500">{fileExtension}</span>
            </div>
            <button 
              onClick={clearFile}
              className="absolute -top-2 -right-2 bg-zinc-700 border border-zinc-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3 text-zinc-300" />
            </button>
          </div>
        </div>
      )}

      {/* Text Input Area */}
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full bg-transparent px-5 pt-5 pb-14 text-zinc-200 placeholder-zinc-500 focus:outline-none resize-none min-h-[100px] max-h-60"
        onInput={(e) => {
          const target = e.target as HTMLTextAreaElement;
          target.style.height = "auto";
          target.style.height = `${target.scrollHeight}px`;
        }}
      />

      {/* 2. Gemini-style Bottom Toolbar */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Image/Plus Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-full transition-colors"
          >
            <Plus className="w-5 h-5" />
            <input ref={fileInputRef} type="file" onChange={handleFileChange} className="hidden" />
          </button>

          {/* Tools Button (Optional visual) */}
          <button className="flex items-center gap-2 px-3 py-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-full transition-colors text-sm">
            <span className="text-xs font-medium">Tools</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Model Selector (Styled like Gemini's "Fast/Advanced" dropdown) */}
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="bg-transparent text-zinc-500 text-xs px-2 py-1 cursor-pointer focus:outline-none hover:text-zinc-300 transition-colors"
          >
            {models.map((m: any) => (
              <option key={m.id} value={m.id} className="bg-zinc-900">
                {m.label.split("—")[0]}
              </option>
            ))}
          </select>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!input.trim() && !isStreaming}
            className="p-2 text-zinc-500 hover:text-zinc-300 disabled:opacity-20 transition-colors"
          >
            {isStreaming ? <Square className="w-5 h-5" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}