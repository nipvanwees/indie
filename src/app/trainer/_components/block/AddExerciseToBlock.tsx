import { api } from "~/trpc/react";
import { Combobox, ComboboxLabel, ComboboxOption } from "~/app/_components/ui/combobox";
import { Description, Field, FieldGroup, Fieldset, Label } from "~/app/_components/ui/fieldset";
import { Input } from "~/app/_components/ui/input";
import { useState } from "react";
import { Select } from "~/app/_components/ui/select";
import { Button } from "~/app/_components/ui/button";
import { Textarea } from "~/app/_components/ui/textarea";
import type { Exercise, WorkoutBlock } from "@prisma/client";
import { TimeStyle, Unilateral, UnilateralExecution } from "@prisma/client";
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "~/app/_components/ui/dropdown";
import { BsArrowDown } from "react-icons/bs";
import { Divider } from "~/app/_components/ui/divider";
import { ExercisePlanningForm } from "../exercisePlanning/ExercisePlanningForm";

export const AddExerciseToBlock = ({ block }: { block: WorkoutBlock }) => {
   const utils = api.useUtils();

    const createMutaion = api.exercisePlan.addExercise.useMutation({
    onSuccess: async () => {
      await utils.workoutPlan.getWorkout.invalidate();
    }
  })

  return (
    <div>
      <ExercisePlanningForm 
      workoutBlock={block}
       onSubmitForm={async(formData, reset) => {
        console.log("formData", formData);
        await createMutaion.mutateAsync({
          blockId: block.id,
          useTempo: formData.useTempo,
          tempoConcentric: formData.tempoConcentric ?? null,
          tempoEccentric: formData.tempoEccentric ?? null,
          tempoIsometricBottom: formData.tempoIsometricBottom ?? null,
          tempoIsometricTop: formData.tempoIsometricTop ?? null,
          exerciseId: formData.exerciseId,
          alternatives: formData.alternatives ?? null,
          minReps: formData.minReps ?? null,
          maxReps: formData.maxReps ?? null,
          notes: formData.notes ?? null,
          repType: formData.repType,
          timeStyle: formData.timeStyle ?? null,
          unilateralExecution: formData.unilateralExecution ?? null,
          useAsBuyIn: formData.useAsBuyIn ?? false,
          rxDouble: formData.rxDouble,
          useRx: formData.useRx ?? null,
          rxF: formData.rxF ?? null,
          rxM: formData.rxM ?? null,
          maxEffort: formData.maxEffort ?? false,
          rounds: formData.rounds ?? null
        })
        reset();
       }}
      />
    </div>
  )
}

// export const AddExerciseToBlock = ({ blockId }: { blockId: string }) => {
//   const utils = api.useUtils();
//   const exercises = api.exercise.getAll.useQuery();

//   const createMutaion = api.workoutPlan.addExercise.useMutation({
//     onSuccess: async () => {
//       await utils.workoutPlan.getWorkout.invalidate();
//     }
//   })

//   const [addingTempo, setAddingTempo] = useState(false);
//   const [addingRPE, setAddingRPE] = useState(false);

//   const [addingProgression, setAddingProgression] = useState(false);
//   const [addingRegression, setAddingRegression] = useState(false);

//   const [tempo, setTempo] = useState({
//     eccentric: 3 as number | undefined,
//     isometricBottom:1 as number | undefined,
//     concentric: 1 as number | undefined,
//     isometricTop: 0 as number | undefined,
//   });

//   const [repStyle, setRepStyle] = useState<"reps" | "time" | "distance" | undefined>("reps");
//   const [minReps, setMinReps] = useState<number>(10);
//   const [maxReps, setMaxReps] = useState<number | undefined>(undefined);

//   const [timeStyle, setTimeStyle] = useState<TimeStyle | undefined>(undefined);
//   const [unilateralExecution, setUnilateralExecution] = useState<UnilateralExecution | undefined>(undefined);

//   const [regression, setRegression] = useState<string | null>(null);
//   const [progression, setProgression] = useState<string | null>(null);
  

//   const [useRepRange, setUseRepRange] = useState(false);

