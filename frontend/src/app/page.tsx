"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Terminal, Eye, ShieldCheck, Zap, Cpu,
  ChevronRight, ArrowRight, Sparkles, Command,
  Code2, Fingerprint, Globe
} from 'lucide-react';

export default function MoxieLanding() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/chat");
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-[#000] text-zinc-400 selection:bg-white selection:text-black font-sans antialiased">
      
      {/* 1. MINIMAL NAV */}
      <nav className="fixed top-0 z-[100] w-full border-b border-zinc-900 bg-black/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image src="/icon.png" alt="Moxie Logo" width={28} height={28} className="brightness-110" />
            <span className="font-bold tracking-tight text-zinc-100 text-lg uppercase">Moxie</span>
            <div className="h-4 w-[1px] bg-zinc-800 mx-2" />
            <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-500 uppercase">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Systems Operational
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-[11px] font-medium uppercase tracking-widest">
            <Link href="/docs" className="hover:text-white transition-colors">Documentation</Link>
            <Link href="/about" className="hover:text-white transition-colors">Internal</Link>
            <Link href="/partners" className="hover:text-white transition-colors">Partners</Link>
            <div className="relative group flex items-center gap-1">
              <span className="text-zinc-700">Mobile</span>
              <div className="px-1 py-0.5 border border-zinc-800 text-[8px] text-zinc-600 rounded">BETA</div>
            </div>
          </div>

          <Link href="/chat" className="px-4 py-1.5 border border-zinc-800 hover:border-zinc-400 bg-white text-black text-[11px] font-bold uppercase transition-all">
            Enter Terminal
          </Link>
        </div>
      </nav>

      {/* 2. INDUSTRIAL HERO */}
      <section className="relative pt-40 pb-20 border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-zinc-100 leading-[0.95] mb-8">
              THE OPEN STANDARD <br />
              FOR MULTIMODAL AI.
            </h1>

            <p className="text-lg text-zinc-500 mb-12 leading-relaxed max-w-xl">
              Moxie is a high-performance intelligence layer built for engineering teams. Local inference, visual reasoning, and sub-second latency—<span className="text-white">completely free.</span>
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/chat" className="px-6 py-3 bg-white text-black text-xs font-bold uppercase flex items-center gap-2 hover:bg-zinc-200 transition-all">
                Get Started <ArrowRight size={14} />
              </Link>
              <Link href="/docs" className="px-6 py-3 border border-zinc-800 text-zinc-300 text-xs font-bold uppercase flex items-center gap-2 hover:bg-zinc-900 transition-all">
                Access Documentation
              </Link>
            </div>
          </div>
        </div>
        
        {/* Subtle Brand Accent (Bottom Right) */}
        <div className="absolute bottom-0 right-0 w-1/3 h-px bg-gradient-to-r from-transparent via-purple-500 to-cyan-500 opacity-30" />
      </section>

      {/* 3. CORE SPECS (DATA FOCUS) */}
      <section className="border-b border-zinc-900 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <div className="text-white font-mono text-sm mb-2">01 // VISION</div>
              <p className="text-xs leading-relaxed text-zinc-500">Native vision-language processing for UI debugging and technical asset analysis.</p>
            </div>
            <div>
              <div className="text-white font-mono text-sm mb-2">02 // PRIVACY</div>
              <p className="text-xs leading-relaxed text-zinc-500">Isolated local execution. No external training, no telemetry, no data leakage.</p>
            </div>
            <div>
              <div className="text-white font-mono text-sm mb-2">03 // COST</div>
              <p className="text-xs leading-relaxed text-zinc-500">Zero-cost infrastructure for the community. No credits or tokens required.</p>
            </div>
            <div>
              <div className="text-white font-mono text-sm mb-2">04 // STACK</div>
              <p className="text-xs leading-relaxed text-zinc-500">Optimized for Llama 4 and Qwen-VL architectures with custom optimization.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PARTNERS (MONOCHROME) */}
      <div className="py-16 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8 opacity-40 hover:opacity-80 transition-opacity">
          <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-zinc-600">A Proud Product of</span>
          <div className="flex items-center gap-16 grayscale">
            <Link href="/partners">
               <Image src="/devspace-icon.png" alt="DevSpace" width={140} height={35} className="hover:brightness-200 transition-all" />
            </Link>
            <Link href="/partners">
               <Image src="/swiftairecruit-icon.png" alt="SwiftAire Recruit" width={140} height={35} className="hover:brightness-200 transition-all" />
            </Link>
          </div>
        </div>
      </div>

      {/* 5. WORKBENCH SECTION */}
      <section className="py-24 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-zinc-950 border border-zinc-900 p-1 rounded-sm shadow-2xl">
            <div className="border border-zinc-800 bg-black">
              {/* Terminal Header */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-900">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-zinc-800" />
                  <div className="w-2 h-2 rounded-full bg-zinc-800" />
                  <div className="w-2 h-2 rounded-full bg-zinc-800" />
                </div>
                <div className="text-[10px] font-mono text-zinc-600">MOXIE-SHELL-V1.0</div>
              </div>
              <div className="p-8 grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <div className="inline-flex px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-500 text-[10px] font-bold uppercase">Multimodal</div>
                  <h3 className="text-3xl font-bold text-zinc-100 tracking-tight">Engineered for Technical Context.</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">
                    Paste error logs, upload terminal screenshots, or drop component files. Moxie synthesizes visual and textual data to provide precise engineering solutions.
                  </p>
                  <Link href="/chat" className="inline-flex items-center gap-2 text-zinc-100 text-xs font-bold uppercase group">
                    Launch Workbench <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
                <div className="bg-zinc-900/20 border border-zinc-800 p-6 rounded font-mono text-[11px] text-zinc-500">
                  <div className="mb-2 text-zinc-400 tracking-tighter uppercase font-bold text-[9px] border-b border-zinc-800 pb-2">Analysis Log</div>
                  <div className="flex gap-2 mb-2">
                    <span className="text-purple-500">[VISION]</span>
                    <span>Image input detected: .png (1.2mb)</span>
                  </div>
                  <div className="flex gap-2 mb-2 text-zinc-300">
                    <span className="text-cyan-500">{">"}</span>
                    <span>Scanning for Expo dependency conflicts...</span>
                  </div>
                  <div className="text-emerald-500 mt-4">MATCH FOUND: expo-router v3.5 conflict.</div>
                  <div className="mt-2 py-1 px-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 inline-block italic">
                    Resolution: Update @expo/config-plugins
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SYSTEM FOOTER */}
      <footer className="py-12 border-t border-zinc-900 bg-black">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-6">
            <Image src="/icon.png" alt="Logo" width={20} height={20} className="grayscale opacity-50" />
            <span className="text-[10px] font-bold tracking-[0.4em] text-zinc-700 uppercase">Moxie Engine // Distributed by DevSpace</span>
          </div>
          <div className="flex gap-10 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/security" className="hover:text-white transition-colors">Security</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Infrastructure</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

// if authenticated redirect to /chat