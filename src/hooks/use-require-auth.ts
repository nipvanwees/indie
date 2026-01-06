"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "~/server/better-auth/client";

/**
 * Client-side hook that redirects to /login if user is not authenticated
 * @returns The session object if authenticated, null otherwise, and loading state
 */
export function useRequireAuth() {
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

  return { session, isPending: isLoading };
}

