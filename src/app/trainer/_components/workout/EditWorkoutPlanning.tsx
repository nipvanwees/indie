import { useState } from "react";
import { api } from "~/trpc/react";
import toLocalDateTime from "~/utils/toLocalDateTime";
import { SelectLocation } from "../location/SelectLocation";
import {
  Field,
  FieldGroup,
  Fieldset,
  Label,
} from "~/app/_components/ui/fieldset";
import { Input } from "~/app/_components/ui/input";
import { Button } from "~/app/_components/ui/button";
import { Checkbox, CheckboxField } from "~/app/_components/ui/checkbox";
import type { PersonalWorkoutPlanningOutput } from "~/utils/trpc-types";

export const EditWorkoutPlanning = ({
  workoutPlanning,
  onSuccess,
}: {
  workoutPlanning: PersonalWorkoutPlanningOutput[0];
  onSuccess: () => void;
}) => {
  const utils = api.useUtils();

  const [date, setDate] = useState<Date>(
    workoutPlanning.date ? new Date(workoutPlanning.date) : new Date()
  );
  const [includeTime, setIncludeTime] = useState<boolean>(
    workoutPlanning.includeTime
  );
  const [locationId, setLocationId] = useState<string | null>(
    workoutPlanning.locationId
  );

  const updateMutation = api.workoutPlanning.update.useMutation({
    onSuccess: async () => {
      await utils.workoutPlanning.getPersonal.invalidate();
      await utils.workoutPlanning.getAll.invalidate();
      onSuccess();
    },
    onError: (error) => {
      console.error("Error updating workout planning:", error);
    },
  });

  const handleSubmit = () => {
    updateMutation.mutate({
      id: workoutPlanning.id,
      date: date,
      includeTime: includeTime,
      locationId: locationId,
    });
  };

  return (
    <div className="">
      <Fieldset>
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
              id="include-time-edit"
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
            <Label htmlFor="include-time-edit" className="ml-2">
              Include time
            </Label>
          </CheckboxField>

          <Field>
            <Label>Location</Label>
            <SelectLocation
              defaultValue={locationId ?? undefined}
              onSelect={(location) => {
                if (location) {
                  setLocationId(location.id);
                } else {
                  setLocationId(null);
                }
              }}
            />
          </Field>

          <Button
            className="rounded bg-slate-50 p-2"
            onClick={handleSubmit}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? "Updating..." : "Update Planning"}
          </Button>
        </FieldGroup>
      </Fieldset>
    </div>
  );
};

