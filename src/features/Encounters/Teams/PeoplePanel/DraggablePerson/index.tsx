"use client";

import { useDraggable } from "@dnd-kit/core";
import { Info, UserPlus } from "lucide-react";
import { PERSON_TYPE_LABELS } from "@/interfaces/Person";
import { personDisplayName, personInitials } from "@/utils/personDisplay";
import { storageUrl } from "@/utils/helpers";
import { DraggablePersonProps } from "./types";

const DraggablePerson: React.FC<DraggablePersonProps> = ({ person, selected, onAdd, onInfo }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: person.id });
  const photo = person.photo ? storageUrl(person.photo) : null;
  const initials = personInitials(person);

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors text-left select-none
        ${isDragging ? "opacity-40" : ""}
        ${selected ? "hover:bg-hover/50 cursor-grab active:cursor-grabbing" : "opacity-40 cursor-not-allowed"}`}
    >
      <div
        className={`w-7 h-7 rounded-full overflow-hidden flex items-center justify-center shrink-0 text-xs font-bold
        ${!photo ? (person.type === "youth" ? "bg-blue-100 text-blue-600" : "bg-violet-100 text-violet-600") : ""}`}
      >
        {photo ? (
          <img src={photo} alt="" className="w-full h-full object-cover" />
        ) : (
          initials
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-text truncate">
          {personDisplayName(person)}
        </p>
        <p className="text-xs text-text-muted">
          {PERSON_TYPE_LABELS[person.type]}
        </p>
      </div>
      <button
        onPointerDown={(e) => e.stopPropagation()}
        onClick={onInfo}
        className="shrink-0 p-0.5 hover:text-primary text-text-muted transition-colors"
        title="Ver perfil"
      >
        <Info size={12} />
      </button>
      {selected && (
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={onAdd}
          className="shrink-0 p-0.5 hover:text-primary text-text-muted transition-colors"
          title="Adicionar à equipe"
        >
          <UserPlus size={12} />
        </button>
      )}
    </div>
  );
};

export default DraggablePerson;
