"use client";

import { api } from "~/trpc/react";
import { Badge } from "~/app/_components/ui/badge";
import { Text } from "~/app/_components/ui/text";

export const PlanExistingWorkout = ({
  selectedWorkoutId,
  onSelectWorkout,
}: {
  selectedWorkoutId: string | null;
  onSelectWorkout: (workoutId: string | null) => void;
}) => {
  const { data: workouts, isLoading } = api.workoutPlan.getAll.useQuery();

  if (isLoading) {
    return (
      <div className="py-4">
        <Text className="text-sm text-gray-500">Loading workouts...</Text>
      </div>
    );
  }

  if (!workouts || workouts.length === 0) {
    return (
      <div className="py-4">
        <Text className="text-sm text-gray-500">
          No workouts found. Create a new workout first.
        </Text>
      </div>
    );
  }

  const formatDate = (date: Date | null, includeTime: boolean) => {
    if (!date) return "No date";
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
    <div className="space-y-2">
      {workouts.map((workout) => (
        <div
          key={workout.id}
          onClick={() => onSelectWorkout(selectedWorkoutId === workout.id ? null : workout.id)}
          className={`rounded-md border p-4 transition cursor-pointer ${
            selectedWorkoutId === workout.id
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200 bg-white hover:bg-gray-50"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{workout.name}</h3>
              <div className="mt-1 flex items-center gap-2">
                {workout.date && (
                  <Text className="text-xs text-gray-500">
                    {formatDate(workout.date, workout.includeTime)}
                  </Text>
                )}
                {workout.location && (
                  <Text className="text-xs text-gray-500">
                    • {workout.location.name}
                  </Text>
                )}
              </div>
              {workout.notes && (
                <Text className="mt-1 text-xs text-gray-600">{workout.notes}</Text>
              )}
            </div>
            <div className="flex items-center gap-2">
              {workout.completed && (
                <Badge color="green" className="text-xs">
                  Completed
                </Badge>
              )}
              <Badge color="blue" className="text-xs">
                {workout.type}
              </Badge>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

