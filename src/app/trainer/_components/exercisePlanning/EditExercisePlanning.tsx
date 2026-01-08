import { Exercise, ExercisePlanning, PlanningAlternative, Rounds, TimeStyle, Unilateral, UnilateralExecution, WorkoutBlock } from "@prisma/client"
import { Description, Field, FieldGroup, Fieldset, Label } from "../ui/fieldset";
import { Combobox, ComboboxLabel, ComboboxOption } from "../ui/combobox";
import { useState } from "react";
import { api } from "~/utils/api";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "../ui/dropdown";
import { Divider } from "../ui/divider";
import { Button } from "../ui/button";
import { ExercisePlanningForm } from "./ExercisePlanningForm";

export const EditExercisePlanning = ({
    exercisePlan,
    workoutBlock
}: {
    exercisePlan: ExercisePlanning & {
        exercise: Exercise,
        alternativeExercises: PlanningAlternative[]
        rounds: Rounds[]
    },
    workoutBlock: WorkoutBlock
}) => {
  const utils = api.useUtils();

  const updateMutation = api.exercisePlan.updateExercisePlan.useMutation({
    onSuccess: async () => {
      await utils.workoutPlan.getWorkout.invalidate();
    }
  })
    return (
      <ExercisePlanningForm 
        workoutBlock={workoutBlock}
        exercisePlanning={exercisePlan}
        onSubmitForm={async(value, reset) => {
          console.log("updating with values", value);
          updateMutation.mutate({
            id: exercisePlan.id,
            maxEffort: value.maxEffort,
            alternatives: value.alternatives ?? null,
            exerciseId: value.exerciseId,
            repType: value.repType,
            rxDouble: value.rxDouble,
            rxF: value.rxF,
            rxM: value.rxM,
            tempoConcentric: value.tempoConcentric,
            tempoEccentric: value.tempoEccentric,
            tempoIsometricBottom: value.tempoIsometricBottom,
            tempoIsometricTop: value.tempoIsometricTop,
            timeStyle: value.timeStyle,
            unilateralExecution: value.unilateralExecution,
            useRx: value.useRx,
            useAsBuyIn: value.useAsBuyIn ?? null,
            useTempo: value.useTempo,
            maxReps: value.maxReps,
            minReps: value.minReps,
            notes: value.notes,
            rounds: value.rounds,
          })
          reset()

        }}
      />
         
        
      );


}