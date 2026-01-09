"use client";
import { api } from "~/trpc/react";
import HorizontalCalendar from "./_components/horizontal-calendar";

export default function TrainerHome() {
    //type = PersonalWorkoutPlanning 
    const {data: events, isLoading} =  api.workoutPlanning.getPersonal.useQuery();
    console.log(events);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!events) {
        return <div>No events found</div>;
    }
    
    return (
        <div>
            <HorizontalCalendar workoutPlannings={events} />
        </div>
    )
}