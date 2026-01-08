import { api } from "~/trpc/server";
import HorizontalCalendar from "./_components/horizontal-calendar";


const EventsHorizontalCalendar = () => {

    const eventsQuery = api.workoutPlanning.getAll.useQuery();
  
    if (eventsQuery.isLoading) {
      return <div>Loading...</div>;
    }
    if (eventsQuery.isError) {
      return <div>Error: {eventsQuery.error.message}</div>;
    }
    if (eventsQuery.data === undefined) {
      return <div>No data</div>;
    }
  
    return <HorizontalCalendar events={eventsQuery.data ?? []} />;
  };

export default async function TrainerHome() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
            <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
                <h1 className="text-4xl font-extrabold">Trainer Home</h1>

                <EventsHorizontalCalendar />


            </div>
        </div>
    )
}