"use client";
import React from "react";
import { UserRoundPlus, Dot, UserRoundCheck } from "lucide-react";
import { sendFollowRequest } from "@/services/api";
import { useState } from "react";

interface User {
  id: string;
  nickname: string;
  image: string;
  masterLanguage: string;
  masterLanguage2: string;
  masterLanguage3: string;
  learningLanguage: string;
  learningLanguage2: string;
  learningLanguage3: string;
  friendRequestSent: boolean;
}

interface AddFriendCardProps extends User {
  onAddFriend: (success: boolean) => void;
}

const AddFriendCard: React.FC<AddFriendCardProps> = ({
  id,
  nickname,
  image,
  masterLanguage,
  masterLanguage2,
  masterLanguage3,
  learningLanguage,
  learningLanguage2,
  learningLanguage3,
  friendRequestSent,
  onAddFriend,
}) => {
  const [friendRequestJustSent, setFriendRequestJustSent] = useState(false);

  const addFriendOnClick = async (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.stopPropagation();
    event.preventDefault();
    const result = await sendFollowRequest(id);
    if (result === 0) {
      onAddFriend(true);
      setFriendRequestJustSent(true);
    } else {
      onAddFriend(false);
    }
  };

  const goToProfile = () => {
    window.location.href = `/profile/${id}`;
  };
  return (
    <div className="px-6 pt-4 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 shadow-md w-full flex flex-row justify-between gap-4">
      <div className="flex flex-row gap-7 items-center">
        <img
          src={`${process.env.NEXT_PUBLIC_PICTURES_BASE_URL}/${image}`}
          alt={image}
          className="w-15 h-15 rounded-full border border-gray-300 dark:border-gray-600"
        />
        <div className="flex flex-col gap-2 items-start mb-4">
          {/* Fecha y Diario */}
          <h4
            className="cursor-pointer hover:text-purple-400 hover:underline items-center text-gray-700 font-bold dark:text-gray-400"
            onClick={goToProfile}
          >
            {nickname}
          </h4>
          <div className="flex flex-row mt-2 items-center justify-center">
            <img
              src={`/flags/${masterLanguage}.svg`}
              alt={masterLanguage}
              className="h-6 w-6 rounded-full object-cover border border-gray-300 shadow"
            ></img>
            {masterLanguage2 && (
              <img
                src={`/flags/${masterLanguage2}.svg`}
                alt={masterLanguage2}
                className="h-6 w-6 rounded-full object-cover border border-gray-300 shadow ml-1"
              ></img>
            )}
            {masterLanguage3 && (
              <img
                src={`/flags/${masterLanguage3}.svg`}
                alt={masterLanguage3}
                className="h-6 w-6 rounded-full object-cover border border-gray-300 shadow ml-1"
              ></img>
            )}
            <Dot className="text-gray-700 h-6 w-6" color="gray" size={300}>
              |
            </Dot>
            <img
              src={`/flags/${learningLanguage}.svg`}
              alt={learningLanguage}
              className="h-6 w-6 rounded-full object-cover border border-gray-300 shadow"
            ></img>
            {learningLanguage2 && (
              <img
                src={`/flags/${learningLanguage2}.svg`}
                alt={learningLanguage2}
                className="h-6 w-6 rounded-full object-cover border border-gray-300 shadow ml-1"
              ></img>
            )}
            {learningLanguage3 && (
              <img
                src={`/flags/${learningLanguage3}.svg`}
                alt={learningLanguage3}
                className="h-6 w-6 rounded-full object-cover border border-gray-300 shadow ml-1"
              ></img>
            )}
          </div>
        </div>
      </div>
      {/* Botones añadir amigo */}
      <div className="flex flex-col justify-start h-full">
        {friendRequestJustSent || friendRequestSent ? (
          <UserRoundCheck className="h-6 w-6 text-green-500" />
        ) : (
          <button
            className="flex justify-center align-center bg-green-400 hover:bg-green-500 border-2 border-green-500 text-white rounded-md p-1"
            onClick={addFriendOnClick}
          >
            <UserRoundPlus className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default AddFriendCard;
