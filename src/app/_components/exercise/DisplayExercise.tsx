import { Exercise, ExercisePlanning } from "@prisma/client";
import { FaDeleteLeft } from "react-icons/fa6";
import { api } from "~/utils/api";
import { repStyleToUnit } from "~/utils/repStyleToUnit";

export const DisplayExercise = ({
  plan,
}: {
  plan: ExercisePlanning & {
    exercise: Exercise;
  };
}) => {
  return (
    <div className="flex items-center justify-between gap-2 text-[14px] border-b border-b-slate-300 py-2">
      {plan.minReps ? plan.minReps : null}
      {plan.maxReps ? `-${plan.maxReps}` : null}
      {plan.minReps && plan.repStyle ? repStyleToUnit(plan.repStyle) : null}{" "}
      {plan.exercise.name}
    </div>
  );
};
