import { api } from "~/utils/api";

export const DisplayExerciseName = ({
    exerciseId,
}: {
    exerciseId: string;
}) => {
    const { data: exercises, isLoading } = api.exercise.getAll.useQuery();

    if (isLoading) {
        return <span className="text-gray-500">Loading...</span>;
    }

    if (!exercises) {
        return <span className="text-red-500">Exercises not found</span>;
    }

    const exercise = exercises.find((e) => e.id === exerciseId);

    if(!exercise) {
        return <span className="text-red-500">Exercise not found</span>;
    }

    return <span className="font-semibold">{exercise.name}</span>;
}