"use client";

import Link from "next/link";
import { api } from "~/trpc/react";

export function TrainingSessionsList() {
  const { data: sessions, isLoading } = api.trainingSession.getLatest.useQuery();

  if (isLoading) {
    return (
      <div className="w-full max-w-2xl space-y-4 rounded-lg bg-white/10 p-6 backdrop-blur-sm">
        <h2 className="text-2xl font-bold text-white">Latest Training Sessions</h2>
        <div className="text-white/60">Loading...</div>
      </div>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <div className="w-full max-w-2xl space-y-4 rounded-lg bg-white/10 p-6 backdrop-blur-sm">
        <h2 className="text-2xl font-bold text-white">Latest Training Sessions</h2>
        <div className="text-white/60">No training sessions yet. Create your first one above!</div>
      </div>
    );
  }

  const formatDate = (date: Date, includeTime: boolean) => {
    const d = new Date(date);
    if (includeTime) {
      return d.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="w-full max-w-2xl space-y-4 rounded-lg bg-white/10 p-6 backdrop-blur-sm">
      <h2 className="text-2xl font-bold text-white">Latest Training Sessions</h2>
      <div className="space-y-2">
        {sessions.map((session) => (
          <Link
            key={session.id}
            href={`/athlete/training-session/${session.id}`}
            className="block rounded-md border border-white/20 bg-white/5 p-4 transition hover:bg-white/10 hover:border-[hsl(280,100%,70%)]"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-white">{session.name}</h3>
                <p className="text-sm text-white/60">
                  {formatDate(session.date, session.includeTime)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {session.completed && (
                  <span className="rounded-full bg-green-500/20 px-2 py-1 text-xs text-green-200">
                    Completed
                  </span>
                )}
                <span className="rounded-full bg-[hsl(280,100%,70%)]/20 px-2 py-1 text-xs text-[hsl(280,100%,80%)]">
                  {session.type}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