//   const create = () => {
//     if(!value) return;
//     createMutaion.mutate({
//       blockId: blockId,
//       exerciseId: value.id,
//       minReps: minReps,
//       maxReps: maxReps,
//       repStyle,
//       progression: progression,
//       UnilateralExecution: unilateralExecution,
//       timeStyle: timeStyle,
//       regression: regression,
//       notes: "",
//       useTempo: addingTempo,
//       tempo: {
//         eccentric: tempo.eccentric || 0,
//         isometricBottom: tempo.isometricBottom || 0,
//         concentric: tempo.concentric || 0,
//         isometricTop: tempo.isometricTop || 0,
//       }
//     });
//   }

//   const [notes, setNotes] = useState<string>("");

//   const [value, setValue] = useState<
//   Exercise
//    | null>(null);

//   return (
//     <Fieldset>
//       <FieldGroup>
//         <Field>
//           <Label>Exercise</Label>
//           {!exercises.data ? null : (
//             <Combobox
//               name="exercise"
//               options={exercises.data}
//               value={value}
//               placeholder="Select an exercise"
//               displayValue={(exercise) => exercise?.name ?? ""}
//               defaultValue={exercises.data[0]}
//               onChange={(value) => {
//                 if(!value) return
//                 setValue(value);
//               }}

//             >
//               {(exercise) => (
//                 <ComboboxOption value={exercise}>
//                   <ComboboxLabel>{exercise.name}</ComboboxLabel>
//                 </ComboboxOption>
//               )}
//             </Combobox>
//           )}

//         <div className="flex gap-3 mt-3">
//        <div className="flex-[2]">
//           <Input
//             type="number"
//             name="sets"
//             placeholder="Sets"
//             min={1}
//             max={1000}
//             value={minReps}
//             onChange={(e) => {
//               const value = e.target.value;
//               if (value === "") {
//                 setMinReps(0);
//                 return;
//               }
//               const numberValue = parseInt(value);
//               if (isNaN(numberValue)) {
//                 setMinReps(0);
//                 return;
//               }
//               setMinReps(numberValue);
//             }
//             }
//           />
//         </div>
//         {
//           useRepRange ? (
//             <div className="flex-[2]">
//               <Input
//                 type="number"
//                 name="reps"
//                 placeholder="Reps"
//                 min={0}
//                 max={1000}
//                 value={maxReps}
//                 onChange={(e) => {
//                   const value = e.target.value;
//                   if (value === "" || !value) {
//                     return;
//                   }
//                   const numberValue = parseInt(value);
//                   if (isNaN(numberValue)) {
//                     // setMaxReps(0);
//                     return;
//                   }
//                   setMaxReps(numberValue);
//                 }}
//               />
//             </div>
//           ) : null
//         }

//           <div className="flex-[3]">
//         <Label>
//             <Select
//               name="repStyle"
//               value={repStyle}
//               onChange={(value) => {
//                 setRepStyle(value.target.value as "reps" | "time");
//               }}
//             >
//               <option value="reps">reps</option>
//               <option value="time">seconds</option>
//               <option value="distance">meter</option>
//             </Select>
//           </Label>

//           </div>
   
//         </div>
//         {repStyle === "time" ? 
//             <Field className="mt-3">
//                 <Select
//                 value={timeStyle}
//                 onChange={(e) => {
//                     setTimeStyle(e.target.value as TimeStyle);
//                 }
//                 }
//                 >
//                     <option value={TimeStyle.ISO}>Isometric hold</option>
//                     <option value={TimeStyle.REPS}>Reps for time</option>
//                 </Select>
//             </Field>
 
//             : null}
//             </Field>

//             {value?.unilateral !== Unilateral.NO ? 
//         <Field>
//           <Label>Unilateral execution</Label>
//           <Select
//             value={unilateralExecution}
//             onChange={(e) => {
//               setUnilateralExecution(e.target.value as UnilateralExecution);
//             }}
//           >
//             <option value={UnilateralExecution.NONE}>Not unilateral</option>
//             <option value={UnilateralExecution.ALTERNATING}>Alternating</option>
//             <option  value={UnilateralExecution.SEPERATED}>Seperate sets</option>
//           </Select>
//         </Field> : null
// }


//         <Field>
//           <label>Notes</label>
//           <Textarea
//           value={notes}
//           onChange={(e) => {
//             setNotes(e.target.value);
//           }}
//           ></Textarea>
  
//         </Field>


