"use client";
import Link from "next/link";
import React from "react";
import {Tooltip} from 'react-tooltip';


interface Friend {
    _id: string;
    nickname: string;
    image: string;
    lettersExchanged: number;
}



const FriendCard: React.FC<Friend> = ({ _id, nickname, image, lettersExchanged }) => {

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
      <div className="px-8 pt-4 rounded-lg bg-white hover:bg-gradient-to-r hover:from-indigo-100 hover:via-purple-100 hover:to-pink-100 border border-gray-200 shadow-md w-full flex flex-row gap-4">
        <img
            src={`http://localhost:3090/uploads/profile_pictures/${image}`}
            alt={image}
            className="w-14 h-14 rounded-full border border-gray-300 dark:border-gray-600"
        />
        {/* Fecha y Diario */}
        <div className="flex flex-col gap-2 items-start justify-between mb-4">
          <h4 className="items-center text-gray-700 font-bold dark:text-gray-400">
            {nickname}
          </h4>
          <p className="text-gray-800 text-base dark:text-gray-200 mb-2">
            ✉️ {lettersExchanged} letters exchanged
          </p>
        </div>

      </div>
  );
};

export default FriendCard;