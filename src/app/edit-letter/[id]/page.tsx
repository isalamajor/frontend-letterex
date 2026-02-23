"use client";
import { useEffect } from "react";
import { SidebarDemo } from "@/components/sidebardemo";
import Link from "next/link";
import { useState } from "react";
import { CalendarDate, parseDate } from "@internationalized/date";
import { DateField, DateInput } from "@/components/ui/datefield";
import { Label } from "@/components/ui/field";
import { getLetter, getDiaries, editLetter } from "@/services/api";
import { Check, HeartCrack } from "lucide-react";
import { use } from "react";
import { Spinner } from "@/components/ui/spinner-1";
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
import { DiarySelect } from "@/components/diarySelect";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

interface SharedWithUser {
  id: string;
  nickname: string;
  image: string;
}

interface Letter {
  id: string;
  date: CalendarDate;
  diary: string;
  language: string;
  title: string;
  letterContent: string;
  sharedWith: SharedWithUser[];
}

export default function Home({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <div className="page-container">
      <SidebarDemo>
        <NewLetterPageContent id={id} />
      </SidebarDemo>
    </div>
  );
}

const NewLetterPageContent = ({ id }: { id: string }) => {
  const { openDialog } = useDialog();
  useEffect(() => {
    // @ts-ignore
    import("react-quill-new/dist/quill.bubble.css").catch(() => {});
  }, []);

  const [isLoading, setIsLoading] = useState(true);
  const [valuesChanged, setValuesChanged] = useState(false);

  const [diaryAddedPreviously, setDiaryAddedPreviously] =
    useState<boolean>(false);
  const [letter, setLetter] = useState<Letter>({
    id: id,
    date: parseDate(new Date().toISOString().split("T")[0]),
    diary: "",
    language: "",
    title: "",
    letterContent: "",
    sharedWith: [],
  });
  const updateLetter = (updates: Partial<Letter>) => {
    setLetter((prev) => ({ ...prev, ...updates }));
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

  // Estados para manejar errores
  const [titleError, setTitleError] = useState(false);
  const [dateError, setDateError] = useState(false);
  const [letterNotFound, setLetterNotFound] = useState<boolean>(false);

  const modulesQuill = {
    toolbar: [
      ["bold", "italic"], // negrita y cursiva
      [{ header: 1 }, { header: 2 }], // encabezados
      ["blockquote"], // citas
      [{ align: [] }], // alineación (izquierda, centro, derecha, justificado)
    ],
  };

  // Funciones
  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitleError(false);
    setValuesChanged(true);
    updateLetter({ title: event.target.value });
  };

  const handleDateChange = (newDate: CalendarDate | null) => {
    if (newDate) {
      setDateError(false);
      setValuesChanged(true);
      updateLetter({ date: newDate });
    }
  };

  const handleLanguageChange = (selectedLanguage: string) => {
    setValuesChanged(true);
    updateLetter({ language: selectedLanguage });
  };

  const handleDiaryChange = (selectedDiary: string) => {
    setValuesChanged(true);
    updateLetter({ diary: selectedDiary });
    return;
  };

  // Función para guardar la carta (editar)
  const SaveLetterOnClick = async () => {
    let hasError = false;

    if (!letter.title.trim()) {
      setTitleError(true);
      hasError = true;
    }
    if (!letter.date) {
      setDateError(true);
      hasError = true;
    }
    if (!letter.language) {
      hasError = true;
    }
    if (!letter.letterContent.trim()) {
      hasError = true;
    }
    if (hasError) {
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
      openDialog({
        title: "Letter Saved",
        description: "Your letter was updated!",
        primaryActionText: "",
        type: "success",
        autoDismiss: true,
      });
      setValuesChanged(false);
    } else {
      openDialog({
        title: "Error Saving Letter",
        description:
          "There was an error saving your letter. Please try again later.",
        primaryActionText: "OK",
        type: "error",
      });
      return;
    }
  };

  const addNewDiary = (diaryName: string) => {
    if (diaryAddedPreviously) {
      // Cambiar el último añadido por el nuevo
      setDiaryList((prev) => {
        const newList = [...prev];
        newList[diaryList.length - 1] = diaryName;
        return newList;
      });
    } else {
      setDiaryList((prev) => [...prev, diaryName]);
      setDiaryAddedPreviously(true);
    }
    updateLetter({ diary: diaryName });
  };

  const handleShareSuccess = async (result: number) => {
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
  };

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const letterData = await getLetter(id);

      console.log("letterdata", letterData);
      if (!letterData) {
        setLetterNotFound(true);
        setIsLoading(false);
        return;
      }

      // Get languages from sessionStorage
      const userData = JSON.parse(sessionStorage.getItem("userData") || "{}");

      // If userData is not available, redirect to login
      if (userData === "{}") {
        console.error("User data not found in sessionStorage.");
        window.location.href = "/";
        return;
      }

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
      setLanguageList(learningLanguages || []);
      fetchDiaries();
      setIsLoading(false);
    })();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size={40} color="gray" />
      </div>
    );
  }

  if (letterNotFound) {
    return (
      <div className="h-full flex flex-col gap-5 justify-center items-center text-gray-800">
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
          className={`placeholder-gray-400 text-center text-2xl font-bold text-gray-700 bg-clip-text bg-gradient-to-r from-[#242424] via-[#333333] to-[#4d4d4d] p-4 transition-transform duration-300 animate-gradient-dark w-full focus:border-blue-500 outline-none caret-[#8EBA03] ${
            titleError ? "placeholder-red-500" : "border-none"
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
              {dateError && (
                <Label className="text-red-500">Date missing</Label>
              )}
              {!dateError && <Label className="text-black">Date</Label>}
              <DateInput
                className={`bg-white text-black  ${
                  dateError ? "border-red-500" : "border-neutral-300"
                }`}
              />
            </DateField>
          </div>

          {/* Diary select */}
          <div>
            <Label className="text-black">Select diary</Label>
            <Select
              value={letter.diary}
              onValueChange={(diary) => {
                handleDiaryChange(diary);
              }}
            >
              <SelectTrigger className="text-black bg-white h-10 rounded-md ring-transparent">
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
                  className="cursor-pointer flex justify-center items-center hover:bg-gray-100 w-full text-sm bg-white h-8 rounded-md ring-transparent text-[#8EBA03]"
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
            <Label className="text-black" htmlFor={id}>
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
                className="text-black bg-white h-10 rounded-md ring-transparent"
              >
                <SelectValue placeholder="(None)" />
              </SelectTrigger>
              <SelectContent>
                {languageList.map((lang) => (
                  <SelectItem key={lang} value={lang}>
                    {lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {letter.sharedWith && letter.sharedWith[0] && (
            <div className="col-span-5 text-[#6495ED] m-4 flex flex-row gap-2 justify-end">
              <span className="text-gray-600">Shared with</span>
              <div
                key={letter.sharedWith[0].id}
                className="flex items-center gap-1"
              >
                <img
                  src={`http://localhost:3090/uploads/profile_pictures//${letter.sharedWith[0].image}`}
                  alt={letter.sharedWith[0].nickname}
                  className="w-5 h-5 rounded-full border border-gray-300"
                />
                {letter.sharedWith[0].nickname}
              </div>
              {letter.sharedWith[1] && (
                <div
                  key={letter.sharedWith[1].id}
                  className="flex items-center gap-1"
                >
                  <span className="text-gray-600">and</span>
                  <img
                    src={`http://localhost:3090/uploads/profile_pictures//${letter.sharedWith[1].image}`}
                    alt={letter.sharedWith[1].nickname}
                    className="w-5 h-5 rounded-full border border-gray-300"
                  />
                  {letter.sharedWith[1].nickname}
                </div>
              )}
            </div>
          )}
        </div>

        <ReactQuill
          className="min-h-[60vh] sm:min-h-[65vh] border rounded-md bg-white text-gray-900
              rounded-md p-2 space-y-1 ring-transparent"
          theme="bubble"
          value={letter.letterContent}
          onChange={(content) => {
            updateLetter({ letterContent: content });
            setValuesChanged(true);
          }}
          modules={modulesQuill}
          readOnly={letter.sharedWith.length > 0}
        />

        {/* Buttons */}
        <div className="flex justify-between h-[5%] items-center gap-4 mt-4">
          <BackButton />

          <div className="flex flex-row justify-end h-[5%] col items-center gap-4">
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
                });
              }}
            >
              <div className="h-[100%] w-auto flex items-center justify-center bg-[#6495ED] text-white rounded py-2 px-4 hover:bg-[#537dc9] ">
                📬 Send Letter
              </div>
            </button>
            {valuesChanged && (
              <button
                onClick={() => {
                  SaveLetterOnClick();
                }}
              >
                <div className="h-[100%] w-auto flex items-center justify-center bg-[#8EBA03] text-white rounded py-2 px-4 hover:bg-[#708e0b] transition-colors">
                  💾 Save Letter
                </div>
              </button>
            )}
            {!valuesChanged && letter.sharedWith.length > 0 && (
              <div className="text-[#6495ED] display flex items-center gap-2">
                Letter sent
                <Check className="w-5 h-5" />
              </div>
            )}
            {!valuesChanged && letter.sharedWith.length === 0 && (
              <div className="text-[#8EBA03] display flex items-center gap-2">
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
