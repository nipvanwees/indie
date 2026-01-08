import { Unilateral } from "@prisma/client";
import { useState } from "react";
import { api } from "~/utils/api";

export const CreateExercise = ({ defaultName }: { defaultName: string }) => {
  const utils = api.useUtils();

  const [name, setName] = useState(defaultName || "");
  const [notes, setNotes] = useState("");
  const [unilateral, setUnilateral] = useState<Unilateral>(Unilateral.NO);

  const createMutation = api.exercise.create.useMutation({
    async onSettled() {
      // invalidate the query to refetch the data
      await utils.exercise.getAll.invalidate();
    },
  });

  return (
    <div className="bg-green-300 p-4">
      <input value={name} onChange={(e) => setName(e.target.value)} />

      <input
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="notes"
      />

      <select
        value={unilateral}
        onChange={(e) => {
          setUnilateral(e.target.value as Unilateral);
        }}
      >
        <option value={Unilateral.NO}>NO</option>
        <option value={Unilateral.OPTIONAL}>Optional</option>
        <option value={Unilateral.YES}>Yes</option>
      </select>

      <label>Unilateral</label>

      <button
        onClick={() => {
          if (name) {
            createMutation.mutate({
              name: name,
              unilateral: unilateral,
              notes: notes,
            });
            setName("");
            setNotes("");
            setUnilateral(Unilateral.NO);
          }
        }}
      >
        CREATE
      </button>
    </div>
  );
};
