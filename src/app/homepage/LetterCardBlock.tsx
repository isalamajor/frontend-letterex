"use client";
import { useState } from "react";
import React from "react";
import { Trash2, X, Eye, EyeOff, Search } from "lucide-react";
import Link from "next/link";
import LetterCardList from "./LetterCardList";
import { AnimatePresence, motion } from "framer-motion";
import { fadeInOut } from "@/lib/constants";

interface settingsLetterList {
  orderByDiaries: boolean;
  searchFilter: string;
  deleteMode: boolean;
  allLetterSwipeOpen: boolean;
}

export function LetterCardBlock() {
  const [settings, setSettings] = useState<settingsLetterList>({
    orderByDiaries: false,
    searchFilter: "",
    deleteMode: false,
    allLetterSwipeOpen: false,
  });
  const [deleteTriggerEvent, setDeleteTriggerEvent] = useState<boolean>(false);
  const [noLetters, setNoLetters] = useState<boolean>(false);
  if (noLetters) {
    return (
      <>
        <div className="flex gap-2 flex-col lg:flex-row justify-end">
          <NewLetterButton />
        </div>
        <div className="text-center text-gray-500 h-[40vh] flex items-center justify-center">
          No letters found. Start writing your first letter!
        </div>
      </>
    );
  }
  return (
    <>
      <div className="flex gap-2 flex-col lg:flex-row justify-between items-center mb-4">
        <div className="flex flex-row gap-2 cursor-pointer border border-lightblack text-gray-700 rounded-sm py-2 px-4 bg-gray-50">
          <Search className="text-gray-500" />
          <input
            placeholder="Search a letter..."
            className="w-full outline-none"
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
                  className="cursor-pointer text-gray-700 border border-lightblack rounded-sm bg-gray-150 shadow-md p-2 hover:bg-gray-50"
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
            ) : (
              <motion.div
                key="normal-mode"
                {...fadeInOut}
                className="flex gap-2"
              >
                <button
                  className="cursor-pointer text-gray-700 border border-lightblack rounded-sm bg-gray-150 dark:bg-neutral-800 shadow-md py-2 px-4 hover:bg-gray-50"
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
                  className="cursor-pointer text-gray-700 border border-lightblack rounded-sm bg-gray-150 dark:bg-neutral-800 shadow-md py-2 px-4 hover:bg-gray-50"
                  onClick={() =>
                    setSettings({
                      ...settings,
                      orderByDiaries: !settings.orderByDiaries,
                    })
                  }
                >
                  {settings.orderByDiaries
                    ? "✉️ Show all"
                    : "📚 Order by diary"}
                </button>
                <NewLetterButton />
                <button
                  className="cursor-pointer text-gray-700 border border-lightblack rounded-sm bg-gray-150 shadow-md p-2 hover:bg-gray-50"
                  onClick={() => setSettings({ ...settings, deleteMode: true })}
                >
                  <Trash2 />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <LetterCardList
        orderByDiaryTrigger={settings.orderByDiaries}
        searchFilter={settings.searchFilter}
        deleteMode={settings.deleteMode}
        onDeleteClicked={deleteTriggerEvent}
        allLetterSwipeOpen={settings.allLetterSwipeOpen}
        onNoLetters={() => setNoLetters(true)}
      ></LetterCardList>
    </>
  );
}

const NewLetterButton = () => {
  return (
    <Link href="/new-letter">
      <button className="cursor-pointer text-gray-700 border border-lightblack rounded-sm bg-gray-150 dark:bg-neutral-800 shadow-md py-2 px-4 hover:bg-gray-50">
        💌 New
      </button>
    </Link>
  );
};
