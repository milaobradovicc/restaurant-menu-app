import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export const SortableItem = ({ kat, children, urediRaspored }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: kat._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    background: urediRaspored ? "#fff9f4" : "white",
    cursor: urediRaspored ? "grab" : "default",
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(urediRaspored ? listeners : {})} // samo ako je mod aktivan
    >
      {children}
    </tr>
  );
};
