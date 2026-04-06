"use client";

import { useState, useEffect, useCallback } from "react";

interface ModelInfo {
  id: string;
  name: string;
  category: "general" | "vision";
  label: string;
  size?: number;
  offline?: boolean;
}

interface UseModelsReturn {
  models: ModelInfo[];
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  isLoading: boolean;
  isVisionModel: boolean;
}

const FALLBACK_MODELS: ModelInfo[] = [
  {
    id: "moxie-deepseek-v3",
    name: "moxie-deepseek-v3",
    category: "general",
    label: "DeepSeek V3.2 — Logic & Coding",
    offline: true,
  },
  {
    id: "moxie-qwen-vl",
    name: "moxie-qwen-vl",
    category: "vision",
    label: "Qwen2.5-VL — Vision & Multimodal",
    offline: true,
  },
];

export function useModels(): UseModelsReturn {
  const [models, setModels] = useState<ModelInfo[]>(FALLBACK_MODELS);
  const [selectedModel, setSelectedModel] = useState("moxie-deepseek-v3");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/models");
      const data = await res.json();
      if (data.models && data.models.length > 0) {
        setModels(data.models);
        const current = data.models.find((m: ModelInfo) => m.id === selectedModel);
        if (!current) {
          setSelectedModel(data.models[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch models:", err);
      setModels(FALLBACK_MODELS);
    } finally {
      setIsLoading(false);
    }
  };

  const isVisionModel = models.find((m) => m.id === selectedModel)?.category === "vision";

  return {
    models,
    selectedModel,
    setSelectedModel,
    isLoading,
    isVisionModel,
  };
}
