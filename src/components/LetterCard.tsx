"use client";
import Link from "next/link";
import React from "react";
import {Tooltip} from 'react-tooltip';

interface LetterCardProps {
  id: string;
  created_at: string;
  diary: string;
  title: string;
  language: string;
  sharedWith: { nickname: string; avatar: string; correctionSentBack: boolean; correctedLetterId: string }[];
}



const LetterCard: React.FC<LetterCardProps> = ({ id, created_at, diary, title, language, sharedWith }) => {

  const goToCorrection = (correctedLetterId: string) => (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault(); 
    window.location.href = `/view-correction/${correctedLetterId}`;
  };

  const goToEditLetter = (id: string) => (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    event.preventDefault();
    window.location.href = `/edit-letter/${id}`;
  }

  return (
    <div className="block w-full relative w-full max-w-5xl group">
      <div className="px-8 py-4 rounded-lg bg-gray-50 shadow-md relative 
      group w-full max-w-5xl transition-all duration-300 group-hover:w-[80%]" onClick={goToEditLetter(id)}>
        {/* Fecha y Diario */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-s text-gray-500 dark:text-gray-400 mb-2">{created_at.slice(0, 10)}</p>
          <p className="font-semibold text-gray-800 dark:text-gray-200 mb-2 highlighted-text">
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
                  alt={user.avatar}
                  className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600"
                />
              ))}
            <img
              src={`/flags/${language}.svg`}
              alt={language}
              className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600"
            />
          </div>
        </div>

      </div>
      <div
      className="absolute h-full w-[17%] top-1/2 right-0 transform -translate-y-1/2 bg-gray-50 text-black px-4 py-2 mr-3 ml-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 group-hover:delay-200 text-center flex items-center justify-center overflow-x-hidden"
      >
      <div className="flex flex-col gap-2 px-2">
        {
          sharedWith.length > 0 ? (
            sharedWith.map((user, index) => {
              const btnId = `btn-${user.nickname}`;

              return (
                <div className="inline-block px-2">
                  <button
                    key={user.nickname + index}
                    onClick={goToCorrection(user.correctedLetterId)}
                    data-tooltip-id={btnId}
                    data-tooltip-place="top-start"
                    data-tooltip-content=
                    {user.correctionSentBack ? `${user.nickname} sent a correction` : `Wait for ${user.nickname} to send a correction`}
                    id={btnId}
                    className={`w-[90%] p-2 rounded-sm max-h-[40%]
                      ${user.correctionSentBack ? "ring-2 ring-transparent bg-green-300 hover:ring-green-500" : "bg-red-200"}`}
                    disabled={!user.correctionSentBack}
                  >
                    {user.correctionSentBack ? (
                      <p>{user.nickname}</p>
                    ) : (
                      <div className="flex flex-row gap-x-1 max-w-[100px] truncate overflow-hidden whitespace-nowrap">
                        <p>⏰</p> 
                        <p>{user.nickname}</p>
                        </div>
                    )
                  }
                  </button>

                  <Tooltip
                    id={btnId}
                    className="!z-[9999]"
                    data-tooltip-variant="dark"
                  ></Tooltip>
                </div>
              );
            })
          ) : (
            "Share this letter! 📬"
          )
        }
        </div>
      </div>

      </div>
  );
};

export default LetterCard;