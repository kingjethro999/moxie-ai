'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Terminal, Code2, Globe, Cpu, 
  Lock, Zap, ChevronRight, Copy,
  Layers, Braces
} from 'lucide-react';

function ApiEndpointExample() {
  const [baseUrl, setBaseUrl] = useState('/api/chat');

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  return (
    <code className="block leading-relaxed">
      <span className="text-emerald-500">curl</span> -X POST {baseUrl}/api/chat \<br />
      &nbsp;&nbsp;-H <span className="text-purple-400">"Content-Type: application/json"</span> \<br />
      &nbsp;&nbsp;-H <span className="text-purple-400">"x-api-key: moxie-your-key-here"</span> \<br />
      &nbsp;&nbsp;-d '<span className="text-zinc-200">{"{"}</span><br />
      &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-zinc-200">"model":</span> <span className="text-emerald-400">"moxie-deepseek-v3"</span>,<br />
      &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-zinc-200">"messages": [</span><br />
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-zinc-200">{"{"} "role": "user", "content": "Fix my package.json" {"}"}</span><br />
      &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-zinc-200">],</span><br />
      &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-zinc-200">"stream":</span> <span className="text-emerald-400">false</span><br />
      &nbsp;&nbsp;<span className="text-zinc-200">{"}"}</span>'
    </code>
  );
}

