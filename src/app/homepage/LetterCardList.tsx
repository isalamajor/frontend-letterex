"use client";
import { useEffect, useState, useRef } from "react";
import React from "react";
import { useRouter } from "next/navigation";
import LetterCard from "./LetterCard";
import {
  searchLetters,
  searchDiaryLetters,
  deleteLetters,
  getDiariesWithCount,
} from "@/services/api";
import { BookCopy, BookX } from "lucide-react";
import { useDialog } from "@/context/dialogContext";
import { AnimatePresence, motion } from "framer-motion";
import { fadeInOut } from "@/lib/constants";
import type { Letter } from "@/lib/types";
import TablePagination from "@mui/material/TablePagination";

interface ChildProps {
  orderByDiaryTrigger: boolean;
  searchFilter: string;
  deleteMode: boolean;
  onDeleteClicked: boolean;
  allLetterSwipeOpen: boolean;
  onDataLoaded: (noLetters: boolean) => void;
}

const LetterCardList = ({
  orderByDiaryTrigger,
  searchFilter,
  deleteMode,
  allLetterSwipeOpen,
  onDeleteClicked,
  onDataLoaded,
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
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;
  const diaryItemsPerPage = 6;
  const [diaryCurrentPage, setDiaryCurrentPage] = useState<number>(1);
  const [diaryLetters, setDiaryLetters] = useState<Letter[]>([]);
  const [diaryTotalCount, setDiaryTotalCount] = useState<number>(0);
  const [totalLettersCount, setTotalLettersCount] = useState<number>(0);
  const { openDialog, closeDialog } = useDialog();
  const pagesCacheRef = useRef<Record<number, Letter[]>>({});
  const totalPagesRef = useRef<number>(1);
  const totalLettersCountRef = useRef<number>(0);
  const router = useRouter();

  // Initialize letters
  useEffect(() => {
    const callFetchLetters = async () => {
      const zeroLetters = await fetchLetters();
      onDataLoaded(zeroLetters);
    };
    const getDiaries = async () => {
      const res = await getDiariesWithCount();
      if (res.ok) {
        setDiaries(res.data);
      }
    };
    callFetchLetters();
    getDiaries();
  }, []);

  // Get user letters from the API using search
  const fetchLetters = async (page: number = currentPage) => {
    const query = searchFilter || "";

    // Check if page is already cached
    if (pagesCacheRef.current[page]) {
      setletters(pagesCacheRef.current[page]);
      setTotalLettersCount(totalLettersCountRef.current);
      return false;
    }

    const result = await searchLetters(query, page, itemsPerPage);

    if (!result || !result.letters) {
      setletters([]);
      return true;
    }
    console.log("letters:", result);

    const letters = result.letters;
    letters.forEach((letter: Letter) => (letter.selectedToDelete = false));

    // Cache the page
    pagesCacheRef.current[page] = letters;

    setletters(letters);

    // Store total letters count and calculate total pages
    const totalCount = result.totalLetters || 0;
    setTotalLettersCount(totalCount);
    totalLettersCountRef.current = totalCount;
    const totalPagesCount = result.totalPages;
    totalPagesRef.current = totalPagesCount;

    return letters.length === 0;
  };

  const fetchLettersByDiary = async (
    selectedDiary: string,
    page: number = diaryCurrentPage,
  ) => {
    if (!selectedDiary) {
      setDiaryLetters([]);
      setDiaryTotalCount(0);
      return;
    }

    const query = searchFilter || "";
    const result = await searchDiaryLetters(
      query,
      page,
      diaryItemsPerPage,
      selectedDiary,
    );

    if (!result || !result.letters) {
      setDiaryLetters([]);
      setDiaryTotalCount(0);
      return;
    }

    setDiaryLetters(result.letters);
    setDiaryTotalCount(result.totalLetters || 0);
  };

  // Organise letters by diaries on trigger
  useEffect(() => {
    if (!filteredLetters || filteredLetters.length < 1) return;
    setDiarySelected("");
    setDiaryOrganised(!diaryOrganised);
  }, [orderByDiaryTrigger]);

  // Refetch letters when search filter changes
  useEffect(() => {
    // Clear cache when search filter changes
    pagesCacheRef.current = {};
    totalPagesRef.current = 1;
    totalLettersCountRef.current = 0;
    setCurrentPage(1);
    setDiaryCurrentPage(1);
    const refetchLetters = async () => {
      await fetchLetters(1);
    };
    refetchLetters();
  }, [searchFilter]);

  // Refetch letters when page changes
  useEffect(() => {
    const refetchLetters = async () => {
      await fetchLetters(currentPage);
    };
    if (currentPage >= 1) {
      refetchLetters();
    }
  }, [currentPage]);

  // Set filtered letters from fetched letters
  useEffect(() => {
    setFilteredLetters(letters);
  }, [letters]);

  // Prefetch visible edit routes for snappier navigation.
  useEffect(() => {
    filteredLetters.slice(0, 10).forEach((letter) => {
      router.prefetch(`/edit-letter/${letter.id}`);
    });
  }, [filteredLetters, router]);

  useEffect(() => {
    setDiaryCurrentPage(1);
    if (!diarySelected) {
      setDiaryLetters([]);
      setDiaryTotalCount(0);
    }
  }, [diarySelected]);

  useEffect(() => {
    if (!diaryOrganised || !diarySelected || diaryCurrentPage < 1) {
      if (!diarySelected || !diaryOrganised) {
        setDiaryLetters([]);
        setDiaryTotalCount(0);
      }
      return;
    }

    const refetchDiaryLetters = async () => {
      await fetchLettersByDiary(diarySelected, diaryCurrentPage);
    };
    refetchDiaryLetters();
  }, [diaryCurrentPage, diarySelected, diaryOrganised, searchFilter]);

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
              // Clear cache after deletion
              pagesCacheRef.current = {};
              totalLettersCountRef.current = 0;
              resetSelection();
              fetchLetters();
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
      router.push(`/edit-letter/${id}`);
    };

  // Changes the delete selection of an item, then notifies the parent
  const toggleDeleteItem = (letterId: string) => {
    setSelectedToDeleteIds((prevIds) => {
      const newIds = prevIds.includes(letterId)
        ? prevIds.filter((id) => id !== letterId)
        : [...prevIds, letterId];
      return newIds;
    });
  };

  // Resets selection when exiting delete mode or clicking cancel
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

  const showDiaries = diaryOrganised && diaries && diaries.length > 0;

  const handlePageChange = (
    _event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    // TablePagination uses 0-based indexing, convert to 1-based
    setCurrentPage(newPage + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDiaryPageChange = (
    _event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    // TablePagination uses 0-based indexing, convert to 1-based
    setDiaryCurrentPage(newPage + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      {showDiaries ? (
        <motion.div
          key="diary-view"
          {...fadeInOut}
          className="flex flex-row gap-4 pb-10 pt-3"
        >
          {/* Diaries */}
          <div className="flex flex-col gap-y-3 w-[50%]">
            {diaries.map((diary) => (
              <div key={diary.diary}>
                <div
                  className="flex flex-row group relative cursor-pointer dark:text-blue-100"
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
                  <p className="flex rounded-l-lg bg-yellow-200 dark:bg-dark-green-800 shadow-md w-[20%] text-2xl items-center justify-center align-middle">
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
                    className={`px-8 py-4 rounded-r-lg bg-gray-50 dark:bg-neutral-850 shadow-md w-full max-w-5xl text-black dark:text-blue-100 ${diary.diary === diarySelected && "bg-yellow-50 dark:bg-dark-bg-tertiary/50"}`}
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
              </div>
            ))}
          </div>

          {/* Letters */}
          {!diarySelected ? (
            <motion.div
              key="select-diary"
              {...fadeInOut}
              className="text-gray-500 dark:text-blue-100 bg-white dark:bg-neutral-800 rounded-lg shadow-md flex flex-col gap-y-3 items-center justify-center align-middle p-5 text-center h-[15rem]"
            >
              Select a diary and its letters will appear here
              <BookCopy className="h-20 w-20" strokeWidth={0.75}></BookCopy>
            </motion.div>
          ) : diaryLetters.length === 0 ? (
            <div className="text-gray-500 dark:text-blue-00 bg-white dark:bg-neutral-800 rounded-lg shadow-md flex flex-col gap-y-3 items-center justify-center align-middle p-5 text-center">
              No letters in this diary matching the filter
              <BookX className="h-20 w-20" strokeWidth={0.75}></BookX>
            </div>
          ) : (
            <motion.div
              key="list-letters"
              {...fadeInOut}
              className="flex flex-col gap-4 h-[60vh] w-[50%]"
            >
              {diaryLetters.map((letter, index) => (
                <div key={index}>
                  <div
                    className="flex flex-row group relative cursor-pointer"
                    onMouseEnter={() =>
                      router.prefetch(`/edit-letter/${letter.id}`)
                    }
                    onClick={goToEditLetter(letter.id)}
                  >
                    <p className="flex rounded-l-lg bg-blue-200 dark:bg-dark-green-600 shadow-md w-[20%] text-2xl items-center justify-center align-middle">
                      <span className="block group-hover:hidden transition-opacity duration-900">
                        ✉️
                      </span>
                      <span className="hidden group-hover:block transition-opacity duration-900">
                        💌
                      </span>
                    </p>
                    <div className="px-8 py-4 rounded-r-lg bg-gray-50 dark:bg-neutral-850 shadow-md w-full max-w-5xl text-black dark:text-gray-200">
                      <div className="flex flex-row justify-between">
                        <div className="flex flex-row gap-2 text-gray-500 items-center">
                          <img
                            src={`/flags/${letter.language}.svg`}
                            className="w-5 h-5 rounded-full border border-gray-300 dark:border-gray-600"
                          />
                          <p>{letter.language}</p>
                        </div>
                        <p className="dark:text-green-100">
                          {letter.created_at.slice(5, 10)}
                        </p>
                      </div>
                      <p className="font-semibold">{letter.title}</p>
                    </div>
                  </div>
                </div>
              ))}
              {diaryTotalCount > diaryItemsPerPage && (
                <div className="flex justify-end mt-2">
                  <TablePagination
                    component="div"
                    count={diaryTotalCount}
                    page={diaryCurrentPage - 1}
                    onPageChange={handleDiaryPageChange}
                    rowsPerPage={diaryItemsPerPage}
                    rowsPerPageOptions={[]}
                    className="text-gray-700 dark:text-gray-200"
                    sx={{
                      color: "rgb(55 65 81)",
                      "& .MuiTablePagination-toolbar": { color: "inherit" },
                      "& .MuiTablePagination-selectLabel": { color: "inherit" },
                      "& .MuiTablePagination-displayedRows": {
                        color: "inherit",
                      },
                      "& .MuiTablePagination-actions": { color: "inherit" },
                      "& .MuiSvgIcon-root": { color: "inherit" },
                      ".dark &": { color: "rgb(243 244 246)" },
                      ".dark & .MuiTablePagination-toolbar": {
                        color: "rgb(243 244 246)",
                      },
                      ".dark & .MuiTablePagination-selectLabel": {
                        color: "rgb(243 244 246)",
                      },
                      ".dark & .MuiTablePagination-displayedRows": {
                        color: "rgb(243 244 246)",
                      },
                      ".dark & .MuiTablePagination-actions": {
                        color: "rgb(243 244 246)",
                      },
                      ".dark & .MuiSvgIcon-root": {
                        color: "rgb(243 244 246)",
                      },
                    }}
                  />
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      ) : (
        <>
          {/* Pagination */}
          {totalLettersCount > 0 && (
            <div className="flex justify-end mt-5">
              <TablePagination
                component="div"
                count={totalLettersCount}
                page={currentPage - 1}
                onPageChange={handlePageChange}
                rowsPerPage={itemsPerPage}
                rowsPerPageOptions={[]}
                className="text-gray-700 dark:text-gray-200"
                sx={{
                  color: "rgb(55 65 81)",
                  "& .MuiTablePagination-toolbar": { color: "inherit" },
                  "& .MuiTablePagination-selectLabel": { color: "inherit" },
                  "& .MuiTablePagination-displayedRows": { color: "inherit" },
                  "& .MuiTablePagination-actions": { color: "inherit" },
                  "& .MuiSvgIcon-root": { color: "inherit" },
                  ".dark &": { color: "rgb(243 244 246)" },
                  ".dark & .MuiTablePagination-toolbar": {
                    color: "rgb(243 244 246)",
                  },
                  ".dark & .MuiTablePagination-selectLabel": {
                    color: "rgb(243 244 246)",
                  },
                  ".dark & .MuiTablePagination-displayedRows": {
                    color: "rgb(243 244 246)",
                  },
                  ".dark & .MuiTablePagination-actions": {
                    color: "rgb(243 244 246)",
                  },
                  ".dark & .MuiSvgIcon-root": {
                    color: "rgb(243 244 246)",
                  },
                }}
              />
            </div>
          )}
          <motion.div
            key="list-view"
            {...fadeInOut}
            className="flex flex-col h-full sm:h-[64vh] pb-10"
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
              <div className="text-center text-gray-500 h-full flex items-center justify-center">
                {!letters || letters.length === 0
                  ? "No letters found. Start writing your first letter!"
                  : "No letters matching the filter."}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LetterCardList;
