
import { useEffect, useState } from "react";
import React from "react";
import ReceivedLetterCardProps from "./ReceivedLetterCard";
import { getReceivedLetters } from "../services/api";

interface ReceivedLetterListProps {
  letters: {
    _id: string;
    originalLetter: {
      _id: string;
      author: string;
      title: string;
      language: string;
      created_at: string;
    };
    sender: {
      nickname: string;
      avatar: string;
    };
    sentBack: boolean;
    corrected_at: string;
    seen: boolean;
  }[];
}

interface ChildProps {
  orderBySender: string; 
  searchFilter: string;
}
  

const ReceivedLetterList = ({ orderBySender, searchFilter } : ChildProps) => {
  const [letters, setletters] = useState<ReceivedLetterListProps["letters"]>([]);
  const [diaryOrganised, setDiaryOrganised] = useState<boolean>(false);
  const [senderSelected, setSenderSelected] = useState<string>("");
  const [filteredLetters, setFilteredLetters] = useState<ReceivedLetterListProps["letters"]>([]);

  // Get user letters from the API
  useEffect(() => {
     const fetchletters = async () => {
       const response = await getReceivedLetters();
       console.log("Letters fetched:", response);
       setletters(response);
     };
     fetchletters();
   }, []);
   
  // Organise letters by sender on trigger
  /*useEffect(() => {
    console.log("HIJO: ", orderBySender);
    if (!filteredLetters || filteredLetters.length < 1) {return}
    const lettersReduced = filteredLetters.filter(
      (letter) => letter.sender.nickname === orderBySender
    );

    setFilteredLetters(lettersReduced);
    setDiaryOrganised(!diaryOrganised);
  }, [orderBySender]);*/
   
  // Filter letters by search text
  useEffect(() => {
    const filteredLetters = async() => {
      //if (!filteredLetters || filteredLetters.length < 1) {return}
        const q = searchFilter.toLowerCase();
        const results = letters.filter(letter =>
          letter.originalLetter.title.toLowerCase().includes(q) ||
          letter.originalLetter.language.toLowerCase().includes(q) ||
          letter.originalLetter.created_at.slice(0, 10).toLocaleLowerCase().includes(q)
        );
        console.log("results ", results);
        console.log("orderBySender ", orderBySender);
        const lettersReduced = orderBySender
        ? results.filter((letter) => letter.sender.nickname === orderBySender)
        : results;
        console.log("lettersReduced ", lettersReduced)
        setFilteredLetters(lettersReduced);
    }
    filteredLetters();
  }, [searchFilter, letters, orderBySender])
   

  if (filteredLetters && filteredLetters.length > 0) {
  return (
    <div className="flex flex-col gap-4 max-h-[80%] custom-scroll overflow-y-auto">
      {filteredLetters.map((letter, index) => (
        <ReceivedLetterCardProps
          id={letter._id}
          diary="-"
          created_at={letter.corrected_at}
          title={letter.originalLetter.title}
          language={letter.originalLetter.language}
          sender={letter.sender}
          sentBack={letter.sentBack}
          seen={letter.seen}
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