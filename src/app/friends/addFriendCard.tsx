"use client";
import React from "react";
import Image from "next/image";
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
    <div className="px-6 pt-4 rounded-lg bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700 border border-gray-200 dark:border-neutral-700 shadow-md w-full flex flex-row justify-between gap-4">
      <div className="flex flex-row gap-7 items-center">
        <div className="relative w-15 h-15 rounded-full border border-gray-200 dark:border-gray-600 overflow-hidden">
          <Image
            src={`${image || "/default.png"}`}
            alt={nickname || "user"}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex flex-col gap-2 items-start mb-4">
          {/* Fecha y Diario */}
          <h4
            className="cursor-pointer hover:text-purple-400 dark:hover:text-indigo-400 hover:underline items-center text-gray-800 font-bold dark:text-indigo-100"
            onClick={goToProfile}
          >
            {nickname}
          </h4>
          <div className="flex flex-row mt-2 items-center justify-center">
            <div className="relative h-6 w-6 rounded-full object-cover border border-gray-300 dark:border-gray-600 shadow">
              <Image
                src={`/flags/${masterLanguage}.svg`}
                alt={masterLanguage}
                fill
                className="object-cover rounded-full"
              />
            </div>
            {masterLanguage2 && (
              <div className="relative h-6 w-6 rounded-full object-cover border border-gray-300 dark:border-gray-600 shadow ml-1">
                <Image
                  src={`/flags/${masterLanguage2}.svg`}
                  alt={masterLanguage2}
                  fill
                  className="object-cover rounded-full"
                />
              </div>
            )}
            {masterLanguage3 && (
              <div className="relative h-6 w-6 rounded-full object-cover border border-gray-300 dark:border-gray-600 shadow ml-1">
                <Image
                  src={`/flags/${masterLanguage3}.svg`}
                  alt={masterLanguage3}
                  fill
                  className="object-cover rounded-full"
                />
              </div>
            )}
            <Dot
              className="text-gray-700 dark:text-gray-300 h-6 w-6"
              color="gray"
              size={300}
            >
              |
            </Dot>
            <div className="relative h-6 w-6 rounded-full object-cover border border-gray-300 dark:border-gray-600 shadow">
              <Image
                src={`/flags/${learningLanguage}.svg`}
                alt={learningLanguage}
                fill
                className="object-cover rounded-full"
              />
            </div>
            {learningLanguage2 && (
              <div className="relative h-6 w-6 rounded-full object-cover border border-gray-300 dark:border-gray-600 shadow ml-1">
                <Image
                  src={`/flags/${learningLanguage2}.svg`}
                  alt={learningLanguage2}
                  fill
                  className="object-cover rounded-full"
                />
              </div>
            )}
            {learningLanguage3 && (
              <div className="relative h-6 w-6 rounded-full object-cover border border-gray-300 dark:border-gray-600 shadow ml-1">
                <Image
                  src={`/flags/${learningLanguage3}.svg`}
                  alt={learningLanguage3}
                  fill
                  className="object-cover rounded-full"
                />
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Add friend buttons */}
      <div className="flex flex-col justify-start h-full">
        {friendRequestJustSent || friendRequestSent ? (
          <UserRoundCheck className="h-6 w-6 text-green-400" />
        ) : (
          <button
            className="flex justify-center align-center bg-green-400 hover:bg-green-500 text-white rounded-md p-1 "
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
