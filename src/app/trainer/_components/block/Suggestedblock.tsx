import { BlockPurpose } from "@prisma/client";
import { useEffect, useMemo, useState } from "react";
import useSwipe from "~/hooks/use-swipe";
import { api } from "~/trpc/react";
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "~/app/_components/ui/dropdown";
import { Dialog, DialogBody, DialogTitle } from "~/app/_components/ui/dialog";
import { Field, Label } from "~/app/_components/ui/fieldset";
import { Button } from "~/app/_components/ui/button";
import { Input } from "~/app/_components/ui/input";

export const SuggestedBlock = ({
  workoutId,
  defaultPurpose,
}: {
  workoutId: string;
  defaultPurpose?: BlockPurpose;
}) => {
  const utils = api.useUtils();

  const suggestionQuery = api.block.getSuggestedBlocks.useQuery({
    workoutId: workoutId,
  });

  const [purpose, setPurpose] = useState<BlockPurpose>(defaultPurpose ?? BlockPurpose.INTENSITY);
  
  const [exerciseId, setExerciseId] = useState<string | null>(null);

  const [query, setQuery] = useState<string>("");

  const suggestions = suggestionQuery.data;

  const [openFullView, setOpenFullView] = useState(false);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [purpose, exerciseId]);

  const filtered = useMemo(() => {
    if (!suggestions) return [];

    const result = []


    if (purpose === BlockPurpose.INTENSITY) {
      result.push(...suggestions.filter((s) => s.blockPurpose === BlockPurpose.INTENSITY));
    }
    if (purpose === BlockPurpose.WARMUP) {
      result.push(...suggestions.filter((s) => s.blockPurpose === BlockPurpose.WARMUP));
    }
    if (purpose === BlockPurpose.COOLDOWN) {
      result.push(...suggestions.filter((s) => s.blockPurpose === BlockPurpose.COOLDOWN));
    }

    // filter by search query
    if (query) {
      return result.filter((s) => {
        return s.name.toLowerCase().includes(query.toLowerCase()) ||
          s.exercisePlanning.some((ep) => ep.exercise.name.toLowerCase().includes(query.toLowerCase()));
      });
    } 

    return result;
    
  }, [suggestions, purpose, exerciseId, query]);  

  const suggested = useMemo(() => {
    if (!filtered) return  null
    return filtered[index] ?? null
  }, [filtered, index]);

  const swipeHandlers = useSwipe({
    onSwipedRight: () => {
      setIndex((prev) => {
        if (prev - 1 < 0) return suggestions ? suggestions.length - 1 : 0;
        return prev - 1;
      }
      );
    },
    onSwipedLeft: () => {
      setIndex((prev) => {
        if (prev - 1 < 0) return suggestions ? suggestions?.length - 1 : 0;
        return prev - 1;
      }
      );
    },
  });

  const addBlockMutation = api.block.addBlockToWorkout.useMutation({
    onSuccess: async () => {
      // refetch the workout plan
      await utils.workoutPlan.getWorkout.invalidate();
    },
  });


  if (suggestionQuery.isLoading) {
    return <div>Loading...</div>;
  }
  if(!suggestions) return <div>no suggestions sadlei</div>

  return (
    <div>

    <div className="bg-green-100 p-3" {...swipeHandlers}>
      <div className="flex gap-3">
        <p className="flex-1">Suggested Block</p>
        <div>
          <Button onClick={() => {
            setOpenFullView((prev) => !prev);
          }}>
            Open
          </Button>
        </div>
           <div>
        <Dropdown>
          <DropdownButton color={purpose === BlockPurpose.WARMUP ? "blue" : purpose === BlockPurpose.INTENSITY ? "green" : "red"}>
              {purpose}
          </DropdownButton>
          <DropdownMenu>
            <DropdownItem
            onClick={() => {
              setPurpose(BlockPurpose.WARMUP);
            }}
          >Warmup</DropdownItem>
            <DropdownItem
            onClick={() => {
              setPurpose(BlockPurpose.INTENSITY);
            }}
          >Intensity</DropdownItem>
            <DropdownItem
            onClick={() => {
              setPurpose(BlockPurpose.COOLDOWN);
            }}
          >Cooldown</DropdownItem>
          </DropdownMenu>

        </Dropdown>

      </div>

      {index + 1} / {filtered?.length}
        <div className="flex-shrink-0 flex gap-2">
          <Button
            onClick={() => {
              setIndex((prev) => {
                console.log(prev, filtered.length);
                if (prev === 0 ) return filtered.length - 1;
                return prev - 1;
              });
            }}
          >
            Prev
          </Button>
     
          <Button
            onClick={() => {
              setIndex((prev) => {
                console.log(prev, filtered.length);
                if (prev + 1 >= filtered.length) return 0;
                return prev + 1;
              });
            }}
          >
            Next
          </Button>
      </div>
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <h2>{suggested?.name}</h2>
          <p className="text-[12px]">{suggested?.exercisePlanning.map((i)=> (
            <div key={i.id}>
              {i.exercise.name}
            </div>
          ))}
          </p>
        </div>

         

        </div>
        <div className="mt-4">
          <Button
            onClick={() => {
              // add the block to the workout
              if(!suggested) return;
              addBlockMutation.mutate({
                workoutId: workoutId,
                blockId: suggested?.id,
              })
            }}
          >
            Add
          </Button>
 
        </div>
    </div>

    <Dialog
    open={openFullView}
    onClose={() => {
        setOpenFullView(false)
        setIndex(0);
        setQuery("");
    }}
    >
      <DialogTitle>Suggested</DialogTitle>
      <DialogBody>
        <div>

        <Dropdown>
          <DropdownButton color={purpose === BlockPurpose.WARMUP ? "blue" : purpose === BlockPurpose.INTENSITY ? "green" : "red"}>
              {purpose}
          </DropdownButton>
          <DropdownMenu>
            <DropdownItem
            onClick={() => {
              setPurpose(BlockPurpose.WARMUP);
            }}
          >Warmup</DropdownItem>
            <DropdownItem
            onClick={() => {
              setPurpose(BlockPurpose.INTENSITY);
            }}
          >Intensity</DropdownItem>
            <DropdownItem
            onClick={() => {
              setPurpose(BlockPurpose.COOLDOWN);
            }}
          >Cooldown</DropdownItem>
          </DropdownMenu>

        </Dropdown>

          <Field>
            <Label>Search</Label>
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
              }}
              placeholder="Search by exercise name"
            />

          </Field>

        {
          filtered?.map((i) => (
    <div className="flex" key={i.id}>
      <div className="flex-1">
          <h2>{suggested?.name}</h2>
          <p className="text-[12px]">{suggested?.exercisePlanning.map((i)=> (
            <div key={i.id}>
              {i.exercise.name}
            </div>
          ))}
          </p>
        </div>
        <div className="flex-shrink-0 flex items-center">
          <Button
            onClick={() => {
              // add the block to the workout
              addBlockMutation.mutate({
                workoutId: workoutId,
                blockId: i.id,
              })
            }}
          >
            Add 
          </Button>
          </div>
        </div>

          ))
        }
        </div>

      </DialogBody>

    </Dialog>
    </div>
  )
}