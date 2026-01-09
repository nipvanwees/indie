import { closestCenter, DndContext, PointerSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useState } from "react";
import { CSS } from '@dnd-kit/utilities';
import { Button } from "~/app/_components/ui/button";

const ArrangeBlock = ({id, text, order}: {
    id: string;
    text: string;
    order: number;
}) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} {...attributes} {...listeners} style={style} className="p-2 border rounded bg-white shadow-sm">
            <span>{text}</span>
        </div>
    );
}

export const RearrangeBlock = ({
    // blockId,
    exercises,
    onRearrange
}: {
    // blockId: string;
    exercises: { id: string; text: string, order: number }[];
    onRearrange: (newOrder: {id: string, text: string, order: number}[]) => void;
}) => {

    const defaultOrder = exercises.map((exercise, index) => ({
        id: exercise.id,
        text: exercise.text,
        order: index
    }));

    const [rearrangedOrder, setRearrangedOrder] = useState(defaultOrder);
    const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor));

    return (
                   <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={({ active, over }) => {
                  if (active.id !== over.id) {
                    const oldIndex = rearrangedOrder.findIndex((item) => item.id === active.id);
                    const newIndex = rearrangedOrder.findIndex((item) => item.id === over.id);

                    const newOrder = [...rearrangedOrder];
                    const [movedItem] = newOrder.splice(oldIndex, 1);
                    newOrder.splice(newIndex, 0, movedItem);

                    setRearrangedOrder(newOrder.map((item, index) => ({
                        ...item,
                        order: index + 1
                    })));
                    // onRearrange(newOrder);
                  }
                }}
              >
            <SortableContext
                items={rearrangedOrder.map((item) => item.id)}
                strategy={verticalListSortingStrategy}
            >
                <div className="flex flex-col gap-2" 
                >
                    {rearrangedOrder.map((exercise) => (
                       <ArrangeBlock id={exercise.id} key={exercise.id} text={exercise.text} order={exercise.order} />

                    ))}
                </div>
            </SortableContext>

            <Button 
                onClick={() => {
                    console.log("Rearranged Order:", rearrangedOrder);
                    onRearrange(rearrangedOrder);
                }} 
                className="mt-4"    
            >Save</Button>
            
              </DndContext>
    )
}
