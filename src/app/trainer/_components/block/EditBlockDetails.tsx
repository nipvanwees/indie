import { WorkoutBlock } from "@prisma/client";
import { api } from "~/trpc/react";
import { BlockForm } from "./BlockForm";

export const EditBlockDetails = ({
    block
}: {
    block: WorkoutBlock;
}) => {
    const utils = api.useUtils();

    const updateBlockDetailsMutation = api.block.updateBlock.useMutation({
        onSuccess: async () => {
            // refetch the workout plan
            await utils.workoutPlan.getWorkout.invalidate();
        }   
    })

    return (
        <div>
            <BlockForm 
                 defaultBlock={block}
                onSubmitForm={(values, reset) => {
                    console.log("block form", values)
                    updateBlockDetailsMutation.mutate({
                        id: block.id,
                        name: values.name,
                        style: values.style,
                        rounds: values.rounds,
                        maxDurationMin: values.maxDurationMin,
                        notes: values.notes,
                        blockPurpose: values.blockPurpose,
                        specifyRepsPerRound: values.specifyRepsPerRound,
                    })
                    reset()
                }}
                workoutId={block.workoutPlanId}
            />
        </div>
    )
}