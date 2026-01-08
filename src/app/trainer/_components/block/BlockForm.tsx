import { BlockPurpose, BlockStyle, WorkoutBlock } from "@prisma/client"
import { SubmitHandler, useForm, UseFormReset } from "react-hook-form"
import { Field, FieldGroup, Fieldset, Label } from "~/app/_components/ui/fieldset"
import { Input } from "~/app/_components/ui/input"
import { Select } from "~/app/_components/ui/select"
import { Textarea } from "~/app/_components/ui/textarea"
import { Button } from "~/app/_components/ui/button"
import { Checkbox, CheckboxField } from "~/app/_components/ui/checkbox"


interface WorkoutBlockForm {
    workoutId: string,
    name: string,
    blockPurpose: BlockPurpose,
    style: BlockStyle,
    notes: string
    maxDurationMin: number | null,
    rounds: number | null,
    specifyRepsPerRound: boolean
}

export const BlockForm = ({
    workoutId,
    onSubmitForm,
    defaultBlock
}: {
    workoutId: string,
    onSubmitForm: (formData: WorkoutBlockForm, reset: UseFormReset<WorkoutBlockForm> ) => void,
    defaultBlock?: Partial<WorkoutBlock>
}) => {
        const {handleSubmit, control, reset, register, watch, setValue, getValues} = useForm<WorkoutBlockForm>({
        defaultValues: {
            workoutId,
            maxDurationMin: defaultBlock?.maxDurationMin ?? null,
            name: defaultBlock?.name ?? "",
            notes: defaultBlock?.notes ?? "",
            blockPurpose: defaultBlock?.blockPurpose ?? BlockPurpose.WARMUP,
            style: defaultBlock?.style ?? BlockStyle.TOPDOWN,
            rounds: defaultBlock?.rounds ?? null,
            specifyRepsPerRound: defaultBlock?.specifyRepsPerRound ?? false,
        }
    })

    const style = watch("style")

   const onSubmit: SubmitHandler<WorkoutBlockForm> = async (data) => {
        onSubmitForm(data, reset)
    }

    return (
          <form onSubmit={handleSubmit(onSubmit)}>
        <Fieldset>
          <FieldGroup>
            <Field>
                <Label>
                    Block name
                </Label>
                <Input 
                    {...register("name")}
                />
            </Field>
            <Field>
                <Label>
                    Purpose
                </Label>
                <Select
                {...register("blockPurpose")}
                >
                    {Object.entries(BlockPurpose).map(([key, value], index) => (
                        <option
                        key={index}
                        >
                            {value}
                        </option>
                    ))}
                </Select>
            </Field>

            

            <Field>
                <Label>Round style</Label>
    <Select
    {...register("style")}
      >
        <option value={BlockStyle.TOPDOWN}>Top down (default)</option>
        <option value={BlockStyle.ROUNDS}>Rounds</option>
        <option value={BlockStyle.AMRAP}>AMRAP</option>
        <option value={BlockStyle.EMOM}>EMOM</option>
        </Select>

        </Field>

        {style === BlockStyle.AMRAP ? 
        <Field>
            <Label>Time</Label>
            <Input {...register("maxDurationMin", {
                valueAsNumber: true
            })}
            />
            </Field>
            : null }

        {
        style === BlockStyle.ROUNDS ? 
        <>
        <Field>
            <Label>Rounds</Label>
          <Input 
          {...register("rounds", {
            valueAsNumber: true,
          })}
          />
        </Field>
          <CheckboxField>
          <input 
            type="checkbox"

            {...register("specifyRepsPerRound", {
                setValueAs(value) {
                    return value === true || value === "true";
                },
            })}
          />
          Specify reps etc per round
          </CheckboxField>
        </>
        : null
        }

            <Field>
  <Label>Notes</Label>
  <Textarea
  {...register("notes")}
  ></Textarea>
</Field>
          </FieldGroup>
          </Fieldset>

          <Button
          type={"submit"}
          >Submit</Button>
          </form>
    )

}