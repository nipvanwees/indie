// import { BlockStyle, WorkoutBlock } from "@prisma/client";
// import { CreateElement } from "~/pages/teacher";
// import { api } from "~/utils/api";
// import { roundStyles, timedStyles } from "~/utils/blockStyleIncludes";
// import { DisplayExercise } from "../exercise/DisplayExercise";

// export const EditBlock = ({
//   block,
//   children,
// }: {
//   block: WorkoutBlock;
//   children: React.ReactNode;
// }) => {
//   const utils = api.useUtils();

//   const addExerciseMutation = api.exercisePlan.addExercise.useMutation({
//     async onSettled() {
//       await utils.workoutPlan.getWorkout.invalidate();
//     },
//   });

//   const updateBlockMutation = api.block.updateBlock.useMutation({
//     async onSettled() {
//       await utils.workoutPlan.getWorkout.invalidate();
//     },
//   });

//   const deleteBlockMutation = api.block.removeBlock.useMutation({
//     async onSettled() {
//       await utils.workoutPlan.getWorkout.invalidate();
//     },
//   });

//   return (
//     <div className="my-3 justify-between gap-2 border-l-2 border-l-black pl-3">
//       <div className="flex items-center justify-between gap-2">
//         <div className="flex-1">
//           <div className="font-semibold first-letter:capitalize">
//             <input
//               type="text"
//               defaultValue={block.name}
//               onBlur={(e) => {
//                 updateBlockMutation.mutate({
//                   id: block.id,
//                   name: e.target.value,
//                 });
//               }}
//               className="bg-transparent text-lg font-semibold focus:outline-none"
//             />
//           </div>
//           <div className="text-sm">
//             <textarea
//               defaultValue={block.notes}
//               onBlur={(e) => {
//                 updateBlockMutation.mutate({
//                   id: block.id,
//                   name: block.name,
//                   notes: e.target.value,
//                 });
//               }}
//               className="w-full resize-none bg-yellow-200 text-sm focus:outline-none"
//               rows={2}
//               placeholder="Notes"
//             />
//           </div>

//           <div>
//             <button
//               onClick={() =>
//                 deleteBlockMutation.mutate({
//                   id: block.id,
//                 })
//               }
//               className="rounded bg-red-500 px-2 py-1 text-white hover:bg-red-600"
//             >
//               Del
//             </button>
//           </div>
//         </div>

//         <select
//           defaultValue={block.style}
//           onChange={(e) => {
//             updateBlockMutation.mutate({
//               id: block.id,
//               name: block.name,
//               notes: block.notes,
//               style: e.target.value as BlockStyle,
//             });
//           }}
//         >
//           <option></option>
//           {Object.values(BlockStyle).map((style, index) => (
//             <option key={style + index} value={style}>
//               {style}
//             </option>
//           ))}
//         </select>
//       </div>

//       {roundStyles.includes(block.style) ? (
//         <div>
//           ROUNDS
//           <input
//             type="number"
//             defaultValue={block.rounds || undefined}
//             onBlur={(e) => {
//               updateBlockMutation.mutate({
//                 id: block.id,
//                 name: block.name,
//                 notes: block.notes,
//                 style: block.style,
//                 rounds: parseInt(e.target.value),
//               });
//             }}
//             className="w-16 bg-transparent text-lg font-semibold focus:outline-none"
//           />
//         </div>
//       ) : null}

//       {timedStyles.includes(block.style) ? (
//         <div>
//           MAXTIME
//           <input
//             type="number"
//             defaultValue={block.rounds || undefined}
//             onBlur={(e) => {
//               updateBlockMutation.mutate({
//                 id: block.id,
//                 name: block.name,
//                 notes: block.notes,
//                 style: block.style,
//                 rounds: parseInt(e.target.value),
//               });
//             }}
//             className="w-16 bg-transparent text-lg font-semibold focus:outline-none"
//           />
//         </div>
//       ) : null}

//        {block.exercisePlanning.map((plan) => (
//             <DisplayExercise key={plan.id} plan={plan} />
//           ))}


//       <CreateElement
//         onSubmit={(item) => {
//           if (!item.exerciseId) return;
//           addExerciseMutation.mutate({
//             blockId: block.id,
//             exerciseId: item.exerciseId,
//             minReps: item.minReps,
//             maxReps: item.maxReps,
//             repStyle: item.repStyle,
//             notes: item.notes,
//           });
//         }}
//       />
//     </div>
//   );
// };
