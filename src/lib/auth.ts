import { redirect } from "next/navigation";
import { getSession } from "~/server/better-auth/server";

/**
 * Check if user is authenticated
 * @returns Session object if authenticated, null otherwise
 */
export async function requireAuth() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

/**
 * Check if user is authenticated (non-redirecting version)
 * @returns Session object if authenticated, null otherwise
 */
export async function checkAuth() {
  return await getSession();
}

