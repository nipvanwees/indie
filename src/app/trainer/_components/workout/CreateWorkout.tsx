import { WorkoutType } from "@prisma/client";
import { useState } from "react";
import { api } from "~/trpc/react";
import toLocalDateTime from "~/utils/toLocalDateTime";
import { SelectLocation } from "../location/SelectLocation";
import {
  Description,
  Field,
  FieldGroup,
  Fieldset,
  Label,
  Legend,
} from "~/app/_components/ui/fieldset";
import { Input } from "~/app/_components/ui/input";
import { Button } from "~/app/_components/ui/button";
import { Select } from "~/app/_components/ui/select";
import { Checkbox, CheckboxField } from "~/app/_components/ui/checkbox";
import { Divider } from "~/app/_components/ui/divider";
import { PlanExistingWorkout } from "./PlanExistingWorkout";

export const CreateWorkout = ({ defaultDate }: { defaultDate?: Date }) => {
  const utils = api.useUtils();

  const createWorkoutMutation = api.workoutPlan.create.useMutation({
    onSuccess: async () => {
      await utils.workoutPlan.getAll.invalidate();
      await utils.workoutPlanning.getAll.invalidate();
      await utils.workoutPlanning.getPersonal.invalidate();
      // Reset form state
      if (activeTab === "new") {
        setName("");
        setDate(new Date());
        setIncludeTime(false);
        setNotes("");
      } else {
        setSelectedWorkoutId(null);
        setDate(new Date());
        setIncludeTime(false);
      }
    },
    onError: (error) => {
      console.error("Error creating workout:", error);
    },
  });

  const existingWorkouts = api.workoutPlan.getNames.useQuery();

  const [name, setName] = useState<string>("");
  const [date, setDate] = useState<Date>(defaultDate || new Date());
  const [includeTime, setIncludeTime] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>("");
  const [type, setType] = useState<WorkoutType | undefined>(undefined);

  const [locationId, setLocationId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"new" | "existing">("new");
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);

  const createWorkout = () => {
    if (activeTab === "new") {
      // Create new workout
      if (name) {
        createWorkoutMutation.mutate({
          name: name,
          date: date,
          includeTime: includeTime,
          notes: notes,
          locationId,
          type,
        });
      }
    } else {
      // Plan existing workout
      if (selectedWorkoutId) {
        createWorkoutMutation.mutate({
          workoutId: selectedWorkoutId,
          date: date,
          includeTime: includeTime,
          locationId,
        });
      }
    }
  };

  return (
    <div className="">
      <Fieldset>
        <Legend className="text-lg font-bold">Create Workout</Legend>

        <FieldGroup>
          <Field>
            <Label>Date & time</Label>

            {includeTime ? (
              <Input
                type="datetime-local"
                value={toLocalDateTime(date, true)}
                onChange={(e) => setDate(new Date(e.target.value))}
              />
            ) : (
              <Input
                type="date"
                value={toLocalDateTime(date, false)}
                onChange={(e) => setDate(new Date(e.target.value))}
              />
            )}
          </Field>
          <CheckboxField>
            <Checkbox
              id="include-time"
              checked={includeTime}
              onChange={(value) => {
                setIncludeTime(value);
                if (value) {
                  setDate(new Date(date.setHours(0, 0, 0, 0)));
                } else {
                  setDate(new Date(date.setHours(0, 0, 0, 0)));
                }
              }}
            />
            <Label htmlFor="include-time" className="ml-2">
              Include time
            </Label>
          </CheckboxField>

          <Field>
            <Label>Location</Label>
            <SelectLocation
              onSelect={(location) => {
                if (location) {
                  setLocationId(location.id);
                }
              }}
            />
          </Field>

          <Divider />

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              type="button"
              onClick={() => setActiveTab("new")}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === "new"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              New workout
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("existing")}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === "existing"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Plan existing workout
            </button>
          </div>

          {/* Tab Content */}
          <div className="mt-4">
            {activeTab === "new" && (
              <div>
                <Field>
                  <Label>Name</Label>
                  <Input
                    placeholder="Workout name"
                    list="workout-names"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <datalist id="workout-names">
                    {existingWorkouts.data?.map((workout) => (
                      <option key={workout.name} value={workout.name} />
                    ))}
                  </datalist>
                </Field>
         
                <Field>
                  <Label>Type</Label>

                  <Select
                    value={type}
                    onChange={(e) => {
                      setType(e.target.value as WorkoutType);
                    }}
                  >
                    {Object.keys(WorkoutType).map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Button className="rounded bg-slate-50 p-2" onClick={createWorkout}>
                  Create
                </Button>
              </div>
            )}
            {activeTab === "existing" && (
              <div>
                <PlanExistingWorkout 
                  selectedWorkoutId={selectedWorkoutId}
                  onSelectWorkout={setSelectedWorkoutId}
                />
                {selectedWorkoutId && (
                  <Button 
                    className="mt-4 rounded bg-slate-50 p-2" 
                    onClick={createWorkout}
                  >
                    Plan Workout
                  </Button>
                )}
              </div>
            )}
          </div>
        </FieldGroup>
      </Fieldset>
    </div>
  );
};
