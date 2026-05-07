"use client";
import { useContext, useEffect, useRef } from "react";
import Link from "next/link";
import { useState } from "react";
import { CalendarDate, parseDate } from "@internationalized/date";
import { DateField, DateInput } from "@/components/ui/datefield";
import { Label } from "@/components/ui/field";
import { getLetter, getDiaries, editLetter } from "@/services/api";
import { Check, HeartCrack } from "lucide-react";
import { use } from "react";
import AppPageSkeleton from "@/components/appPageSkeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import dynamic from "next/dynamic";
import { useDialog } from "@/context/dialogContext";
import { BookOpen } from "lucide-react";
import { isQuillContentEmpty } from "@/lib/utils";
import { LetterFormErrors, NewLetter } from "@/lib/types";
import { useRouter } from "next/navigation";
import { UserContext } from "@/context/userContext";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export default function Home({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <NewLetterPageContent id={id} />;
}

const NewLetterPageContent = ({ id }: { id: string }) => {
  const { openDialog, closeDialog } = useDialog();
  const router = useRouter();
  const quillRef = useRef<{
    getEditor: () => {
      focus: () => void;
      getLength: () => number;
      setSelection: (index: number, length: number, source?: string) => void;
    };
  } | null>(null);

  useEffect(() => {
    import("react-quill-new/dist/quill.bubble.css").catch(() => {});
  }, []);

  const [isLoading, setIsLoading] = useState(true);
  const [valuesChanged, setValuesChanged] = useState(false);

  const [diaryAddedPreviously, setDiaryAddedPreviously] = useState<
    string | undefined
  >(undefined);
  const [letter, setLetter] = useState<NewLetter>({
    id: id,
    date: parseDate(new Date().toISOString().split("T")[0]),
    diary: "",
    language: "",
    title: "",
    letterContent: "",
    sharedWith: [],
  });
  const updateLetter = (updates: Partial<NewLetter>) => {
    setLetter((prev) => ({ ...prev, ...updates }));
    setValuesChanged(true);
  };
  const [languageList, setLanguageList] = useState<string[]>([
    "English",
    "Spanish",
    "French",
    "German",
  ]);
  const [diaryList, setDiaryList] = useState<string[]>([
    "English Diary",
    "Spanish Tales",
    "new",
  ]);

  const [errors, setErrors] = useState<LetterFormErrors>({
    title: false,
    date: false,
    language: false,
    content: false,
  });
  const [letterNotFound, setLetterNotFound] = useState<boolean>(false);

  const modulesQuill = {
    toolbar: [
      ["bold", "italic"], // negrita y cursiva
      [{ header: 1 }, { header: 2 }], // encabezados
      ["blockquote"], // citas
      [{ align: [] }], // alignment (left, center, right, justified)
    ],
  };

  const { userData } = useContext(UserContext);

  // Funciones
  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setErrors((prev) => ({ ...prev, title: false }));
    updateLetter({ title: event.target.value });
  };

  const handleDateChange = (newDate: CalendarDate | null) => {
    if (newDate) {
      setErrors((prev) => ({ ...prev, date: false }));
      updateLetter({ date: newDate });
    }
  };

  const handleLanguageChange = (selectedLanguage: string) => {
    setErrors((prev) => ({ ...prev, language: false }));
    updateLetter({ language: selectedLanguage });
  };

  const handleDiaryChange = (selectedDiary: string) => {
    updateLetter({ diary: selectedDiary });
  };

  const handleQuillContainerMouseDown = (
    event: React.MouseEvent<HTMLDivElement>,
  ) => {
    if (letter.sharedWith.length > 0) return;

    const target = event.target as HTMLElement;
    const clickedInsideEditor = target.closest(".ql-editor");
    const clickedQuillControl = target.closest(".ql-toolbar, .ql-tooltip");

    if (clickedInsideEditor || clickedQuillControl) return;

    event.preventDefault();
    const quill = quillRef.current?.getEditor();
    if (!quill) return;

    quill.focus();
    const endPosition = Math.max(0, quill.getLength() - 1);
    quill.setSelection(endPosition, 0, "user");
  };

  // Function to save the letter (edit)
  const SaveLetterOnClick = async () => {
    const nextErrors: LetterFormErrors = {
      title: !letter.title.trim(),
      date: !letter.date,
      language: !letter.language,
      content: isQuillContentEmpty(letter.letterContent),
    };

    setErrors(nextErrors);

    const hasError = Object.values(nextErrors).some(Boolean);
    if (hasError) {
      const missingFields: string[] = [];
      if (nextErrors.title) missingFields.push("title");
      if (nextErrors.date) missingFields.push("date");
      if (nextErrors.language) missingFields.push("language");
      if (nextErrors.content) missingFields.push("letter content");

      openDialog({
        title: "Fields missing!",
        description: `Please complete: ${missingFields.join(", ")}.`,
        primaryActionText: "OK",
        type: "error",
        autoDismiss: true,
        autoDismissDelay: 3000,
      });
      return;
    }

    const res = await editLetter(
      id,
      letter.title,
      letter.letterContent,
      letter.diary,
      letter.language,
      letter.date,
      letter.sharedWith,
    );

    if (res === 0) {
      setValuesChanged(false);
      openDialog({
        title: "Letter Saved",
        description: "Your letter was updated!",
        primaryActionText: "OK",
        type: "success",
        autoDismiss: true,
      });
    } else {
      openDialog({
        title: "Error Saving Letter",
        description:
          "There was an error saving your letter. Please try again later.",
        primaryActionText: "OK",
        type: "error",
      });
    }
  };

  const addNewDiary = (diaryName: string) => {
    setDiaryList((prev) => {
      // Verificar si el diario ya existe
      if (prev.includes(diaryName)) {
        return prev;
      }

      if (diaryAddedPreviously) {
        // Replace the last added with the new one
        const newList = [...prev];
        newList[prev.length - 1] = diaryName;
        return newList;
      } else {
        return [...prev, diaryName];
      }
    });
    setDiaryAddedPreviously(diaryName);
    updateLetter({ diary: diaryName });
  };

  /*const handleShareSuccess = async (result: number) => {
    // Fetch letter data again to get its uploaded version
    if (result === 0) {
      openDialog({
        title: "Letter Shared",
        description: "Your letter has been shared successfully!",
        primaryActionText: "OK",
        type: "success",
        autoDismiss: true,
      });
    } else {
      openDialog({
        title: "Error Sharing Letter",
        description: "There was an error sharing your letter.",
        primaryActionText: "OK",
        type: "error",
      });
    }

    const letterData = await getLetter(id);
    if (!letterData) {
      setLetterNotFound(true);
      setIsLoading(false);
      return;
    }
    updateLetter({ sharedWith: letterData.sharedWith || [] });
  };*/

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const letterData = await getLetter(id);
      if (!letterData) {
        setLetterNotFound(true);
        setIsLoading(false);
        return;
      }

      // Get languages
      const learningLanguages = [
        userData.learningLanguage,
        userData.learningLanguage2,
        userData.learningLanguage3,
      ].filter((lang) => lang !== null);

      const fetchDiaries = async () => {
        const res = await getDiaries();
        if (Array.isArray(res)) {
          setDiaryList(res);
        }
      };
      console.log(letterData);
      updateLetter({
        date: parseDate(
          new Date(letterData.created_at).toISOString().split("T")[0],
        ),
        diary: letterData.diary || "",
        language: letterData.language || learningLanguages[0],
        title: letterData.title || "",
        letterContent: letterData.content || "",
        sharedWith: letterData.sharedWith || [],
      });

      if (learningLanguages.length > 0) {
        setLanguageList(learningLanguages as string[]);
      }
      fetchDiaries();
      setIsLoading(false);
    })();
  }, [id, router]);

  const goToProfile = (userId: string) => {
    window.location.href = `/profile/${userId}`;
  };

  if (isLoading) {
    return (
      <AppPageSkeleton
        titleWidthClass="w-2/3 mx-auto"
        contentHeightClass="h-[60vh]"
      />
    );
  }

  if (letterNotFound) {
    return (
      <div className="h-full flex flex-col gap-5 justify-center items-center text-gray-800 dark:text-gray-200">
        <h3>Letter not found. Try again later.</h3>
        <HeartCrack size={100} strokeWidth={1} />
        <BackButton />
      </div>
    );
  }

  return (
    <div className="flex gap-2 flex-1">
      <div className="h-full w-full rounded-lg bg-gray-100 dark:bg-neutral-800 py-10 px-5 sm:px-20">
        {/* Title field */}
        <input
          type="text"
          value={letter.title}
          disabled={letter.sharedWith.length > 0}
          onChange={handleTitleChange}
          className={`placeholder-gray-500 dark:placeholder-gray text-center text-2xl font-bold text-gray-850 dark:text-gray-200 p-4 w-full focus:border-blue-500 outline-none caret-[#60a5fa] ${
            errors.title ? "placeholder-red-500" : "border-none"
          }`}
          placeholder="Title of the letter! Edit this, ganster..."
          autoFocus
        />

        <div className="grid grid-cols-2 grid-rows-2 lg:grid-cols-8 lg:grid-rows-1 gap-2 justify-between items-end mb-0 sm:mb-5">
          {/* Date field */}
          <div className="w-full">
            <DateField
              className={"rounded-md ring-transparent"}
              value={letter.date}
              isDisabled={letter.sharedWith.length > 0}
              onChange={handleDateChange}
            >
              {errors.date && (
                <Label className="text-red-500">Date missing</Label>
              )}
              {!errors.date && (
                <Label className="text-black dark:text-gray-200">Date</Label>
              )}
              <DateInput
                className={`bg-white dark:bg-neutral-850 text-black dark:text-gray-200  ${
                  errors.date
                    ? "border-red-500"
                    : "border-neutral-300 dark:border-neutral-700"
                }`}
              />
            </DateField>
          </div>

          {/* Diary select */}
          <div>
            <Label className="text-black dark:text-gray-200">
              Select diary
            </Label>
            <Select
              value={letter.diary}
              onValueChange={(diary) => {
                handleDiaryChange(diary);
              }}
              disabled={letter.sharedWith.length > 0}
            >
              <SelectTrigger className="text-black dark:text-gray-200 bg-white dark:bg-neutral-850 h-10 rounded-md ring-transparent border border-neutral-300 dark:border-neutral-700">
                <SelectValue placeholder="(None)" />
              </SelectTrigger>
              <SelectContent>
                {diaryList.map((diary, index) => (
                  <SelectItem key={`${diary}-${index}`} value={diary}>
                    {diary}
                  </SelectItem>
                ))}
                <div
                  key="new"
                  className="cursor-pointer flex justify-center items-center hover:bg-gray-100 dark:hover:bg-neutral-800 w-full text-sm bg-white dark:bg-neutral-850 h-8 rounded-md ring-transparent text-purple-500 dark:text-dark-green-500"
                  onClick={(e) => {
                    e.preventDefault();
                    openDialog({
                      title: "Create New Diary",
                      description: "Enter a name for your new diary.",
                      primaryActionText: "OK",
                      type: "newDiary",
                      autoDismiss: false,
                      onNewDiaryCreated: (diaryName: string) => {
                        addNewDiary(diaryName);
                      },
                      prevNewDiaryName: diaryAddedPreviously,
                    });
                  }}
                >
                  <BookOpen className="mr-2" size={15} /> Create new diary
                </div>
              </SelectContent>
            </Select>
          </div>

          {/* Language select */}
          <div className="">
            <Label
              className={
                errors.language
                  ? "text-red-500"
                  : "text-black dark:text-gray-200"
              }
              htmlFor={id}
            >
              Select language
            </Label>
            <Select
              value={letter.language}
              disabled={letter.sharedWith.length > 0}
              onValueChange={(lang) => {
                handleLanguageChange(lang);
              }}
            >
              <SelectTrigger
                id={id}
                className={`text-black dark:text-gray-200 bg-white dark:bg-neutral-850 h-10 rounded-md ring-transparent border ${
                  errors.language
                    ? "border-red-500"
                    : "border-neutral-300 dark:border-neutral-700"
                }`}
              >
                <SelectValue placeholder="(None)" />
              </SelectTrigger>
              <SelectContent>
                {languageList.map((lang, index) => (
                  <SelectItem key={`${lang}-${index}`} value={lang}>
                    {lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {letter.sharedWith && letter.sharedWith[0] && (
            <div className="col-span-5 text-[#6495ED] m-4 flex flex-row gap-2 justify-end">
              <span className="text-gray-600 dark:text-gray-300">
                Shared with
              </span>
              <div
                key={letter.sharedWith[0].id}
                className="flex items-center gap-1 cursor-pointer"
                onClick={() => goToProfile(letter.sharedWith[0].id)}
              >
                <img
                  src={letter.sharedWith[0].image || "/default.png"}
                  alt={letter.sharedWith[0].nickname}
                  className="w-5 h-5 rounded-full border border-gray-300"
                />
                {letter.sharedWith[0].nickname}
              </div>
              {letter.sharedWith[1] && (
                <div
                  key={letter.sharedWith[1].id}
                  className="flex items-center gap-1 cursor-pointer"
                  onClick={() => goToProfile(letter.sharedWith[1].id)}
                >
                  <span className="text-gray-600 dark:text-gray-300">and</span>
                  <img
                    src={letter.sharedWith[1].image || "/default.png"}
                    alt={letter.sharedWith[1].nickname}
                    className="w-5 h-5 rounded-full border border-gray-300"
                  />
                  {letter.sharedWith[1].nickname}
                </div>
              )}
            </div>
          )}
        </div>

        <div onMouseDown={handleQuillContainerMouseDown}>
          <ReactQuill
            // @ts-expect-error: dynamic import makes the ref type opaque
            ref={quillRef}
            className={`min-h-[60vh] sm:min-h-[65vh] border rounded-md bg-white dark:bg-neutral-850 text-gray-900 dark:text-gray-200
              rounded-md p-2 space-y-1 ring-transparent ${
                errors.content
                  ? "border-red-500"
                  : "border-neutral-300 dark:border-neutral-700"
              }`}
            theme="bubble"
            value={letter.letterContent}
            onChange={(content) => {
              updateLetter({ letterContent: content });
              setErrors((prev) => ({
                ...prev,
                content: isQuillContentEmpty(content) ? prev.content : false,
              }));
              setValuesChanged(true);
            }}
            modules={modulesQuill}
            readOnly={letter.sharedWith.length > 0}
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-between h-[5%] items-center gap-4 mt-4">
          <BackButton />

          <div className="flex flex-row justify-end h-[5%] col items-center gap-4">
            {/* Send Letter button - show if not sent to 2 people yet */}
            {letter.sharedWith.length < 2 && (
              <button
                onClick={() => {
                  openDialog({
                    title: "Send Letter",
                    description: "",
                    primaryActionText: "",
                    size: "md",
                    type: "shareLetter",
                    letterId: id,
                    autoDismiss: false,
                    sharedWith: letter.sharedWith,
                    onShareSuccess: (sharedWithUsers) => {
                      updateLetter({ sharedWith: sharedWithUsers });
                      closeDialog();
                    },
                  });
                }}
              >
                <div className="h-[100%] w-auto flex items-center justify-center bg-[#6495ED] dark:bg-[#ffff4d] dark:text-gray-900 text-white rounded py-2 px-4 hover:bg-[#537dc9] dark:hover:bg-[#c8c800]">
                  📬 Send Letter
                </div>
              </button>
            )}

            {/* Save Letter button - only if not sent and has changes */}
            {valuesChanged && letter.sharedWith.length === 0 && (
              <button
                onClick={() => {
                  SaveLetterOnClick();
                }}
              >
                <div className="h-[100%] w-auto flex items-center justify-center bg-[#8EBA03] hover:bg-[#708e0b] dark:bg-border dark:hover:bg-card text-white rounded py-2 px-4">
                  💾 Save Letter
                </div>
              </button>
            )}

            {/* Letter sent indicator - show if sent to at least 1 person */}
            {letter.sharedWith.length > 0 && (
              <div className="text-[#60a5fa] display flex items-center gap-2">
                Letter sent
                <Check className="w-5 h-5" />
              </div>
            )}

            {/* Letter saved indicator - show if saved but not sent and no changes */}
            {!valuesChanged && letter.sharedWith.length === 0 && (
              <div className="text-[#8EBA03] dark:text-ring display flex items-center gap-2">
                Letter saved
                <Check className="w-5 h-5" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const BackButton = () => {
  return (
    <Link href={"/homepage"}>
      <button>
        <div className="h-[100%] w-auto flex items-center justify-center bg-[#FF6347] text-white rounded py-2 px-4 hover:bg-[#c75945] transition-colors">
          Back
        </div>
      </button>
    </Link>
  );
};
