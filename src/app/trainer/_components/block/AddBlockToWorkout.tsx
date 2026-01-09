import { api } from "~/trpc/react"
import { BlockForm } from "./BlockForm"
import type { WorkoutWithRelations } from "~/utils/trpc-types";


export const AddBlockToWorkout = ({workout, onCreated}: {workout: WorkoutWithRelations, onCreated: () => void}) => {
    const utils = api.useUtils()

    const createMutation = api.block.addBlock.useMutation({
        async onSettled(data, error) {
            if(error) {
                return
            }
            await utils.workoutPlan.getWorkout.invalidate()
        },
    })

    return (
        <div>
            <BlockForm 
            workoutId={workout.id}
            defaultBlock={{

            }}
            onSubmitForm={(values, reset) => {
                createMutation.mutate({
                    workoutId: values.workoutId,
                    blockPurpose: values.blockPurpose,
                    maxDurationMin: values.maxDurationMin,
                    name: values.name,
                    notes: values.notes,
                    rounds: values.rounds,
                    style: values.style,
                    specifyRepsPerRound: values.specifyRepsPerRound,
                })
                reset()
                onCreated()
            }}
            />
        </div>
    )

}