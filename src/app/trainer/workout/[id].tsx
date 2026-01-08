"use client";

import moment from "moment";
import { useParams } from "next/navigation";
import { api } from "~/trpc/react";

// functio that tranforms a date to a US-us local date and time string

const dateToString = (date: Date) => {
  const mom = moment(date);
  if (!mom.isValid()) {
    return "";
  }

  return mom.format("dddd, MMMM Do YYYY, h:mm:ss a");
};

const WorkoutPlan = ({ id }: { id: string }) => {
  const workoutQuery = api.workoutPlan.getWorkout.useQuery(
    { id: id },
    {
      enabled: true,
      refetchOnWindowFocus: false,
    },
  );

  if (workoutQuery.isFetching) {
    return <div>Loading...</div>;
  }

  if (workoutQuery.error) {
    return <div>Error: {workoutQuery.error.message}</div>;
  }

  if (!workoutQuery.data) {
    return <div>no data...</div>;
  }

  const workout = workoutQuery.data;

  return (
    <div>
      <h1>{workoutQuery.data.name}</h1>
      <div>{workout.date ? dateToString(workout.date) : null}</div>

      <div>
        {workout.WorkoutBlock.map((block) => (
          <div key={block.id} className="my-2">
            <div className="font-semibold">{block.name}</div>
            <div className="bg-yellow-200 text-sm">{block.notes}</div>

            {block.exercisePlanning.map((plan) => (
              <div key={plan.id}>{plan.exercise.name}</div>
            ))}
          </div>
        ))}
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
      <div>workout with id {id}</div>

      <WorkoutPlan id={id} />
    </div>
  );
}
