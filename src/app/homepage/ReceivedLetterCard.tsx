import Link from "next/link";
import React from "react";
import { Check, Trash2 } from "lucide-react";
import { deleteCorrectedLetter } from "@/services/api";
import { useDialog } from "@/context/dialogContext";

interface ReceivedLetterCardProps {
  id: string;
  received_at: string;
  diary: string;
  title: string;
  language: string;
  sender: { id: string; nickname: string; image: string };
  sentBack: boolean;
  seen: boolean;
  deleted: boolean;
  letterDeleted: () => void;
}

const ReceivedLetterCard: React.FC<ReceivedLetterCardProps> = ({
  id,
  received_at,
  title,
  language,
  sender,
  sentBack,
  seen,
  deleted,
  letterDeleted,
}) => {
  const { openDialog, closeDialog } = useDialog();

  const deleteOnClick = async () => {
    const result = await deleteCorrectedLetter(id);
    if (result === 0) {
      letterDeleted();
    } else {
      openDialog({
        title: "There was an error deleting the letter.",
        description: "Please, try again later.",
        primaryActionText: "Ok",
        onPrimaryAction: () => setTimeout(closeDialog, 4000),
        autoDismiss: true,
        size: "sm",
        type: "error",
        autoDismissDelay: 3000,
      });
    }
  };

  return (
    <Link
      onClick={() => console.log("Link clicked")}
      href={`/correct-letter/${id}`}
    >
      <div
        className={`mb-2 w-full h-full sm:h-[12vh] px-8 py-4 rounded-lg bg-gray-50 shadow-md relative group
      ${deleted ? "hover:bg-red-100" : sentBack ? "hover:bg-green-100" : "hover:bg-blue-100"}`}
      >
        {/* Fecha */}
        <div className="flex flex-row align-center items-center justify-between mb-6">
          <p className="text-gray-500 dark:text-gray-400">
            {"Received " + formatReceivedDate(received_at)}
          </p>
          <div className="flex flex-row gap-x-2">
            <p
              className={`opacity-0 group-hover:opacity-100 flex items-center justify-center
            ${deleted ? "text-red-500 " : sentBack ? "text-green-500 " : "text-blue-500 "}`}
            >
              {deleted
                ? "Deleted by the author"
                : sentBack
                  ? "Corrected & Sent Back"
                  : "Pending to correct"}
              {deleted && (
                <button
                  type="button"
                  className="cursor-pointer text-white rounded-sm bg-red-500 shadow-md p-1 ml-2 hover:bg-red-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    deleteOnClick();
                  }}
                >
                  <Trash2 size={20}></Trash2>
                </button>
              )}
            </p>
            {!seen && (
              <p className="text-xs bg-red-400 mb-2 rounded-md p-1">New</p>
            )}
          </div>
        </div>

        {/* Título de la carta */}
        <div className="flex justify-between">
          <div className="flex flex-row gap-2 align-center items-center">
            <h4 className="items-center text-gray-700 font-bold dark:text-gray-400">
              {title}
            </h4>
            {sentBack && (
              <Check className="w-5 h-5 p-0.25 bg-green-500 border border-white rounded-md"></Check>
            )}
          </div>

          {/* Usuario que la manda e Idioma */}
          <div className="flex items-center gap-2">
            <img
              src={`http://localhost:3090/uploads/profile_pictures//${sender.image}`}
              alt={sender.nickname}
              className="w-8 h-8 sm:w-[3.5vh] sm:h-[3.5vh] rounded-full border border-gray-300 dark:border-gray-600"
            />
            <img
              src={`/flags/${language}.svg`}
              alt={language}
              className="w-8 h-8 sm:w-[3.5vh] sm:h-[3.5vh] rounded-full border border-gray-300 dark:border-gray-600"
            />
          </div>
        </div>
      </div>
    </Link>
  );
};

function formatReceivedDate(received_at: string): string {
  const date = new Date(received_at);
  const now = new Date();

  // Calcular diferencia en milisegundos
  const diff = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diff / 60000);
  const diffInHours = Math.floor(diff / 3600000);
  const diffInDays = Math.floor(diff / 86400000);

  if (diffInMinutes < 1) return "Just now";
  if (diffInHours < 1)
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
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
