
"use client";
import { useEffect, useState, useRef } from "react";
import React from "react";
import LetterCard from "./LetterCard";
import { getUserLetters } from "../services/api";
import { unique } from "next/dist/build/utils";
import { BookCopy, BookX } from "lucide-react";



interface Letter {
  _id: string;
  created_at: string;
  diary: string;
  title: string;
  language: string;
  sharedWith: { nickname: string; image: string; correctionSentBack: boolean; correctedLetterId: string }[];
  selectedToDelete?: boolean;
}

interface ChildProps {
  orderByDiaryTrigger: number; 
  searchFilter: string;
  deleteMode: boolean;
  resetSelection: boolean;
  onDeleteListChange: (letterIds: string[]) => void;
  reFetchLetters: boolean;
}


interface DraggableItemProps {
  id: string;
  children: React.ReactNode;
  onDrop?: (id: string, x: number, y: number) => void;
}


interface DropZoneProps {
  onDropAction: (id: string) => void;
  children: React.ReactNode;
}


const LetterCardList = ({ orderByDiaryTrigger, searchFilter, deleteMode, resetSelection, onDeleteListChange, reFetchLetters }: ChildProps) => {
  const [letters, setletters] = useState<Letter[]>([]);
  const [diaryOrganised, setDiaryOrganised] = useState<boolean>(false);
  const [diaries, setDiaries] = useState<{ diary: string; count: number }[]>([]);
  const [diarySelected, setDiarySelected] = useState<string>("");
  const [filteredLetters, setFilteredLetters] = useState<Letter[]>([]);
  const [selectedToDeleteIds, setSelectedToDeleteIds] = useState<string[]>([]);

  // Get user letters from the API
  useEffect(() => {
     const fetchletters = async () => {
       const response = await getUserLetters();
      // Set all fields selectedToDelete to false
      response.forEach((letter: Letter) => letter.selectedToDelete = false);
       setletters(response);
     };
     fetchletters();
   }, [reFetchLetters]);

   // Organise letters by diaries on trigger
   useEffect(() => {
    if (!filteredLetters || filteredLetters.length < 1) {return}
     setDiarySelected("");
     const counts = filteredLetters.reduce((acc, letter) => {
      const found = acc.find(item => item.diary === letter.diary);
      if (found) {
        found.count += 1;
      } else {
        acc.push({ diary: letter.diary, count: 1 });
      }
      return acc;
    }, [] as { diary: string; count: number }[]);
    setDiaries(counts);
    setDiaryOrganised(!diaryOrganised);
   }, [orderByDiaryTrigger]);

   // Filter letters by search text
   useEffect(() => {
     const filterLetters = async() => {
        const q = searchFilter.toLowerCase();
        const results = letters.filter(letter =>
          letter.title.toLowerCase().includes(q) ||
          letter.language.toLowerCase().includes(q) ||
          letter.diary.toLowerCase().includes(q) ||
          letter.created_at.toLocaleLowerCase().includes(q)
        );
        setFilteredLetters(results);
     }
     filterLetters();
   }, [searchFilter, letters])

   const goToEditLetter = (id: string) => (event: React.MouseEvent<HTMLDivElement>) => {
       event.stopPropagation();
       event.preventDefault();
       window.location.href = `/edit-letter/${id}`;
    }


    // Cambia selección de delete de un Item, entonces notifica al padre
    const toggleDeleteItem = (letterId: string) => {
      setSelectedToDeleteIds(prevIds => {
        const newIds = prevIds.includes(letterId)
          ? prevIds.filter(id => id !== letterId)
          : [...prevIds, letterId];

        console.log("Nuevo selectedToDeleteIds:", newIds);
        onDeleteListChange(newIds); // pasamos el valor actualizado a la función
        return newIds;
      });
    };



    // Resetea selección al salir de delete mode o al clicar en cancelar
    useEffect(() => {
      setletters(prevLetters => {
        const updatedLetters = prevLetters.map(letter => {
          letter.selectedToDelete = false;
          return letter;
        });
        return updatedLetters;
      }
      );
    }, [resetSelection]);

  const [droppedItems, setDroppedItems] = useState<string[]>([]);
  const handleDropAction = (id: string) => {
    console.log("Dropped item id:", id);
    // Añadir el id a la lista (sin duplicados)
    setDroppedItems((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  if (diaryOrganised && filteredLetters && filteredLetters.length > 0) {
    return(
      <div className="flex flex-row gap-5">
        
        {/* Diaries */}
        <div className="flex flex-col gap-y-3 w-[50%]">
          {diaries.map((diary) =>  (  
          <DropZone onDropAction={handleDropAction} key={diary.diary}>
            <div className="flex flex-row group relative cursor-pointer" onClick={ () => {if (diary.diary === diarySelected) {setDiarySelected("")} else { setDiarySelected(diary.diary)}}}>
              <p className="flex rounded-l-lg bg-yellow-200 shadow-md w-[20%] text-2xl items-center justify-center align-middle">
                <span className="block group-hover:hidden transition-opacity duration-900">
                  {diary.diary === diarySelected ? "📖" : "📘"}
                  </span>
                <span className="hidden group-hover:block transition-opacity duration-900">📖</span>
              </p> 
              <div className={`px-8 py-4 rounded-r-lg bg-gray-50 shadow-md w-full max-w-5xl text-black ${diary.diary === diarySelected && "bg-yellow-50"}`}>
                <p className="font-semibold">{diary.diary}</p>
                <p>{diary.count} letters in this diary</p>
              </div>
            </div>
          </DropZone>
          ))}
        </div>

        {/* Letters */}
        {!diarySelected ? (
          <div className="text-gray-500 bg-white rounded-lg shadow-md flex flex-col gap-y-3 items-center justify-center align-middle p-5 text-center">
          Select a diary and its letters will appear here
          <BookCopy className="h-20 w-20" strokeWidth={0.75}></BookCopy>
          </div>
        ) : ( filteredLetters.filter(letter => letter.diary === diarySelected).length === 0 ? 
        <div className="text-gray-500 bg-white rounded-lg shadow-md flex flex-col gap-y-3 items-center justify-center align-middle p-5 text-center">
          No letters in this diary matching the filter
          <BookX className="h-20 w-20" strokeWidth={0.75}></BookX>
        </div> :  
        <div className="flex flex-col gap-4 custom-scroll h-[60vh] overflow-y-auto w-[50%]">
          {filteredLetters.filter(letter => letter.diary === diarySelected).map((letter, index) => (
            <DraggableItem id={letter._id} key={index}>
              <div className="flex flex-row group relative cursor-pointer" onClick={ goToEditLetter(letter._id)}>
              <p className="flex rounded-l-lg bg-blue-200 shadow-md w-[20%] text-2xl items-center justify-center align-middle">
                <span className="block group-hover:hidden transition-opacity duration-900">✉️</span>
                <span className="hidden group-hover:block transition-opacity duration-900">💌</span>
              </p> 
              <div className="px-8 py-4 rounded-r-lg bg-gray-50 shadow-md w-full max-w-5xl text-black">
                <div className="flex flex-row justify-between">
                  <div className="flex flex-row gap-2 text-gray-500 items-center">
                    <img
                    src={`/flags/${letter.language}.svg`}
                    className="w-5 h-5 rounded-full border border-gray-300 dark:border-gray-600"
                    />
                    <p>{letter.language}</p>
                    </div>
                  <p>{letter.created_at.slice(0, 10)}</p>
                </div>
                <p className="font-semibold">{letter.title}</p>
              </div>
            </div>
            </DraggableItem>
          ))}
        </div>
        )
        }
      </div>
    )
  }
  if (filteredLetters && filteredLetters.length > 0) {
  return (
    <div className="flex flex-col gap-4 max-h-[80%] custom-scroll overflow-y-auto pr-2">
      {filteredLetters.map((letter, index) => (
        <LetterCard
          id={letter._id}
          created_at={letter.created_at}
          diary={letter.diary}
          title={letter.title}
          language={letter.language}
          sharedWith={letter.sharedWith}
          key={index}
          deleteMode={deleteMode || false}
          resetSelection={resetSelection}
          onSelectionChange={toggleDeleteItem}
        />
      ))}
    </div>
  )
  }
  return (
    <div className="text-center text-gray-500 h-[40vh] flex items-center justify-center">
        { !letters || letters.length === 0 ? "No letters found. Start writing your first letter!" : "No letters matching the filter."}
    </div>
  );
};

export default LetterCardList;


function DraggableItem({ id, children, onDrop }: DraggableItemProps) {
  const [dragging, setDragging] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const offsetRef = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    offsetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setPos({ x: e.clientX, y: e.clientY });
    setDragging(true);

    // Para escuchar movimientos globales
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    setPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = (e: MouseEvent) => {
    setDragging(false);
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);

    if (onDrop) {
      onDrop(id, e.clientX, e.clientY);
    }
  };

  return (
    <>
      {/* Elemento original */}
      <div
        onMouseDown={handleMouseDown}
        className="cursor-grab select-none"
      >
        {children}
      </div>

      {/* Elemento flotante que sigue al ratón */}
      {dragging && (
        <div
          className="fixed pointer-events-none p-1 bg-yellow-200 rounded shadow-lg opacity-90"
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



function DropZone({ onDropAction, children }: DropZoneProps) {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Necesario para permitir el drop
    e.dataTransfer.dropEffect = "move";
    setIsOver(true);
  };

  const handleDragLeave = () => setIsOver(false);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(false);
    const id = e.dataTransfer.getData("text/plain");
    if (id) {
      onDropAction(id);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`p-2 rounded border-2 border-dashed border-gray-300 bg-gray-50 ${isOver && "border-blue-400 bg-blue-50"} transition-colors duration-200 `}
      aria-label="Drop zone"
    >
      {children}
    </div>
  );
}