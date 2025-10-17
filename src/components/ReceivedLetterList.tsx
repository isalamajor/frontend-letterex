
import { useEffect, useState } from "react";
import React from "react";
import ReceivedLetterCardProps from "./ReceivedLetterCard";
import { getReceivedLetters } from "@/services/api";

interface ReceivedLetterListProps {
  letters: {
    _id: string;
    originalLetter: {
      _id: string;
      author: string;
      title: string;
      language: string;
      created_at: string;
      deleted: boolean;
    };
    sender: {
      _id: string;
      nickname: string;
      image: string;
    };
    sentBack: boolean;
    corrected_at: string;
    received_at: string;
    seen: boolean;
  }[];
}

interface ChildProps {
  orderBySender: string; 
  searchFilter: string;
  showOnlyPending?: boolean;
  refresh: number;
}
  

const ReceivedLetterList = ({ orderBySender, searchFilter, showOnlyPending, refresh } : ChildProps) => {
  const [letters, setletters] = useState<ReceivedLetterListProps["letters"]>([]);
  const [filteredLetters, setFilteredLetters] = useState<ReceivedLetterListProps["letters"]>([]);
  const [childAskedForRefresh, setChildAskedForRefresh] = useState<boolean>(false);

  // Get user letters from the API
  useEffect(() => {
     const fetchletters = async () => {
       const response = await getReceivedLetters();
       setletters(response);
     };
     fetchletters();
   }, [refresh, childAskedForRefresh]);
   
   
  // Filter letters by search text
  useEffect(() => {
    const filteredLetters = async() => {
      const q = searchFilter.toLowerCase();
      const results = letters.filter(letter =>
        letter.originalLetter.title.toLowerCase().includes(q) ||
        letter.originalLetter.language.toLowerCase().includes(q) ||
        letter.originalLetter.created_at.slice(0, 10).toLocaleLowerCase().includes(q)
      );
      const lettersReduced = orderBySender
      ? results.filter((letter) => letter.sender.nickname === orderBySender)
      : results;
      if (showOnlyPending) {
        const lettersPending = lettersReduced.filter(letter => !letter.sentBack);
        setFilteredLetters(lettersPending);
      } else {
        setFilteredLetters(lettersReduced);
      }
    }
    filteredLetters();
  }, [searchFilter, letters, orderBySender, showOnlyPending, refresh]);


  if (filteredLetters && filteredLetters.length > 0) {
  return (
    <div className="flex flex-col gap-4 max-h-[80%] custom-scroll overflow-y-auto">
      {filteredLetters.map((letter, index) => (
        <ReceivedLetterCardProps
          id={letter._id}
          diary="-"
          created_at={letter.corrected_at}
          received_at={letter.received_at}
          title={letter.originalLetter.title}
          language={letter.originalLetter.language}
          sender={letter.sender}
          sentBack={letter.sentBack}
          seen={letter.seen}
          deleted={letter.originalLetter.deleted}
          letterDeleted={() => {setChildAskedForRefresh(!childAskedForRefresh)}}
          key={index}
        />
      ))}
    </div>
  )
  }
  return (
    <div className="text-center text-gray-500 h-[40vh] flex items-center justify-center">
      { !letters || letters.length === 0 ? "When you receive letters to check and correct, they will appear here." : "No letters matching the filter."}
    </div>
  );
};

export default ReceivedLetterList;