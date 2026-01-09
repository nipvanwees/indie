import { api } from "~/trpc/server";
import HorizontalCalendar from "./_components/horizontal-calendar";

export default async function TrainerHome() {
    const events = await api.workoutPlanning.getPersonal();
    
    return (
        <div>
                <HorizontalCalendar events={events ?? []} />
        </div>
    )
}