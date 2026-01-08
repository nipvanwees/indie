import { useForm, SubmitHandler, UseFormReset } from "react-hook-form"
import { Field, FieldGroup, Fieldset, Label } from "~/app/_components/ui/fieldset"
import { SelectExercise, SelectExerciseForced } from "../exercise/SelectExercise"
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "~/app/_components/ui/dropdown"
import { Divider } from "~/app/_components/ui/divider"
import { Button } from "~/app/_components/ui/button"
import { Select } from "~/app/_components/ui/select"
import { AlternativeType, Exercise, ExercisePlanning, PlanningAlternative, RepStyle, Rounds, TimeStyle, Unilateral, UnilateralExecution, WorkoutBlock } from "@prisma/client"
import { Input } from "~/app/_components/ui/input"
import { Textarea } from "~/app/_components/ui/textarea"
import { useEffect, useState } from "react"
import { Checkbox, CheckboxField } from "~/app/_components/ui/checkbox"
import { Switch } from "~/app/_components/ui/switch"
import { DisplayExerciseName } from "../exercise/DisplayExerciseName"
import { PreviouslyPlanned } from "./Previouslyplanned"
import { set } from "zod"
  
interface ExercisePlanningForm {
    exerciseId: string,
    minReps: number | null,
    useRepRange: boolean,
    maxReps: number | null,
    maxEffort: boolean,
    repType: RepStyle,
    timeStyle: TimeStyle,
    unilateral: Unilateral,
    unilateralExecution: UnilateralExecution,
    notes: string,
    useRx: boolean,
    rxDouble: boolean,
    rxM: number | null,
    rxF:  number | null,
    useAsBuyIn?: boolean,
    useTempo: boolean,
    tempoEccentric: number | null
    tempoIsometricBottom: number | null,
    tempoConcentric: number | null,
    tempoIsometricTop: number | null,
    useRPE: boolean,
    rpe: number,
    rounds: {
        min: number | null,
        max: number | null,
        rpe: number | null,
        repType: RepStyle,
        notes: string | null,
    }[],
    alternatives?: {
        exerciseId: string,
        type: AlternativeType,
        notes: string | null,
    }[]
}