//         {addingRegression ? (
//           <Field>
//             <Label>Regression</Label>
//             <Combobox
//               name="regression"
//               options={exercises.data}
//               placeholder="Select an exercise"
//               displayValue={(exercise) => exercise?.name ?? ""}
//               defaultValue={exercises.data[0]}
//               onChange={(value) => {
//                 if(!value) return
//                 setRegression(value.id);
//               }}

//             >
//               {(exercise) => (
//                 <ComboboxOption value={exercise}>
//                   <ComboboxLabel>{exercise.name}</ComboboxLabel>
//                 </ComboboxOption>
//               )}
//             </Combobox>
//           </Field>
//         ) : null}

// {addingProgression ? (
//           <Field>
//             <Label>Progression</Label>
//             <Combobox
//               name="progression"
//               options={exercises.data}
//               placeholder="Select an exercise"
//               displayValue={(exercise) => exercise?.name ?? ""}
//               defaultValue={exercises.data[0]}
//               onChange={(value) => {
//                 if(!value) return
//                 setProgression(value.id);
//               }}

//             >
//               {(exercise) => (
//                 <ComboboxOption value={exercise}>
//                   <ComboboxLabel>{exercise.name}</ComboboxLabel>
//                 </ComboboxOption>
//               )}
//             </Combobox>
//           </Field>
//         ) : null}
          

 

//         {addingTempo ? (
//           <div className="flex gap-2 justify-between">
  
//           <Field>

//             <Label>
//               Eccentric
//              </Label>
//             <Input 
//               type="number"
//               step={1}
//               min={0}
//               max={100}
//               value={tempo.eccentric}
//               onChange={(e) => {
//                 setTempo({
//                   ...tempo,
//                   eccentric: e.target.value ? Number(e.target.value) : undefined,
//                 });
//               }}
//             />
//             </Field>
//             <Field>
//             <Label>Iso bottom</Label>
//             <Input 
//               type="number"
//               min={0}
//               max={100}
//               value={tempo.isometricBottom}
//               onChange={(e) => {
//                 setTempo({
//                   ...tempo,
//                   isometricBottom: e.target.value ? Number(e.target.value) : undefined,
//                 });
//               }}
//             />
//             </Field>
//             <Field>
//             <Label>Concentric</Label>
//             <Input 
//               type="number"
//               min={0}
//               max={100}
//               value={tempo.concentric}
//               onChange={(e) => {
//                 setTempo({
//                   ...tempo,
//                   concentric: e.target.value ? Number(e.target.value) : undefined,
//                 });
//               }
//               }
//             />
//             </Field>
//             <Field>
//             <Label>Concentric top</Label>
//             <Input 
//               type="number"
//               min={0}
//               max={100}
//               value={tempo.isometricTop}
//               onChange={(e) => {
//                 setTempo({
//                   ...tempo,
//                   isometricTop: e.target.value ? Number(e.target.value) : undefined,
//                 });
//               }}

//             />
//             </Field>
//           </div>
//         ) : null}


// <Field>

//           <Dropdown>
//             <DropdownButton>
//               Add extra
//             </DropdownButton>
//             <DropdownMenu>
//             <DropdownItem
//               onClick={() => {
//                 setAddingTempo(!addingTempo);
//               }}
//             >
//               Tempo
//             </DropdownItem>
//             <DropdownItem
//               onClick={() => {
//                 setAddingRPE(!addingRPE);
//               }}
//             >
//               RPE
//             </DropdownItem>
//             <DropdownItem
//               onClick={() => {
//                 setAddingRPE(!addingRPE);
//               }}
//             >
//               RX
//             </DropdownItem>
//             <DropdownItem
//               onClick={() => {
//                 setAddingProgression(!addingRPE);
//               }}
//             >
//               Progression
//             </DropdownItem>
//             <DropdownItem
//               onClick={() => {
//                 setAddingRegression(!addingRPE);
//               }}
//             >
//               Regression
//             </DropdownItem>
//             <DropdownItem
//               onClick={() => {
//                 setUseRepRange(true)
//               }}
//             >
//               Rep range
//             </DropdownItem>
//             </DropdownMenu>


//           </Dropdown>
       
//         </Field>

//         <Divider />
        

//         <Button
//           onClick={() => {
//             create();
//           }}
//           color="green"
//           disabled={!value}
//         >Add to section</Button>

//       </FieldGroup>

//     </Fieldset>
//   );
// };
