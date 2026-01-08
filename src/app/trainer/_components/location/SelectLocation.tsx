import type { Locations } from "@prisma/client";
import { api } from "~/utils/api";
import { CreateLocation } from "./CreateLocation";
import { Select } from "../ui/select";
import { Button } from "../ui/button";
import { Dialog, DialogBody, DialogTitle } from "../ui/dialog";
import { useState } from "react";

export const SelectLocation = ({
  onSelect,
}: {
  onSelect: (location: Locations | null) => void;
}) => {
  // fetch locations
  const [open, setOpen] = useState(false);
  const locationQuery = api.location.getAll.useQuery();

  return (
    <div className="flex gap-2">
      <div className="flex-1">
        <Select
          className="w-full"
          onChange={(e) => {
            const selectedLocation = locationQuery.data?.find(
              (location) => location.id === e.target.value,
            );
            onSelect(selectedLocation ?? null);
          }}
          defaultValue={""}
        >
          <option value="">Select a location</option>
          {locationQuery.data?.map((location) => (
            <option key={location.id} value={location.id}>
              {location.name}
            </option>
          ))}
          {locationQuery.isLoading && <option>Loading...</option>}
        </Select>
      </div>
      <div className="flex-shrink-0">
        <Button
          onClick={() => {
            setOpen(true);
          }}
        >+</Button>
        <Dialog open={open} onClose={() => setOpen(false)}>
          <DialogTitle>
            Create new location
          </DialogTitle>

          <DialogBody>
        <CreateLocation />
          </DialogBody>

        </Dialog>
      </div>
    </div>
  );
};
