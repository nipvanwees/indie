import { useState } from "react";
import { api } from "~/utils/api";
import { Field, FieldGroup, Fieldset, Label } from "../ui/fieldset";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export const CreateLocation = () => {
  const utils = api.useUtils();
  const createMutation = api.location.create.useMutation({
    async onSettled(data, error) {
      if (error) {
        console.log("oops");
      } else {
        alert("created!");
        await utils.location.getAll.invalidate();
      }
    },
  });

  const [name, setName] = useState("");

  const createLocation = () => {
    if (name) {
      createMutation.mutate({
        name,
      });
    }
  };

  return (
    <div>
    <FieldGroup>
      <Field>
        <Label>Location</Label>
        <Input
          value={name}
          placeholder="Location name"
          onChange={(e) => {
            setName(e.target.value);
          }}
        />
      </Field>


      <Button
        onClick={() => {
          createLocation();
        }}
      >
        Create
      </Button>
      </FieldGroup>
    </div>
  );
};
