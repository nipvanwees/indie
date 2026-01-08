import { api } from "~/trpc/server";
import HorizontalCalendar from "./_components/horizontal-calendar";

export default async function TrainerHome() {
    const events = await api.workoutPlanning.getAll();
    
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
            <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
                <h1 className="text-4xl font-extrabold">Trainer Home</h1>

                <HorizontalCalendar events={events ?? []} />


            </div>
        </div>
    )
}