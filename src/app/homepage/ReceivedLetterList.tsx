import React, { useEffect } from "react";
import ReceivedLetterCardProps from "./ReceivedLetterCard";
import type { ReceivedLetter } from "@/lib/types";
import { useRouter } from "next/navigation";

interface ChildProps {
  letters: ReceivedLetter[];
  noLetters: boolean;
}

const ReceivedLetterList = ({ letters, noLetters }: ChildProps) => {
  const router = useRouter();

  useEffect(() => {
    letters.slice(0, 5).forEach((letter) => {
      router.prefetch(`/correct-letter/${letter.id}`);
    });
  }, [letters, router]);

  if (letters && letters.length > 0) {
    return (
      <div className="flex flex-col h-full sm:h-[64vh] pb-10">
        {letters.map((letter, index) => (
          <ReceivedLetterCardProps
            id={letter.id}
            diary="-"
            received_at={letter.received_at}
            title={letter.originalLetter.title}
            language={letter.originalLetter.language}
            sender={letter.sender}
            sentBack={letter.sentBack}
            seen={letter.seen}
            deleted={letter.originalLetter.deleted}
            letterDeleted={() => {
              /*setChildAskedForRefresh(!childAskedForRefresh);*/
            }}
            key={index}
          />
        ))}
      </div>
    );
  }
  return (
    <div className="text-center text-gray-500 h-[80%] flex items-center justify-center">
      {noLetters
        ? "When you receive letters to check and correct, they will appear here."
        : "No letters matching the filter."}
    </div>
  );
};

export default ReceivedLetterList;
