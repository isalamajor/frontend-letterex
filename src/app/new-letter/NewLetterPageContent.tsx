"use client";
import { useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { parseDate } from "@internationalized/date";
import { DateField, DateInput } from "@/components/ui/datefield";
import { Label } from "@/components/ui/field";
import { getDiaries, saveLetter } from "@/services/api";
import { BookOpen } from "lucide-react";
import dynamic from "next/dynamic";
import { useDialog } from "@/context/dialogContext";
import { isQuillContentEmpty } from "@/lib/utils";
import { LetterFormErrors } from "@/lib/types";
import { UserContext } from "@/context/userContext";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const NewLetterPageContent = () => {
  const quillRef = useRef<{
    getEditor: () => {
      focus: () => void;
      getLength: () => number;
      setSelection: (index: number, length: number, source?: string) => void;
    };
  } | null>(null);

  const [date, setDate] = useState(() =>
    parseDate(new Date().toISOString().split("T")[0]),
  );
  const [diary, setDiary] = useState("");
  const [language, setLanguage] = useState("");
  const [languageList, setLanguageList] = useState<string[]>([
    "English",
    "Spanish",
    "French",
    "German",
  ]);
  const [title, setTitle] = useState("");
  const [letterContent, setLetterContent] = useState("");
  const [diaryList, setDiaryList] = useState<string[]>([]);
  const [diaryAddedPreviously, setDiaryAddedPreviously] = useState<
    string | undefined
  >(undefined);
  const { openDialog, closeDialog } = useDialog();
  const { userData } = useContext(UserContext);

  useEffect(() => {
    // @ts-ignore
    import("react-quill-new/dist/quill.bubble.css").catch(() => {});
  }, []);

  const [errors, setErrors] = useState<LetterFormErrors>({
    title: false,
    date: false,
    language: false,
    content: false,
  });

  const router = useRouter();

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setErrors((prev) => ({ ...prev, title: false }));
    setTitle(event.target.value);
  };

  const handleDateChange = (newDate: any) => {
    setErrors((prev) => ({ ...prev, date: false }));
    setDate(newDate);
  };

  const handleLanguageChange = (selectedLanguage: string) => {
    setErrors((prev) => ({ ...prev, language: false }));
    setLanguage(selectedLanguage);
  };

  const handleDiaryChange = (selectedDiary: string) => {
    setDiary(selectedDiary);
    return;
  };

  const handleQuillContainerMouseDown = (
    event: React.MouseEvent<HTMLDivElement>,
  ) => {
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

  // Function to save the letter
  const SaveLetterOnClick = async () => {
    const nextErrors: LetterFormErrors = {
      title: !title.trim(),
      date: !date,
      language: !language,
      content: isQuillContentEmpty(letterContent),
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

    // Save letter
    const res = await saveLetter(title, letterContent, diary, language, date);

    if (res) {
      router.push("/edit-letter/" + res.id);
    } else {
      openDialog({
        title: "Server Error",
        description: `Error saving letter. Please try again later.`,
        primaryActionText: "OK",
        type: "error",
        autoDismiss: true,
        autoDismissDelay: 3000,
      });
    }
  };

  useEffect(() => {
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

    fetchDiaries();
    if (learningLanguages.length > 0) {
      setLanguageList(learningLanguages as string[]);
    }
  }, []);

  const addNewDiary = (diaryName: string) => {
    if (diaryAddedPreviously) {
      // Replace the last added with the new one
      setDiaryList((prev) => {
        const newList = [...prev];
        newList[diaryList.length - 1] = diaryName;
        return newList;
      });
    } else {
      setDiaryList((prev) => [...prev, diaryName]);
    }
    setDiaryAddedPreviously(diaryName);
    setDiary(diaryName);
  };

  return (
    <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200  dark:border-neutral-700 bg-white dark:bg-neutral-850 flex flex-col gap-2 flex-1 w-full h-full">
      <div className="flex gap-2 flex-1">
        <div className="h-full w-full rounded-lg bg-gray-100 dark:bg-neutral-800 py-10 px-5 sm:px-20">
          {/* Title field */}
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            className={`placeholder-gray-500 dark:placeholder-gray text-center text-2xl font-bold text-gray-700 dark:text-gray-200 p-4 w-full focus:border-blue-500 outline-none caret-[#60a5fa] ${
              errors.title ? "placeholder-red-500" : "border-none"
            }`}
            placeholder="Title of the letter! Edit this, ganster..."
            autoFocus
          />

          {/* Date field */}
          <div className="grid grid-cols-3 grid-rows-1 lg:grid-cols-8 gap-2 justify-between items-end mb-2 sm:mb-5">
            <div>
              <DateField
                className={"rounded-md ring-transparent"}
                value={date}
                onChange={handleDateChange}
              >
                {errors.date ? (
                  <Label className="text-red-500">Date missing</Label>
                ) : (
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
                value={diary}
                onValueChange={(diary) => {
                  handleDiaryChange(diary);
                }}
              >
                <SelectTrigger className="text-black dark:text-gray-200 bg-white dark:bg-neutral-850 h-10 rounded-md ring-transparent border border-neutral-300 dark:border-neutral-700">
                  <SelectValue placeholder="(None)" />
                </SelectTrigger>
                <SelectContent>
                  {diaryList.map((diary) => (
                    <SelectItem key={diary} value={diary}>
                      {diary}
                    </SelectItem>
                  ))}
                  <div
                    key="new"
                    className="flex justify-center items-center hover:bg-gray-100 dark:hover:bg-neutral-800 w-full text-sm bg-white dark:bg-neutral-850 h-8 rounded-md ring-transparent text-[#60a5fa] dark:text-dark-green-500"
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

            {/* Language select*/}
            <div>
              <Label
                className={
                  errors.language
                    ? "text-red-500"
                    : "text-black dark:text-gray-200"
                }
              >
                Select language
              </Label>
              <Select
                value={language}
                onValueChange={(lang) => {
                  handleLanguageChange(lang);
                }}
              >
                <SelectTrigger
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
          </div>

          <div onMouseDown={handleQuillContainerMouseDown}>
            <ReactQuill
              // @ts-ignore react-quill-new ref typing is not exposed here
              ref={quillRef}
              className={`min-h-[62vh] sm:min-h-[65vh] border rounded-md bg-white dark:bg-neutral-850 text-gray-900 dark:text-gray-200
              rounded-md p-2 space-y-1 ring-transparent ${
                errors.content
                  ? "border-red-500"
                  : "border-neutral-300 dark:border-neutral-700"
              }`}
              theme="bubble"
              value={letterContent}
              onChange={(content) => {
                setLetterContent(content);
                setErrors((prev) => ({
                  ...prev,
                  content: isQuillContentEmpty(content) ? prev.content : false,
                }));
              }}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-between h-[5%] items-end gap-4 mt-4">
            <Link href={"/homepage"}>
              <button className="h-[100%] w-auto flex items-center justify-center bg-[#FF6347] text-white rounded py-2 px-4 hover:bg-[#c75945] dark:bg-red-700 dark:hover:bg-red-800">
                Back
              </button>
            </Link>
            <button
              onClick={() => {
                SaveLetterOnClick();
              }}
              className="h-[100%] w-auto flex items-center justify-center bg-[#3b82f6] text-white rounded py-2 px-4 hover:bg-[#2563eb] dark:bg-dark-green-500 dark:hover:bg-dark-green-600"
            >
              💾 Save Letter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewLetterPageContent;
