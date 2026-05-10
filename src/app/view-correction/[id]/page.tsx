"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { getLetterToCorrect } from "@/services/api";
import { HeartCrack, X } from "lucide-react";
import Image from "next/image";
import { use } from "react";
import TextCorrections from "@/components/textCorrections";
import { CorrectedLetter } from "../../../lib/types";

export default function Home({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <CorrectLetterPageContent id={id} />;
}

const CorrectLetterPageContent = ({ id }: { id: string }) => {
  const router = useRouter();
  const textRef = useRef<HTMLDivElement | null>(null);
  const correctionRef = useRef<HTMLDivElement | null>(null);
  const [currentCorrectionText, setcurrentCorrectionText] =
    useState<string>("");
  const [selectionInfo, setSelectionInfo] = useState<{
    text: string;
    rect: DOMRect | null;
    startIndex: number;
    endIndex: number;
  } | null>(null);
  const [letter, setLetter] = useState<CorrectedLetter | null>(null);

  useEffect(() => {
    (async () => {
      const letterData = await getLetterToCorrect(id);
      console.log("letterData component", letterData);
      if (!letterData) {
        console.error("No letter data found for ID:", id);
        return;
      }
      setLetter(letterData);
    })();
  }, [id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        correctionRef.current &&
        !correctionRef.current.contains(event.target as Node)
      ) {
        setcurrentCorrectionText("");
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
    <div className="rounded-tl-2xl bg-white border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 w-full h-full flex justify-center align-center items-stretch h-screen">
      <div className="my-4 w-[95%] rounded-lg bg-gray-100 dark:bg-neutral-800 py-10 px-10 sm:px-20 flex flex-col justify-around">
        {/* Title field */}
        <h1 className="placeholder-gray-400 text-center font-bold text-gray-700 bg-clip-text bg-gradient-to-r from-[#242424] via-[#333333] to-[#4d4d4d] p-4 transition-transform duration-300 animate-gradient-dark w-full focus:border-blue-500 outline-none caret-[#60a5fa]">
          {letter.title}
        </h1>

        {/* Date field */}
        <div className="flex flex-col text-gray-800 dark:text-gray-200 justify-end text-center lg:text-right ">
          <p>
            Written day{" "}
            {letter.date
              .toDate("UTC")
              .toLocaleDateString("en-CA", { timeZone: "UTC" })}
          </p>
          {letter.reviewer.nickname && (
            <p className="flex flex-row justify-end items-center">
              Corrected by
              <div className="relative rounded-full w-6 h-6 border border-1 border-gray-500 ml-2 mr-0.5 overflow-hidden">
                <Image
                  src={`${process.env.NEXT_PUBLIC_PICTURES_BASE_URL}/${letter.reviewer.image}`}
                  alt={letter.reviewer.nickname || "Reviewer"}
                  fill
                  className="object-cover"
                />
              </div>
              <span
                className="text-blue-500 cursor-pointer"
                onClick={() => router.push(`/profile/${letter.reviewer.id}`)}
              >
                {letter.reviewer.nickname}
              </span>
            </p>
          )}
        </div>

        {/* Letter content field */}
        <div className="w-full min-h-[55vh] sm:min-h-[58vh] pt-5 pb-10 text-gray-900 dark:text-gray-100 outline-none rounded cursor-text text-xl leading-loose">
          <TextCorrections
            ref={textRef}
            text={letter.content}
            corrections={letter.corrections || []}
            onCorrectionClick={(correction, rect) => {
              setcurrentCorrectionText(correction.textCorrected);
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
                {!letter.sentBack ? "🖍️ Correcting" : "🖍️ Correction"}
              </p>
              <div className="flex items-center gap-2">
                <X
                  onClick={() => {
                    setSelectionInfo(null);
                    console.log("Correction saved for:", selectionInfo.text);
                  }}
                  className="w-5 h-5 text-blue-500 hover:text-white hover:bg-blue-500 hover:rounded"
                ></X>
              </div>
            </div>
            <textarea
              className="border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 w-64 p-2 text-sm rounded text-gray-800 dark:text-gray-100"
              rows={3}
              disabled={letter.sentBack}
              placeholder="Enter your correction..."
              value={currentCorrectionText}
              onChange={(e) => {
                setcurrentCorrectionText(e.target.value);
              }}
            />
          </div>
        )}

        {/* Comment box */}
        <div className="w-full my-3">
          <textarea
            placeholder={"No additional comments"}
            value={letter.comments}
            disabled={true}
            className="px-5 py-4 w-full text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-neutral-900 rounded-lg outline-none
                  resize-none
                  opacity-100"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-between h-[5rem] col items-center gap-4 mt-4">
          <Link href={"/homepage"}>
            <button>
              <div className="h-[100%] w-auto flex items-center justify-center bg-[#FF6347] text-white rounded py-2 px-4 hover:bg-[#c75945] transition-colors">
                Back
              </div>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};
