"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "~/server/better-auth/client";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Client-side authentication guard component
 * Redirects to /login if user is not authenticated
 */
export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const router = useRouter();
  const [session, setSession] = useState<typeof authClient.$Infer.Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const currentSession = await authClient.getSession();
        setSession(currentSession.data ?? null);
        
        if (!currentSession.data) {
          router.push("/login");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    }

    void checkAuth();
  }, [router]);

  // Show fallback or nothing while checking
  if (isLoading) {
    return fallback ?? <div>Loading...</div>;
  }

  // If not authenticated, don't render children (redirect will happen)
  if (!session) {
    return fallback ?? null;
  }

  // User is authenticated, render children
  return <>{children}</>;
}

