import { NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8080";

const MODEL_CATEGORIES: Record<string, { category: "vision" | "general"; label: string }> = {
  "moxie-deepseek-v3": { category: "general", label: "DeepSeek V3.2 — Logic & Coding" },
  "moxie-qwen-vl": { category: "vision", label: "Qwen2.5-VL — Vision & Multimodal" },
};

interface MoxieModel {
  id: string;
  object: string;
  created: number;
  owned_by: string;
}

/**
 * GET /api/models
 * Returns a list of models available via the local Moxie API server.
 */
export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/models`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `API server returned ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const models: MoxieModel[] = data.data || [];

    const categorized = models.map((m) => {
      const categoryInfo = MODEL_CATEGORIES[m.id] || {
        category: "general" as const,
        label: m.id,
      };

      return {
        id: m.id,
        name: m.id,
        category: categoryInfo.category,
        label: categoryInfo.label,
      };
    });

    return NextResponse.json({ models: categorized });
  } catch (error) {
    console.error("Cannot reach Moxie API server:", error);
    return NextResponse.json({
      models: [
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
      ],
      offline: true,
    });
  }
}
