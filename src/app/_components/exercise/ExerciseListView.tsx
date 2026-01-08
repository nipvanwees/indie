import { Exercise, ExercisePlanning, PlanningAlternative, Rounds, Unilateral, UnilateralExecution, WorkoutBlock } from "@prisma/client";
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "../ui/dropdown";
import { BsDiamondHalf, BsThreeDots } from "react-icons/bs";
import { api } from "~/utils/api";
import { Dialog, DialogBody, DialogTitle } from "../ui/dialog";
import { EditExercisePlanning } from "../exercisePlanning/EditExercisePlanning";
import { useState } from "react";
import { FaNoteSticky } from "react-icons/fa6";
import { Badge } from "../ui/badge";
import { repStyleToUnit } from "~/utils/repStyleToUnit";
import { RoundPlanningTable } from "../exercisePlanning/RoundPlanningTable";
import { TempoVisualization } from "../exercisePlanning/TempoVisualization";

export const ExerciseListView = ({
    plan,
    block
  }: {
    plan: ExercisePlanning & {
      exercise: Exercise,
      planningAlternative: PlanningAlternative[],
      rounds: Rounds[]
    },
    block: WorkoutBlock
  }) => {

    const utils = api.useUtils();

    const [editOpen, setEditOpen] = useState(false)

    const deleteMutation = api.exercisePlan.removeExercise.useMutation({
        onSettled: async () => {
          // refetch the workout plan
          await utils.workoutPlan.getWorkout.invalidate();
        },
      });
    
      const removeExercise = (id: string) => {
        deleteMutation.mutate({
          id,
        });
      };

    return (

    <div className="flex border-b border-b-slate-300 py-2 text-[14px] items-center justify-between gap-2"
    >
        <Dialog open={editOpen} onClose={() => {
            setEditOpen(false)
        }}>
            <DialogTitle>Edit plan</DialogTitle>
            <DialogBody>
                <EditExercisePlanning 
                  workoutBlock={block}
                  exercisePlan={plan}
                />
            </DialogBody>

        </Dialog>
        <div className="flex-1" >
          {plan.rounds?.length ?   <span className="font-semibold capitalize">{plan.exercise.name}</span> : 
          <>
          {
            plan.maxEffort ? <Badge className="mr-2" color={"red"}>Max Effort 
          {plan.maxEffort || plan.minReps || plan.maxReps ?

            <span className="font-light ml-[1px]">
              {plan.repType === "TIME" && plan.minReps ? plan.minReps : null}

              { plan.minReps ? <span>{repStyleToUnit(plan.repType)}</span> : null }
            </span>
            : null
          }
            </Badge> : 
            <span>
              {plan.minReps ? plan.minReps : null}
              {plan.maxReps ? `-${plan.maxReps}` : null}
              { plan.minReps ? <span>{repStyleToUnit(plan.repType)} {" - "}</span> : null }
            </span>
          }



            {plan.useAsBuyIn ? <Badge color={"amber"} className="mr-2">Buy-in</Badge> : null}
            <span className="">
            <span className="font-semibold capitalize">{plan.exercise.name}</span>   {plan.repStyle === "time" ? plan.timeStyle === "REPS" ? "(reps for time)" : "(iso)" : null} {plan.unilateralExecution === UnilateralExecution.ALTERNATING && plan.exercise.unilateral !== Unilateral.NO? "(alternating)" : null}   
            </span>
            </>
          }
            { plan.rounds?.length ? <RoundPlanningTable rounds={plan.rounds} /> : null }

            {plan.planningAlternative?.length > 0 ? <span className="text-[12px] text-slate-500">({plan.planningAlternative?.length}) alternatives</span> : null}
        </div>

        <div className="flex gap-2 items-center relative">
          {plan.useTempo ? 
          <TempoVisualization
            eccentric={plan.tempoEccentric ?? 0}
            isometricBottom={plan.tempoIsometricBottom ?? 0}
            concentric={plan.tempoConcentric ?? 0}
            isometricTop={plan.tempoIsometricTop ?? 0}
          /> : null }

          {/* {plan.useTempo ? `${plan.tempoEccentric ?? 0}${plan.tempoIsometricBottom ?? 0}${plan.tempoConcentric ?? 0}${plan.tempoIsometricTop ?? 0}` : null} */}
            {plan.unilateralExecution === UnilateralExecution.SEPERATED ? <BsDiamondHalf /> : null}
            {plan.notes ? <FaNoteSticky /> : null}
            {plan.rxDouble}
            {plan.useRx ? <Badge className="italic">{plan.rxDouble ? <span className="text-[12px] relative left-1">2x</span> : null}<span className="absolute bottom-3.5 -left-1 text-[10px] font-semibold">RX</span><span className="text-[11px] relative bottom-1 left-1">{plan.rxM}</span>/<span className="text-[11px] relative top-1 right-1">{plan.rxF}</span></Badge> : null}
        </div>

        <Dropdown>
            <DropdownButton plain>
                <BsThreeDots />
            </DropdownButton>

            <DropdownMenu>
                <DropdownItem
                onClick={() => setEditOpen(true)}
                >
                    Edit
                </DropdownItem>
                <DropdownItem onClick={() => {
                    removeExercise(plan.id);
                }}>
                    Remove
                </DropdownItem>
 
            </DropdownMenu>

        </Dropdown>
    </div>

    )
  }