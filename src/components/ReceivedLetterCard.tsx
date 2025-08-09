import Link from "next/link";
import React from "react";
import { Check } from "lucide-react";

interface ReceivedLetterCardProps {
  id: string;
  created_at: string;
  diary: string;
  title: string;
  language: string;
  sender: { name: string; avatar: string };
  sentBack: boolean;
  seen: boolean
}



const ReceivedLetterCard: React.FC<ReceivedLetterCardProps> = ({ id, created_at, title, language, sender, sentBack, seen }) => {
  return (
      <Link href={`/correct-letter/${id}`} > 
      <div className=" w-full max-w-5xl">
      <div className={`px-8 py-4 rounded-lg bg-gray-50 shadow-md relative group
      w-full max-w-5xl ${sentBack ? "hover:bg-green-100" : "hover:bg-blue-100"}`}>
        {/* Fecha */}
        <div className="flex flex-row align-center items-center justify-between mb-6">
          <p className="text-s text-gray-500 dark:text-gray-400">{created_at.slice(0, 10)}</p>
          <div className="flex flex-row gap-x-2">
            <p className={`opacity-0 group-hover:opacity-100
            ${sentBack ? "text-green-500 " : "text-blue-500 "}`}>
            {sentBack ? "Corrected & Sent Back" : "Pending to correct"}
            </p>
          { !seen &&
          <p className="text-xs bg-red-400 mb-2 rounded-md p-1">New</p>
          }
          </div>
        </div>

        {/* Título de la carta */}
        <div className="flex justify-between">
          <div className="flex flex-row gap-2 align-center items-center">
          <h4 className="text-xl items-center text-gray-700 font-bold dark:text-gray-400">
            {title}
          </h4>
          {sentBack && <Check className="w-5 h-5 p-0.25 bg-green-500 border border-white rounded-md"></Check>}
          </div>

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