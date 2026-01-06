"use client";

import { useState, useEffect, useMemo } from "react";
import { api } from "~/trpc/react";
import { parseLogInput, type ParsedLogInput } from "./log-form-parser";
import { Combobox, type ComboboxOption } from "~/components/ui/combobox";

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
  const [smartInput, setSmartInput] = useState<string>("");
  const [reps, setReps] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [rpe, setRpe] = useState<string>("");
  const [repType, setRepType] = useState<string>("REPS");
  const [time, setTime] = useState<string>("");
  const [distance, setDistance] = useState<string>("");
  const [calories, setCalories] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Parse smart input in real-time
  const parsed: ParsedLogInput = useMemo(() => {
    return parseLogInput(smartInput);
  }, [smartInput]);

  // Update form fields when parsed values change
  useEffect(() => {
    if (parsed.reps !== undefined) {
      setReps(parsed.reps.toString());
    }
    if (parsed.weight !== undefined) {
      setWeight(parsed.weight.toString());
    }
    if (parsed.rpe !== undefined) {
      setRpe(parsed.rpe.toString());
    }
    if (parsed.repType) {
      setRepType(parsed.repType);
    }
    if (parsed.time !== undefined) {
      setTime(parsed.time.toString());
    }
    if (parsed.distance !== undefined) {
      setDistance(parsed.distance.toString());
    }
    if (parsed.calories !== undefined) {
      setCalories(parsed.calories.toString());
    }
  }, [parsed]);

  const { data: exercises, isLoading: exercisesLoading } =
    api.exercise.getAll.useQuery();

  const utils = api.useUtils();
  const createLog = api.log.create.useMutation({
    onSuccess: () => {
      setSuccess(true);
      setSmartInput("");
      setReps("");
      setWeight("");
      setRpe("");
      setRepType("REPS");
      setTime("");
      setDistance("");
      setCalories("");
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

    // Use parsed values from smart input, or fall back to manual inputs
    const repsNum =
      parsed.reps ??
      (reps.trim() ? parseInt(reps.trim(), 10) : undefined);

    const weightNum =
      parsed.weight ??
      (weight.trim() ? parseInt(weight.trim(), 10) : undefined);

    const rpeNum =
      parsed.rpe ??
      (rpe.trim() ? parseInt(rpe.trim(), 10) : undefined);

    const timeNum =
      parsed.time ??
      (time.trim() ? parseInt(time.trim(), 10) : undefined);

    const distanceNum =
      parsed.distance ??
      (distance.trim() ? parseFloat(distance.trim()) : undefined);

    const caloriesNum =
      parsed.calories ??
      (calories.trim() ? parseInt(calories.trim(), 10) : undefined);

    const finalRepType = parsed.repType || repType;

    // Validate that at least one value is provided
    if (
      !repsNum &&
      !weightNum &&
      !timeNum &&
      !distanceNum &&
      !caloriesNum &&
      !smartInput.trim()
    ) {
      setError("Please enter at least one metric (reps, weight, time, distance, or calories)");
      return;
    }

    createLog.mutate({
      exerciseId: selectedExerciseId,
      repType: finalRepType as "REPS" | "TIME" | "METERS" | "CALORIES",
      reps: repsNum,
      time: timeNum,
      distance: distanceNum,
      calories: caloriesNum,
      weight: weightNum,
      rpe: rpeNum,
      date: date,
      trainingSessionId: trainingSessionId,
    });
  };

  // Convert exercises to combobox options
  const exerciseOptions: ComboboxOption[] = useMemo(() => {
    if (!exercises) return [];
    return exercises.map((exercise) => ({
      value: exercise.id,
      label: exercise.name,
    }));
  }, [exercises]);

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
          <Combobox
            options={exerciseOptions}
            value={selectedExerciseId}
            onChange={setSelectedExerciseId}
            placeholder={exercisesLoading ? "Loading exercises..." : "Select or type to search for an exercise"}
            disabled={!!initialExerciseId || exercisesLoading}
            required={!initialExerciseId}
            autoFocus={!initialExerciseId}
          />
        </div>

        {selectedExerciseId && (
          <>
            <div>
              <label
                htmlFor="smartInput"
                className="block text-sm font-medium text-white/80 mb-1"
              >
                Smart Input{" "}
                <span className="text-xs text-white/50">
                  (e.g., &quot;10m 205kg @7&quot; or &quot;10 reps 100kg&quot;)
                </span>
              </label>
              <input
                id="smartInput"
                name="smartInput"
                type="text"
                value={smartInput}
                onChange={(e) => setSmartInput(e.target.value)}
                className="relative block w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-white/50 focus:z-10 focus:border-[hsl(280,100%,70%)] focus:outline-none focus:ring-2 focus:ring-[hsl(280,100%,70%)]"
                placeholder='Try: &quot;10m 205kg @7&quot; or &quot;10 100kg&quot; or &quot;30s @8&quot;'
              />
              {smartInput && (
                <p className="mt-1 text-xs text-white/60">
                  Parsed: {repType}
                  {parsed.reps !== undefined && ` | Reps: ${parsed.reps}`}
                  {parsed.time !== undefined && ` | Time: ${parsed.time}s`}
                  {parsed.distance !== undefined && ` | Distance: ${parsed.distance}m`}
                  {parsed.calories !== undefined && ` | Calories: ${parsed.calories}`}
                  {parsed.weight !== undefined && ` | Weight: ${parsed.weight}kg`}
                  {parsed.rpe !== undefined && ` | RPE: ${parsed.rpe}`}
                </p>
              )}
            </div>

            <div className="rounded-md border border-white/10 bg-white/5 p-4">
              <p className="mb-3 text-sm font-medium text-white/80">
                Interpreted Values (editable):
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="repType"
                    className="block text-xs font-medium text-white/60 mb-1"
                  >
                    Rep Type
                  </label>
                  <select
                    id="repType"
                    name="repType"
                    value={repType}
                    onChange={(e) => setRepType(e.target.value)}
                    className="relative block w-full rounded-md border border-white/20 bg-white/10 px-2 py-1.5 text-sm text-white focus:z-10 focus:border-[hsl(280,100%,70%)] focus:outline-none focus:ring-2 focus:ring-[hsl(280,100%,70%)]"
                  >
                    <option value="REPS">REPS</option>
                    <option value="TIME">TIME</option>
                    <option value="METERS">METERS</option>
                    <option value="CALORIES">CALORIES</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="rpe"
                    className="block text-xs font-medium text-white/60 mb-1"
                  >
                    RPE
                  </label>
                  <input
                    id="rpe"
                    name="rpe"
                    type="number"
                    min="1"
                    max="10"
                    step="1"
                    value={rpe}
                    onChange={(e) => setRpe(e.target.value)}
                    className="relative block w-full rounded-md border border-white/20 bg-white/10 px-2 py-1.5 text-sm text-white placeholder-white/50 focus:z-10 focus:border-[hsl(280,100%,70%)] focus:outline-none focus:ring-2 focus:ring-[hsl(280,100%,70%)]"
                    placeholder="1-10"
                  />
                </div>

                {repType === "REPS" && (
                  <div>
                    <label
                      htmlFor="reps"
                      className="block text-xs font-medium text-white/60 mb-1"
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
                      className="relative block w-full rounded-md border border-white/20 bg-white/10 px-2 py-1.5 text-sm text-white placeholder-white/50 focus:z-10 focus:border-[hsl(280,100%,70%)] focus:outline-none focus:ring-2 focus:ring-[hsl(280,100%,70%)]"
                      placeholder="Number"
                    />
                  </div>
                )}

                {repType === "TIME" && (
                  <div>
                    <label
                      htmlFor="time"
                      className="block text-xs font-medium text-white/60 mb-1"
                    >
                      Time (seconds)
                    </label>
                    <input
                      id="time"
                      name="time"
                      type="number"
                      min="1"
                      step="1"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="relative block w-full rounded-md border border-white/20 bg-white/10 px-2 py-1.5 text-sm text-white placeholder-white/50 focus:z-10 focus:border-[hsl(280,100%,70%)] focus:outline-none focus:ring-2 focus:ring-[hsl(280,100%,70%)]"
                      placeholder="Seconds"
                    />
                  </div>
                )}

                {repType === "METERS" && (
                  <div>
                    <label
                      htmlFor="distance"
                      className="block text-xs font-medium text-white/60 mb-1"
                    >
                      Distance (meters)
                    </label>
                    <input
                      id="distance"
                      name="distance"
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={distance}
                      onChange={(e) => setDistance(e.target.value)}
                      className="relative block w-full rounded-md border border-white/20 bg-white/10 px-2 py-1.5 text-sm text-white placeholder-white/50 focus:z-10 focus:border-[hsl(280,100%,70%)] focus:outline-none focus:ring-2 focus:ring-[hsl(280,100%,70%)]"
                      placeholder="Meters"
                    />
                  </div>
                )}

                {repType === "CALORIES" && (
                  <div>
                    <label
                      htmlFor="calories"
                      className="block text-xs font-medium text-white/60 mb-1"
                    >
                      Calories
                    </label>
                    <input
                      id="calories"
                      name="calories"
                      type="number"
                      min="1"
                      step="1"
                      value={calories}
                      onChange={(e) => setCalories(e.target.value)}
                      className="relative block w-full rounded-md border border-white/20 bg-white/10 px-2 py-1.5 text-sm text-white placeholder-white/50 focus:z-10 focus:border-[hsl(280,100%,70%)] focus:outline-none focus:ring-2 focus:ring-[hsl(280,100%,70%)]"
                      placeholder="Calories"
                    />
                  </div>
                )}

                <div>
                  <label
                    htmlFor="weight"
                    className="block text-xs font-medium text-white/60 mb-1"
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
                    className="relative block w-full rounded-md border border-white/20 bg-white/10 px-2 py-1.5 text-sm text-white placeholder-white/50 focus:z-10 focus:border-[hsl(280,100%,70%)] focus:outline-none focus:ring-2 focus:ring-[hsl(280,100%,70%)]"
                    placeholder="kg"
                  />
                </div>
              </div>
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

