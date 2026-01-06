import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { UserInfo } from "~/app/_components/user-info";
import { auth } from "~/server/better-auth";
import { getSession } from "~/server/better-auth/server";
import { HydrateClient } from "~/trpc/server";

export default async function Home() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  console.log(session);

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
  
          </div>
          <div className="flex flex-col items-center gap-2">
            <UserInfo />
            <div className="flex flex-col items-center justify-center gap-4">
              {!session ? (
                <form>
                  LOG IN CUNT
          
                </form>
              ) : (
                <form>
                  <button
                    className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
                    formAction={async () => {
                      "use server";
                      await auth.api.signOut({
                        headers: await headers(),
                      });
                      redirect("/login");
                    }}
                  >
                    Sign out
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </main>
    </HydrateClient>
  );
}
