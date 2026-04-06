"use client";

import { Cpu, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface ModelInfo {
  id: string;
  name: string;
  category: string;
  label: string;
  offline?: boolean;
}

interface ModelSwitcherProps {
  models: ModelInfo[];
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  isLoading: boolean;
}

export default function ModelSwitcher({
  models,
  selectedModel,
  onSelectModel,
  isLoading,
}: ModelSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentModel = models.find((m) => m.id === selectedModel);
  const generalModels = models.filter((m) => m.category === "general");
  const visionModels = models.filter((m) => m.category === "vision");

  // Friendly display name
  const displayName = currentModel
    ? currentModel.name.split(":")[0]
    : selectedModel.split(":")[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-[#121214] border border-white/[0.08] rounded-md pl-2.5 pr-2 py-1.5 hover:border-white/[0.15] transition-colors cursor-pointer"
      >
        <Cpu className="w-3.5 h-3.5 text-zinc-400" />
        <span className="text-xs text-zinc-200 max-w-[120px] truncate">
          {isLoading ? "Loading..." : displayName}
        </span>
        {currentModel?.offline && (
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
        )}
        <ChevronDown
          className={`w-3 h-3 text-zinc-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-64 bg-[#121214] border border-white/[0.1] rounded-lg shadow-xl shadow-black/40 z-50 overflow-hidden">
          {generalModels.length > 0 && (
            <>
              <div className="px-3 py-1.5 text-[10px] text-zinc-500 uppercase tracking-wider font-bold bg-white/[0.02]">
                Logic / General
              </div>
              {generalModels.map((m) => (
                <ModelOption
                  key={m.id}
                  model={m}
                  isSelected={m.id === selectedModel}
                  onSelect={() => {
                    onSelectModel(m.id);
                    setIsOpen(false);
                  }}
                />
              ))}
            </>
          )}
          {visionModels.length > 0 && (
            <>
              <div className="px-3 py-1.5 text-[10px] text-zinc-500 uppercase tracking-wider font-bold bg-white/[0.02] border-t border-white/[0.05]">
                Vision / Multimodal
              </div>
              {visionModels.map((m) => (
                <ModelOption
                  key={m.id}
                  model={m}
                  isSelected={m.id === selectedModel}
                  onSelect={() => {
                    onSelectModel(m.id);
                    setIsOpen(false);
                  }}
                />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ModelOption({
  model,
  isSelected,
  onSelect,
}: {
  model: ModelInfo;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`flex items-center gap-3 w-full px-3 py-2 text-left text-sm transition-colors ${
        isSelected
          ? "bg-indigo-500/15 text-indigo-300"
          : "text-zinc-300 hover:bg-white/[0.04]"
      }`}
    >
      <Cpu
        className={`w-3.5 h-3.5 shrink-0 ${
          isSelected ? "text-indigo-400" : "text-zinc-500"
        }`}
      />
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium truncate">{model.name}</div>
      </div>
      {model.offline && (
        <span className="text-[9px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
          offline
        </span>
      )}
      {isSelected && (
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
      )}
    </button>
  );
}
