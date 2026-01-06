import { CreateTrainingSession } from "./_components/create-training-session";
import { TrainingSessionsList } from "./_components/training-sessions-list";

export default async function AthleteHome() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
            <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
                <h1 className="text-4xl font-extrabold">Athlete Home</h1>
                <CreateTrainingSession />
                <TrainingSessionsList />
            </div>
        </div>
    )
}