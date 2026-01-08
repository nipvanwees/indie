import { useState } from "react";
import { api } from "~/trpc/react";
import { Field, FieldGroup, Label } from "~/app/_components/ui/fieldset";
import { Input } from "~/app/_components/ui/input";
import toLocalDateTime from "~/utils/toLocalDateTime";
import { Checkbox, CheckboxField } from "~/app/_components/ui/checkbox";
import { SelectLocation } from "../location/SelectLocation";
import { Button } from "~/app/_components/ui/button";

export const CopyCreateWorkout = ({
    copyId
}: {
    copyId: string
}) => {

  const utils = api.useUtils();

    const [date, setDate] = useState<Date>(new Date());
    const [includeTime, setIncludeTime] = useState<boolean>(false);

    const [locationId, setLocationId] = useState<string | null>(null);

    // fetch the toCopy workout
    const workoutQuery = api.workoutPlan.getWorkout.useQuery({
        id: copyId,
    }, {
        enabled: true,
        refetchOnWindowFocus: false,
    });

    const createMutaion = api.workoutPlan.copyAndCreate.useMutation({
        async onSettled(data, error, variables, context) {
            if(error) {
                console.error(error)
            } else {
                // refetch the workout list
                await utils.workoutPlan.getUpcoming.invalidate();
                await utils.workoutPlan.getAll.invalidate();
            }
        },
    })

    const createWorkout = () => {
        createMutaion.mutate({
            date,
            includeTime,
            locationId,
            workoutId: copyId
        })

    }

    return (
        <div>
            {workoutQuery.isLoading || !workoutQuery.data ? (
                <div>Loading...</div>
            ) : (
                <div>

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
          {/* <Field>
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
          </Field> */}
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
          {/* <Field>
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
          </Field> */}
          <Button className="rounded bg-slate-50 p-2" onClick={createWorkout}>
            Create
          </Button>
        </FieldGroup>
                </div>
            )}
        </div>
    )
}