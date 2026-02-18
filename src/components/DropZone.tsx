import { useState } from "react";
interface DropZoneProps {
  onDropAction: (letterId: string, oldDiary: string, newDiary: string) => void;
  children: React.ReactNode;
  diaryDropZone: string;
}

export default function DropZone({
  onDropAction,
  children,
  diaryDropZone,
}: DropZoneProps) {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Necesario para permitir el drop
    e.dataTransfer.dropEffect = "move";
    setIsOver(true);
    console.log("it's over");
  };

  const handleDragLeave = () => setIsOver(false);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(false);
    const id = e.dataTransfer.getData("text/plain");
    const oldDiary = e.dataTransfer.getData("application/x-letter-diary");

    console.log(
      "Desde DropZone: diaryName (new) es ",
      oldDiary,
      "diaryDropZone es ",
      diaryDropZone,
    );

    if (id) {
      onDropAction(id, oldDiary, diaryDropZone);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`${isOver && "rounded-lg ring ring-2 ring-blue-400"} transition-colors duration-200 `}
      aria-label="Drop zone"
    >
      {children}
    </div>
  );
}
