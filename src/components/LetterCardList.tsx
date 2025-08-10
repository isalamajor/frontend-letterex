
"use client";
import { useEffect, useState } from "react";
import React from "react";
import LetterCard from "./LetterCard";
import { getUserLetters } from "../services/api";
import { unique } from "next/dist/build/utils";
import { BookCopy, BookX } from "lucide-react";

interface LetterCardListProps {
  letters: {
    _id: string;
    created_at: string;
    diary: string;
    title: string;
    language: string;
    sharedWith: { nickname: string; avatar: string; correctionSentBack: boolean; correctedLetterId: string }[];
  }[];
}

interface ChildProps {
  orderByDiaryTrigger: number; 
  searchFilter: string;
}

const LetterCardList = ({ orderByDiaryTrigger, searchFilter } : ChildProps) => {
  const [letters, setletters] = useState<LetterCardListProps["letters"]>([]);
  const [diaryOrganised, setDiaryOrganised] = useState<boolean>(false);
  const [diaries, setDiaries] = useState<{ diary: string; count: number }[]>([]);
  const [diarySelected, setDiarySelected] = useState<string>("");
  const [filteredLetters, setFilteredLetters] = useState<LetterCardListProps["letters"]>([]);

  // Get user letters from the API
  useEffect(() => {
     const fetchletters = async () => {
       const response = await getUserLetters();
       
       console.log("Letters fetched:", response);
       setletters(response);
     };
     fetchletters();
   }, []);

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

  if (diaryOrganised && filteredLetters && filteredLetters.length > 0) {
    return(
      <div className="flex flex-row gap-5">
        
        {/* Diaries */}
        <div className="flex flex-col gap-y-3 w-[50%]">
          {diaries.map((diary) =>  (  
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
            <div className="flex flex-row group relative cursor-pointer" onClick={ goToEditLetter(letter._id)}>
            <p className="flex rounded-l-lg bg-blue-200 shadow-md w-[20%] text-2xl items-center justify-center align-middle">
              <span className="block group-hover:hidden transition-opacity duration-900">✉️</span>
              <span className="hidden group-hover:block transition-opacity duration-900">💌</span>
            </p> 
            <div className="px-8 py-4 rounded-r-lg bg-gray-50 shadow-md w-full max-w-5xl text-black">
              <div className="flex flex-row justify-between">
                <div className="flex flex-row gap-2 text-gray-500 items-center">
                  <img
                  src={`/flags/${letter.language}.png`}
                  className="w-5 h-5 rounded-full border border-gray-300 dark:border-gray-600"
                  />
                  <p>{letter.language}</p>
                  </div>
                <p>{letter.created_at.slice(0, 10)}</p>
              </div>
              <p className="font-semibold">{letter.title}</p>
            </div>
          </div>
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