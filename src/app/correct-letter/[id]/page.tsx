"use client";
import { useEffect, useRef } from "react";
import { SidebarDemo } from "@/components/sidebardemo";
import Link from "next/link";
import { useState } from "react";
import { parseDate } from "@internationalized/date";
import { Check, X, Trash, SquareDashed } from "lucide-react";
import { use } from "react";
import { SuccessDialog, DialogType } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner-1";
import TextCorrections from "@/components/textCorrections";
import {
  updateLetterCorrections,
  sendLetterBack,
  getLetterToCorrect,
} from "@/services/api";

interface Correccion {
  textOriginal: string;
  textCorrected: string;
  startIndex: number;
  endIndex: number;
}

export default function Home({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <div className="page-container">
      <SidebarDemo>
        <CorrectLetterPageContent id={id} />
      </SidebarDemo>
    </div>
  );
}

const CorrectLetterPageContent = ({ id }: { id: string }) => {
  const textRef = useRef<HTMLDivElement | null>(null);
  const correctionRef = useRef<HTMLDivElement | null>(null);
  const [currentCorrectionText, setCurrentCorrectionText] =
    useState<string>("");
  const [editingCorrection, setEditingCorrection] = useState<Correccion | null>(
    null,
  );
  const [overlapping, setOverlapping] = useState<boolean>(false);
  const [valuesChanged, setValuesChanged] = useState(false);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [letterContent, setLetterContent] = useState("");
  const [date, setDate] = useState(() =>
    parseDate(new Date().toISOString().split("T")[0]),
  );
  const [deleted, setDeleted] = useState(false);
  const [correctionMode, setCorrectionMode] = useState(false);
  const [selectionInfo, setSelectionInfo] = useState<{
    text: string;
    rect: DOMRect | null;
    startIndex: number;
    endIndex: number;
  } | null>(null);
  const [corrections, setCorrections] = useState<Correccion[]>([]);
  const [sentBack, setSentBack] = useState(false);
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = "auto"; // reset height
    textarea.style.height = textarea.scrollHeight + "px"; // set height to scrollHeight
    setComment(e.target.value);
    setValuesChanged(true);
  };

  // Dialog
  const [dialogConfig, setDialogConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    primaryActionText: string;
    autoDismiss: boolean;
    size: "sm" | "md" | "lg";
    type: DialogType;
    onConfirmationPositive?: () => void | Promise<void>;
  }>({
    isOpen: false,
    title: "Payment Successful!",
    description:
      "Your payment has been processed successfully. You will receive a confirmation email shortly.",
    primaryActionText: "View Receipt",
    autoDismiss: true,
    size: "md",
    type: "success",
    onConfirmationPositive: undefined,
  });

  const openDialog = (config: Partial<typeof dialogConfig>) => {
    setDialogConfig((prev) => ({ ...prev, ...config, isOpen: true }));
  };

  const closeDialog = () => {
    setDialogConfig((prev) => ({ ...prev, isOpen: false }));
  };

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const letterData = await getLetterToCorrect(id);
      console.log("Letter data:", letterData);
      if (!letterData) {
        console.error("No letter data found for ID:", id);
        return;
      }
      setAuthor(letterData.sender.nickname || "");
      setTitle(letterData.originalLetter.title || "");
      setLetterContent(letterData.originalLetter.content || "");
      setDate(
        parseDate(
          new Date(letterData.originalLetter.created_at)
            .toISOString()
            .split("T")[0],
        ),
      );
      setDeleted(letterData.originalLetter.deleted || false);
      setCorrections(letterData.corrections || []);
      setSentBack(letterData.sentBack || false);
      setComment(letterData.comments || "");
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

    // Añadir el listener con un pequeño delay
    const timeout = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0); // se ejecuta después del click actual

    return () => {
      clearTimeout(timeout);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectionInfo]);

  const addCorrection = () => {
    if (!selectionInfo || !selectionInfo.text || currentCorrectionText === "")
      return;

    let { text, startIndex, endIndex } = selectionInfo;

    // Eliminar espacio al final
    if (text.endsWith(" ")) {
      text = text.slice(0, -1);
      endIndex -= 1;
    }

    if (text.length === 0) return;

    const newCorrection: Correccion = {
      textOriginal: text,
      textCorrected: currentCorrectionText,
      startIndex,
      endIndex,
    };

    setCorrections([...corrections, newCorrection]);
    setSelectionInfo(null);
    setCurrentCorrectionText("");
    setEditingCorrection(null);
    setValuesChanged(true);
  };

  const editCorrection = () => {
    if (!editingCorrection || !currentCorrectionText) return;
    const updatedCorrections = corrections.map((correction) => {
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
    setCorrections(updatedCorrections);
    setEditingCorrection(null);
    setCurrentCorrectionText("");
    setSelectionInfo(null);
    setValuesChanged(true);
    console.log("Correction edited:", updatedCorrections);
  };

  const saveCorrectionOnClick = async () => {
    setCorrectionMode(false);
    if (!id) return;
    if (corrections.length === 0 && (!comment || comment === "")) {
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
      const response = await updateLetterCorrections(id, corrections, comment);
      if (response === 0) {
        console.log("Corrections saved successfully:", response);
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
    if (!id) return;
    const sendBack = async () => {
      closeDialog();
      const response = await sendLetterBack(id);
      if (response === 0) {
        setSentBack(true);
        openDialog({
          title: "Letter sent back",
          description: "The letter has been sent back successfully.",
          primaryActionText: "OK",
          autoDismiss: true,
          size: "md",
          type: "success",
        });
      } else {
        openDialog({
          title: "Failed to send back",
          description: "There was an error sending letter back :(",
          primaryActionText: "OK",
          autoDismiss: true,
          size: "md",
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
        size: "md",
        type: "askConfirmation",
        onConfirmationPositive: sendBack,
      });
    } catch (_error) {
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size={40} color="gray" />
      </div>
    );
  }

  return (
    <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-screen overflow-hidden">
      <div className="h-full w-full rounded-lg bg-gray-100 dark:bg-neutral-800 py-10 px-10 sm:px-20 flex flex-col">
        {/* Title field */}
        <p className="placeholder-gray-400 text-center text-2xl font-bold text-gray-700 bg-clip-text bg-gradient-to-r from-[#242424] via-[#333333] to-[#4d4d4d] p-4 transition-transform duration-300 animate-gradient-dark w-full focus:border-blue-500 outline-none caret-[#8EBA03]">
          {title}
        </p>

        {/* Date field */}
        <div className="flex flex-col text-black justify-end text-right ">
          <p>
            By <span className="font-semibold">{author}</span>
          </p>
          <p>{date.toString()}</p>
          {deleted && (
            <>
              <p className="text-red-400 font-semibold">
                This letter has been deleted by the author.
              </p>
              <p className="text-red-400">
                You can review it and add corrections, but you won't be able to
                send it back.
              </p>
            </>
          )}
        </div>

        {/* Correcting tools */}

        {!sentBack && (
          <button
            onClick={() => setCorrectionMode(!correctionMode)}
            className={`flex flex-row gap-1 py-1 px-2 w-fit shadow border border-gray-300 rounded-md bg-white  ${correctionMode ? "text-gray-600" : "text-red-500"} `}
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

              // Crea un rango desde el inicio del contenedor hasta el inicio de la selección
              const preRange = document.createRange();
              if (!textRef.current) return;
              preRange.setStart(textRef.current, 0);
              preRange.setEnd(range.startContainer, range.startOffset);

              const startIndex = preRange.toString().length;
              const endIndex = startIndex + range.toString().length;

              // Check overlapping
              const overlapping = corrections.some(
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
          className={`w-full flex-1 min-h-0 pt-5 pb-10 text-gray-900 outline-none rounded cursor-text leading-loose
              mt-8 p-4 ${correctionMode ? "cursor-none" : "cursor-auto"}
                ${correctionMode && overlapping ? "selection:bg-red-200" : "selection:bg-yellow-200"}`}
        >
          <TextCorrections
            ref={textRef}
            text={letterContent}
            corrections={corrections}
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
              background: "white",
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "8px",
              zIndex: 1000,
            }}
          >
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-gray-600 mb-1">
                {!sentBack ? "🖍️ Correcting" : "🖍️ Correction"}
              </p>
              <div className="flex items-center gap-2">
                {!sentBack && (
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
                        setCorrections(
                          corrections.filter(
                            (c) =>
                              c.startIndex !== editingCorrection.startIndex ||
                              c.endIndex !== editingCorrection.endIndex,
                          ),
                        );
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
              className="border w-64 p-2 text-sm rounded text-gray-800"
              rows={3}
              disabled={sentBack}
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
              sentBack
                ? "No additional comments"
                : "You may add general comments here..."
            }
            value={comment}
            onChange={handleInput}
            disabled={sentBack}
            className="px-5 py-4 w-full text-gray-800 bg-gray-50 rounded-lg outline-none
                  resize-none
                  opacity-100"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-between h-[5%] col items-center gap-4 mt-4">
          <Link href={"/homepage"}>
            <button>
              <div className="h-[100%] w-auto flex items-center justify-center bg-[#FF6347] text-white rounded py-2 px-4 hover:bg-[#c75945] transition-colors">
                Back
              </div>
            </button>
          </Link>

          <div className="flex flex-row justify-end h-[5%] col items-center gap-4">
            {!sentBack ? (
              <>
                {valuesChanged || (corrections.length === 0 && !comment) ? (
                  <button onClick={saveCorrectionOnClick}>
                    <div className="h-[100%] w-auto flex items-center justify-center bg-[#8EBA03] text-white rounded py-2 px-4 hover:bg-[#708e0b] transition-colors">
                      💾 Save correction
                    </div>
                  </button>
                ) : (
                  <>
                    {!deleted && (
                      <button onClick={sendBackOnClick}>
                        <div className="h-[100%] w-auto flex items-center justify-center bg-[#6495ED] text-white rounded py-2 px-4 hover:bg-[#537dc9] ">
                          📬 Send Back
                        </div>
                      </button>
                    )}
                    <div className="text-[#8EBA03] flex items-center gap-2">
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
      <SuccessDialog
        isOpen={dialogConfig.isOpen}
        onClose={closeDialog}
        title={dialogConfig.title}
        description={dialogConfig.description}
        primaryActionText={dialogConfig.primaryActionText}
        autoDismiss={dialogConfig.autoDismiss}
        autoDismissDelay={2000}
        size={dialogConfig.size}
        type={dialogConfig.type}
        onPrimaryAction={() => {
          console.log("Primary action clicked for type:", dialogConfig.type);
        }}
        letterId={id}
        sharedWith={[]}
        onShareSuccess={() => {}}
        onConfirmationPositive={dialogConfig.onConfirmationPositive}
      />

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

    // Añadir el listener al documento completo
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
        left: position.x + 3, // Offset para que no tape el cursor
        top: position.y - 20,
        fontSize: "20px",
      }}
    >
      🖍️
    </div>
  );
}
