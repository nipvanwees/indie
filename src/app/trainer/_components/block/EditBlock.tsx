import type { Exercise, ExercisePlanning, WorkoutBlock } from "@prisma/client";
import { Heading } from "~/app/_components/ui/heading";
import { DisplayBlockStyle } from "./DisplayBockStyle";
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "~/app/_components/ui/dropdown";
import { BsThreeDotsVertical } from "react-icons/bs";
import { api } from "~/trpc/react";
import { Button } from "~/app/_components/ui/button";
import { FaPlus } from "react-icons/fa6";
import { Dialog, DialogBody, DialogTitle } from "~/app/_components/ui/dialog";
import { AddExerciseToBlock } from "./AddExerciseToBlock";
import { useState } from "react";
import { EditBlockDetails } from "./EditBlockDetails";
import { FaCheckCircle } from "react-icons/fa";
import { Badge } from "~/app/_components/ui/badge";
import { Text } from "~/app/_components/ui/text";
import { Divider } from "~/app/_components/ui/divider";
import { ExerciseListView } from "~/app/_components/exercise/ExerciseListView";
import { PointerSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SuggestedExerciseForBlock } from "../exercisePlanning/SuggestedExerciseForBlock";
import { RearrangeBlock } from "./RearrangeBlock";

type FullExercisePlanning = ExercisePlanning & {
  exercise: Exercise
}

export const EditBlock = ({block, children}: {
    block: WorkoutBlock & {
      exercisePlanning: FullExercisePlanning[]
    }
    children: React.ReactNode
}) => {

    const utils = api.useUtils();



    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);

    const [rearrangeOpen, setRearrangeOpen] = useState(false);

    const dupplicateBlockMutation = api.block.duplicateBlock.useMutation({
        async onSettled() {
          await utils.workoutPlan.getWorkout.invalidate();
        },  
      });

    const rearrangeMutation = api.block.rearrangeExercises.useMutation({
        async onSettled() {
          await utils.workoutPlan.getWorkout.invalidate();
        },
      });

      const sensors = useSensors(
        useSensor(PointerSensor, {
          activationConstraint: {
            distance: 5,
          },
        }),
        useSensor(TouchSensor, {
          activationConstraint: {
            delay: 250,
            tolerance: 5,
          },
        }),
      );

    const completeBlockMutation = api.block.completeBlock.useMutation({
        async onSettled() {
          await utils.workoutPlan.getWorkout.invalidate();
        },
      });

      const uncompleteBlockMutation = api.block.uncompleteBlock.useMutation({
        async onSettled() {
          await utils.workoutPlan.getWorkout.invalidate();
        },
      });


    const completeBlock = () => {
        completeBlockMutation.mutate({
            id: block.id,
        });
    }

    const uncompleteBlock = () => {
        uncompleteBlockMutation.mutate({
            id: block.id,
        });
      };

    const deleteBlockMutation = api.block.removeBlock.useMutation({
        async onSettled() {
          await utils.workoutPlan.getWorkout.invalidate();
        },
      });
    return (

        
<div
className=" m-1 rounded-md p-2 dark:border-white/10"
key={block.id}
>
<div className="flex w-full flex-wrap items-center justify-between gap-4  dark:border-white/10 mb-2">
<div className="flex-1">

<Heading className="text-sm font-bold capitalize flex gap-3">
  {block.name}  
</Heading>
<div className="flex gap-3">

  <DisplayBlockStyle
  style={block.style}
  rounds={block.rounds ?? undefined}
  minutes={block.maxDurationMin ?? undefined}
/>
<Badge 
  className="text-[10px] capitalize"
  color={block.blockPurpose === "WARMUP" ? "blue" : block.blockPurpose === "INTENSITY" ? "amber" : block.blockPurpose === "COOLDOWN" ? "green" : "sky"} 
  >
  {block.blockPurpose.toLocaleLowerCase()}
</Badge>

{block.specifyRepsPerRound ? <Badge color="purple">Reps per round</Badge> : null}

{block.completed ? <Badge color="green">Completed</Badge> : null}

</div>

<Text className="mt-1 text-[11px]">
  {block.notes}
  </Text>
</div>

<div className="flex-shrink-0">
<Dropdown>
<DropdownButton plain>
  <BsThreeDotsVertical />
</DropdownButton>

<DropdownMenu>
  <DropdownItem onClick={() => {
    setEditOpen(true);
  }}>
    Edit
  </DropdownItem>
  <DropdownItem onClick={() => {
    dupplicateBlockMutation.mutate({
        blockId: block.id,
        workoutId: block.workoutPlanId,
    });
  }}>
    Duplicate
  </DropdownItem>
  <DropdownItem
  onClick={() => setRearrangeOpen(true)}
  >
    Rearrange
  </DropdownItem>
  {block.completed ? 
  <DropdownItem onClick={() => {
    uncompleteBlock();
  }
  }>
    Uncomplete
  </DropdownItem>
  : null}
  <DropdownItem onClick={() => {
    deleteBlockMutation.mutate({
      id: block.id,
    });

  }}>
    Delete
  </DropdownItem>
</DropdownMenu>
</Dropdown>
</div>
</div>

<Divider />

 {/* <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={({ active, over }) => {
        if (active.id !== over.id) {
          // const oldIndex = items.indexOf(active.id);
          // const newIndex = items.indexOf(over.id);
          // setItems(arrayMove(items, oldIndex, newIndex));
        }
      }}
    > */}
            {/* <SortableContext items={block.exercisePlanning.map((i) => i.id)} strategy={verticalListSortingStrategy}> */}

   {block.exercisePlanning.sort((a,b) => {
    return a.blockOrder - b.blockOrder
   }).map((i) => (
            <ExerciseListView 
            key={i.id} 
            plan={i} 
              block={block}
            />
          ))}
          {/* </SortableContext> */}

              {/* </DndContext> */}


              {
                block.completed ? null :
                <SuggestedExerciseForBlock block={block} />
              }


    <Dialog open={createOpen} onClose={() => setCreateOpen(false)}>
            <DialogTitle>Add Exercise to block</DialogTitle>
            <DialogBody>
              <AddExerciseToBlock block={block} />
            </DialogBody>
          </Dialog>

          <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
            <DialogTitle>Edit block details</DialogTitle>
            <DialogBody>
              <EditBlockDetails block={block} />
            </DialogBody>
          </Dialog>

          <Dialog open={rearrangeOpen} onClose={() => setRearrangeOpen(false)}>
            <DialogTitle>Rearrange exercises</DialogTitle>
            <DialogBody>
              <Text className="text-xs mb-2">Drag and drop to rearrange exercises in this block.</Text>
              <RearrangeBlock exercises={block.exercisePlanning.map((i) => ({
                id: i.id,
                text: i.exercise?.name ?? "no name",
                order: i.blockOrder
              }))} 
              onRearrange={(newOrder) => {
                // console.log(newOrder);
               rearrangeMutation.mutate({
                  blockId: block.id,
                  exercises: newOrder
                });
              }} />
   
            </DialogBody>

            </Dialog>


{ block.completed ? null : 
<div className="flex gap-2 items-center">
<Button onClick={() => setCreateOpen(true)} className="text-xs gap-2 items-center">
  <FaPlus className="" /> add exercise
</Button>

<Button color="green" onClick={() => {
    completeBlock()
}}>
<FaCheckCircle />
</Button>
</div>
}

</div>

    )
}

