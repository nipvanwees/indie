"use client";

import { useParams } from "next/navigation";

import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent
} from "@dnd-kit/core";

import { arrayMove, rectSortingStrategy, SortableContext, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useState } from "react";

export default function WorkoutPage() {
  const params = useParams();

  const id = params?.id;

  if (!id || typeof id !== "string") {
    return <div>loading...</div>;
  }

  // get the id from the route parameters
  return (
    <div className="">
        <DNDPage id={id} />
    </div>
  );
}


export const DNDPage = ({id}: {id: string}) => {

    const [blocks, setBlocks] = useState([
        { id: 'block1', name: 'Block 1', items: [{
            id: 'item1a',
            name: 'Item 1A'
        }, {
            id: 'item1b',
            name: 'Item 1b'
        }]},
        { id: 'block2', name: 'Block 2', items: [{id: 'item2a', name: 'Item 2b'}]},
        { id: 'block3', name: 'Block 3', items: [{id: 'item3a', name: 'Item 3b'}]},
        { id: 'block4', name: 'Block 4', items: [{id: 'item4a', name: 'Item 4b'}]}
    ]);

      const [activeId, setActiveId] = useState();

    return (
           <div>
     {/* MultipleContainers component needs to be imported or implemented */}
     <div>DND Page for workout {id}</div>
    </div>
    )


}
