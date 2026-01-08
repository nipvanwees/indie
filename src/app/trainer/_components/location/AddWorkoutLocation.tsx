import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "~/trpc/react";

export const AddWorkoutLocation = ({ id }: { id: string }) => {
  const { data: locations, isLoading } = api.location.getAll.useQuery();

  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  const connectToWorkoutMutation = api.location.connectToWorkout.useMutation();

  const connectToWorkout = (locationId: string) => {
    connectToWorkoutMutation.mutate({
      workoutId: id,
      locationId: locationId,
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex gap-2">
      <select
        className="w-1/2"
        value={selectedLocation ? selectedLocation : undefined}
        onChange={(e) => setSelectedLocation(e.target.value)}
      >
        <option value="">Select a location</option>
        {locations?.map((location) => (
          <option key={location.id} value={location.id}>
            {location.name}
          </option>
        ))}
      </select>

      <button
        className="btn btn-primary"
        disabled={!selectedLocation}
        onClick={() => {
          if (selectedLocation) {
            connectToWorkout(selectedLocation);
          }
        }}
      >
        Connect
      </button>
    </div>
  );
};
