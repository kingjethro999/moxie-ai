import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { validateHashedApiKey } from "@/lib/firebase-db";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8080";

export interface OllamaChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  images?: string[];
}

interface ChatRequestBody {
  messages: OllamaChatMessage[];
  model: string;
  image?: string | null;
  stream?: boolean;
}

const SYSTEM_PROMPT = `You are Moxie, a sharp, concise, and highly knowledgeable AI developer assistant. You specialize in helping with coding, debugging, and technical problem-solving. 

Key traits:
- Be direct and efficient — developers don't want fluff
- Always provide working code examples when relevant
- Use markdown formatting for code blocks, lists, and emphasis
- When analyzing images/screenshots, be specific about what you see
- If you're unsure, say so — never make up information
- Suggest the most modern and efficient solution available`;

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequestBody = await request.json();
    const { messages, model: requestedModel, image, stream: wantStream = true } = body;

    const apiKey = request.headers.get("x-api-key");
    if (!apiKey) {
      return NextResponse.json(
        { error: "Authentication required. Please provide x-api-key header." },
        { status: 401 }
      );
    }

    const hashedKey = crypto.createHash("sha256").update(apiKey).digest("hex");
    const authUser = await validateHashedApiKey(hashedKey);

    if (!authUser) {
      return NextResponse.json(
        { error: "Invalid API key. Please generate a new one." },
        { status: 401 }
      );
    }

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: "No messages provided" },
        { status: 400 }
      );
    }

    const model = requestedModel || "moxie-deepseek-v3";

    const formattedMessages = messages.map((msg, idx) => {
      const formatted: OllamaChatMessage = {
        role: msg.role,
        content: msg.content,
      };

      if (image && idx === messages.length - 1 && msg.role === "user") {
        const base64Clean = image.replace(/^data:image\/\w+;base64,/, "");
        formatted.images = [base64Clean];
      }

      return formatted;
    });

    const allMessages = [
      { role: "system" as const, content: SYSTEM_PROMPT },
      ...formattedMessages,
    ];

    if (!wantStream) {
      const response = await fetch(`${API_BASE_URL}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({
          model,
          messages: allMessages,
          stream: false,
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        return NextResponse.json({ error: err }, { status: 500 });
      }

      const data = await response.json();
      return NextResponse.json({
        content: data.choices?.[0]?.message?.content || "",
        model: data.model,
        done: true,
      });
    }

    const ollamaResponse = await fetch(`${API_BASE_URL}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        model,
        messages: allMessages,
        stream: true,
      }),
    });

    if (!ollamaResponse.ok) {
      const errorText = await ollamaResponse.text();
      console.error("API server error:", errorText);
      return NextResponse.json(
        { error: `API returned ${ollamaResponse.status}: ${errorText}` },
        { status: ollamaResponse.status }
      );
    }

    const reader = ollamaResponse.body?.getReader();
    if (!reader) {
      return NextResponse.json(
        { error: "No response stream from API server" },
        { status: 500 }
      );
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const text = decoder.decode(value, { stream: true });
            const lines = text.split("\n").filter((line) => line.trim());

            for (const line of lines) {
              if (line === "data: [DONE]") {
                controller.enqueue(encoder.encode(JSON.stringify({ done: true }) + "\n"));
                break;
              }

              if (line.startsWith("data: ")) {
                const dataStr = line.slice(6);
                try {
                  const parsed = JSON.parse(dataStr);
                  const content = parsed.choices?.[0]?.delta?.content || "";
                  const reasoning = parsed.choices?.[0]?.delta?.reasoning_content || "";

                  if (content || reasoning) {
                    controller.enqueue(
                      encoder.encode(JSON.stringify({ 
                        token: content, 
                        thinking: reasoning,
                        done: false 
                      }) + "\n")
                    );
                  }
                } catch {
                  // Skip malformed JSON
                }
              }
            }
          }
        } catch (err) {
          console.error("Stream error:", err);
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
