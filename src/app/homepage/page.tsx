"use client";
import { useState, useEffect, useContext } from "react";
import LetterCardBlock from "./LetterCardBlock";
import Image from "next/image";
import ReceivedLetterBlock from "./ReceivedLetterBlock";
import { UserContext } from "@/context/userContext";
import { isUserComplete } from "@/lib/utils";
import { getUserData } from "@/services/api";
import { useRouter } from "next/navigation";

export default function Home() {
  const { userData, setUserData } = useContext(UserContext);
  const router = useRouter();

  const fetchUserData = async () => {
    if (!isUserComplete(userData)) {
      const me = await getUserData();
      if (me.data) {
        setUserData(me.data);
      } else {
        router.push("/");
      }
    }
  };
  useEffect(() => {
    fetchUserData();
    setTimeout(() => {}, 30000);
  }, []);

  return <HomepageContent />;
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
  }, []);

  return (
    <div
      className="p-2 md:p-10 md:pt-2 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-850
      h-screen custom-scroll box-border overflow-auto overflow-x-hidden
      sm:h-full sm:overflow-hidden pb-6 sm:pb-2"
    >
      <div className="relative h-15 m-2 sm:h-20 mx-auto flex w-full justify-center">
        <Image
          src="/letter-logo-2.png"
          alt="Letterex"
          width={350}
          height={200}
          sizes="350x200"
          className="object-cover transition-transform duration-300 hover:-translate-y-1 hover:scale-105"
        />
      </div>

      <div className="flex flex-col pb-10 sm:pb-0 sm:flex-row gap-2 flex-1 sm:scrolling-auto h-[90%]">
        <div className="flex flex-row gap-2 justify-center sm:hidden">
          <button
            onClick={() => setSectionVisible(1)}
            className={`rounded-full border border-1 px-3 py-1 ${sectionVisible === 1 ? "border-black dark:border-neutral-600 bg-gray-300 dark:bg-neutral-700 text-gray-900 dark:text-gray-100" : " border-gray-500 dark:border-neutral-700 bg-gray-100 dark:bg-neutral-800 text-gray-800 dark:text-gray-300"}`}
          >
            Letters written
          </button>
          <button
            onClick={() => setSectionVisible(2)}
            className={`rounded-full border border-1 px-3 py-1 ${sectionVisible === 2 ? "border-black dark:border-neutral-600 bg-gray-300 dark:bg-neutral-700 text-gray-900 dark:text-gray-100" : " border-gray-500 dark:border-neutral-700 bg-gray-100 dark:bg-neutral-800 text-gray-800 dark:text-gray-300"}`}
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
