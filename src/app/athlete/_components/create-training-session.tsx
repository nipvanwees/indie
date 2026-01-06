"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

export function CreateTrainingSession() {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [includeTime, setIncludeTime] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const utils = api.useUtils();
  const createTrainingSession = api.trainingSession.create.useMutation({
    onSuccess: () => {
      setSuccess(true);
      setName("");
      setDate("");
      setTime("");
      setIncludeTime(false);
      setError(null);
      void utils.trainingSession.invalidate();
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    },
    onError: (err) => {
      setError(err.message ?? "Failed to create training session");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    if (!date) {
      setError("Date is required");
      return;
    }

    // Combine date and time if time is included
    let dateTime: Date;
    if (includeTime && time) {
      const combinedDateTimeString = `${date}T${time}`;
      dateTime = new Date(combinedDateTimeString);
    } else {
      // If no time, use the date at midnight
      dateTime = new Date(date);
    }

    createTrainingSession.mutate({
      name: name.trim(),
      date: dateTime,
      includeTime: includeTime && !!time,
    });
  };

  return (
    <div className="w-full max-w-md space-y-4 rounded-lg bg-white/10 p-6 backdrop-blur-sm">
      <h2 className="text-2xl font-bold text-white">Create Training Session</h2>
      
      {error && (
        <div className="rounded-md bg-red-500/20 p-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-500/20 p-3 text-sm text-green-200">
          Training session created successfully!
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-white/80 mb-1">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="relative block w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-white/50 focus:z-10 focus:border-[hsl(280,100%,70%)] focus:outline-none focus:ring-2 focus:ring-[hsl(280,100%,70%)]"
            placeholder="Training session name"
          />
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-white/80 mb-1">
            Date
          </label>
          <input
            id="date"
            name="date"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="relative block w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-white/50 focus:z-10 focus:border-[hsl(280,100%,70%)] focus:outline-none focus:ring-2 focus:ring-[hsl(280,100%,70%)]"
          />
        </div>

        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={includeTime}
              onChange={(e) => {
                setIncludeTime(e.target.checked);
                if (!e.target.checked) {
                  setTime("");
                }
              }}
              className="h-4 w-4 rounded border-white/20 bg-white/10 text-[hsl(280,100%,70%)] focus:ring-2 focus:ring-[hsl(280,100%,70%)]"
            />
            <span className="text-sm font-medium text-white/80">
              Include time
            </span>
          </label>
        </div>

        {includeTime && (
          <div>
            <label htmlFor="time" className="block text-sm font-medium text-white/80 mb-1">
              Time (optional)
            </label>
            <input
              id="time"
              name="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="relative block w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-white/50 focus:z-10 focus:border-[hsl(280,100%,70%)] focus:outline-none focus:ring-2 focus:ring-[hsl(280,100%,70%)]"
            />
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={createTrainingSession.isPending}
            className="group relative flex w-full justify-center rounded-md border border-transparent bg-[hsl(280,100%,70%)] px-4 py-2 text-sm font-medium text-white hover:bg-[hsl(280,100%,65%)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[hsl(280,100%,70%)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {createTrainingSession.isPending ? "Creating..." : "Create Training Session"}
          </button>
        </div>
      </form>
    </div>
  );
}

