import { WorkoutBlock } from "@prisma/client";
import { useState } from "react";
import { CreateElement } from "~/pages/teacher";
import { api } from "~/utils/api";

export const DisplayBlock = ({
  block,
  children,
  onClick,
}: {
  block: WorkoutBlock;
  children: React.ReactNode;
  onClick?: () => void;
}) => {
  const utils = api.useUtils();

  const [focusBlock, setFocusBlock] = useState(false);

  const addExerciseMutation = api.exercisePlan.addExercise.useMutation({
    async onSettled() {
      await utils.workoutPlan.getWorkout.invalidate();
    },
  });

  const deleteBlockMutation = api.block.removeBlock.useMutation({
    async onSettled() {
      await utils.workoutPlan.getWorkout.invalidate();
    },
  });

  return (
    <div className="my-3 justify-between gap-2 pl-1" onClick={onClick}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1">
          <div className="font-semibold first-letter:capitalize">
            {block.name}
          </div>
          <div className="text-sm">
            {/* {block.notes ? "*" + block.notes : null} */}
          </div>
        </div>
      </div>

      <div className="border-l-2 pl-2">{children}</div>
    </div>
  );
};
