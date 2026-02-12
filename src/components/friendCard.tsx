"use client";
import React from "react";

interface Friend {
  _id: string;
  nickname: string;
  image: string;
  lettersExchanged: number;
}

const FriendCard: React.FC<Friend> = ({
  _id,
  nickname,
  image,
  lettersExchanged,
}) => {
  const goToProfile = () => {
    window.location.href = `/profile/${_id}`;
  };

  return (
    <div
      className="cursor-pointer px-8 pt-4 rounded-lg bg-white hover:bg-gradient-to-r hover:from-indigo-100 hover:via-purple-100 hover:to-pink-100 border border-gray-200 shadow-md w-full flex flex-row gap-4"
      onClick={goToProfile}
    >
      <img
        src={`${process.env.NEXT_PUBLIC_PICTURES_BASE_URL}/${image}`}
        alt={image}
        className="w-14 h-14 rounded-full border border-gray-300 dark:border-gray-600"
      />
      {/* Fecha y Diario */}
      <div className="flex flex-col gap-2 items-start justify-between mb-4">
        <h4 className="items-center text-gray-700 font-bold dark:text-gray-400">
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
