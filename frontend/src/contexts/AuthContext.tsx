"use client";

import { useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

const PUBLIC_PATHS = ["/", "/docs", "/auth/login", "/auth/signup"];

export function AuthProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Initialize auth listener
    const { initAuth } = require("@/stores/authStore");
    initAuth();
  }, []);

  return <>{children}</>;
}

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const initialized = useAuthStore((state) => state.initialized);
  const signInWithEmail = useAuthStore((state) => state.signInWithEmail);
  const signUpWithEmail = useAuthStore((state) => state.signUpWithEmail);
  const signInWithGoogle = useAuthStore((state) => state.signInWithGoogle);
  const signOut = useAuthStore((state) => state.signOut);

  return {
    user,
    loading,
    initialized,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
  };
}

export function useRequireAuth(redirectTo = "/auth/login") {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const initialized = useAuthStore((state) => state.initialized);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (initialized && !loading && !user && !PUBLIC_PATHS.includes(pathname)) {
      const encoded = encodeURIComponent(pathname);
      router.push(`${redirectTo}?redirect=${encoded}`);
    }
  }, [user, loading, initialized, pathname, redirectTo, router]);

  return { user, loading, initialized };
}

export function useAuthRedirect(targetPath = "/chat") {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const initialized = useAuthStore((state) => state.initialized);
  const router = useRouter();

  useEffect(() => {
    if (initialized && !loading && user) {
      router.replace(targetPath);
    }
  }, [user, loading, initialized, targetPath, router]);

  return { user, loading, initialized };
}
