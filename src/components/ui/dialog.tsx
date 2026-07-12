"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  X,
  AlertTriangle,
  CircleX,
  Lock,
  BookOpen,
  MailQuestionMark,
  Trash2,
  Handshake,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  getFriendsList,
  shareLetter,
  changePassword,
  deleteAccount,
} from "@/services/api";
import FriendsCheckboxList from "@/components/ui/friendsCheckBoxList";
import { Switch } from "@/components/ui/switch";
import { InputPasswords } from "@/components/ui/inputPasswords";
import { InputPass } from "@/components/ui/inputPass";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

interface Friend {
  id: string;
  nickname: string;
  image?: string;
  alreadySent?: boolean;
}

export interface SharedWithUser {
  id: string;
  nickname: string;
  image: string;
}

const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      onClick={() => onOpenChange(false)}
    >
      {children}
    </div>
  );
};

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const DialogContent: React.FC<DialogContentProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={`relative z-50 grid w-full gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg md:w-full ${className}`}
      onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside content
      {...props}
    >
      {children}
    </div>
  );
};

interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const DialogHeader: React.FC<DialogHeaderProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={`flex flex-col space-y-1.5 text-center sm:text-left ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

const DialogTitle: React.FC<DialogTitleProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <h2
      className={`text-lg font-semibold leading-none tracking-tight ${className}`}
      {...props}
    >
      {children}
    </h2>
  );
};

interface DialogDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

const DialogDescription: React.FC<DialogDescriptionProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <p className={`text-sm text-muted-foreground ${className}`} {...props}>
      {children}
    </p>
  );
};

export type DialogType =
  | "success"
  | "alert"
  | "error"
  | "shareLetter"
  | "settings"
  | "newDiary"
  | "askConfirmation"
  | "bye";

export interface DialogConfig {
  isOpen?: boolean;
  onClose?: () => void;
  title?: string;
  description?: string;
  primaryActionText?: string;
  onPrimaryAction?: () => void;
  autoDismiss?: boolean;
  autoDismissDelay?: number;
  showCloseButton?: boolean;
  size?: "sm" | "md" | "lg";
  type?: DialogType;
  letterId?: string;
  sharedWith?: SharedWithUser[];
  onShareSuccess?: (shareLetterResult: SharedWithUser[]) => void;
  onNewDiaryCreated?: (diaryName: string) => void;
  prevNewDiaryName?: string;
  onConfirmationPositive?: () => void | Promise<void>;
}

const SuccessDialog: React.FC<DialogConfig> = ({
  isOpen = false,
  onClose = () => {},
  title,
  description,
  primaryActionText,
  onPrimaryAction = () => {},
  autoDismiss = false,
  autoDismissDelay = 3000,
  showCloseButton = false,
  size = "md",
  type = "success", // Default to success
  letterId = null,
  sharedWith = [],
  onShareSuccess = () => {},
  onNewDiaryCreated = () => {},
  prevNewDiaryName = "",
  onConfirmationPositive = () => {},
}) => {
  const [internalOpen, setInternalOpen] = useState(isOpen);
  const [friendsList, setFriendsList] = useState<Friend[]>([]);
  const [friendsSelected, setFriendsSelected] = useState<SharedWithUser[]>([]);
  const primaryButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const [settingSwitch, setSettingSwitch] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordChangeMessage, setPasswordChangeMessage] = useState<
    string | null
  >(null);
  const [deleteAccountResult, setDeleteAccountResult] = useState<number | null>(
    null,
  );
  const [newDiaryName, setNewDiaryName] = useState<string>("");

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
  };

  const typeConfig = {
    success: {
      icon: Check,
      iconBgClass: "bg-green-100 dark:bg-green-900/20",
      iconColorClass: "text-green-600 dark:text-green-400",
      titleDefault: "Success!",
      descriptionDefault: "Your action has been completed successfully.",
      buttonClass: "bg-primary text-primary-foreground hover:bg-primary/90",
    },
    alert: {
      icon: AlertTriangle,
      iconBgClass: "bg-yellow-100 dark:bg-yellow-900/20",
      iconColorClass: "text-yellow-600 dark:text-yellow-400",
      titleDefault: "Heads Up!",
      descriptionDefault: "Please review the information provided.",
      buttonClass: "bg-yellow-600 text-white hover:bg-yellow-700",
    },
    error: {
      icon: CircleX,
      iconBgClass: "bg-red-100 dark:bg-red-900/20",
      iconColorClass: "text-red-600 dark:text-red-400",
      titleDefault: "Error!",
      descriptionDefault: "Something went wrong. Please try again.",
      buttonClass: "bg-red-600 text-white hover:bg-red-700",
    },
    shareLetter: {
      icon: Handshake,
      iconBgClass: "bg-[#7E27A3]/40 dark:bg-[#DB5FDE]",
      iconColorClass: "text-white dark:text-white-400",
      titleDefault: "Send this letter to friends",
      descriptionDefault:
        "They can check your letter and send a correction back :)",
      buttonClass: "bg-[#7E27A3] text-white hover:bg-[#DB5FDE]",
    },
    settings: {
      icon: Lock,
      iconBgClass: "bg-green-100 dark:bg-green-900/20",
      iconColorClass: "text-green-600 dark:text-green-400",
      titleDefault: "Password changed",
      descriptionDefault: "Your password has been changed successfully :)",
      buttonClass: "bg-green-600 text-white hover:bg-green-700",
    },
    newDiary: {
      icon: BookOpen,
      iconBgClass: "bg-purple-100 dark:bg-dark-bg-tertiary/20",
      iconColorClass: "text-purple-600 dark:text-dark-text-secondary",
      titleDefault: "New Diary Created",
      descriptionDefault: "Your new diary has been created successfully.",
      buttonClass:
        "bg-purple-600 text-white hover:bg-purple-700 dark:bg-[#00ae91] dark:hover:bg-[#00977d]",
    },
    askConfirmation: {
      icon: MailQuestionMark,
      iconBgClass: "bg-yellow-100 dark:bg-yellow-900/20",
      iconColorClass: "text-yellow-600 dark:text-yellow-400",
      titleDefault: "Are you sure you want to perform this action?",
      descriptionDefault: "Please confirm your action.",
      buttonClass: "bg-yellow-600 text-white hover:bg-yellow-700",
    },
    bye: {
      icon: Check,
      iconBgClass: "",
      iconColorClass: "",
      titleDefault: "Bye!",
      descriptionDefault: "See you soon :)",
      buttonClass: "bg-primary text-primary-foreground hover:bg-primary/90",
    },
  };

  const currentConfig = typeConfig[type];
  const IconComponent = currentConfig.icon;

  const handleClose = useCallback(() => {
    setFriendsSelected([]);
    setInternalOpen(false);
    onClose();

    // Return focus to the previously active element
    if (previousActiveElement.current) {
      previousActiveElement.current.focus();
    }
  }, [onClose]);

  const handlePrimaryAction = useCallback(() => {
    onPrimaryAction();
    if (type === "newDiary" && newDiaryName && onNewDiaryCreated) {
      onNewDiaryCreated(newDiaryName);
    }
    handleClose();
  }, [onPrimaryAction, handleClose, newDiaryName, onNewDiaryCreated, type]);

  const handleShareLetter = async () => {
    if (friendsSelected.length === 0 || !letterId) {
      return;
    }
    const shareLetterResult: number = await shareLetter(
      letterId,
      friendsSelected.map((f) => f.id),
    );
    if (shareLetterResult === 0) {
      if (onShareSuccess) {
        onShareSuccess(friendsSelected);
      } else {
        handleClose();
      }
    }
  };

  const handleChangePassword = async () => {
    if (password && newPassword && confirmPassword) {
      const result = await changePassword(password, newPassword);
      if (result.ok) {
        setPasswordChangeMessage("Password changed successfully!");
      } else if (result.errorMessage === "Current password is incorrect") {
        setPasswordChangeMessage("Wrong password.");
      } else {
        setPasswordChangeMessage(
          result.errorMessage ||
            "Failed to change password. Please try again later.",
        );
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (!password) {
      return;
    }
    const result = await deleteAccount(password);
    setDeleteAccountResult(
      result.ok ? 0 : result.errorMessage === "Password is incorrect" ? -2 : -1,
    );
    if (result.ok) {
      setTimeout(() => {
        window.location.href = "/";
        sessionStorage.clear();
      }, 2000);
    } else {
      setPassword("");
    }
  };

  // Store the previously focused element when dialog opens
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      setInternalOpen(true);
    } else {
      setInternalOpen(false);
    }
  }, [isOpen]);

  // Auto-dismiss functionality
  useEffect(() => {
    if (internalOpen && autoDismiss && autoDismissDelay > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoDismissDelay);

      return () => clearTimeout(timer);
    }
  }, [internalOpen, autoDismiss, autoDismissDelay, handleClose]);

  // Focus management
  useEffect(() => {
    if (internalOpen) {
      // Focus the primary button when dialog opens
      const timer = setTimeout(() => {
        primaryButtonRef.current?.focus();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [internalOpen]);

  useEffect(() => {
    const fetchFriendsList = async () => {
      try {
        const friends = await getFriendsList();

        // Mark with alreadySent property
        const friendsWithStatus = friends.map((friend: Friend) => ({
          ...friend,
          alreadySent: sharedWith.some((user) => user.id === friend.id),
        }));
        setFriendsList(friendsWithStatus);
        // Add alreadySent friends to selected
        const alreadySentFriends = friendsWithStatus
          .filter((friend: Friend) => friend.alreadySent)
          .map((friend: Friend) => ({
            id: friend.id,
            nickname: friend.nickname,
            image: friend.image || "",
          }));
        setFriendsSelected((prev) => [...prev, ...alreadySentFriends]);
        console.log("Fetched friends list:", friends);
      } catch (error) {
        console.error("Error fetching friends list:", error);
      }
    };

    if (type === "shareLetter" && isOpen) {
      fetchFriendsList();
    } else if (type === "newDiary" && isOpen && prevNewDiaryName) {
      setNewDiaryName(prevNewDiaryName);
    }
  }, [type, isOpen]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      } else if (event.key === "Tab") {
        // Simple focus trapping between close button and primary button
        const focusableElements = [
          closeButtonRef.current,
          primaryButtonRef.current,
        ].filter(Boolean) as HTMLElement[];
        const currentIndex = focusableElements.findIndex(
          (el) => el === document.activeElement,
        );

        if (focusableElements.length === 0) return; // No focusable elements

        if (event.shiftKey) {
          // Shift + Tab (backwards)
          event.preventDefault();
          const prevIndex =
            currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1;
          focusableElements[prevIndex]?.focus();
        } else {
          // Tab (forwards)
          event.preventDefault();
          const nextIndex =
            currentIndex >= focusableElements.length - 1 ? 0 : currentIndex + 1;
          focusableElements[nextIndex]?.focus();
        }
      }
    },
    [handleClose],
  );

  // Fallback for missing content
  const displayTitle = title || currentConfig.titleDefault;
  const displayDescription = description || currentConfig.descriptionDefault;
  const displayPrimaryActionText = primaryActionText || "OK";

  return (
    <Dialog open={internalOpen} onOpenChange={handleClose}>
      <DialogContent
        className={`${sizeClasses[size]} p-0 overflow-hidden bg-white dark:bg-neutral-800 dark:text-gray-200`}
        onKeyDown={handleKeyDown}
        aria-labelledby="success-dialog-title"
        aria-describedby="success-dialog-description"
      >
        <AnimatePresence>
          {internalOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{
                duration: 0.2,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative"
            >
              {/* Close button */}
              {showCloseButton && (
                <button
                  ref={closeButtonRef}
                  onClick={handleClose}
                  className="absolute right-4 top-4 z-10 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
                  aria-label="Close dialog"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              {type === "shareLetter" && (
                <div className="flex flex-col items-center text-center space-y-4">
                  {friendsList.length === 0 ? (
                    <div className="flex flex-col gap-4 min-h-[15rem] w-full align-center items-center justify-center mt-2">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{
                          delay: 0.1,
                          duration: 0.3,
                          type: "spring",
                          stiffness: 200,
                        }}
                        className={`flex items-center justify-center w-20 h-20 rounded-full ${currentConfig.iconBgClass}`}
                      >
                        <IconComponent
                          className={`w-8 h-8 ${currentConfig.iconColorClass}`}
                        />
                      </motion.div>
                      <h3 className="mx-10 text-xs text-gray-700 font-semibold dark:text-gray-400">
                        First add some friends to share with!
                      </h3>
                      <div className="flex justify-center items-center gap-4 pt-4">
                        <Button
                          onClick={handlePrimaryAction}
                          className={`min-w-[120px] bg-[#acb0ac] text-white rounded py-2 px-4 hover:bg-[#537dc9]`}
                          size="default"
                        >
                          {" "}
                          Cancel
                        </Button>
                        <Button
                          onClick={() => {
                            window.location.href = "/friends";
                          }}
                          className={`min-w-[120px] rounded transition-colors duration-200 bg-[#7E27A3] hover:!bg-[#DB5FDE] `}
                          size="default"
                        >
                          {" "}
                          Discover new people
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-base font-semibold text-gray-700 dark:text-gray-200">
                        Share with friends (choose at most 2)
                      </h3>
                      <h4 className="text-xs text-gray-500 mx-15">
                        ⚠️ Note that{" "}
                        <span className="bg-yellow-300/40 dark:text-gray-900">
                          you won&apos;t be able to modify
                        </span>{" "}
                        the letter after sharing it.
                      </h4>
                      <div className="flex flex-col gap-2 align-center items-center mt-2">
                        <FriendsCheckboxList
                          friends={friendsList}
                          selected={friendsSelected}
                          setSelected={setFriendsSelected}
                        />
                      </div>
                      <div className="flex justify-center items-center gap-4 pt-4">
                        <Button
                          onClick={handlePrimaryAction}
                          className={`min-w-[120px] bg-[#acb0ac] text-white rounded py-2 px-4 hover:bg-[#537dc9]  dark:text-gray-900`}
                          size="default"
                        >
                          {" "}
                          Cancel
                        </Button>
                        <Button
                          onClick={handleShareLetter}
                          className={`min-w-[120px] bg-[#6495ED] dark:bg-[#ffff4d] text-white dark:text-gray-900 rounded py-2 px-4 hover:bg-[#537dc9] dark:hover:bg-[#c8c800]`}
                          size="default"
                        >
                          {" "}
                          Share 📩
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {type === "settings" && (
                <div className="flex flex-col items-start justify-center gap-2 w-full min-h-[21rem]">
                  {!passwordChangeMessage && deleteAccountResult !== 0 && (
                    <Switch
                      name="full-width"
                      style={{ width: "100%" }}
                      onChange={(value) => setSettingSwitch(value)}
                    >
                      <Switch.Control
                        defaultChecked
                        label="Change password"
                        size="large"
                        value="password"
                      />
                      <Switch.Control
                        label="Delete account"
                        size="large"
                        value="delete"
                      />
                    </Switch>
                  )}
                  {settingSwitch === "password" ? (
                    <>
                      {passwordChangeMessage ? (
                        <div className="flex justify-center text-center items-center flex-col gap-2 h-full w-full text-black dark:text-gray-100 m-2">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{
                              delay: 0.1,
                              duration: 0.3,
                              type: "spring",
                              stiffness: 200,
                            }}
                            className={`flex items-center justify-center w-16 h-16 rounded-full ${passwordChangeMessage === "Password changed successfully!" ? currentConfig.iconBgClass : "bg-red-100 dark:bg-red-900/20"}`}
                          >
                            <IconComponent
                              className={`w-8 h-8 ${passwordChangeMessage === "Password changed successfully!" ? currentConfig.iconColorClass : "text-red-600 dark:text-red-400"}`}
                            />
                          </motion.div>
                          <span className="font-semibold text-center">
                            {passwordChangeMessage}
                          </span>
                          {passwordChangeMessage === "Wrong password." ? (
                            <p className="text-center text-sm mb-2">
                              Your password could not be changed because the
                              current password you entered is incorrect.
                            </p>
                          ) : null}
                          <Button
                            onClick={() => setPasswordChangeMessage(null)}
                          >
                            OK
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-center items-start flex-col gap-2 h-full w-full text-black dark:text-gray-100 m-2">
                            {/* Input with eye to hide password */}
                            <InputPasswords
                              onSave={(
                                password,
                                NewPassword,
                                ConfirmPassword,
                              ) => {
                                setPassword(password);
                                setNewPassword(NewPassword);
                                setConfirmPassword(ConfirmPassword);
                              }}
                            />
                          </div>
                          <div className="flex justify-between items-center flex-row h-full w-full text-black dark:text-gray-100 mt-2">
                            <Button
                              onClick={() => {
                                handlePrimaryAction();
                                setPassword("");
                                setNewPassword("");
                                setConfirmPassword("");
                              }}
                              className={`min-w-[120px] bg-[#acb0ac] text-white rounded py-2 px-4 hover:bg-[#537dc9] transition-colors`}
                              size="default"
                            >
                              {" "}
                              Cancel
                            </Button>
                            <Button
                              onClick={handleChangePassword}
                              className={`min-w-[120px] bg-lime-500 text-white rounded py-2 px-4 hover:bg-lime-600 transition-colors`}
                              size="default"
                            >
                              {" "}
                              Save
                            </Button>
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col gap-2 min-h-[17rem] w-full align-center items-center justify-center mt-2">
                      {deleteAccountResult === 0 ? (
                        <motion.div
                          key="delete-success"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95, y: 10 }}
                          transition={{
                            delay: 0.1,
                            duration: 0.3,
                            type: "spring",
                            stiffness: 200,
                          }}
                          className={`flex items-center justify-center w-30 h-30 rounded-full`}
                        >
                          <div className="relative w-20 h-20">
                            <Image
                              src="/logo-frog.png"
                              alt="Success"
                              fill
                              className="object-contain"
                            />
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="delete-fail"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95, y: 10 }}
                          transition={{
                            delay: 0.1,
                            duration: 0.3,
                            type: "spring",
                            stiffness: 200,
                          }}
                          className={`flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20`}
                        >
                          <IconComponent
                            className={`w-8 h-8 text-red-600 dark:text-red-400`}
                          />
                        </motion.div>
                      )}

                      {deleteAccountResult === -1 ? (
                        <>
                          <p className="text-red-600 mb-3 font-bold w-[60%] text-center">
                            An internal error ocurred. Please, try again later.
                          </p>
                          <Button
                            onClick={() => {
                              handlePrimaryAction();
                              setPassword("");
                              setNewPassword("");
                              setConfirmPassword("");
                              setDeleteAccountResult(null);
                            }}
                            className={`min-w-[120px] bg-black/90 text-white mb-5 rounded py-2 px-4 hover:bg-[#537dc9] transition-colors`}
                            size="default"
                          >
                            {" "}
                            OK
                          </Button>
                        </>
                      ) : deleteAccountResult === 0 ? (
                        <p className="text-gray-900 dark:text-gray-100 mb-3 font-bold w-[60%] text-center">
                          Account deleted succesfully. See you soon!
                        </p>
                      ) : (
                        <>
                          <p className="text-black dark:text-gray-100 mb-3 font-bold w-[60%] text-center">
                            Your password is required to perform this action
                          </p>
                          <InputPass
                            onChange={(password) => {
                              setPassword(password);
                              setDeleteAccountResult(null);
                            }}
                            wrongPassword={
                              deleteAccountResult !== null &&
                              deleteAccountResult < -1
                            }
                          />
                          <Button
                            onClick={handleDeleteAccount}
                            className={`min-w-[120px] mt-3 bg-red-500 text-white rounded py-2 px-4 hover:bg-red-600 transition-colors`}
                            size="default"
                          >
                            {" "}
                            Delete account
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {type === "askConfirmation" && (
                <div className="flex flex-col items-center text-center p-6 pt-8 space-y-4">
                  {/* Icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{
                      delay: 0.1,
                      duration: 0.3,
                      type: "spring",
                      stiffness: 200,
                    }}
                    className={`flex items-center justify-center w-16 h-16 rounded-full ${displayTitle.includes("delete") ? "bg-red-100 dark:bg-red-900/20" : currentConfig.iconBgClass}`}
                  >
                    {displayTitle.includes("delete") ? (
                      <Trash2 className="w-8 h-8 text-red-600 dark:text-red-400" />
                    ) : (
                      <IconComponent
                        className={`w-8 h-8 ${currentConfig.iconColorClass}`}
                      />
                    )}
                  </motion.div>
                  {/* Title */}
                  <DialogHeader className="space-y-2 display-inline-flex items-center justify-center">
                    <DialogTitle
                      id="success-dialog-title"
                      className="text-xl font-semibold text-black dark:text-gray-100 text-center mx-10"
                    >
                      <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ delay: 0.2, duration: 0.3 }}
                      >
                        {displayTitle}
                      </motion.span>
                    </DialogTitle>
                    {/* Cancel & Confirm Buttons */}
                    <DialogDescription
                      id="success-dialog-description"
                      className="text-muted-foreground max-w-sm mx-auto leading-relaxed text-center text-sm"
                    >
                      <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ delay: 0.3, duration: 0.3 }}
                      >
                        {displayDescription}
                      </motion.span>
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex justify-center items-center gap-4 pt-2">
                    <Button
                      onClick={handlePrimaryAction}
                      className={`min-w-[120px] bg-gray-300 dark:bg-neutral-700 text-black dark:text-gray-100 rounded py-2 px-4 hover:bg-gray-200! dark:hover:bg-neutral-600 transition-colors`}
                      size="default"
                    >
                      {" "}
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        handlePrimaryAction();
                        if (onConfirmationPositive) onConfirmationPositive();
                      }}
                      className={`min-w-[120px] ${displayTitle.includes("delete") ? "bg-red-500" : "bg-yellow-500"} text-white rounded py-2 px-4 transition-colors`}
                      size="default"
                    >
                      {" "}
                      Confirm
                    </Button>
                  </div>
                </div>
              )}

              {type !== "shareLetter" &&
                type !== "settings" &&
                type !== "askConfirmation" && (
                  <div className="flex flex-col items-center text-center p-6 pt-8 space-y-4">
                    {/* Icon */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      transition={{
                        delay: 0.1,
                        duration: 0.3,
                        type: "spring",
                        stiffness: 200,
                      }}
                      className={`flex items-center justify-center rounded-full ${currentConfig.iconBgClass} ${type === "bye" ? "w-24 h-24" : "w-16 h-16"}`}
                    >
                      {type === "bye" ? (
                        <div className="relative w-40 h-40">
                          <Image
                            src="/logo-frog.png"
                            alt="Letterex logo"
                            fill
                            className="object-contain"
                          />
                        </div>
                      ) : (
                        <IconComponent
                          className={`w-8 h-8 ${currentConfig.iconColorClass}`}
                        />
                      )}
                    </motion.div>

                    {/* Title */}
                    <DialogHeader className="space-y-2 display-inline-flex items-center justify-center">
                      <DialogTitle
                        id="success-dialog-title"
                        className="text-xl font-semibold text-black dark:text-gray-100 text-center"
                      >
                        <motion.span
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 10 }}
                          transition={{ delay: 0.2, duration: 0.3 }}
                        >
                          {displayTitle}
                        </motion.span>
                      </DialogTitle>

                      {/* Description */}
                      <DialogDescription
                        id="success-dialog-description"
                        className="text-muted-foreground max-w-sm mx-auto leading-relaxed text-center"
                      >
                        <motion.span
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 10 }}
                          transition={{ delay: 0.3, duration: 0.3 }}
                        >
                          {displayDescription}
                        </motion.span>
                      </DialogDescription>
                    </DialogHeader>

                    {type === "newDiary" && (
                      <input
                        className="text-gray-900 dark:text-gray-100 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-200 dark:focus:ring-blue-100/50"
                        placeholder="Diary name"
                        value={newDiaryName}
                        onChange={(e) => setNewDiaryName(e.target.value)}
                      />
                    )}

                    {/* Primary Action Button */}
                    {type !== "bye" && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ delay: 0.4, duration: 0.3 }}
                        className="pt-2"
                      >
                        <Button
                          onClick={handlePrimaryAction}
                          className={`min-w-[120px] focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all duration-200 ${currentConfig.buttonClass}`}
                          size="default"
                        >
                          {displayPrimaryActionText}
                        </Button>
                      </motion.div>
                    )}
                  </div>
                )}
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default SuccessDialog;
export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription };
