import { api } from "~/utils/api";
import { Exercise, Unilateral } from "@prisma/client";
import { useEffect, useState } from "react";
import { Combobox, ComboboxLabel, ComboboxOption } from "../ui/combobox";
import { Input } from "../ui/input";
import { Listbox, ListboxDescription, ListboxLabel, ListboxOption } from "../ui/listbox";
import { Dialog, DialogBody, DialogTitle } from "../ui/dialog";
import { Field, Label } from "../ui/fieldset";
import { Divider } from "../ui/divider";
import { Button } from "../ui/button";
import { Text } from "../ui/text";
import { CreateExercise } from "./CreateExercise";

interface Props {
    defaultValue?: {id: string, name?: string} |null;
    onSelect: (value: Exercise) => void;
}

export const SelectExerciseForced = ({
    defaultValue,
    onSelect
}: Props) => {
      const [query, setQuery] = useState<string>("");

        const {data: exercises, isFetching } = api.exercise.getAll.useQuery();

        const filteredExercises = query === "" ? exercises : exercises?.filter((exercise) => {
            if (!query) return true
            return exercise.name.toLowerCase().includes(query.toLowerCase());
        }
        );

        if(isFetching) return <div className="h-4 w-4 animate-pulse rounded-full bg-slate-200" />
        if(!exercises) return <div className="h-4 w-4 animate-pulse rounded-full bg-slate-200" />


return (
    <div className="w-full">
                        <Field>
                            <Label>Exercise name</Label>
                            <Input
                                autoFocus
                                value={query}
                                onChange={(e) => {
                                    setQuery(e.target.value);
                                }}
                            />
                        </Field>
                        <Divider className="my-2"/>

                        <div className="h-[180px] overflow-y-auto">

                             {filteredExercises?.length === 0 ? (
                            <div className="h-[20px]">
                                <CreateExercise
                                    defaultName={query}
                                />
                                </div>


                        ):<div className="h-[20px] text-xs">
                            {filteredExercises?.length} exercises found
                            </div>}

                        {filteredExercises?.map((exercise) => (
                            <div key={exercise.id} onClick={() => {
                                setQuery(exercise.name);
                                onSelect(exercise);
                            }}
                            className="justify-between items-center p-2  h-[40px] border-b-[1px] border-slate-400 "
                            >
                                <Text className="font-bold text-sm">{exercise.name}</Text>
                                <Text className="text-[10px]">{exercise.unilateral === Unilateral.YES ? "unilateral" : null}</Text>
                            </div>
                        ))}

                       
                        </div>

    </div>
)

}

export const SelectExercise = ({
    defaultValue,
    onSelect
}: Props) => {

    // useEffect(() => {
    //     console.log("defaultValue", defaultValue);
    //     if(defaultValue?.name) {
    //         setQuery(defaultValue.name);
    //     }
    // }, [defaultValue])

      const [query, setQuery] = useState<string>(defaultValue?.name ?? "");

      const [open, setOpen] = useState(false);

        const {data: exercises, isFetching } = api.exercise.getAll.useQuery();

        const filteredExercises = query === "" ? exercises : exercises?.filter((exercise) => {
            if (!query) return true
            return exercise.name.toLowerCase().includes(query.toLowerCase());
        }
        );

        useEffect(() => {
            if(defaultValue) {
                // find the exercise in the list
                const foundExercise = exercises?.find((exercise) => exercise.id === defaultValue.id);
                if(foundExercise) {
                    setQuery(foundExercise.name);
                    // onSelect(foundExercise);
                    // alert("Exercise selected: " + foundExercise.name);
                }
            } else {
                setQuery("");
            }
        }, [exercises, defaultValue]);

        if(isFetching) return <div className="h-4 w-4 animate-pulse rounded-full bg-slate-200" />
        if(!exercises) return <div className="h-4 w-4 animate-pulse rounded-full bg-slate-200" />

        return (
            <div className="w-full">
                <Button
                    onClick={() => setOpen(true)}
                >
                    {query ? query : "Select an exercise"}
                </Button>
                <Dialog
                    open={open}
                    onClose={() => setOpen(false)}
                    className="h-screen"
                >
                    <DialogTitle>
                    </DialogTitle>
                    <DialogBody>
                        <Field>
                            <Label>Exercise name</Label>
                            <Input
                                autoFocus
                                value={query}
                                onChange={(e) => {
                                    setQuery(e.target.value);
                                }}
                            />
                        </Field>
                        <Divider className="my-2"/>

                        <div className="h-[180px] overflow-y-auto">

                             {filteredExercises?.length === 0 ? (
                            <div className="h-[20px]">
                                <CreateExercise
                                    defaultName={query}
                                />
                                </div>


                        ):<div className="h-[20px] text-xs">
                            {filteredExercises?.length} exercises found
                            </div>}

                        {filteredExercises?.map((exercise) => (
                            <div key={exercise.id} onClick={() => {
                                setQuery(exercise.name);
                                onSelect(exercise);
                                setOpen(false);
                            }}
                            className="justify-between items-center p-2  h-[40px] border-b-[1px] border-slate-400 "
                            >
                                <Text className="font-bold text-sm">{exercise.name}</Text>
                                <Text className="text-[10px]">{exercise.unilateral === Unilateral.YES ? "unilateral" : null}</Text>
                            </div>
                        ))}

                       
                        </div>

                    </DialogBody>
                </Dialog>

              

                {/* {query && filteredExercises  ? (


                <Listbox
                    value={query}
                    onChange={(value) => {
                        if(!value) return
                        setQuery(value);
                   }
                    }
                >
                       <ListboxOption
                            value={""}
                        >
                            <ListboxLabel>
                                Select
                            </ListboxLabel>
                       </ListboxOption>
                       
                    {filteredExercises?.map((exercise) => (
                      
                        <ListboxOption
                            key={exercise.id}
                            value={exercise.name}
                        >
                            <ListboxLabel>
                                {exercise.name}
                            </ListboxLabel>
                            <ListboxDescription>
                                {exercise.unilateral ? "Unilateral" : "Bilateral"}
                            </ListboxDescription>
                        </ListboxOption>
                    ))}
                </Listbox>
                ) : null} */}
            </div>
                // <Combobox
                //   name="exercise"
                //   options={exercises}
                //   placeholder="Select an exercise"
                //   displayValue={(exercise) => exercise?.name}
                //   value={exercises[0]}
                //   onChange={(value) => {
                //     console.log(value);
                //   }}

                // //   onChange={(value) => {
                // //     if(!value) return
                // //     if (onSelect) {
                // //       onSelect(value);
                // //     }
                // //   }}
                // >
                //   {(exercise) => (
                //     <ComboboxOption value={exercise}>
                //       <ComboboxLabel>{exercise.name}</ComboboxLabel>
                //     </ComboboxOption>
                //   )}
                // </Combobox>
        
    )
}