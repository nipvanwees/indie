import { WorkoutType } from "@prisma/client";
import { useState } from "react";
import { api } from "~/utils/api";
import toLocalDateTime from "~/utils/toLocalDateTime";
import { SelectLocation } from "../location/SelectLocation";
import {
  Description,
  Field,
  FieldGroup,
  Fieldset,
  Label,
  Legend,
} from "../ui/fieldset";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Select } from "../ui/select";
import { Checkbox, CheckboxField } from "../ui/checkbox";

export const CreateWorkout = ({ defaultDate }: { defaultDate?: Date }) => {
  const utils = api.useUtils();

  const createWorkoutMutation = api.workoutPlan.create.useMutation({
    onSuccess: async () => {
      await utils.workoutPlan.getAll.invalidate();
      await utils.workoutPlanning.getAll.invalidate();
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

  const createWorkout = () => {
    if (name) {
      createWorkoutMutation.mutate({
        name: name,
        date: date,
        includeTime: includeTime,
        notes: notes,
        locationId,
        type,
      });
      setName("");
      setDate(new Date());
      setIncludeTime(false);
      setNotes("");
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
            <Label>Location</Label>
            <SelectLocation
              onSelect={(location) => {
                if (location) {
                  setLocationId(location.id);
                }
              }}
            />
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
        </FieldGroup>
      </Fieldset>
    </div>
  );
};