export default function MoxieDocs() {
  return (
    <div className="min-h-screen bg-[#000] text-zinc-400 selection:bg-white selection:text-black font-sans antialiased">
      
      {/* 1. DOCUMENTATION HEADER */}
      <header className="border-b border-zinc-900 bg-black/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img src="/icon.png" alt="Moxie" className="w-6 h-6 grayscale brightness-150" />
              <span className="font-bold tracking-tighter text-zinc-100 text-lg uppercase">Moxie // Docs</span>
            </Link>
          </div>
          <div className="flex items-center gap-6 text-[10px] font-mono font-bold tracking-widest text-zinc-500">
            <span className="text-emerald-500">M.1 STABLE</span>
            <Link href="/chat" className="text-zinc-100 hover:text-white transition-colors uppercase">Open Terminal</Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12 grid lg:grid-cols-[240px_1fr] gap-12">
        
        {/* 2. SIDEBAR NAVIGATION */}
        <aside className="hidden lg:block space-y-8 sticky top-28 h-fit">
          <div>
            <h4 className="text-[10px] font-bold text-zinc-100 uppercase tracking-[0.2em] mb-4">Introduction</h4>
            <ul className="space-y-2 text-xs font-medium">
              <li><Link href="#overview" className="text-emerald-500">Overview</Link></li>
              <li><Link href="#auth" className="hover:text-white transition-colors">Authentication</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] font-bold text-zinc-100 uppercase tracking-[0.2em] mb-4">Core API</h4>
            <ul className="space-y-2 text-xs font-medium">
              <li><Link href="#endpoint" className="hover:text-white transition-colors">Endpoints</Link></li>
              <li><Link href="#models" className="hover:text-white transition-colors">Model Selection</Link></li>
              <li><Link href="#streaming" className="hover:text-white transition-colors">Streaming Results</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] font-bold text-zinc-100 uppercase tracking-[0.2em] mb-4">Guides</h4>
            <ul className="space-y-2 text-xs font-medium">
              <li><Link href="#vision" className="hover:text-white transition-colors">Visual Debugging</Link></li>
            </ul>
          </div>
        </aside>

        {/* 3. MAIN CONTENT */}
        <main className="space-y-20 pb-32">
          
          {/* Overview Section */}
          <section id="overview" className="space-y-6">
            <h2 className="text-3xl font-bold text-zinc-100 tracking-tight">Overview</h2>
            <p className="text-sm leading-relaxed max-w-2xl">
              Moxie provides a high-performance REST API for interacting with our local multimodal models. 
              Our infrastructure supports standard chat completions with native vision capabilities, 
              offered entirely for free via the <span className="text-white">DevSpace</span> cluster.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <div className="p-4 border border-zinc-900 bg-zinc-950/50 rounded flex gap-4 items-start">
                <Globe size={18} className="text-emerald-500 mt-1" />
                <div>
                  <div className="text-xs font-bold text-white uppercase mb-1">Base URL</div>
                  <code className="text-[10px] font-mono text-zinc-400">/api/chat</code>
                </div>
              </div>
              <div className="p-4 border border-zinc-900 bg-zinc-950/50 rounded flex gap-4 items-start">
                <Lock size={18} className="text-purple-500 mt-1" />
                <div>
                  <div className="text-xs font-bold text-white uppercase mb-1">Authentication</div>
                  <code className="text-[10px] font-mono text-zinc-400">x-api-key header</code>
                </div>
              </div>
            </div>
          </section>

          {/* Model Selection Section */}
          <section id="models" className="space-y-6">
            <h2 className="text-3xl font-bold text-zinc-100 tracking-tight">Model Selection</h2>
            <p className="text-sm leading-relaxed">
              Moxie allows you to specify the inference engine based on your specific task requirements.
            </p>
            <div className="overflow-hidden border border-zinc-900 rounded">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-zinc-900 text-zinc-500 uppercase text-[9px] tracking-widest">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Architecture</th>
                    <th className="px-4 py-3">Best For</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  <tr className="hover:bg-zinc-950 transition-colors">
                    <td className="px-4 py-4 text-emerald-500">moxie-qwen-vl</td>
                    <td className="px-4 py-4 italic">Qwen 2.5 (Multimodal)</td>
                    <td className="px-4 py-4 text-zinc-500">Vision, UI Debugging, Complex Logic</td>
                  </tr>
                  <tr className="hover:bg-zinc-950 transition-colors">
                    <td className="px-4 py-4 text-purple-500">moxie-deepseek-v3</td>
                    <td className="px-4 py-4 italic">DeepSeek V3 (MoE)</td>
                    <td className="px-4 py-4 text-zinc-500">Fast Coding, Math, Documentation Research</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* API Usage Section */}
          <section id="endpoint" className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-zinc-100 tracking-tight">Chat Completions</h2>
              <p className="text-sm leading-relaxed">
                Send a POST request to the completions endpoint to generate a response.
              </p>
            </div>

            <div className="bg-zinc-950 border border-zinc-900 rounded-sm overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-900 bg-zinc-900/30">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-500 text-black rounded">POST</span>
                  <code className="text-[11px] font-mono text-zinc-300">/api/chat</code>
                </div>
                <button className="text-zinc-600 hover:text-white"><Copy size={14} /></button>
              </div>
              
              <div className="p-6">
                <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Request Body</h4>
                <pre className="text-[11px] font-mono text-zinc-300 leading-6 bg-black p-4 border border-zinc-900 rounded">
{`{
  "model": "moxie-qwen-vl",
  "messages": [
    {
      "role": "user",
      "content": "Analyze this Expo dependency error."
    }
  ],
  "stream": true,
  "image": "optional_base64_string"
}`}
                </pre>
              </div>
            </div>
          </section>

          {/* API Example (cURL) */}
          <section id="example" className="space-y-6">
            <h3 className="text-xl font-bold text-zinc-100 italic tracking-tight">CURL EXAMPLE</h3>
            <div className="bg-zinc-950 border border-zinc-800 p-6 rounded font-mono text-[11px] text-zinc-400 relative group">
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[8px] bg-zinc-800 px-2 py-1 rounded border border-zinc-700">SHELL</span>
              </div>
              <ApiEndpointExample />
            </div>
          </section>

          {/* Visual Capabilities Section */}
          <section id="vision" className="space-y-6 border-t border-zinc-900 pt-20">
            <h2 className="text-3xl font-bold text-zinc-100 tracking-tight">Vision Processing</h2>
            <p className="text-sm leading-relaxed text-zinc-500 max-w-xl">
              To process visual data, encode your image as a Base64 string and include it in the message content using the standard multimodal format.
            </p>
            <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-sm">
               <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-bold uppercase mb-2">
                 <Zap size={12} /> Pro Tip
               </div>
               <p className="text-xs text-zinc-400 font-medium">Use <code className="text-emerald-400">moxie-qwen-vl</code> for higher precision in OCR (reading error logs) and object detection in technical screenshots.</p>
            </div>
          </section>

        </main>
      </div>

      {/* 4. DOCS FOOTER */}
      <footer className="py-20 border-t border-zinc-900 bg-black">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-[10px] font-bold text-zinc-700 tracking-[0.5em] uppercase mb-4">
            Moxie Engine // Technical Documentation
          </p>
          <div className="flex justify-center gap-8 text-[10px] font-mono text-zinc-500">
            <span>© 2026 DevSpace</span>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/chat" className="hover:text-white transition-colors underline underline-offset-4 decoration-emerald-500/30">Back to Workbench</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

// display browser current link before the /api/chat, i know it would be [domain]/docs page we are in right , but i want you to fetch [domain]link only and add to the /api/chat