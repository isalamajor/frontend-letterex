import React from "react";
import ReceivedLetterCardProps from "./ReceivedLetterCard";
import type { ReceivedLetter } from "@/lib/types";

interface ChildProps {
  letters: ReceivedLetter[];
  noLetters: boolean;
}

const ReceivedLetterList = ({ letters, noLetters }: ChildProps) => {
  /*const [filteredLetters, setFilteredLetters] = useState<ReceivedLetter[]>([]);
  const [childAskedForRefresh, setChildAskedForRefresh] =
    useState<boolean>(false);

  // Filter letters by search text
  useEffect(() => {
    const filteredLetters = async () => {
      const q = searchFilter.toLowerCase();
      const results = letters.filter(
        (letter) =>
          letter.originalLetter.title.toLowerCase().includes(q) ||
          letter.originalLetter.language.toLowerCase().includes(q) ||
          letter.originalLetter.created_at
            .slice(0, 10)
            .toLocaleLowerCase()
            .includes(q),
      );
      const lettersReduced = orderBySender
        ? results.filter((letter) => letter.sender.nickname === orderBySender)
        : results;
      if (showOnlyPending) {
        const lettersPending = lettersReduced.filter(
          (letter) => !letter.sentBack,
        );
        setFilteredLetters(lettersPending);
      } else {
        setFilteredLetters(lettersReduced);
      }
    };
    filteredLetters();
  }, [searchFilter, letters, orderBySender, showOnlyPending]);*/

  if (letters && letters.length > 0) {
    return (
      <div className="flex flex-col h-full sm:h-[64vh] custom-scroll overflow-y-auto pb-10">
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
