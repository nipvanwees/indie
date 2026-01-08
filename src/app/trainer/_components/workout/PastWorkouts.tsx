import { api } from "~/utils/api";
import { DisplayWorkout } from "./DisplayWorkout";

export const PastWorkouts = () => {
  const upcomingQuery = api.workoutPlan.getPast.useQuery();

  if (upcomingQuery.isFetching) {
    return <div>Loading...</div>;
  }
  if (upcomingQuery.error) {
    return <div>Error: {upcomingQuery.error.message}</div>;
  }
  if (!upcomingQuery.data) {
    return <div>No upcoming workouts</div>;
  }
  return (
    <div>
      {upcomingQuery.data.map((workout) => (
        <DisplayWorkout workout={workout} key={workout.id} />
      ))}
    </div>
  );
};
