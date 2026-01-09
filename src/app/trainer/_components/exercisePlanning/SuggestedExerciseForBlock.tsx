import type { Exercise, ExercisePlanning, WorkoutBlock } from "@prisma/client";
import { api } from "~/trpc/react";
import { ExerciseListView } from "~/app/_components/exercise/ExerciseListView";
import { Button } from "~/app/_components/ui/button";
import { Dialog, DialogBody, DialogTitle } from "~/app/_components/ui/dialog";
import { useState } from "react";
import { ExercisePlanningForm } from "./ExercisePlanningForm";
import { FaBrain } from "react-icons/fa";

export const Suggestion = ({block, suggestion}: {
    block: WorkoutBlock;
    suggestion: ExercisePlanning & {
        exercise: Exercise
    }
}) => {
    const utils = api.useUtils();
    const [open, setOpen] = useState(false);

    const createMutation = api.exercisePlan.addExercise.useMutation({
        onSuccess: async () => {
            await utils.workoutPlan.getWorkout.invalidate();
            await utils.exercisePlan.getSuggestions.invalidate({});
            setOpen(false);
        },
    });
    

    return (
                 <div key={suggestion.id} className="w-[200px] inline-block h-[40px] whitespace-nowrap ml-2 py-1 bg-blue-100 px-2 text-xs">
                    <div className="flex items-center">
                    <div className=" flex-1">
                        <div className="capitalize font-semibold">
                    {suggestion.exercise.name}
                    </div>
                    <div>
                        {suggestion.minReps} {suggestion.maxReps ? `-${suggestion.maxReps}` : ""} {suggestion.repStyle === "time" ? "s" : suggestion.repStyle === "reps" ? "x" : suggestion.repStyle === "distance" ? "m" : ""}
                        </div>
                    </div>

                    <div>
                        <Button onClick={() => setOpen(true)} className="text-[10px]">+</Button>
                        <Dialog open={open} onClose={() => setOpen(false)}>
                            <DialogTitle>
                                Add suggestion
                            </DialogTitle>
                            <DialogBody>
                                <ExercisePlanningForm 
                                workoutBlock={block}
                                exercisePlanning={suggestion}
                                onSubmitForm={(data) => {
                                    createMutation.mutate({
                                        blockId: block.id,
                                        exerciseId: suggestion.exercise.id,
                                        minReps: data.minReps,
                                        maxReps: data.maxReps,
                                        repType: data.repType,
                                        alternatives: data.alternatives ?? null,
                                        maxEffort: data.maxEffort,
                                        useAsBuyIn: data.useAsBuyIn ?? false,
                                        unilateralExecution: data.unilateralExecution,
                                        timeStyle: data.timeStyle,
                                        notes: data.notes,
                                        useTempo: data.useTempo,
                                        tempoConcentric: data.tempoConcentric,
                                        tempoEccentric: data.tempoEccentric,
                                        tempoIsometricBottom: data.tempoIsometricBottom,
                                        tempoIsometricTop: data.tempoIsometricTop,
                                        useRx: data.useRx,
                                        rxDouble: data.rxDouble,
                                        rxM: data.rxM,
                                        rxF: data.rxF
                                    });
                                }}
                                />

                            </DialogBody>

                        </Dialog>
                        </div>
                        </div>
                    
                </div>

    )

}


export const SuggestedExerciseForBlock = ({block}: {block: WorkoutBlock}) => {
    const suggestionQuery = api.exercisePlan.getSuggestions.useQuery({
        blockId: block.id,
        workoutId: block.workoutId,
        blockPurpose: block.blockPurpose,
    })

    return (
        <div className="border-b border-b-slate-300 text-[14px]  bg-blue-50 overflow-x-scroll">
            <div className="min-w-[800px] h-[40px] whitespace-nowrap">
                <div className="inline-block bg-blue-100 h-[40px] float-left whitespace-nowrap w-[30px]">
                    <div className="flex items-center justify-center h-full">
                    <FaBrain />
                    </div>
                </div>
            {suggestionQuery.isLoading ? <div>Loading...</div> : (suggestionQuery.data?.length ?? 0) < 1 ? "hmm no suggestions" : suggestionQuery.data?.map((suggestion) => (
                <Suggestion key={suggestion.id} block={block} suggestion={suggestion} />
            ))}
            </div>
        </div>
    )
}

