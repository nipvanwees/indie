"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";

interface LogFormProps {
  exerciseId?: string;
  trainingSessionId?: string;
  date?: Date;
  onSuccess?: () => void;
}

export function LogForm({
  exerciseId: initialExerciseId,
  trainingSessionId,
  date,
  onSuccess,
}: LogFormProps) {
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>(
    initialExerciseId ?? "",
  );
  const [reps, setReps] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { data: exercises, isLoading: exercisesLoading } =
    api.exercise.getAll.useQuery();

  const utils = api.useUtils();
  const createLog = api.log.create.useMutation({
    onSuccess: () => {
      setSuccess(true);
      setReps("");
      setWeight("");
      setError(null);
      if (!initialExerciseId) {
        setSelectedExerciseId("");
      }
      void utils.log.invalidate();
      if (trainingSessionId) {
        void utils.trainingSession.invalidate();
      }
      onSuccess?.();
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    },
    onError: (err) => {
      setError(err.message ?? "Failed to create log");
    },
  });

  // Update selected exercise when prop changes
  useEffect(() => {
    if (initialExerciseId) {
      setSelectedExerciseId(initialExerciseId);
    }
  }, [initialExerciseId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!selectedExerciseId) {
      setError("Please select an exercise");
      return;
    }

    if (!reps.trim() && !weight.trim()) {
      setError("Please enter at least reps or weight");
      return;
    }

    const repsNum = reps.trim() ? parseInt(reps.trim(), 10) : undefined;
    const weightNum = weight.trim() ? parseInt(weight.trim(), 10) : undefined;

    if (repsNum !== undefined && (isNaN(repsNum) || repsNum <= 0)) {
      setError("Reps must be a positive number");
      return;
    }

    if (weightNum !== undefined && (isNaN(weightNum) || weightNum <= 0)) {
      setError("Weight must be a positive number");
      return;
    }

    createLog.mutate({
      exerciseId: selectedExerciseId,
      reps: repsNum,
      weight: weightNum,
      date: date,
      trainingSessionId: trainingSessionId,
    });
  };

  const selectedExercise = exercises?.find((e) => e.id === selectedExerciseId);

  return (
    <div className="w-full space-y-4">

      {error && (
        <div className="rounded-md bg-red-500/20 p-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-500/20 p-3 text-sm text-green-200">
          Log created successfully!
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="exercise"
            className="block text-sm font-medium text-white/80 mb-1"
          >
            Exercise {!initialExerciseId && <span className="text-red-400">*</span>}
          </label>
          <select
            id="exercise"
            name="exercise"
            required={!initialExerciseId}
            disabled={!!initialExerciseId || exercisesLoading}
            value={selectedExerciseId}
            onChange={(e) => setSelectedExerciseId(e.target.value)}
            className="relative block w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-white/50 focus:z-10 focus:border-[hsl(280,100%,70%)] focus:outline-none focus:ring-2 focus:ring-[hsl(280,100%,70%)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">
              {exercisesLoading ? "Loading exercises..." : "Select an exercise"}
            </option>
            {exercises?.map((exercise) => (
              <option key={exercise.id} value={exercise.id}>
                {exercise.name}
              </option>
            ))}
          </select>
        </div>

        {selectedExerciseId && (
          <>
            <div>
              <label
                htmlFor="reps"
                className="block text-sm font-medium text-white/80 mb-1"
              >
                Reps
              </label>
              <input
                id="reps"
                name="reps"
                type="number"
                min="1"
                step="1"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                className="relative block w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-white/50 focus:z-10 focus:border-[hsl(280,100%,70%)] focus:outline-none focus:ring-2 focus:ring-[hsl(280,100%,70%)]"
                placeholder="Enter number of reps"
              />
            </div>

            <div>
              <label
                htmlFor="weight"
                className="block text-sm font-medium text-white/80 mb-1"
              >
                Weight (kg)
              </label>
              <input
                id="weight"
                name="weight"
                type="number"
                min="1"
                step="0.5"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="relative block w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-white/50 focus:z-10 focus:border-[hsl(280,100%,70%)] focus:outline-none focus:ring-2 focus:ring-[hsl(280,100%,70%)]"
                placeholder="Enter weight in kg"
              />
            </div>
          </>
        )}

        {selectedExerciseId && (
          <div>
            <button
              type="submit"
              disabled={createLog.isPending}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-[hsl(280,100%,70%)] px-4 py-2 text-sm font-medium text-white hover:bg-[hsl(280,100%,65%)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[hsl(280,100%,70%)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {createLog.isPending ? "Creating..." : "Create Log"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

