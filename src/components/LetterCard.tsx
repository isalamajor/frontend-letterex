import Link from "next/link";
import React from "react";

interface LetterCardProps {
  id: string;
  created_at: string;
  diary: string;
  title: string;
  language: string;
  sharedWith: { name: string; avatar: string }[];
}



const LetterCard: React.FC<LetterCardProps> = ({ id, created_at, diary, title, language, sharedWith }) => {
  return (
      <Link href={`/edit-letter/${id}`} className="block w-full"> 
      <div className="relative w-full max-w-5xl group">
      <div className="px-8 py-4 rounded-lg bg-gray-50 shadow-md relative 
      group w-full max-w-5xl transition-all duration-300 group-hover:w-[80%]">
        {/* Fecha y Diario */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-s text-gray-500 dark:text-gray-400 mb-2">{created_at.slice(0, 10)}</p>
          <p className="highlighted-text font-semibold text-gray-800 dark:text-gray-200 mb-2">
            {diary}
          </p>
        </div>

        {/* Título de la carta */}
        <div className="flex justify-between">
          <h4 className="text-xl items-center text-gray-700 font-bold dark:text-gray-400">
            {title}
          </h4>

          {/* Idioma */}
          <div className="flex items-center gap-2">
            {/* Usuarios que corrigieron */}
              {(sharedWith || []).map((user, index) => (
                <img
                  key={index}
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600"
                />
              ))}
            <img
              src={`/flags/${language}.png`}
              alt={language}
              className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600"
            />
          </div>
        </div>

      </div>
          <button
          className="absolute h-full w-[17%] top-1/2 right-0 transform -translate-y-1/2 bg-gray-50 text-black px-4 py-2 mr-3 ml-0 rounded-lg z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 group-hover:delay-200">
            BTN
          </button>
      </div>
      </Link>
  );
};

export default LetterCard;