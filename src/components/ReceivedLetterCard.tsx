import Link from "next/link";
import React from "react";

interface ReceivedLetterCardProps {
  id: string;
  created_at: string;
  diary: string;
  title: string;
  language: string;
  sender: { name: string; avatar: string };
}



const ReceivedLetterCard: React.FC<ReceivedLetterCardProps> = ({ id, created_at, title, language, sender }) => {
  return (
      <Link href={`/correct-letter/${id}`} > 
      <div className=" w-full max-w-5xl">
      <div className="px-8 py-4 rounded-lg bg-gray-50 shadow-md  
      w-full max-w-5xl">
        {/* Fecha */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-s text-gray-500 dark:text-gray-400 mb-2">{created_at.slice(0, 10)}</p>
        </div>

        {/* Título de la carta */}
        <div className="flex justify-between">
          <h4 className="text-xl items-center text-gray-700 font-bold dark:text-gray-400">
            {title}
          </h4>

          {/* Usuario que la manda e Idioma */}
          <div className="flex items-center gap-2">
          <img
              src={sender.avatar}
              alt={sender.name}
              className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600"
            />
            <img
              src={`/flags/${language}.png`}
              alt={language}
              className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600"
            />
          </div>
        </div>
      </div>
      </div>
      </Link>
  );
};

export default ReceivedLetterCard;