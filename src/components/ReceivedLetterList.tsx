
import { useEffect } from "react";
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
      name: string;
      avatar: string;
    };
    sentBack: boolean;
    corrected_at: string;
    seen: boolean;
  }[];
}

  

const ReceivedLetterList = () => {
  const [letters, setletters] = React.useState<ReceivedLetterListProps["letters"]>([]);

  // Get user letters from the API
  useEffect(() => {
     const fetchletters = async () => {
       const response = await getReceivedLetters();
       
       console.log("Letters fetched:", response);
       setletters(response);
     };
     fetchletters();
   }, []);

  if (letters && letters.length > 0) {
  return (
    <div className="flex flex-col gap-4 max-h-[80%] custom-scroll overflow-y-auto pr-2 ml-4 mr-4">
      {letters.map((letter, index) => (
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
          When you receive letters to check and correct, they will appear here.
        </div>
  );
};

export default ReceivedLetterList;