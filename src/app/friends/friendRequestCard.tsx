"use client";
import React from "react";
import { Check, X } from "lucide-react";
import { acceptFriendRequest, declineFriendRequest } from "@/services/api";
import { useDialog } from "@/context/dialogContext";

interface User {
  id: string;
  nickname: string;
  image: string;
  onAcceptSuccess: () => void;
}

const FriendRequestCard: React.FC<User> = ({
  id,
  nickname,
  image,
  onAcceptSuccess,
}) => {
  const { openDialog } = useDialog();

  const acceptOnClick = async () => {
    const result = await acceptFriendRequest(id);
    if (result === 0) {
      onAcceptSuccess();
    } else {
      openDialog({
        title: "Error",
        description: "There was an error accepting the friend request.",
        primaryActionText: "OK",
        type: "error",
      });
    }
  };

  const declineOnClick = async () => {
    const result = await declineFriendRequest(id);
    if (result === 0) {
      onAcceptSuccess();
    } else {
      openDialog({
        title: "Error",
        description: "There was an error declining the friend request.",
        primaryActionText: "OK",
        type: "error",
      });
    }
  };

  const goToProfile = () => {
    window.location.href = `/profile/${id}`;
  };

  return (
    <div className="px-8 pt-4 rounded-lg bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700 border border-gray-200 dark:border-neutral-700 shadow-md w-full flex flex-row gap-4">
      <img
        src={`${image || "default.png"}`}
        alt={image}
        className="w-14 h-14 rounded-full border border-gray-200 dark:border-gray-600"
      />
      {/* Fecha y Diario */}
      <div className="flex flex-col gap-2 items-start justify-between mb-4">
        <h4
          className="cursor-pointer hover:text-purple-400 dark:hover:text-purple-400 hover:underline items-center text-gray-800 font-bold dark:text-purple-100"
          onClick={goToProfile}
        >
          {nickname}
        </h4>
        <div className="flex flex-row gap-2">
          <button
            className="bg-green-500 hover:bg-green-600 text-white text-base px-2 py-1 rounded-md flex flex-row items-center cursor-pointer"
            onClick={acceptOnClick}
          >
            <Check className="inline mr-1" size={20} /> Accept
          </button>
          <button
            className="bg-red-500 hover:bg-red-600 text-white text-base px-2 py-1 rounded-md flex flex-row items-center cursor-pointer"
            onClick={declineOnClick}
          >
            <X className="inline mr-1" size={20} /> Decline
          </button>
        </div>
      </div>
    </div>
  );
};

export default FriendRequestCard;
