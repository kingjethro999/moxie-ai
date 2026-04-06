"use client";

import { Cpu, Image as ImageIcon, Clock, Zap } from "lucide-react";
import type { LocalMessage } from "@/hooks/useChat";

interface ContextPanelProps {
  metrics: {
    model?: string;
    totalDuration?: number;
    evalCount?: number;
    evalDuration?: number;
    tokensPerSecond?: number;
  } | null;
  selectedModel: string;
  lastImage?: string | null;
  isStreaming: boolean;
}

export default function ContextPanel({
  metrics,
  selectedModel,
  lastImage,
  isStreaming,
}: ContextPanelProps) {
  const tps = metrics?.tokensPerSecond
    ? metrics.tokensPerSecond.toFixed(1)
    : "—";
  const totalTime = metrics?.totalDuration
    ? (metrics.totalDuration / 1e9).toFixed(2) + "s"
    : "—";
  const tokens = metrics?.evalCount || "—";

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex items-center border-b border-white/[0.08] px-2 h-10 shrink-0 gap-1">
        <button className="px-3 py-1 text-xs font-medium text-zinc-200 bg-white/[0.08] rounded border border-white/[0.04]">
          Context
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Vision Preview */}
        {lastImage && (
          <div className="bg-[#121214] border border-white/[0.08] rounded-md p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 mb-3">
              <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
              <span>Vision Preview</span>
            </div>
            <div className="rounded overflow-hidden border border-white/[0.05]">
              <img
                src={lastImage}
                alt="Uploaded"
                className="w-full object-contain max-h-48"
              />
            </div>
          </div>
        )}

        {/* Active Model */}
        <div className="bg-[#121214] border border-white/[0.08] rounded-md p-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 mb-3">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span>Active Model</span>
          </div>
          <div className="text-sm text-zinc-200 font-mono bg-[#0a0a0b] px-3 py-2 rounded">
            {selectedModel}
          </div>
          {isStreaming && (
            <div className="flex items-center gap-2 mt-2 text-xs text-indigo-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
              </span>
              Generating response...
            </div>
          )}
        </div>

        {/* Telemetry */}
        <div className="bg-[#121214] border border-white/[0.08] rounded-md p-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 mb-3">
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            <span>Telemetry</span>
          </div>
          <div className="space-y-2 text-xs text-zinc-400 font-mono">
            <div className="flex justify-between items-center bg-[#0a0a0b] px-2 py-1.5 rounded">
              <span>Speed</span>
              <span
                className={
                  metrics?.tokensPerSecond
                    ? "text-emerald-400"
                    : "text-zinc-500"
                }
              >
                {tps} t/s
              </span>
            </div>
            <div className="flex justify-between items-center bg-[#0a0a0b] px-2 py-1.5 rounded">
              <span>Tokens</span>
              <span className="text-zinc-200">{tokens}</span>
            </div>
            <div className="flex justify-between items-center bg-[#0a0a0b] px-2 py-1.5 rounded">
              <span>Total Time</span>
              <span className="text-zinc-200">{totalTime}</span>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-[#121214] border border-white/[0.08] rounded-md p-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 mb-3">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>System</span>
          </div>
          <div className="space-y-2 text-xs text-zinc-400 font-mono">
            <div className="flex justify-between items-center bg-[#0a0a0b] px-2 py-1.5 rounded">
              <span>Engine</span>
              <span className="flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                </span>
                <span className="text-emerald-400">Ollama</span>
              </span>
            </div>
            <div className="flex justify-between items-center bg-[#0a0a0b] px-2 py-1.5 rounded">
              <span>DB</span>
              <span className="flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                </span>
                <span className="text-emerald-400">Firebase</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
