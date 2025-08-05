"use client";
import { useEffect } from "react";
import { SidebarDemo } from "@/components/sidebardemo";
import Link from "next/link";
import { editLetter } from "@/services/api";
import { useState } from "react"
import { Calendar, parseDate } from "@internationalized/date"
import { DateField, DateInput } from "@/components/ui/datefield"
import { Label } from "@/components/ui/field"
import { getLetter } from "@/services/api";
import { Check } from "lucide-react";
import { use } from "react";
import { LabelSelect } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useId } from "react";
import { SuccessDialog, DialogType } from "@/components/ui/dialog";


export default function Home({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <div className="page-container">
      <SidebarDemo>
        <NewLetterPageContent id={id}/>
      </SidebarDemo>
    </div>
  );
}



const NewLetterPageContent = ({ id }: { id: string }) => {

  const [valuesChanged, setValuesChanged] = useState(false);
  const [date, setDate] = useState(() => parseDate(new Date().toISOString().split("T")[0]));
  const [diary, setDiary] = useState(""); 
  const [language, setLanguage] = useState("");
  const [languageList, setLanguageList] = useState<string[]>(["English", "Spanish", "French", "German"]);
  const [title, setTitle] = useState(""); 
  const [letterContent, setLetterContent] = useState(""); 
  const [diaryList, setDiaryList] = useState<string[]>(["English Diary", "Spanish Tales", "new"]);
  const [indexNewDiary, setIndexNewDiary] = useState(-1);
  const [sharedWith, setSharedWith] = useState<string[]>([]);

  // Estados para manejar errores
  const [titleError, setTitleError] = useState(false);
  const [dateError, setDateError] = useState(false);
  const [contentError, setContentError] = useState(false);
  const [languageError, setLanguageError] = useState(false);

  // Dialog
    const [dialogConfig, setDialogConfig] = useState<{
      isOpen: boolean
      title: string
      description: string
      primaryActionText: string
      autoDismiss: boolean
      size: 'sm' | 'md' | 'lg'
      type: DialogType
    }>({
      isOpen: false,
      title: "Payment Successful!",
      description: "Your payment has been processed successfully. You will receive a confirmation email shortly.",
      primaryActionText: "View Receipt",
      autoDismiss: true,
      size: 'md',
      type: 'success'
    })
  
    const openDialog = (config: Partial<typeof dialogConfig>) => {
      setDialogConfig(prev => ({ ...prev, ...config, isOpen: true }))
    }
  
    const closeDialog = () => {
      setDialogConfig(prev => ({ ...prev, isOpen: false }))
    }

  // Funciones
  const handleTitleChange = (event: any) => {
    setTitleError(false);
    setValuesChanged(true);
    setTitle(event.target.value); 
  }

  const handleDateChange = (newDate: any) => {
    setDateError(false);
    setValuesChanged(true);
    setDate(newDate)
  }

  const handleLanguageChange = (selectedLanguage: string) => {
    setLanguageError(false);
    setValuesChanged(true);
    setLanguage(selectedLanguage); 
  }

  const handleDiaryChange = (selectedDiary: string) => {
    setValuesChanged(true);
    setDiary(selectedDiary);
    return; 
  };

  const handleLetterContentChange = (event: any) => {
    setContentError(false);
    setValuesChanged(true);
    setLetterContent(event.target.value);
  };

  // Función para guardar la carta (editar)
  const SaveLetterOnClick = async () => {
    let hasError = false;

    if (!title.trim()) {
      setTitleError(true);
      hasError = true;
    }
    if (!date) {
      setDateError(true);
      hasError = true;
    }
    if (!language) {
      setLanguageError(true);
      hasError = true;
    }
    if (!letterContent.trim()) {
      setContentError(true);
      hasError = true;
    }
    if (hasError) {
      return;
    }

    const res = await editLetter(
      id,
      title,
      letterContent,
      diary,
      language,
      date,
      sharedWith
    );
    
    if (res === 0) {
      console.log("Letter saved successfully!");
      openDialog({
        title: "Letter Saved",
        autoDismiss: true,
        description: "Your letter was updated!",
        primaryActionText: "",
        size: 'md',
        type: 'success'
      });
      setValuesChanged(false);
    } else {
      console.error("Error saving letter.");
    }
    
    console.log("Saving letter:", { title, date, letterContent });
  };

  const handleShareSuccess = async  () => {
    // Fetch letter data again to get its uploaded version
    const letterData = await getLetter(id);
      console.log("Letter data:", letterData);
      if (!letterData) {
        console.error("No letter data found for ID:", id);
        return;
      }
      
      setSharedWith(letterData.sharedWith || []);

  }

  useEffect(() => {
    (async () => {
      const letterData = await getLetter(id);
      console.log("Letter data:", letterData);
      if (!letterData) {
        console.error("No letter data found for ID:", id);
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
        userData.learningLanguage3
      ].filter((lang) => lang !== null);

      setDate(parseDate(new Date(letterData.created_at).toISOString().split("T")[0]));
      setDiary(letterData.diary || "");
      setLanguage(letterData.language || learningLanguages[0]);
      setTitle(letterData.title || "");
      setLetterContent(letterData.content || "");
      setLanguageList(learningLanguages || []);
      setSharedWith(letterData.sharedWith || []);
    })();
  }, [id]);

  return (
      <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full">
        
        <div className="flex gap-2 flex-1">
            <div
              className="h-full w-full rounded-lg bg-gray-100 dark:bg-neutral-800 py-10 px-20"
            >

              {/* Title field */}
              <input
                type="text"
                value={title}
                disabled={sharedWith.length > 0}
                onChange={handleTitleChange}
                className={`placeholder-gray-400 text-center text-2xl font-bold text-gray-700 bg-clip-text bg-gradient-to-r from-[#242424] via-[#333333] to-[#4d4d4d] p-4 transition-transform duration-300 animate-gradient-dark w-full focus:border-blue-500 outline-none caret-[#8EBA03] ${
                  titleError ? "placeholder-red-500" : "border-none"
                }`}
                placeholder="Title of the letter! Edit this, ganster..."
                autoFocus
              />
              
              <div className="flex flex-row gap-2 justify-between items-end">
              
              {/* Date field */}
              <div className="flex flex-row items-center gap-4 w-[50%]">
                <DateField
                className={"w-[150px] rounded-md p-2 space-y-1 ring-transparent"}
                value={date}
                isDisabled={sharedWith.length > 0}
                onChange={handleDateChange}
                >
                {dateError && <Label className="text-red-500">Date missing</Label>}
                {!dateError && <Label className="text-black">Date</Label>}
                <DateInput className={`bg-white text-black  ${
                  dateError ? "border-red-500" : "border-neutral-300"
                }`}/>
                </DateField>

              {/* Diary select */}
              <div className="space-y-2 min-w-[200px]">
                <Label className="text-black" htmlFor={id}>Select diary</Label>
                <Select 
                value={diary} 
                disabled={sharedWith.length > 0}
                onValueChange={(diary) => {handleDiaryChange(diary)}}>
                  <SelectTrigger id={id} className="text-black bg-white h-10 rounded-md ring-transparent">
                    <SelectValue placeholder="(None)"/>
                  </SelectTrigger>
                  <SelectContent>
                    {diaryList.map((diary) => (
                      <SelectItem key={diary} value={diary}>{diary}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Language select */}
              <div className="space-y-2 min-w-[200px]">
                <Label className="text-black" htmlFor={id}>Select language</Label>
                <Select 
                value={language} 
                disabled={sharedWith.length > 0}
                onValueChange={(lang) => {handleLanguageChange(lang)}}>
                  <SelectTrigger id={id} className="text-black bg-white h-10 rounded-md ring-transparent">
                    <SelectValue placeholder="(None)"/>
                  </SelectTrigger>
                  <SelectContent>
                    {languageList.map((lang) => (
                      <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              </div>

              {!valuesChanged && sharedWith.length > 0 && (
                <div className="text-[#6495ED] m-4">
                  You cannot modify a letter once it has been sent.
                </div>
              )}

              </div>


              {/* Letter content field */}
              <textarea
                value={letterContent}
                disabled={sharedWith.length > 0}
                onChange={handleLetterContentChange}
                placeholder="Write your letter here..."
                className={`w-full h-[70%] p-4 text-lg text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-neutral-800 rounded-lg border ${
                  contentError ? "border-red-500 placeholder-red-500" : "border-neutral-300"
                } outline-none resize-none`}
              />

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
                <button
                onClick={() => openDialog({
                  title: "Send Letter",
                  description: "",
                  primaryActionText: "",
                  size: 'md',
                  type: 'shareLetter',
                  autoDismiss: false
                })}>
                  <div className="h-[100%] w-auto flex items-center justify-center bg-[#6495ED] text-white rounded py-2 px-4 hover:bg-[#537dc9] ">
                  📬 Send Letter
                  </div>
                </button>
                {valuesChanged && (
                <button onClick={() => {SaveLetterOnClick()}}>
                    <div className="h-[100%] w-auto flex items-center justify-center bg-[#8EBA03] text-white rounded py-2 px-4 hover:bg-[#708e0b] transition-colors">
                      💾 Save Letter
                    </div>
                </button>)}
                {!valuesChanged && sharedWith.length > 0 && (
                <div className="text-[#6495ED] display flex items-center gap-2">
                  Letter sent
                  <Check className="w-5 h-5" />
                </div>)}
                {!valuesChanged && sharedWith.length === 0 && (
                <div className="text-[#8EBA03] display flex items-center gap-2">
                  Letter saved
                  <Check className="w-5 h-5" />
                </div>)}
              </div>
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
            console.log('Primary action clicked for type:', dialogConfig.type)
          }}
          letterId={id}
          sharedWith={sharedWith}
          onShareSuccess={handleShareSuccess}
        />
      </div>
  );
}
