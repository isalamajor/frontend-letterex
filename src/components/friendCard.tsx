"use client";
import React from "react";

interface Friend {
  id: string;
  nickname: string;
  image: string;
  lettersExchanged: number;
}

const FriendCard: React.FC<Friend> = ({
  id,
  nickname,
  image,
  lettersExchanged,
}) => {
  const goToProfile = () => {
    window.location.href = `/profile/${id}`;
  };

  return (
    <div
      className="cursor-pointer px-8 pt-4 rounded-lg bg-white dark:bg-neutral-800 hover:bg-gradient-to-r hover:from-indigo-100 hover:via-purple-100 hover:to-pink-100 dark:hover:from-purple-100/20 dark:hover:via-purple-200/30 dark:hover:to-purple-300/40 border border-gray-200 dark:border-neutral-700 shadow-md w-full flex flex-row gap-4"
      onClick={goToProfile}
    >
      <img
        src={`${image || "default.png"}`}
        alt={image}
        className="w-14 h-14 rounded-full border border-gray-200 dark:border-gray-600"
      />
      {/* Fecha y Diario */}
      <div className="flex flex-col gap-2 items-start justify-between mb-4">
        <h4 className="items-center text-gray-800 font-bold dark:text-purple-100">
          {nickname}
        </h4>
        <p className="text-gray-800 text-base dark:text-gray-200 mb-2 text-sm">
          ✉️ {lettersExchanged} letters exchanged
        </p>
      </div>
    </div>
  );
};

export default FriendCard;