export const ExercisePlanningForm = ({
  exercisePlanning, 
  onSubmitForm,
  workoutBlock
}: {
  exercisePlanning?: Partial<ExercisePlanning & {
    exercise: Exercise | null,
    planningAlternative: PlanningAlternative[],
    rounds: Rounds[]
  }>, 
  onSubmitForm: (formData: ExercisePlanningForm, reset: UseFormReset<ExercisePlanningForm> ) => void,
  workoutBlock: WorkoutBlock
}
) => {
  console.log("ExercisePlanningForm", exercisePlanning)

    const {handleSubmit, control, reset, register, watch, setValue, getValues} = useForm<ExercisePlanningForm>({
        defaultValues: {
            exerciseId: exercisePlanning?.exerciseId,
            minReps: exercisePlanning?.minReps ?? undefined,
            maxReps: exercisePlanning?.maxReps ?? undefined ,
            repType: exercisePlanning?.repType ?? RepStyle.REPS,
            timeStyle: exercisePlanning?.timeStyle ?? TimeStyle.REPS,
            unilateral: Unilateral.NO,
            unilateralExecution: exercisePlanning?.unilateralExecution ?? "NONE",

            maxEffort: exercisePlanning?.maxEffort ?? false,

            useRx: exercisePlanning?.useRx ?? false,
            rxDouble: exercisePlanning?.rxDouble ?? false,
            rxM: exercisePlanning?.rxM ?? 0,
            rxF: exercisePlanning?.rxF ?? 0,

            useAsBuyIn: exercisePlanning?.useAsBuyIn ?? false,

            alternatives: exercisePlanning?.planningAlternative?.map((i) => ({
              exerciseId: i.exerciseId,
              notes: i.notes,
              type: i.type
            })) ?? [],

            rounds: exercisePlanning?.rounds?.map((i) => ({
                min: i.min ?? null,
                max: i.max ?? null,
                rpe: i.rpe ?? null,
                notes: i.notes ?? null,
            })) ?? [],

            useRepRange: exercisePlanning?.maxReps ? true : false,
            useTempo: exercisePlanning?.useTempo ?? false,
            tempoEccentric: exercisePlanning?.tempoEccentric ?? null,
            tempoIsometricBottom: exercisePlanning?.tempoIsometricBottom ?? null,
            tempoConcentric: exercisePlanning?.tempoConcentric ?? null,
            tempoIsometricTop: exercisePlanning?.tempoIsometricTop ?? null,

        }
})

    const useRepRange = watch("useRepRange")
    const repType = watch("repType")
    const unilateral = watch("unilateral")
    const useTempo = watch("useTempo")

    const rounds = watch("rounds")

    const rxDouble = watch("rxDouble")

    const useRx = watch("useRx");
    const useAsBuyIn = watch("useAsBuyIn");

    const useRPE = watch("useRPE");
    const rpe = watch("rpe");

    const maxReps = watch("maxReps")
    const maxEffort = watch("maxEffort")

    useEffect(() => {
      if(!workoutBlock.specifyRepsPerRound) return
      const roundas = workoutBlock.rounds
      if(rounds.length > 0) return

      // make an array of length rounds with default values
      const defaultRounds = Array.from({ length: roundas }, (_, i) => ({
        min: 5,
        max: null,
        rpe: null,
        repType: RepStyle.REPS,
        notes: null,
      }));

      console.log("Setting default rounds", defaultRounds)

      setValue("rounds", defaultRounds)
      
    }, [workoutBlock, rounds])

    const alternatives = getValues("alternatives")


    const [exercise, setExercise] = useState<Exercise | null>(exercisePlanning?.exercise ?? null) 

    const [newAlternative, setNewAlternative] = useState<{
      exerciseId: string,
      type: AlternativeType,
      notes: string | null
      }>({
          exerciseId: "",
          type: AlternativeType.ALTERNATIVE,
          notes: null
      })

    const [addingAlternative, setAddingAlternative] = useState(false)

    const onSubmit: SubmitHandler<ExercisePlanningForm> = async (data) => {
        console.log("Submitting exercise planning form", data)
        onSubmitForm(data, reset)
    }

    if(!exercise && !exercisePlanning?.exerciseId) {
        return (
            <div className="flex items-center justify-center">
                <div className="animate-pulse rounded-full bg-slate-200 h-4 w-4" />
                <SelectExerciseForced 
                onSelect={(exercise) => {
                    setExercise(exercise)
                    setValue("exerciseId", exercise.id)
                    setValue("unilateral", exercise.unilateral)
                }}
                />
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
        <Fieldset>
          <FieldGroup>
            <Field>

              <Label>Exercise</Label>

              <SelectExercise 
                defaultValue={exercise}
                onSelect={(exercise) => {
                    setValue("exerciseId", exercise.id)
                    setValue("unilateral", exercise.unilateral)
                }}
              />

              <div className="">
                  {
                    exercise ? 
                  <PreviouslyPlanned 
                    exerciseId={exercise?.id} 
                    onAdd={(exercisePlanning) => {
                      setValue("minReps", exercisePlanning.minReps ?? null)
                      setValue("maxReps", exercisePlanning.maxReps ?? null)
                      setValue("repType", exercisePlanning.repType ?? RepStyle.REPS)
                      setValue("timeStyle", exercisePlanning.timeStyle ?? TimeStyle.REPS)
                      setValue("unilateralExecution", exercisePlanning.unilateralExecution ?? UnilateralExecution.NONE)
                      setValue("maxEffort", exercisePlanning.maxEffort ?? false)
                      setValue("useAsBuyIn", exercisePlanning.useAsBuyIn ?? false)
                      setValue("notes", exercisePlanning.notes ?? "")
                      setValue("useRx", exercisePlanning.useRx ?? false)
                      setValue("rxDouble", exercisePlanning.rxDouble ?? false)
                      setValue("rxM", exercisePlanning.rxM ?? 0)
                      setValue("rxF", exercisePlanning.rxF ?? 0)
                      setValue("useTempo", exercisePlanning.useTempo ?? false)
                      setValue("tempoEccentric", exercisePlanning.tempoEccentric ?? null)
                      setValue("tempoIsometricBottom", exercisePlanning.tempoIsometricBottom ?? null)
                      setValue("tempoConcentric", exercisePlanning.tempoConcentric ?? null)
                      setValue("tempoIsometricTop", exercisePlanning.tempoIsometricTop ?? null)
                      setValue("alternatives", exercisePlanning.alternatives?.map((i) => ({
                        exerciseId: i.exerciseId,
                        type: i.type,
                        notes: i.notes ?? null
                      })) ?? [])
                    }}
                  />
                   : null
                  }
              </div>
    
            <div className="flex gap-3 mt-3">

              {workoutBlock.specifyRepsPerRound ? (
                
             
                <div className="">
                     {  rounds.map((round, index) => (
                    <div key={index} className="flex gap-2 items-center">  
                    r{index + 1}. 
                      <Input
                        type="number"
                        min={1}
                        max={1000000}
                        {...register(`rounds.${index}.min`, {
                          setValueAs(value) {
                            const num = Number(value);
                            return isNaN(num) ? null : num;
                          },
                        })}
                      />
                      <Input
                        type="number"
                        min={1}
                        max={1000000}
                        {...register(`rounds.${index}.max`, {
                          setValueAs(value) {
                            const num = Number(value);
                            return isNaN(num) ? null : num;
                          },
                        })}
                      />

                      <Select
                        {...register(`rounds.${index}.rpe`, {
                            setValueAs(value) {
                              const num = Number(value);
                              return isNaN(num) ? null : num;
                            },
                        })}
                      >
                        <option>RPE</option>
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                        <option value={5}>5</option>
                        <option value={6}>6</option>
                        <option value={7}>7</option>
                        <option value={8}>8</option>
                        <option value={9}>9</option>
                        <option value={10}>10</option>
                      </Select>

                    </div>
                  ))}
                </div>
              ) :  (
           <div className="flex-[2] flex">
            <div>
              <Input
                type="number"
                min={0}
                max={1000000}
                {...register("minReps", {
                  setValueAs(value) {
                    const num = Number(value);
                    return isNaN(num) ? null : num;
                  },
                })}
              />

              <Input
                type="number"
                min={0}
                max={1000000}
                {...register("maxReps", {
                   setValueAs(value) {
                    const num = Number(value);
                    return isNaN(num) ? null : num;
                  },
                })}
              />
            </div>
    
             <div className="flex-[3]">
            <Label>
                <Select
                  {...register("repType")}
               >
                <option value={RepStyle.REPS}>Reps</option>
                <option value={RepStyle.TIME}>Seconds</option>
                <option value={RepStyle.METERS}>Meters</option>
                <option value={RepStyle.CALORIES}>Calories</option>
                </Select>
              </Label>
              </div>
            </div>
            )}
            </div>

            <div>
                <CheckboxField 
                >
                  <input type="checkbox"
                    {...register("maxEffort")}
                  />
                  max effort set
                </CheckboxField>
            </div>

            {repType === RepStyle.TIME ? 
            <Field className="mt-3">
                <Select
                {...register("timeStyle")}
                >
                    <option value={TimeStyle.ISO}>Isometric hold</option>
                    <option value={TimeStyle.REPS}>Reps for time</option>
                </Select>
            </Field>
 
            : null}
            </Field>

{ useAsBuyIn ? 
            <Button color="blue">
              Buy-in exercise
            </Button> 
            : null}

            {unilateral !== Unilateral.NO ? 
        <Field>
          <Label>Unilateral execution</Label>
          <Select
          {...register("unilateralExecution")}
          >
            <option value={UnilateralExecution.NONE}>Not unilateral</option>
            <option value={UnilateralExecution.ALTERNATING}>Alternating</option>
            <option  value={UnilateralExecution.SEPERATED}>Seperate sets</option>
          </Select>
        </Field> : null
}

            <Field>
              <label>Notes</label>
              <Textarea
              {...register("notes")}
              />
      
            </Field>

            {alternatives && alternatives.length > 0 && <div>
              {alternatives.map((i, index) => (
                <div key={index}>
                  <DisplayExerciseName
                     exerciseId={i.exerciseId}
                     />
                 {" "} {i.type.toLocaleLowerCase()} {i.notes ? ` - (${i.notes})` : null}
                </div>
              ))}
              </div>}
     
    
    {addingAlternative ? (
              <Field>
                <Label>Alternative</Label>
                <SelectExercise
                onSelect={(exercise) => {
                  setNewAlternative({
                    ...newAlternative,
                    exerciseId: exercise.id,
                  })
                }}
                />
                <Select
                  value={newAlternative?.type}
                  onChange={(e) => {
                    setNewAlternative({
                      ...newAlternative,
                      type: e.target.value as AlternativeType,
                    });
                  }}
                >
                  <option value={AlternativeType.PROGRESSION}>Progression</option>
                  <option value={AlternativeType.ALTERNATIVE}>Alternative</option>
                  <option value={AlternativeType.REGRESSION}>Regression</option>
                </Select>
                <Button
                  onClick={() => {
                    setValue("alternatives", [
                      ...alternatives ?? [],
                      newAlternative,
                    ]);
                    setAddingAlternative(false);
                    setNewAlternative({
                      exerciseId: "",
                      type: AlternativeType.ALTERNATIVE,
                      notes: null,
                    });
                  }}
                >Add</Button>
              </Field>
            ) : null}

            {useRx ? (
                <div className="flex gap-2">
                    <Field className="flex-1">
                        <Label>2 Weights</Label>
                        <div className="flex items-center justify-center">
                            <Switch
                                checked={rxDouble}
                                onChange={(e) => {
                                    setValue("rxDouble", e)
                                }}
                            />
                        </div>

                    </Field>
                    <Field className="flex-1">
                    <Label>RX Male</Label>
           
                    <Input
                        type="number"
                        min={0}
                        {...register("rxM", {
                        valueAsNumber: true,
                        })}
                    />
                    </Field>
                    <Field className="flex-1">
                    <Label>RX Female</Label>
                    <Input
                        type="number"
                        min={0}
                        {...register("rxF", {
                        valueAsNumber: true,
                        })}
                    />
                    </Field>
                </div>
                ) : null}
    
            {useTempo ? (
              <div className="flex gap-2 justify-between">
      
              <Field>
    
                <Label>
                  Eccentric
                 </Label>
                <Input 
                  type="number"
                  step={1}
                  min={0}
                  max={100}
                  {...register("tempoEccentric", {
                    valueAsNumber: true
                  })}
                />
                </Field>
                <Field>
                <Label>Iso bottom</Label>
                <Input 
                  type="number"
                  min={0}
                  max={100}
                  {...register("tempoIsometricBottom", {
                    valueAsNumber: true
                  })}
                />
                </Field>
                <Field>
                <Label>Concentric</Label>
                <Input 
                  type="number"
                  min={0}
                  max={100}
                  {...register("tempoConcentric", {
                                       valueAsNumber: true
                  })}
                />
                </Field>
                <Field>
                <Label>Concentric top</Label>
                <Input 
                  type="number"
                  min={0}
                  max={100}
                  {...register("tempoIsometricTop", {
  valueAsNumber: true
                  } )}
                />
                </Field>
              </div>
            ) : null}
    
    
    <Field>
    
              <Dropdown>
                <DropdownButton>
                  Add extra
                </DropdownButton>
                <DropdownMenu>
                <DropdownItem
                  onClick={() => {
                    setValue("useTempo", true)
                  }}
                >
                  Tempo
                </DropdownItem>
                <DropdownItem
                  onClick={() => {
                    setValue("useRPE", true)
                  }}
                >
                  RPE
                </DropdownItem>

                <DropdownItem
                  onClick={() => {
                    setValue("useRx", true)
                  }}
                >
                    RX
                </DropdownItem>

{workoutBlock.style === "AMRAP" ? (
                <DropdownItem
                  onClick={() => {
                    setValue("useAsBuyIn", true)
                  }}
                >
                  Use as buy-in
                </DropdownItem>
): null}


                 <DropdownItem
                  onClick={() => {
                    setAddingAlternative(true);
                  }}
                >
                  Alternative exercise
                </DropdownItem>
             
                <DropdownItem
                  onClick={() => {
                    setValue("useRepRange", true)
                  }}
                >
                  Rep range
                </DropdownItem>
                </DropdownMenu>
    
    
              </Dropdown>
           
            </Field>
    
            <Divider />
            
    
            <Button
              type="submit"
              color="green"
            >
                {exercisePlanning ? "Update" : "Create"}
            </Button>
    
          </FieldGroup>
    
        </Fieldset>

        </form>
    )
}