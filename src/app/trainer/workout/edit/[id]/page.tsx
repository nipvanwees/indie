"use client";

import { useParams } from "next/navigation";
import { api } from "~/trpc/react";
import { Button } from "~/app/_components/ui/button";
import { Divider } from "~/app/_components/ui/divider";
import { useState } from "react";
import {
  Dialog,
  DialogBody,
  DialogTitle,
} from "~/app/_components/ui/dialog";
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "~/app/_components/ui/dropdown";
import { BsThreeDotsVertical } from "react-icons/bs";
import { Badge } from "~/app/_components/ui/badge";
import { localeDate, localeDateTime } from "~/utils/dateHelpers";
import { DisplayBlockStyle } from "~/app/trainer/_components/block/DisplayBockStyle";
import { EditBlock } from "~/app/trainer/_components/block/EditBlock";
import { EditWorkoutDetails } from "~/app/trainer/_components/workout/EditWorkoutDetails";
import { BlockPurpose } from "@prisma/client";
import { AddBlockToWorkout } from "~/app/trainer/_components/block/AddBlockToWorkout";
import { FaBrain, FaCheck, FaPlus } from "react-icons/fa";
import { SuggestedBlock } from "~/app/trainer/_components/block/Suggestedblock";

const WorkoutPlan = ({ id }: { id: string }) => {
  const utils = api.useUtils();

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const [addingSuggestion ,setAddingSuggestion] = useState(false)

  const [addingBlock, setAddingBlock] = useState(false)

  const makeAsFinishedMutation = api.workoutPlan.markAsFinished.useMutation({
    onSuccess: async () => {
      await utils.workoutPlan.getWorkout.invalidate();
    }
  })



  const workoutQuery = api.workoutPlan.getWorkout.useQuery(
    {
      id: id,
    },
    {
      enabled: true,
      refetchOnWindowFocus: false,
    },
  );

  if (workoutQuery.isLoading) {
    return <div>Loading...</div>;
  }

  const workout = workoutQuery.data;

  if (!workout) {
    return <div>no data...</div>;
  }

  return (
    <div className="">
      <div className="flex gap-2 w-full items-center">
      <div className="flex-1 px-2">
        <div className="text font-bold flex gap-2">
          {workout.name}


      <Badge className="px-2" color="amber">
            {workout.type ? workout.type : "No type"}
          </Badge>
          </div>
        <div className="">{workout.location?.name}</div>

        <div>
          {workout?.date
            ? workout.includeTime
              ? localeDateTime(workout.date)
              : localeDate(workout.date)
            : null}
        </div>
        {workout.completed ? 
          <Badge color="green" className="px-2">Completed</Badge>
          : null
        }

      </div>
      <div className="flex-shrink-0">
        <Dropdown>
          <DropdownButton plain>
            <BsThreeDotsVertical />
          </DropdownButton>
          <DropdownMenu>
            <DropdownItem
            onClick={() => {
              setEditOpen(true);
            }}
              >
                Edit details
              </DropdownItem>
            <DropdownItem href={`/teacher/show/${id}`}>
              View
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
      </div>

      <Divider className="my-2"/>
      {workout.WorkoutBlock.map((block) => (
        <EditBlock block={block} key={block.id}>
          <></>
          </EditBlock>
      ))}

      {addingSuggestion ? 
        <SuggestedBlock workoutId={id}/>
      : null}

      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>Edit workout details</DialogTitle>
        <DialogBody>
          <EditWorkoutDetails
            workout={workout}
            onUpdated={() => setEditOpen(false)}
          />
        </DialogBody>
      </Dialog>


      <div className="flex gap-4 text-[10px]">
        <Button
          onClick={() => {
            setAddingBlock(true)
          }}
          className="flex items-center gap-1"
        >
          <FaPlus /> create block
        </Button>

        <Button
        color="teal"
         onClick={() => {
            setAddingSuggestion(!addingSuggestion)
          }}
          className="flex items-center gap-1"
        >
          <FaBrain /> Suggest block
        </Button>

        {workout.completed ? null :

        <Button
          color="green"
          className="flex items-center gap-1"
          onClick={() => {
            makeAsFinishedMutation.mutate({
              id: workout.id,
            });
          }}
          >
            <FaCheck />
        </Button>
    }

        <Dialog open={addingBlock} onClose={() => setAddingBlock(false)}>
          <DialogTitle>Add Block to workout</DialogTitle>
          <DialogBody>
            <AddBlockToWorkout
              workout={workout}
              onCreated={() => {
                 setAddingBlock(false);
              }}
           />
      
          </DialogBody>
          </Dialog>
      </div>
    </div>
  );
};

export default function WorkoutPage() {
  const params = useParams();

  const id = params?.id;

  if (!id || typeof id !== "string") {
    return <div>loading...</div>;
  }

  // get the id from the route parameters
  return (
    <div className="">
      <WorkoutPlan id={id} />
    </div>
  );
}
