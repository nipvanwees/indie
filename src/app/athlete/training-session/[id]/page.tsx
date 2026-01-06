"use client";

import { useState } from "react";
import Link from "next/link";
import { use } from "react";
import { api } from "~/trpc/react";
import { Modal } from "~/components/ui/modal";
import { LogForm } from "~/components/athlete/log-form";

export default function TrainingSessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const { data: session, isLoading, error } = api.trainingSession.getById.useQuery(
    { id },
    { enabled: !!id },
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="text-white/60">Loading...</div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="w-full max-w-2xl space-y-4 rounded-lg bg-white/10 p-6 backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-white">Training Session Not Found</h2>
          <p className="text-white/60">
            {error?.message ?? "The training session you're looking for doesn't exist."}
          </p>
          <Link
            href="/athlete"
            className="inline-block rounded-md bg-[hsl(280,100%,70%)] px-4 py-2 text-sm font-medium text-white hover:bg-[hsl(280,100%,65%)]"
          >
            Back to Athlete Home
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (date: Date, includeTime: boolean) => {
    const d = new Date(date);
    if (includeTime) {
      return d.toLocaleString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-8 px-4 py-16">
        <div className="w-full max-w-3xl space-y-6">
          <div className="flex items-center justify-between">
            <Link
              href="/athlete"
              className="text-[hsl(280,100%,70%)] hover:text-[hsl(280,100%,80%)]"
            >
              ← Back to Athlete Home
            </Link>
          </div>

          <div className="rounded-lg bg-white/10 p-6 backdrop-blur-sm">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">{session.name}</h1>
                <p className="mt-2 text-white/60">
                  {formatDate(session.date, session.includeTime)}
                </p>
              </div>
              <div className="flex gap-2">
                {session.completed && (
                  <span className="rounded-full bg-green-500/20 px-3 py-1 text-sm text-green-200">
                    Completed
                  </span>
                )}
                <span className="rounded-full bg-[hsl(280,100%,70%)]/20 px-3 py-1 text-sm text-[hsl(280,100%,80%)]">
                  {session.type}
                </span>
              </div>
            </div>

            {session.location && (
              <div className="mb-4">
                <p className="text-sm text-white/60">Location:</p>
                <p className="text-white">{session.location.name}</p>
              </div>
            )}

            {session.notes && (
              <div className="mb-4">
                <p className="text-sm text-white/60">Notes:</p>
                <p className="whitespace-pre-wrap text-white">{session.notes}</p>
              </div>
            )}

            <div className="mt-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">
                  Logs ({session.logs.length})
                </h2>
                <button
                  onClick={() => setIsLogModalOpen(true)}
                  className="rounded-md bg-[hsl(280,100%,70%)] px-4 py-2 text-sm font-medium text-white hover:bg-[hsl(280,100%,65%)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[hsl(280,100%,70%)]"
                >
                  Add Log
                </button>
              </div>
              {session.logs.length === 0 ? (
                <p className="text-white/60">No logs for this training session yet.</p>
              ) : (
                <div className="space-y-2">
                  {session.logs.map((log) => (
                    <div
                      key={log.id}
                      className="rounded-md border border-white/20 bg-white/5 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-white">{log.exercise.name}</p>
                          <p className="text-sm text-white/60">
                            {new Date(log.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          {log.weight && <p className="text-white">{log.weight}kg</p>}
                          {log.reps && <p className="text-sm text-white/60">{log.reps} reps</p>}
                          {log.time && (
                            <p className="text-sm text-white/60">{log.time} seconds</p>
                          )}
                        </div>
                      </div>
                      {log.notes && (
                        <p className="mt-2 text-sm text-white/60">{log.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        title="Create Log"
      >
        <LogForm
          trainingSessionId={id}
          date={session.date}
          onSuccess={() => {
            setIsLogModalOpen(false);
          }}
        />
      </Modal>
    </div>
  );
}

