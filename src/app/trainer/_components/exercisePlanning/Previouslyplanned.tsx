import type { Exercise, ExercisePlanning, PlanningAlternative } from "@prisma/client";
import { api } from "~/trpc/react";

export const PreviouslyPlanned = ({exerciseId, onAdd}: {exerciseId: string, onAdd: (exercisePlanning: ExercisePlanning & {
    exercise: Exercise
    planningAlternative: PlanningAlternative[]
    alternatives?: PlanningAlternative[]
}) => void}) => {

    const query = api.exercisePlan.getPreviouslyPlanned.useQuery({
        exerciseId: exerciseId,
    }); 

    return (
        <div>
            {query.data?.map((exercise) => (
                <div key={exercise.id} onClick={() => {
                    onAdd({
                        ...exercise,
                        alternatives: exercise.planningAlternative ?? []
                    })
                }
                } className="cursor-pointer hover:bg-slate-100 p-2 rounded-md text-sm"
                >
                    {exercise.exercise.name} - {exercise.minReps} - {exercise.maxReps} - {exercise.repType} - {exercise.notes}
                </div>
            ))}
        </div>
    )

}