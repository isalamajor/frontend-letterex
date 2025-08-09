"use client";
import LetterCard from "@/components/LetterCard";
import LetterCardList from "@/components/LetterCardList";
import ReceivedLetterList from "@/components/ReceivedLetterList";
import { SidebarDemo } from "@/components/sidebardemo";
import Link from "next/link";

export default function Home() {
  return (
    <div className="page-container">
      <SidebarDemo>
        <HomepageContent/>
      </SidebarDemo>
    </div>
  );
}



const HomepageContent = () => {
  return (
      <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full">
        <div className="flex gap-2 h-[15%]">
          <img src="/letter-logo.png" className="h-25 mx-auto mt-4"/>
        </div>
        <div className="flex gap-2 flex-1 h-[85%]">
            <div
              className="h-full w-full rounded-lg bg-gray-100 dark:bg-neutral-800 px-6"
            >
             <h2
                className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#57A02D] via-[#39c167] to-[#004D40] p-4 transition-transform duration-300 animate-gradient"
              >
                Letters written
              </h2>

              <div className="flex justify-end">
                <Link href={"/new-letter"}>
                  <button className="text-gray-700 border border-lightblack rounded-sm bg-gray-150 dark:bg-neutral-800 shadow-md py-2 px-4 mb-4 hover:bg-gray-50">
                    💌 New
                  </button>
                </Link>
              </div>

              {/* Card with letter details */}
              <LetterCardList></LetterCardList>
            </div>
            <div
              className="h-full w-full rounded-lg bg-gray-100 dark:bg-neutral-800"
            >
              <h2 className="text-right text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#242424] via-[#333333] to-[#4d4d4d] p-4 transition-transform duration-300 animate-gradient-dark"
              >
              Letters received  
              </h2>
              <ReceivedLetterList></ReceivedLetterList>
            </div>
        </div>
      </div>
  );
};

