import { Rounds } from "@prisma/client";

export const RoundPlanningTable = ({
    rounds
}: {
    rounds: Rounds[]
}) => {
    return (
        <table className="w-full table-fixed text-center max-w-[500px]">
            <thead>
                <tr className="border-b-[1px] border-black py-2">
                    {
                        rounds.map((i, index) => (
                            <th key={index} className="text-center border-r last:border-r-0">
                                {index + 1}.
                            </th>

                        ))
                    }
               </tr>
            </thead>
            <tbody>
                <tr>
                    {rounds.map((i, index) => (
                        <td key={index} className="text-center border-r last:border-r-0 py-1">
                            {i.min}{i.max ? `-${i.max}` : null}x
                        </td>
                    ))}
               </tr>
               <tr className="border-t-[1px] border-black">
                    {rounds.map((i, index) => (
                        <td key={index} className="text-center border-r last:border-r-0">
                            {i.rpe ? `@${i.rpe}` : null}
                        </td>
                    ))}

               </tr>
            </tbody>
        </table>
    );
};