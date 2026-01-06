"use client";

import Link from "next/link";
import { api } from "~/trpc/react";

export function UserInfo() {
  const { data: user, isLoading, error } = api.user.getCurrent.useQuery();

  if (isLoading) {
    return <p className="text-center text-2xl text-white">Loading user...</p>;
  }

  if (error) {
    return (
      <p className="text-center text-2xl text-red-500">
        Error: {error.message}
      </p>
    );
  }

  if (!user) {
    return <p className="text-center text-2xl text-white">No user data</p>;
  }

  return (
    <div className="flex flex-col items-center gap-2">
        {user.athlete && <p className="text-center text-2xl text-white">
            <Link href="/athlete">Athlete</Link>
            </p>}
        {user.trainer && <p className="text-center text-2xl text-white">
            <Link href="/trainer">Trainer</Link>
            </p>}
 

    </div>
  );
}

