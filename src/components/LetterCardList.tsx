
"use client";
import { useEffect } from "react";
import React from "react";
import LetterCard from "./LetterCard";
import { getUserLetters } from "../services/api";

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

const LetterCardList = () => {
  const [letters, setletters] = React.useState<LetterCardListProps["letters"]>([]);

  // Get user letters from the API
  useEffect(() => {
     const fetchletters = async () => {
       const response = await getUserLetters();
       
       console.log("Letters fetched:", response);
       setletters(response);
     };
     fetchletters();
   }, []);

  if (letters && letters.length > 0) {
  return (
    <div className="flex flex-col gap-4 max-h-[80%] custom-scroll overflow-y-auto pr-2">
      {letters.map((letter, index) => (
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
          No letters found. Start writing your first letter!
        </div>
  );
};

export default LetterCardList;