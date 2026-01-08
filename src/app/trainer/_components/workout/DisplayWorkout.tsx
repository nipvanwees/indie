import { WorkoutPlan } from "@prisma/client";
import Link from "next/link";

export const DisplayWorkout = ({ workout }: { workout: WorkoutPlan }) => {
  return (
    <div>
      <Link href={`/workout/edit/${workout.id}`}>
        <div className="font-semibold">{workout.name}</div>
        <div>
          {workout.date ? new Date(workout.date).toLocaleDateString() : null}
        </div>
      </Link>
    </div>
  );
};
