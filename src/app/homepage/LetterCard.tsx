"use client";
import React, { useEffect, useState } from "react";
import { Tooltip } from "react-tooltip";
import type { Letter } from "@/lib/types";

interface LetterCardProps extends Letter {
  deleteMode: boolean;
  swipeOpen: boolean;
  onSelectionChange: (letterId: string) => void;
  resetSelection?: boolean;
}

const LetterCard: React.FC<LetterCardProps> = ({
  id,
  created_at,
  diary,
  title,
  language,
  sharedWith,
  deleteMode,
  swipeOpen,
  onSelectionChange,
}) => {
  const [isSelected, setIsSelected] = useState(false);

  // Si cambia el modo delete, resetea la selección
  useEffect(() => {
    setIsSelected(false);
  }, [deleteMode]);

  const goToCorrection =
    (correctedLetterId: string) =>
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      event.preventDefault();
      window.location.href = `/view-correction/${correctedLetterId}`;
    };

  const goToEditLetter =
    (id: string) => (event: React.MouseEvent<HTMLDivElement>) => {
      event.stopPropagation();
      event.preventDefault();
      window.location.href = `/edit-letter/${id}`;
    };

  return (
    <div className="block w-full relative group my-1">
      <div
        className={`px-8 py-4 rounded-lg bg-gray-50 shadow-md relative h-[12vh]
      group transition-all duration-300 group-hover:w-[80%] ${deleteMode || swipeOpen ? "w-[80%]" : "w-full"}`}
        onClick={goToEditLetter(id)}
      >
        {/* Fecha y Diario */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-s text-gray-500 dark:text-gray-400 mb-2">
            {created_at.slice(0, 10)}
          </p>
          <p className="font-semibold text-gray-800 dark:text-gray-200 mb-2 highlighted-text">
            {diary}
          </p>
        </div>

        {/* Título de la carta */}
        <div className="flex justify-between">
          <h4 className="items-center text-gray-700 font-bold dark:text-gray-400">
            {title}
          </h4>

          {/* Idioma */}
          <div className="flex items-center gap-2">
            {/* Usuarios que corrigieron */}
            {(sharedWith || []).map((user, index) => (
              <img
                key={index}
                src={`http://localhost:3090/uploads/profile_pictures/${user.image}`}
                alt={user.image}
                className="w-8 h-8 sm:w-[3.5vh] sm:h-[3.5vh] rounded-full border border-gray-300 dark:border-gray-600"
              />
            ))}
            <img
              src={`/flags/${language}.svg`}
              alt={language}
              className="w-8 h-8 sm:w-[3.5vh] sm:h-[3.5vh] rounded-full border border-gray-300 dark:border-gray-600"
            />
          </div>
        </div>
      </div>
      <div
        className={`absolute h-full w-[17%] top-1/2 right-0 transform -translate-y-1/2 bg-gray-50 text-black px-4 py-2 mr-3 ml-0 rounded-lg group-hover:opacity-100 transition-opacity duration-200 group-hover:delay-200 text-center flex items-center justify-center  ${deleteMode || swipeOpen ? "opacity-100 pb-5" : "opacity-0"}`}
      >
        <div className="flex flex-col gap-2 px-2">
          {deleteMode ? (
            <>
              <p className="text-xs">Select to delete</p>
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => {
                  setIsSelected(!isSelected);
                  onSelectionChange(id);
                }}
                className=" inset-0 m-auto w-6 h-6 bg-gray-100 border-gray-300 rounded focus:ring-red-500 focus:ring-1 accent-red-500"
              />
            </>
          ) : sharedWith.length > 0 ? (
            sharedWith.map((user, index) => {
              const btnId = `btn-${user.nickname}`;
              return (
                <div className="inline-block px-2" key={`${btnId}-div`}>
                  <button
                    key={user.nickname + index}
                    onClick={goToCorrection(user.correctedLetterId)}
                    data-tooltip-id={btnId}
                    data-tooltip-place="top-start"
                    data-tooltip-content={
                      user.correctionSentBack
                        ? `${user.nickname} sent a correction`
                        : `Wait for ${user.nickname} to send a correction`
                    }
                    id={btnId}
                    className={`w-[90%] p-2 rounded-sm max-h-[40%]
                        ${user.correctionSentBack ? "ring-2 ring-transparent bg-green-300 hover:ring-green-500" : "bg-red-200"}`}
                    disabled={!user.correctionSentBack}
                  >
                    {user.correctionSentBack ? (
                      <p className="text-sm max-w-[100px] truncate overflow-hidden whitespace-nowrap">
                        {user.nickname}
                      </p>
                    ) : (
                      <div className="text-sm flex flex-row gap-x-1 max-w-[100px] truncate overflow-hidden whitespace-nowrap">
                        <p>⏰</p>
                        <p>{user.nickname}</p>
                      </div>
                    )}
                  </button>

                  <Tooltip
                    id={btnId}
                    place="top"
                    data-tooltip-variant="dark"
                    className="z-[9999]"
                  ></Tooltip>
                </div>
              );
            })
          ) : (
            <p className="text-sm">Share this letter! 📬</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LetterCard;
