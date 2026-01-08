import { FaEllipsis } from "react-icons/fa6";
import {
  Dropdown,
  DropdownButton,
  DropdownDescription,
  DropdownDivider,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
} from "~/app/_components/ui/dropdown";
import type { Locations, WorkoutPlan, WorkoutPlanning } from "@prisma/client";
import { Badge } from "~/app/_components/ui/badge";
import { api } from "~/trpc/react";
import { MdCalendarMonth, MdCopyAll, MdDelete, MdEdit, MdShare } from "react-icons/md";
import { BsEye } from "react-icons/bs";
import { Dialog, DialogBody, DialogTitle } from "~/app/_components/ui/dialog";
import { useState } from "react";
import { CopyCreateWorkout } from "./CopyCreateWorkout";

export const WorkoutPlanningListDisplay = ({
  workout,
}: {
  workout: WorkoutPlanning & {
    workoutPlan: WorkoutPlan,
    location: Locations | null;
  };
}) => {
  const utils = api.useUtils();

  const [copyOpen, setCopyOpen] = useState(false);

  const deleteMutation = api.workoutPlan.delete.useMutation({
    onSuccess: async () => {
      await utils.workoutPlan.getAll.invalidate();
    },
  });

  const deletePlan = (id: string) => {
    if (confirm("Are you sure you want to delete this workout plan?")) {
      deleteMutation.mutate({ id });
    }
  };

  const deleteWorkout = (id: string) => {
    if (confirm("Are you sure you want to delete this workout?")) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <li
      key={workout.id}
      className="flex items-center justify-between gap-x-6 py-5 odd:bg-slate-50 p-2"
    >
      <div className="min-w-0">
        <div className="flex items-start gap-x-3">
          <p className="text-sm/6 font-semibold text-gray-900">
            {workout.workoutPlan.name}
          </p>
        </div>

        <div className="mt-1 flex items-center gap-x-2 text-xs/5 text-gray-500">
          <p className="whitespace-nowrap">
            {workout.includeTime ? 
            workout.date?.toLocaleString() : workout.date?.toLocaleDateString()}
            {/* Due on <time dateTime={workout.dueDateTime}>{workout.dueDate}</time> */}
          </p>
          <svg viewBox="0 0 2 2" className="size-0.5 fill-current">
            <circle r={1} cx={1} cy={1} />
          </svg>
          {workout.workoutPlan.completed ? (
            <Badge color="green" className="text-xs/5">
              completed
            </Badge>
          ) : (
            <Badge color="red" className="text-xs/5">
              incomplete
            </Badge>
          )}
        </div>
        <div className="mt-1 flex items-center gap-x-2 text-xs/5 text-gray-500">
          <p className="whitespace-nowrap">
            {workout.location?.name}
            {/* Due on <time dateTime={workout.dueDateTime}>{workout.dueDate}</time> */}
          </p>
        </div>
      </div>
      <div className="flex flex-none items-center gap-x-4">
        <Dropdown>
          <DropdownButton outline>
            <span className="sr-only">Open options</span>
            <FaEllipsis />
            {/* <EllipsisVerticalIcon aria-hidden="true" className="size-5" /> */}
          </DropdownButton>
          <DropdownMenu transition>
            <DropdownItem>
              <a href={`/workout/edit/${workout.workoutPlanId}`} className="flex gap-2 items-center">
                <MdCalendarMonth />
                Edit planning<span className="sr-only">, {workout.workoutPlan.name}</span>
              </a>
            </DropdownItem>
          <DropdownItem>
              <a href={`/teacher/show/${workout.id}`} className="flex gap-2 items-center">
              <BsEye />
                View workout<span className="sr-only">, {workout.workoutPlan.name}</span>
              </a>
            </DropdownItem>
            <DropdownItem>
              <a href={`/workout/edit/${workout.workoutPlanId}`} className="flex gap-2 items-center">
                <MdEdit />
                Edit workout<span className="sr-only">, {workout.workoutPlan.name}</span>
              </a>
            </DropdownItem>
         
            <DropdownItem disabled>
              <a  className="flex gap-2 items-center">
              <MdShare />Share (coming soon)
              </a>
            </DropdownItem>

            <DropdownItem onClick={() => setCopyOpen(true)}>
              <a  className="flex gap-2 items-center">
              <MdCopyAll /> Copy and edit
              </a>
            </DropdownItem>

            <DropdownDivider />
            <DropdownItem>
              <a onClick={() => deletePlan(workout.id)} className="flex gap-2 items-center">
                <MdDelete  />
                Delete<span className="sr-only">, {workout.workoutPlan.name}</span>
              </a>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>

      <Dialog open={copyOpen} onClose={() => setCopyOpen(false)}>
        <DialogTitle>Copy and edit</DialogTitle>
        <DialogBody>
          <CopyCreateWorkout copyId={workout.workoutPlanId} />
        </DialogBody>
      </Dialog>
    </li>
  );
};
