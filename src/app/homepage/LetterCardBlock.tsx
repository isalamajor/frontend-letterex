"use client";
import { useState, useCallback } from "react";
import React from "react";
import { Trash2, X, Eye, EyeOff, Search } from "lucide-react";
import Link from "next/link";
import LetterCardList from "./LetterCardList";
import { AnimatePresence, motion } from "framer-motion";
import { fadeInOut } from "@/lib/constants";
import { Spinner } from "@/components/ui/spinner-1";

interface settingsLetterList {
  orderByDiaries: boolean;
  searchFilter: string;
  deleteMode: boolean;
  allLetterSwipeOpen: boolean;
  isLoading: boolean;
}

export default function LetterCardBlock() {
  const [settings, setSettings] = useState<settingsLetterList>({
    orderByDiaries: false,
    searchFilter: "",
    deleteMode: false,
    allLetterSwipeOpen: false,
    isLoading: true,
  });
  const [deleteTriggerEvent, setDeleteTriggerEvent] = useState<boolean>(false);
  const [noLetters, setNoLetters] = useState<boolean>(false);

  const handleDataLoaded = useCallback((zeroLetters: boolean) => {
    setSettings((prev) => ({ ...prev, isLoading: false }));
    setNoLetters(zeroLetters);
  }, []);

  if (noLetters) {
    return (
      <div className="flex-1 w-full rounded-lg bg-gray-100 dark:bg-neutral-800 px-8 h-full">
        <h2 className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#246135] via-[#3C8632] to-[#82BC6A] p-4">
          Letters written
        </h2>
        <div className="flex gap-2 flex-col lg:flex-row justify-end">
          <NewLetterButton />
        </div>
        <div className="text-center text-gray-500 h-[70%] flex items-center justify-center">
          No letters found. Start writing your first letter!
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full rounded-lg bg-gray-100 dark:bg-neutral-800 px-8 ">
      <h2 className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#246135] via-[#3C8632] to-[#82BC6A] p-4 dark:from-green-400 dark:via-dark-green-800 to-dark-green-800 ">
        Letters written
      </h2>
      <div className="flex gap-2 flex-col lg:flex-row justify-between items-center text-gray-800 dark:text-gray-200">
        <div className="flex flex-row gap-2 cursor-pointer border border-lightblack dark:border-neutral-700 rounded-sm py-2 px-4 bg-gray-50 dark:bg-neutral-850">
          <Search className="text-gray-500" />
          <input
            placeholder="Search a letter..."
            className="w-full outline-none bg-transparent placeholder:text-gray-500"
            value={settings.searchFilter}
            onChange={(e) => {
              setSettings({ ...settings, searchFilter: e.target.value });
            }}
          ></input>
        </div>
        <div className="flex justify-center sm:justify-end items-center gap-2">
          <AnimatePresence mode="wait" initial={false}>
            {settings.deleteMode ? (
              <motion.div
                key="delete-mode"
                {...fadeInOut}
                className="flex gap-2"
              >
                <button
                  className="cursor-pointer text-white border border-lightblack rounded-sm bg-red-500 shadow-md p-2 hover:bg-red-700"
                  onClick={() => setDeleteTriggerEvent(!deleteTriggerEvent)}
                >
                  <Trash2 />
                </button>
                <button
                  className="cursor-pointer text-gray-700 dark:text-gray-200 border border-lightblack dark:border-neutral-700 rounded-sm bg-gray-150 dark:bg-neutral-800 shadow-md p-2 hover:bg-gray-50 dark:hover:bg-neutral-700"
                  onClick={() =>
                    setSettings({
                      ...settings,
                      deleteMode: !settings.deleteMode,
                    })
                  }
                >
                  <X />
                </button>
              </motion.div>
            ) : settings.orderByDiaries ? (
              <motion.div
                key="diary-mode"
                {...fadeInOut}
                className="flex gap-2 text-gray-700 dark:text-gray-150"
              >
                <button
                  className="cursor-pointer border border-lightblack dark:border-neutral-700 rounded-sm bg-gray-150 dark:bg-neutral-800 shadow-md py-2 px-4 hover:bg-gray-50 dark:hover:bg-neutral-700"
                  onClick={() =>
                    setSettings({
                      ...settings,
                      orderByDiaries: !settings.orderByDiaries,
                    })
                  }
                >
                  ✉️ Show all
                </button>
                <NewLetterButton />
              </motion.div>
            ) : (
              <motion.div
                key="normal-mode"
                {...fadeInOut}
                className="flex gap-2 text-gray-700 dark:text-gray"
              >
                <button
                  className="cursor-pointer border border-lightblack dark:border-neutral-700 rounded-sm bg-gray-150 dark:bg-neutral-800 shadow-md py-2 px-4 hover:bg-gray-50 dark:hover:bg-neutral-700"
                  onClick={() =>
                    setSettings({
                      ...settings,
                      allLetterSwipeOpen: !settings.allLetterSwipeOpen,
                    })
                  }
                >
                  {settings.allLetterSwipeOpen ? <EyeOff /> : <Eye />}
                </button>
                <button
                  className="cursor-pointer border border-lightblack dark:border-neutral-700 rounded-sm bg-gray-150 dark:bg-neutral-800 shadow-md py-2 px-4 hover:bg-gray-50 dark:hover:bg-neutral-700"
                  onClick={() =>
                    setSettings({
                      ...settings,
                      orderByDiaries: !settings.orderByDiaries,
                    })
                  }
                >
                  📚 Order by diary
                </button>
                <NewLetterButton />
                <button
                  className="cursor-pointer border border-lightblack dark:border-neutral-700 rounded-sm bg-gray-150 dark:bg-neutral-800 shadow-md p-2 hover:bg-gray-50 dark:hover:bg-neutral-700"
                  onClick={() => setSettings({ ...settings, deleteMode: true })}
                >
                  <Trash2 />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {settings.isLoading && (
        <div className="flex justify-center items-center h-[70vh]">
          <Spinner size={40} color="gray" />
        </div>
      )}

      <div className={settings.isLoading ? "hidden" : ""}>
        <LetterCardList
          orderByDiaryTrigger={settings.orderByDiaries}
          searchFilter={settings.searchFilter}
          deleteMode={settings.deleteMode}
          onDeleteClicked={deleteTriggerEvent}
          allLetterSwipeOpen={settings.allLetterSwipeOpen}
          onDataLoaded={handleDataLoaded}
        />
      </div>
    </div>
  );
}

const NewLetterButton = () => {
  return (
    <Link href="/new-letter">
      <button className="cursor-pointer text-gray-700 dark:text-gray border border-lightblack dark:border-neutral-700 rounded-sm bg-gray-150 dark:bg-neutral-800 shadow-md py-2 px-4 hover:bg-gray-50 dark:hover:bg-neutral-700">
        💌 New
      </button>
    </Link>
  );
};
