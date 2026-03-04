import { useState, useRef } from "react";

interface DraggableItemProps {
  id: string;
  children: React.ReactNode;
  onDrop?: (id: string, x: number, y: number) => void;
  diaryName: string;
}

export default function DraggableItem({
  id,
  children,
  diaryName,
}: DraggableItemProps) {
  const [dragging, setDragging] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const offsetRef = useRef({ x: 0, y: 0 });

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.setData("application/x-letter-diary", diaryName);
    console.log("Desde Draggable Item: diaryName (old) es ", diaryName);
    e.dataTransfer.effectAllowed = "move";

    // Crear una imagen de drag transparente para eliminar la imagen por defecto
    const dragImage = new Image();
    dragImage.src =
      "data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=";
    e.dataTransfer.setDragImage(dragImage, 0, 0);

    // Calcular el offset inicial
    const rect = e.currentTarget.getBoundingClientRect();
    offsetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setPos({ x: e.clientX, y: e.clientY });
    setDragging(true);

    // Add listeners to track the mouse
    document.addEventListener("dragover", handleDragMove);
  };

  const handleDragMove = (e: DragEvent) => {
    setPos({ x: e.clientX, y: e.clientY });
  };

  const handleDragEnd = () => {
    setDragging(false);
    document.removeEventListener("dragover", handleDragMove);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Solo permitir click si no estamos dragging
    if (dragging) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <>
      {/* Elemento original - se oculta durante el drag */}
      <div
        draggable={true}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClick={handleClick}
        className={`cursor-grab select-none transition-opacity duration-150 ${
          dragging ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        {children}
      </div>

      {/* Floating element that follows the mouse */}
      {dragging && (
        <div
          className="fixed pointer-events-none rounded shadow-lg opacity-100 z-50"
          style={{
            left: pos.x - offsetRef.current.x,
            top: pos.y - offsetRef.current.y,
          }}
        >
          {children}
        </div>
      )}
    </>
  );
}
