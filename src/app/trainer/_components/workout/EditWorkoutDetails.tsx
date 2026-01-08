
    import { type WorkoutPlan, WorkoutType } from "@prisma/client";
    import { useState } from "react";
    import { api } from "~/utils/api";
    import toLocalDateTime from "~/utils/toLocalDateTime";
    import { SelectLocation } from "../location/SelectLocation";
    import {
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

export const EditWorkoutDetails = ({
    workout,
    onUpdated
        }: {
        workout: WorkoutPlan,
        onUpdated: () => void;

}) => {
      const utils = api.useUtils();

      const [name, setName] = useState<string>(workout.name);
      const [date, setDate] = useState<Date>(workout.date ?? new Date());
      const [includeTime, setIncludeTime] = useState<boolean>(workout.includeTime);
      const [notes, setNotes] = useState<string>(workout.notes ?? "");
      const [type, setType] = useState<WorkoutType | undefined>(workout.type);
      const [locationId, setLocationId] = useState<string | null>(workout.locationId);

      const editWorkoutDetailsMutation = api.workoutPlan.update.useMutation({
        onSuccess: async () => {
          await utils.workoutPlan.getAll.invalidate();
          await utils.workoutPlan.getWorkout.invalidate();
        },
        onError: (error) => {
          console.error("Error creating workout:", error);
        },
      });
    
      const existingWorkouts = api.workoutPlan.getNames.useQuery();
    
    
      const updateWorkout = () => {
        if (name) {
            editWorkoutDetailsMutation.mutate({
                id: workout.id,
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
          onUpdated();
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
              <Button className="rounded bg-slate-50 p-2" onClick={updateWorkout}>
                Update
              </Button>
            </FieldGroup>
          </Fieldset>
        </div>
      );
    };
    