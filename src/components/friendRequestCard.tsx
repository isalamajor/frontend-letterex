"use client";
import React from "react";
import { Check, X } from "lucide-react";
import { SuccessDialog, DialogType } from "@/components/ui/dialog";
import { useState } from "react";
import { acceptFriendRequest, declineFriendRequest } from "@/services/api";

interface User {
  _id: string;
  nickname: string;
  image: string;
  onAcceptSuccess: () => void;
}

const FriendRequestCard: React.FC<User> = ({
  _id,
  nickname,
  image,
  onAcceptSuccess,
}) => {
  // Dialog
  const [dialogConfig, setDialogConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    primaryActionText: string;
    autoDismiss: boolean;
    size: "sm" | "md" | "lg";
    type: DialogType;
  }>({
    isOpen: false,
    title: "Payment Successful!",
    description:
      "Your payment has been processed successfully. You will receive a confirmation email shortly.",
    primaryActionText: "View Receipt",
    autoDismiss: false,
    size: "md",
    type: "success",
  });

  const openDialog = (config: Partial<typeof dialogConfig>) => {
    setDialogConfig((prev) => ({ ...prev, ...config, isOpen: true }));
  };

  const closeDialog = () => {
    setDialogConfig((prev) => ({ ...prev, isOpen: false }));
  };

  const acceptOnClick = async () => {
    const result = await acceptFriendRequest(_id);
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
    const result = await declineFriendRequest(_id);
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
    window.location.href = `/profile/${_id}`;
  };

  return (
    <div className="px-8 pt-4 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 shadow-md w-full flex flex-row gap-4">
      <img
        src={`${process.env.NEXT_PUBLIC_PICTURES_BASE_URL}/${image}`}
        alt={image}
        className="w-14 h-14 rounded-full border border-gray-300 dark:border-gray-600"
      />
      {/* Fecha y Diario */}
      <div className="flex flex-col gap-2 items-start justify-between mb-4">
        <h4
          className="cursor-pointer hover:text-purple-400 hover:underline items-center text-gray-700 font-bold dark:text-gray-400"
          onClick={goToProfile}
        >
          {nickname}
        </h4>
        <div className="flex flex-row gap-2">
          <button
            className="bg-green-400 hover:bg-green-500 text-white text-base px-2 py-1 rounded-md flex flex-row items-center"
            onClick={acceptOnClick}
          >
            <Check className="inline mr-1" size={20} /> Accept
          </button>
          <button
            className="bg-red-400 hover:bg-red-500  text-white text-base px-2 py-1 rounded-md flex flex-row items-center"
            onClick={declineOnClick}
          >
            <X className="inline mr-1" size={20} /> Decline
          </button>
        </div>
      </div>
      <SuccessDialog
        isOpen={dialogConfig.isOpen}
        onClose={closeDialog}
        title={dialogConfig.title}
        description={dialogConfig.description}
        primaryActionText={dialogConfig.primaryActionText}
        autoDismiss={dialogConfig.autoDismiss}
        size={dialogConfig.size}
        type={dialogConfig.type}
      />
    </div>
  );
};

export default FriendRequestCard;
