"use client";
import { SidebarDemo } from "@/components/sidebardemo";
import { useState, useEffect } from "react";
import LetterCardBlock from "./LetterCardBlock";
import ReceivedLetterBlock from "./ReceivedLetterBlock";

export default function Home() {
  return (
    <SidebarDemo>
      <HomepageContent />
    </SidebarDemo>
  );
}

const HomepageContent = () => {
  const [sectionVisible, setSectionVisible] = useState<number>(0);

  useEffect(() => {
    const selectSectionVisible = () => {
      if (window.innerWidth < 768) {
        setSectionVisible(1);
      }
    };

    selectSectionVisible();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="p-2 md:p-10 md:pt-2 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900
      h-screen custom-scroll box-border overflow-auto overflow-x-hidden
      sm:h-full sm:overflow-hidden pb-6 sm:pb-2"
    >
      <img
        src="/letter-logo-2.png"
        alt="Letterex"
        className="h-15 m-2 sm:h-20 mx-auto object-cover transition-transform duration-300 hover:-translate-y-1 hover:scale-105"
      />

      <div className="flex flex-col pb-10 sm:pb-0 sm:flex-row gap-2 flex-1 sm:scrolling-auto h-[90%]">
        <div className="flex flex-row gap-2 justify-center sm:hidden">
          <button
            onClick={() => setSectionVisible(1)}
            className={`rounded-full border border-1 px-3 py-1 ${sectionVisible === 1 ? "border-black bg-gray-300 text-gray-900" : " border-gray-500 bg-gray-100 text-gray-800"}`}
          >
            Letters written
          </button>
          <button
            onClick={() => setSectionVisible(2)}
            className={`rounded-full border border-1 px-3 py-1 ${sectionVisible === 2 ? "border-black bg-gray-300 text-gray-900" : " border-gray-500 bg-gray-100 text-gray-800"}`}
          >
            Letters received
          </button>
        </div>
        {/* Letters written */}

        {sectionVisible !== 2 && <LetterCardBlock />}

        {/* Letters received */}
        {sectionVisible !== 1 && <ReceivedLetterBlock />}
      </div>
    </div>
  );
};
