"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ChatHome() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/chat/new");
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen bg-[#0a0a0b]">
      <div className="animate-pulse text-zinc-500 text-sm">Loading...</div>
    </div>
  );
}
