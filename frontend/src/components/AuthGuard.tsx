"use client";

import { useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

const PUBLIC_PATHS = ["/", "/docs", "/auth/login", "/auth/signup"];

interface AuthGuardProps {
  children: ReactNode;
  fallbackPath?: string;
}

export function AuthGuard({ children, fallbackPath = "/auth/login" }: AuthGuardProps) {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const initialized = useAuthStore((state) => state.initialized);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (initialized && !loading && !user && !PUBLIC_PATHS.includes(pathname)) {
      const redirectUrl = `${fallbackPath}?redirect=${encodeURIComponent(pathname)}`;
      router.push(redirectUrl);
    }
  }, [user, loading, initialized, pathname, fallbackPath, router]);

  // Show loading state while checking auth
  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-zinc-600 border-t-zinc-300 rounded-full animate-spin" />
          <p className="text-zinc-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated and not on public path, show nothing (redirecting)
  if (!user && !PUBLIC_PATHS.includes(pathname)) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-zinc-600 border-t-zinc-300 rounded-full animate-spin" />
          <p className="text-zinc-500 text-sm">Redirecting...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
