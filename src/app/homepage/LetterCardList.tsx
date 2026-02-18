"use client";
import { useEffect, useState, useRef } from "react";
import React from "react";
import LetterCard from "./LetterCard";
import {
  getUserLetters,
  changeLetterDiary,
  deleteLetters,
} from "@/services/api";
import { BookCopy, BookX } from "lucide-react";
import { useDialog } from "@/context/dialogContext";
import DraggableItem from "@/components/DraggableItem";
import DropZone from "@/components/DropZone";
import { AnimatePresence, motion } from "framer-motion";
import { fadeInOut } from "@/lib/constants";
import type { Letter } from "@/lib/types";

interface ChildProps {
  orderByDiaryTrigger: boolean;
  searchFilter: string;
  deleteMode: boolean;
  onDeleteClicked: boolean;
  allLetterSwipeOpen: boolean;
  onNoLetters: () => void;
}

const LetterCardList = ({
  orderByDiaryTrigger,
  searchFilter,
  deleteMode,
  allLetterSwipeOpen,
  onDeleteClicked,
  onNoLetters,
}: ChildProps) => {
  const [letters, setletters] = useState<Letter[]>([]);
  const [diaryOrganised, setDiaryOrganised] = useState<boolean>(false);
  const [diaries, setDiaries] = useState<{ diary: string; count: number }[]>(
    [],
  );
  const [diarySelected, setDiarySelected] = useState<string>("");
  const [filteredLetters, setFilteredLetters] = useState<Letter[]>([]);
  const [selectedToDeleteIds, setSelectedToDeleteIds] = useState<string[]>([]);
  const [resetSelectionToDelete, setResetSelectionToDelete] =
    useState<boolean>(false);
  const { openDialog, closeDialog } = useDialog();

  // Get user letters from the API
  const reFetchLetters = () => {
    const fetchletters = async () => {
      const response = await getUserLetters();
      // Set all fields selectedToDelete to false
      response.forEach((letter: Letter) => (letter.selectedToDelete = false));
      setletters(response);
      if (response.length === 0) {
        onNoLetters();
      }
    };
    fetchletters();
  };

  // Initialize letters
  useEffect(() => {
    reFetchLetters();
  }, []);

  // Organise letters by diaries on trigger
  useEffect(() => {
    if (!filteredLetters || filteredLetters.length < 1) return;
    setDiarySelected("");
    const counts = filteredLetters.reduce(
      (acc, letter) => {
        const diaryName =
          letter.diary && letter.diary.trim() !== ""
            ? letter.diary
            : "Unclassified";
        const found = acc.find((item) => item.diary === diaryName);

        if (found) {
          found.count += 1;
        } else {
          acc.push({ diary: letter.diary || "Unclassified", count: 1 });
        }
        return acc;
      },
      [] as { diary: string; count: number }[],
    );
    setDiaries(counts);
    setDiaryOrganised(!diaryOrganised);
  }, [orderByDiaryTrigger]);

  // Filter letters by search text
  useEffect(() => {
    const filterLetters = async () => {
      const q = searchFilter.toLowerCase();
      const results = letters.filter(
        (letter) =>
          letter.title.toLowerCase().includes(q) ||
          letter.language.toLowerCase().includes(q) ||
          (letter.diary && letter.diary.toLowerCase().includes(q)) ||
          letter.created_at.toLocaleLowerCase().includes(q),
      );
      setFilteredLetters(results);
    };
    filterLetters();
  }, [searchFilter, letters]);

  // Delete selected letters
  useEffect(() => {
    const deleteSelectedLetters = async () => {
      if (selectedToDeleteIds.length < 1) return;
      if (deleteMode) {
        openDialog({
          title: "Are you sure you want to delete the selected letters?",
          description: "This action cannot be undone.",
          type: "askConfirmation",
          primaryActionText: "Cancel",
          autoDismiss: false,
          onConfirmationPositive: async () => {
            const deletedCount = await deleteLetters(selectedToDeleteIds);
            closeDialog();
            if (deletedCount < 0) {
              openDialog({
                title: "Error",
                description: "An error occurred while deleting the letters.",
                type: "error",
                primaryActionText: "Ok",
                autoDismiss: true,
              });
            } else {
              resetSelection();
              reFetchLetters();
              closeDialog();
            }
          },
        });
      }
    };
    deleteSelectedLetters();
  }, [onDeleteClicked]);

  const goToEditLetter =
    (id: string) => (event: React.MouseEvent<HTMLDivElement>) => {
      event.stopPropagation();
      event.preventDefault();
      window.location.href = `/edit-letter/${id}`;
    };

  // Cambia selección de delete de un Item, entonces notifica al padre
  const toggleDeleteItem = (letterId: string) => {
    setSelectedToDeleteIds((prevIds) => {
      const newIds = prevIds.includes(letterId)
        ? prevIds.filter((id) => id !== letterId)
        : [...prevIds, letterId];
      return newIds;
    });
  };

  // Resetea selección al salir de delete mode o al clicar en cancelar
  const resetSelection = () => {
    setletters((prevLetters) => {
      const updatedLetters = prevLetters.map((letter) => {
        letter.selectedToDelete = false;
        return letter;
      });
      return updatedLetters;
    });
    setResetSelectionToDelete(!resetSelectionToDelete);
  };

  const handleDropAction = (
    letterId: string,
    oldDiary: string,
    newDiary: string,
  ) => {
    console.log("Cambiar de ", oldDiary, " a ", newDiary);
    if (oldDiary === newDiary) return;
    changeLetterDiary(letterId, newDiary);
  };

  const showDiaries =
    diaryOrganised && filteredLetters && filteredLetters.length > 0;

  console.log("showDiaries:", showDiaries, "diaryOrganised:", diaryOrganised);

  return (
    <AnimatePresence mode="wait" initial={false}>
      {showDiaries ? (
        <motion.div
          key="diary-view"
          {...fadeInOut}
          className="flex flex-row gap-5 h-full sm:custom-scroll"
        >
          {/* Diaries */}
          <div className="flex flex-col gap-y-3 w-[50%]">
            {diaries.map((diary) => (
              <DropZone
                onDropAction={handleDropAction}
                key={diary.diary}
                diaryDropZone={diary.diary}
              >
                <div
                  className="flex flex-row group relative cursor-pointer"
                  onClick={() => {
                    if (diary.diary === diarySelected) {
                      setDiarySelected("");
                    } else {
                      if (!diary.diary || diary.diary === "")
                        setDiarySelected("Unclassified");
                      else setDiarySelected(diary.diary);
                    }
                  }}
                >
                  <p className="flex rounded-l-lg bg-yellow-200 shadow-md w-[20%] text-2xl items-center justify-center align-middle">
                    <span className="block group-hover:hidden transition-opacity duration-900">
                      {diary.diary === "Unclassified"
                        ? diary.diary === diarySelected
                          ? "📃"
                          : "📤" // Unclassified
                        : diary.diary === diarySelected
                          ? "📖"
                          : "📘"}
                    </span>
                    <span className="hidden group-hover:block transition-opacity duration-900">
                      {diary.diary === "Unclassified" ? "📃" : "📖"}{" "}
                    </span>
                  </p>
                  <div
                    className={`px-8 py-4 rounded-r-lg bg-gray-50 shadow-md w-full max-w-5xl text-black ${diary.diary === diarySelected && "bg-yellow-50"}`}
                  >
                    <p className="font-semibold">
                      {diary.diary === "Unclassified"
                        ? "Unclassified"
                        : diary.diary}
                    </p>
                    <p>
                      {diary.count} letters{" "}
                      {diary.diary !== "Unclassified" && "in this diary"}
                    </p>
                  </div>
                </div>
              </DropZone>
            ))}
          </div>

          {/* Letters */}
          {!diarySelected ? (
            <motion.div
              key="select-diary"
              {...fadeInOut}
              className="text-gray-500 bg-white rounded-lg shadow-md flex flex-col gap-y-3 items-center justify-center align-middle p-5 text-center h-[15rem]"
            >
              Select a diary and its letters will appear here
              <BookCopy className="h-20 w-20" strokeWidth={0.75}></BookCopy>
            </motion.div>
          ) : filteredLetters.filter((letter) => {
              if (diarySelected === "Unclassified") {
                return !letter.diary || letter.diary.trim() === "";
              }
              return letter.diary === diarySelected;
            }).length === 0 ? (
            <div className="text-gray-500 bg-white rounded-lg shadow-md flex flex-col gap-y-3 items-center justify-center align-middle p-5 text-center">
              No letters in this diary matching the filter
              <BookX className="h-20 w-20" strokeWidth={0.75}></BookX>
            </div>
          ) : (
            <motion.div
              key="list-letters"
              {...fadeInOut}
              className="flex flex-col gap-4 custom-scroll h-[60vh] overflow-y-auto w-[50%]"
            >
              {filteredLetters
                .filter((letter) => {
                  if (diarySelected === "Unclassified") {
                    return !letter.diary || letter.diary.trim() === "";
                  }
                  return letter.diary === diarySelected;
                })
                .map((letter, index) => (
                  <DraggableItem
                    id={letter.id}
                    key={index}
                    diaryName={letter.diary || "Unclassified"}
                  >
                    <div
                      className="flex flex-row group relative cursor-pointer"
                      onClick={goToEditLetter(letter.id)}
                    >
                      <p className="flex rounded-l-lg bg-blue-200 shadow-md w-[20%] text-2xl items-center justify-center align-middle">
                        <span className="block group-hover:hidden transition-opacity duration-900">
                          ✉️
                        </span>
                        <span className="hidden group-hover:block transition-opacity duration-900">
                          💌
                        </span>
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
            </motion.div>
          )}
        </motion.div>
      ) : (
        <motion.div
          key="list-view"
          {...fadeInOut}
          className="flex flex-col gap-4 h-full sm:h-[70vh] custom-scroll overflow-y-auto pb-10"
        >
          {filteredLetters && filteredLetters.length > 0 ? (
            filteredLetters.map((letter, index) => (
              <LetterCard
                id={letter.id}
                created_at={letter.created_at}
                diary={letter.diary}
                title={letter.title}
                language={letter.language}
                sharedWith={letter.sharedWith}
                key={index}
                deleteMode={deleteMode || false}
                swipeOpen={allLetterSwipeOpen || false}
                resetSelection={resetSelectionToDelete}
                onSelectionChange={toggleDeleteItem}
              />
            ))
          ) : (
            <div className="text-center text-gray-500 h-[40vh] flex items-center justify-center">
              {!letters || letters.length === 0
                ? "No letters found. Start writing your first letter!"
                : "No letters matching the filter."}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LetterCardList;
