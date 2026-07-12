"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { parseDate } from "@internationalized/date";
import {
  Check,
  X,
  Trash,
  Trash2,
  SquareDashed,
  HeartCrack,
} from "lucide-react";
import Image from "next/image";
import { use } from "react";
import TextCorrections from "@/components/textCorrections";
import {
  updateLetterCorrections,
  sendLetterBack,
  getLetterToCorrect,
  deleteCorrectedLetter,
} from "@/services/api";
import CorrectLetterSkeleton from "./loading";

import { CorrectedLetter, Correction } from "../../../lib/types";
import { useDialog } from "@/context/dialogContext";

export default function Home({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <CorrectLetterPageContent id={id} />;
}

const CorrectLetterPageContent = ({ id }: { id: string }) => {
  const router = useRouter();
  const textRef = useRef<HTMLDivElement | null>(null);
  const correctionRef = useRef<HTMLDivElement | null>(null);
  const [currentCorrectionText, setCurrentCorrectionText] =
    useState<string>("");
  const [editingCorrection, setEditingCorrection] = useState<Correction | null>(
    null,
  );
  const [overlapping, setOverlapping] = useState<boolean>(false);
  const [valuesChanged, setValuesChanged] = useState(false);
  const [date] = useState(() =>
    parseDate(new Date().toISOString().split("T")[0]),
  );
  const [correctionMode, setCorrectionMode] = useState(false);
  const [selectionInfo, setSelectionInfo] = useState<{
    text: string;
    rect: DOMRect | null;
    startIndex: number;
    endIndex: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [letter, setLetter] = useState<CorrectedLetter | null>(null);
  const { openDialog, closeDialog } = useDialog();

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = "auto"; // reset height
    textarea.style.height = textarea.scrollHeight + "px"; // set height to scrollHeight
    if (letter) {
      setLetter({ ...letter, comments: e.target.value });
    }
    setValuesChanged(true);
  };

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const letterData = await getLetterToCorrect(id);
      console.log("Letter data:", letterData);
      if (!letterData) {
        setIsLoading(false);
        console.error("No letter data found for ID:", id);
        return;
      }
      setLetter(letterData);
      setIsLoading(false);
    })();
  }, [id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        correctionRef.current &&
        !correctionRef.current.contains(event.target as Node)
      ) {
        setCurrentCorrectionText("");
        setEditingCorrection(null);
        setSelectionInfo(null);
      }
    };

    // Add the listener with a small delay
    const timeout = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0); // executes after the current click

    return () => {
      clearTimeout(timeout);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectionInfo]);

  const addCorrection = () => {
    if (!selectionInfo || !selectionInfo.text || currentCorrectionText === "")
      return;

    const { startIndex } = selectionInfo;
    let { text, endIndex } = selectionInfo;

    // Remove trailing space
    if (text.endsWith(" ")) {
      text = text.slice(0, -1);
      endIndex -= 1;
    }

    if (text.length === 0) return;

    const newCorrection: Correction = {
      textOriginal: text,
      textCorrected: currentCorrectionText,
      startIndex,
      endIndex,
    };

    if (letter) {
      setLetter({
        ...letter,
        corrections: [...letter.corrections, newCorrection],
      });
    }
    setSelectionInfo(null);
    setCurrentCorrectionText("");
    setEditingCorrection(null);
    setValuesChanged(true);
  };

  const editCorrection = () => {
    if (!editingCorrection || !currentCorrectionText || !letter) return;
    const updatedCorrections = letter.corrections.map((correction) => {
      if (
        correction.startIndex === editingCorrection.startIndex &&
        correction.endIndex === editingCorrection.endIndex
      ) {
        return {
          ...correction,
          textCorrected: currentCorrectionText,
        };
      }
      return correction;
    });
    setLetter({ ...letter, corrections: updatedCorrections });
    setEditingCorrection(null);
    setCurrentCorrectionText("");
    setSelectionInfo(null);
    setValuesChanged(true);
  };

  const saveCorrectionOnClick = async () => {
    setCorrectionMode(false);
    if (!id || !letter) return;
    if (
      letter.corrections.length === 0 &&
      (!letter.comments || letter.comments === "")
    ) {
      openDialog({
        title: "Add some corrections...",
        description: "First add some corrections or comments to the letter",
        primaryActionText: "OK",
        autoDismiss: false,
        size: "md",
        type: "error",
      });
      return;
    }
    try {
      const response = await updateLetterCorrections(
        id,
        letter.corrections,
        letter.comments,
      );
      if (response === 0) {
        setValuesChanged(false);
        openDialog({
          title: "Corrections saved",
          description: "Your corrections have been saved successfully.",
          primaryActionText: "OK",
          autoDismiss: true,
          size: "md",
          type: "success",
        });
      } else {
        console.error("Error saving corrections.");
      }
    } catch (error) {
      console.error("Error saving corrections:", error);
    }
  };

  const sendBackOnClick = async () => {
    setCorrectionMode(false);
    if (!id || !letter) return;
    const sendBack = async () => {
      closeDialog();
      const response = await sendLetterBack(id);
      if (response === 0) {
        setLetter({ ...letter, sentBack: true });
        openDialog({
          title: "Letter sent back",
          description: "The letter has been sent back successfully.",
          primaryActionText: "OK",
          type: "success",
        });
      } else {
        openDialog({
          title: "Failed to send back",
          description: "There was an error sending letter back :(",
          primaryActionText: "OK",
          type: "error",
        });
      }
    };
    try {
      openDialog({
        title: "Are you sure you want to send back the letter?",
        description:
          "Once you send it back, you won't be able to make any more changes.",
        primaryActionText: "Send Back",
        autoDismiss: false,
        type: "askConfirmation",
        onConfirmationPositive: sendBack,
      });
    } catch (error) {
      console.log("Error sending letter back:", error);
      openDialog({
        title: "Fail to send back",
        description: "There was an error sending letter back :(",
        primaryActionText: "OK",
        autoDismiss: true,
        size: "md",
        type: "error",
      });
    }
  };

  const deleteLetterForMe = async () => {
    if (letter && letter.id) {
      const res = await deleteCorrectedLetter(letter.id);
      if (res === 0) {
        openDialog({
          title: "Letter correction deleted successfully",
          description: "Let's get back to your dashboard :)",
          type: "success",
          showCloseButton: false,
          autoDismiss: true,
          autoDismissDelay: 3000,
        });
        router.replace("/homepage");
      } else {
        openDialog({
          title: "Failed to delete correction",
          description: "Try again later...",
          primaryActionText: "OK",
          type: "error",
        });
      }
    }
  };

  if (isLoading) {
    return <CorrectLetterSkeleton />;
  }

  if (!letter) {
    return (
      <div className="rounded-tl-2xl bg-white border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 w-full h-full flex justify-center align-center items-stretch h-screen">
        <div className="h-full flex flex-col gap-5 justify-center items-center text-gray-800 dark:text-gray-200">
          <h3>Letter not found. Try again later.</h3>
          <HeartCrack size={100} strokeWidth={1} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-screen overflow-hidden">
      <div className="h-full w-full rounded-lg bg-gray-100 dark:bg-neutral-800 py-10 px-10 sm:px-20 flex flex-col">
        {/* Title field */}
        <p className="placeholder-gray-400 text-center font-bold text-gray-800 dark:text-gray-200 bg-clip-text bg-gradient-to-r from-[#242424] via-[#333333] to-[#4d4d4d] p-4 transition-transform duration-300 animate-gradient-dark w-full focus:border-blue-500 outline-none caret-[#60a5fa] text-2xl">
          {letter.title}
        </p>

        {/* Date field */}
        <div className="flex flex-col text-black dark:text-gray-200 justify-end text-right ">
          {letter.reviewer.nickname && (
            <p className="flex flex-row justify-end items-center">
              By
              <div className="relative rounded-full w-6 h-6 border border-1 border-gray-500 ml-2 mr-0.5 overflow-hidden">
                <Image
                  src={letter.sender.image || "/default.png"}
                  alt={letter.sender.nickname || "sender"}
                  fill
                  className="object-cover"
                />
              </div>
              <span
                className="text-blue-500 cursor-pointer"
                onClick={() => router.push(`/profile/${letter.sender.id}`)}
              >
                {letter.sender.nickname}
              </span>
            </p>
          )}
          <p>{date.toString()}</p>
          {letter.deleted && (
            <>
              <p className="text-red-400 font-semibold">
                This letter has been deleted by the author.
              </p>
              <p className="text-red-400">
                You can review it and add corrections, but you won&apos;t be
                able to send it back.
              </p>
            </>
          )}
        </div>

        {/* Correcting tools */}

        {!letter.sentBack && (
          <button
            onClick={() => setCorrectionMode(!correctionMode)}
            className={`cursor-pointer flex flex-row gap-1 py-1 px-2 w-fit shadow border border-gray-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900  ${correctionMode ? "text-gray-600 dark:text-gray-300" : "text-red-500"} `}
          >
            {correctionMode ? (
              <SquareDashed className="text-gray-600" size={22} />
            ) : (
              "🖍️"
            )}
            <p>Correct</p>
          </button>
        )}

        {/* Letter content field */}
        <div
          onMouseUp={() => {
            setOverlapping(false);
            if (!correctionMode) return;

            const selection = window.getSelection();
            if (selection && selection.toString().trim()) {
              const range = selection.getRangeAt(0);

              // Create a range from the start of the container to the start of the selection
              const preRange = document.createRange();
              if (!textRef.current) return;
              preRange.setStart(textRef.current, 0);
              preRange.setEnd(range.startContainer, range.startOffset);

              const startIndex = preRange.toString().length;
              const endIndex = startIndex + range.toString().length;

              // Check overlapping
              const overlapping = letter.corrections.some(
                (c) => startIndex < c.endIndex && endIndex > c.startIndex,
              );
              if (overlapping) {
                setOverlapping(true);
                return;
              }

              const rect = range.getBoundingClientRect();

              setSelectionInfo({
                text: selection.toString(),
                rect,
                startIndex,
                endIndex,
              });
            }
          }}
          className={`w-full flex-1 min-h-0 pt-5 pb-10 text-gray-900 dark:text-gray-100 outline-none rounded cursor-text leading-loose
              mt-8 p-4 ${correctionMode ? "cursor-none" : "cursor-auto"}
                ${correctionMode && overlapping ? "selection:bg-red-200" : "selection:bg-yellow-200"}`}
        >
          <TextCorrections
            ref={textRef}
            text={letter.content}
            corrections={letter.corrections}
            onCorrectionClick={(correction, rect) => {
              setEditingCorrection(correction);
              setCurrentCorrectionText(correction.textCorrected);
              setSelectionInfo({
                text: correction.textOriginal,
                rect,
                startIndex: correction.startIndex,
                endIndex: correction.endIndex,
              });
            }}
          />
        </div>

        {selectionInfo && selectionInfo.rect && (
          <div
            ref={correctionRef}
            style={{
              position: "absolute",
              top: selectionInfo.rect.bottom + window.scrollY + 8,
              left: selectionInfo.rect.left + window.scrollX,
              background: "var(--ds-background-100)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              padding: "8px",
              zIndex: 1000,
            }}
          >
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                {!letter.sentBack ? "🖍️ Correcting" : "🖍️ Correction"}
              </p>
              <div className="flex items-center gap-2">
                {!letter.sentBack && (
                  <>
                    <Check
                      className="w-5 h-5 text-green-500 hover:text-white hover:bg-green-500 hover:rounded"
                      onClick={() => {
                        if (editingCorrection) {
                          editCorrection();
                          return;
                        }
                        addCorrection();
                      }}
                    />
                    <Trash
                      className="w-5 h-5 p-0.5 text-red-500 cursor-pointer hover:text-white hover:bg-red-500 hover:rounded"
                      onClick={() => {
                        if (!editingCorrection) return;
                        setLetter({
                          ...letter,
                          corrections: letter.corrections.filter(
                            (c) =>
                              c.startIndex !== editingCorrection.startIndex ||
                              c.endIndex !== editingCorrection.endIndex,
                          ),
                        });
                        setEditingCorrection(null);
                        setCurrentCorrectionText("");
                        setSelectionInfo(null);
                        setValuesChanged(true);
                      }}
                    />
                  </>
                )}

                <X
                  onClick={() => {
                    setSelectionInfo(null);
                  }}
                  className="w-5 h-5 text-blue-500 hover:text-white hover:bg-blue-500 hover:rounded"
                ></X>
              </div>
            </div>
            <textarea
              className="border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 w-64 p-2 text-sm rounded text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-dark-green-600 dark:focus:ring-green-400"
              rows={3}
              disabled={letter.sentBack}
              placeholder="Enter your correction..."
              value={currentCorrectionText}
              onChange={(e) => {
                setCurrentCorrectionText(e.target.value);
              }}
            />
          </div>
        )}

        {/* Comment box */}

        <div className="w-full my-3">
          <textarea
            placeholder={
              letter.sentBack
                ? "No additional comments"
                : "You may add general comments here..."
            }
            value={letter.comments}
            onChange={handleInput}
            disabled={letter.sentBack}
            className="px-5 py-4 w-full text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-neutral-900 rounded-lg outline-none
                  resize-none
                  opacity-100"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-between h-[5%] col items-center gap-4 mt-4">
          <Link href={"/homepage"}>
            <button>
              <div className="cursor-pointer h-[100%] w-auto flex items-center justify-center bg-[#FF6347] text-white rounded py-2 px-4 hover:bg-[#c75945] transition-colors">
                Back
              </div>
            </button>
          </Link>

          <div className="flex flex-row justify-end h-[5%] col items-center gap-4">
            {!letter.sentBack ? (
              <>
                {valuesChanged ||
                (letter.corrections.length === 0 && !letter.comments) ? (
                  <button onClick={saveCorrectionOnClick}>
                    <div className="cursor-pointer h-[100%] w-auto flex items-center justify-center bg-[#3b82f6] text-white rounded py-2 px-4 hover:bg-[#2563eb] transition-colors">
                      💾 Save correction
                    </div>
                  </button>
                ) : (
                  <>
                    {letter.deleted ? (
                      <button onClick={deleteLetterForMe}>
                        <div className="cursor-pointer h-[100%] w-auto flex gap-1 items-center justify-center bg-white dark:bg-neutral-900 text-red-400 border-1 border-red-400 rounded py-2 px-4 hover:bg-red-100 dark:hover:bg-red-950/30 ">
                          <Trash2 size={16} /> Delete for me
                        </div>
                      </button>
                    ) : (
                      <button onClick={sendBackOnClick}>
                        <div className="cursor-pointer h-[100%] w-auto flex items-center justify-center bg-[#6495ED] text-white rounded py-2 px-4 hover:bg-[#537dc9] ">
                          📬 Send Back
                        </div>
                      </button>
                    )}
                    <div className="text-[#60a5fa] flex items-center gap-2">
                      Correction saved
                      <Check className="w-5 h-5" />
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="text-[#6495ED] flex items-center gap-2">
                Letter sent back
                <Check className="w-5 h-5" />
              </div>
            )}
          </div>
        </div>
      </div>
      {correctionMode && <EmojiCursor />}
    </div>
  );
};

function EmojiCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    // Add the listener to the entire document
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className="fixed pointer-events-none z-[9999] text-red-500 select-none"
      style={{
        left: position.x + 3, // Offset so it doesn't cover the cursor
        top: position.y - 20,
        fontSize: "20px",
      }}
    >
      🖍️
    </div>
  );
}
