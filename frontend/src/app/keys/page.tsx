"use client";

import { useState, useEffect, useCallback } from "react";
import { useRequireAuth } from "@/contexts/AuthContext";
import { getUserApiKeys, deleteApiKey, type ApiKey } from "@/lib/firebase-db";
import { Key, Copy, Trash2, Plus, AlertCircle, Check, Terminal, Code, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function KeysPage() {
  const { user, loading } = useRequireAuth();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  const loadKeys = useCallback(async () => {
    if (!user) return;
    try {
      const userKeys = await getUserApiKeys(user.uid);
      setKeys(userKeys);
    } catch (err) {
      console.error("Failed to load API keys:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadKeys();
  }, [loadKeys]);

  const generateKey = async () => {
    if (!user || generating) return;
    setGenerating(true);
    try {
      // Get Firebase auth token
      const token = await user.getIdToken();
      
      const response = await fetch("/api/keys/generate", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });
      const data = await response.json();
      if (data.key) {
        setNewKey(data.key);
        loadKeys();
      }
    } catch (err) {
      console.error("Failed to generate key:", err);
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (hashedKey: string) => {
    if (!confirm("Are you sure you want to delete this API key?")) return;
    try {
      await deleteApiKey(hashedKey);
      loadKeys();
    } catch (err) {
      console.error("Failed to delete key:", err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <div className="text-zinc-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030303]">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-[#030303]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/chat" className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                <Key className="w-4 h-4 text-zinc-500" />
              </div>
              <span className="font-semibold text-zinc-200">API Keys</span>
            </Link>
          </div>
          <Link
            href="/chat"
            className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Back to Chat
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Warning Banner */}
        <div className="mb-8 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-zinc-500 shrink-0 mt-0.5" />
          <div className="text-sm text-zinc-400">
            <p className="font-medium text-zinc-300 mb-1">Keep your API keys secure</p>
            <p>Never share your API keys in public repositories, client-side code, or other insecure locations.</p>
          </div>
        </div>

        {/* New Key Modal */}
        {newKey && (
          <div className="mb-8 p-6 bg-zinc-900 border border-zinc-700 rounded-xl">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-zinc-200">New API Key Generated</h3>
              <button
                onClick={() => setNewKey(null)}
                className="text-zinc-500 hover:text-zinc-300"
              >
                <ExternalLink className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-zinc-400 mb-4">
              Copy this key now. You won&apos;t be able to see it again!
            </p>
            <div className="flex items-center gap-3 p-4 bg-zinc-950 border border-zinc-800 rounded-lg">
              <code className="flex-1 font-mono text-sm text-zinc-300 break-all">{newKey}</code>
              <button
                onClick={() => copyToClipboard(newKey)}
                className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span className="text-sm">{copied ? "Copied!" : "Copy"}</span>
              </button>
            </div>
          </div>
        )}

        {/* Keys List */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-zinc-200">Your API Keys</h2>
            <button
              onClick={generateKey}
              disabled={generating}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-200 hover:bg-white text-zinc-900 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              {generating ? "Generating..." : "Generate New Key"}
            </button>
          </div>

          {keys.length === 0 ? (
            <div className="text-center py-12 bg-zinc-900/30 border border-zinc-800 rounded-xl">
              <Key className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-400 mb-2">No API keys yet</p>
              <p className="text-sm text-zinc-500">Generate a key to start using the API</p>
            </div>
          ) : (
            <div className="space-y-3">
              {keys.map((key) => (
                <div
                  key={key.id}
                  className="flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                      <Key className="w-5 h-5 text-zinc-500" />
                    </div>
                    <div>
                      <p className="font-mono text-sm text-zinc-300">
                        {key.id.slice(0, 16)}...
                      </p>
                      <p className="text-xs text-zinc-500 mt-1">
                        Created {formatDate(key.createdAt)}
                        {key.lastUsed && ` • Last used ${formatDate(key.lastUsed)}`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(key.id)}
                    className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    title="Delete key"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* API Documentation */}
        <div className="border-t border-zinc-800 pt-8">
          <h2 className="text-xl font-semibold text-zinc-200 mb-6">API Documentation</h2>

          {/* Endpoint */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-zinc-300 mb-4 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-zinc-500" />
              Chat Endpoint
            </h3>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-mono rounded">POST</span>
                <code className="text-sm text-zinc-300 font-mono">https://ai.swiftairecruit.com/api/chat</code>
              </div>
              <p className="text-sm text-zinc-400">
                Send messages to Moxie AI models. Supports streaming responses and vision models for image analysis.
              </p>
            </div>

            <h4 className="text-sm font-medium text-zinc-400 mb-3">Headers</h4>
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 mb-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-zinc-500 border-b border-zinc-800">
                    <th className="text-left py-2 font-medium">Header</th>
                    <th className="text-left py-2 font-medium">Required</th>
                    <th className="text-left py-2 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody className="text-zinc-400">
                  <tr className="border-b border-zinc-800/50">
                    <td className="py-2 font-mono text-zinc-300">Content-Type</td>
                    <td className="py-2">Yes</td>
                    <td className="py-2">application/json</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-mono text-zinc-300">x-api-key</td>
                    <td className="py-2">Yes</td>
                    <td className="py-2">Your API key from above</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h4 className="text-sm font-medium text-zinc-400 mb-3">Request Body</h4>
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 mb-4 overflow-x-auto">
              <pre className="text-sm text-zinc-300 font-mono">
{`{
  "model": "moxie-deepseek-v3",  // Model to use
  "messages": [                     // Conversation history
    { "role": "user", "content": "Hello!" }
  ],
  "stream": true,                  // Enable streaming (recommended)
  "image": null                    // Base64 image for vision models (optional)
}`}
              </pre>
            </div>

            <h4 className="text-sm font-medium text-zinc-400 mb-3">Example Request (cURL)</h4>
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 mb-4 overflow-x-auto">
              <pre className="text-sm text-zinc-300 font-mono">
{`curl -X POST https://ai.swiftairecruit.com/api/chat \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: moxie-xxxx-xxxx-xxxx-xxxx" \\
  -d '{
    "model": "moxie-deepseek-v3",
    "messages": [{"role": "user", "content": "Hello!"}],
    "stream": true
  }'`}
              </pre>
            </div>

            <h4 className="text-sm font-medium text-zinc-400 mb-3">Example Request (JavaScript)</h4>
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-zinc-300 font-mono">
{`const response = await fetch('https://ai.swiftairecruit.com/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'moxie-xxxx-xxxx-xxxx-xxxx'
  },
  body: JSON.stringify({
    model: 'moxie-deepseek-v3',
    messages: [{ role: 'user', content: 'Hello!' }],
    stream: true
  })
});

// Handle streaming response
const reader = response.body.getReader();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  // Process chunk
}`}
              </pre>
            </div>
          </div>

          {/* Available Models */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-zinc-300 mb-4 flex items-center gap-2">
              <Code className="w-5 h-5 text-zinc-500" />
              Available Models
            </h3>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-zinc-500 border-b border-zinc-800">
                    <th className="text-left py-2 font-medium">Model ID</th>
                    <th className="text-left py-2 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody className="text-zinc-400">
                  <tr className="border-b border-zinc-800/50">
                    <td className="py-2 font-mono text-zinc-300">moxie-deepseek-v3</td>
                    <td className="py-2">General purpose, good for coding</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-mono text-zinc-300">moxie-llama-vision</td>
                    <td className="py-2">Vision model for image analysis</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Stream Response Format */}
          <div>
            <h3 className="text-lg font-medium text-zinc-300 mb-4">Stream Response Format</h3>
            <p className="text-sm text-zinc-400 mb-3">
              When <code className="text-zinc-300">stream: true</code>, the API returns newline-delimited JSON (NDJSON).
              Each line is a JSON object:
            </p>
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-zinc-300 font-mono">
{`// Token chunk
{"token": "Hello", "done": false}

// Thinking/reasoning (from DeepSeek R1 models)
{"thinking": "Let me think about this...", "done": false}

// Final chunk
{"done": true, "model": "moxie-deepseek-v3", "eval_count": 150}`}
              </pre>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
