import Link from "next/link";
import React from "react";
import { Check } from "lucide-react";

interface ReceivedLetterCardProps {
  id: string;
  created_at: string;
  received_at: string;
  diary: string;
  title: string;
  language: string;
  sender: { _id: string, nickname: string; image: string };
  sentBack: boolean;
  seen: boolean
}



const ReceivedLetterCard: React.FC<ReceivedLetterCardProps> = ({ id, created_at, received_at, title, language, sender, sentBack, seen }) => {
  return (
      <Link href={`/correct-letter/${id}`} > 
      <div className=" w-full max-w-5xl">
      <div className={`px-8 py-4 rounded-lg bg-gray-50 shadow-md relative group
      w-full max-w-5xl ${sentBack ? "hover:bg-green-100" : "hover:bg-blue-100"}`}>
        {/* Fecha */}
        <div className="flex flex-row align-center items-center justify-between mb-6">
          <p className="text-s text-gray-500 dark:text-gray-400">{"Received " + formatReceivedDate(received_at)}</p>
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
              src={`http://localhost:3090/uploads/profile_pictures//${sender.image}`}
              alt={sender.nickname}
              className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600"
            />
            <img
              src={`/flags/${language}.svg`}
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


function formatReceivedDate(received_at: string) : string{
  const date = new Date(received_at);
  const now = new Date();

  // Calcular diferencia en milisegundos
  const diff = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diff / 60000);
  const diffInHours = Math.floor(diff / 3600000);
  const diffInDays = Math.floor(diff / 86400000);

  if (diffInMinutes < 1) return "Just now";
  if (diffInHours < 1) return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
  if (diffInDays < 1) return "Today";
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays <= 7) return `${diffInDays} days ago`;

  // Más antiguo → DD/MM/YYYY
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}


export default ReceivedLetterCard;