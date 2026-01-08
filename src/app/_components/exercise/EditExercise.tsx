import { Exercise, ExercisePlanning } from "@prisma/client";
import { api } from "~/utils/api";

export const EditExercise = ({
  plan,
}: {
  plan: ExercisePlanning & {
    exercise: Exercise;
  };
}) => {
  const utils = api.useContext();

  const deleteMutation = api.exercisePlan.removeExercise.useMutation({
    onSettled: async() => {
      // refetch the workout plan
      await utils.workoutPlan.getWorkout.invalidate();
    },
  });

  const deleteExercise = () => {
    deleteMutation.mutate({
      id: plan.id,
    });
  };

  return (
    <div className="flex items-center justify-between gap-2 text-[14px]">
      {plan.minReps ? plan.minReps : null}
      {plan.maxReps ? `-${plan.maxReps}` : null}
      {plan.minReps ? (plan.repStyle === "time" ? "s" : "x") : null}{" "}
      {plan.exercise.name}
      <button onClick={deleteExercise}>Del</button>
    </div>
  );
};
