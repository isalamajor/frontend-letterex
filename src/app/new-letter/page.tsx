"use client";
import { useEffect, useState } from "react";
import { SidebarDemo } from "@/components/sidebardemo";
import { useRouter } from 'next/navigation'
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { parseDate } from "@internationalized/date"
import { DateField, DateInput } from "@/components/ui/datefield"
import { Label } from "@/components/ui/field"
import { getDiaries, saveLetter } from "@/services/api";
import { SuccessDialog, DialogType } from "@/components/ui/dialog";
import { BookOpen } from "lucide-react";
import Quill from 'quill';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import 'react-quill-new/dist/quill.bubble.css';
import { log } from "console";



export default function Home() {
  return (
    <div className="page-container">
      <SidebarDemo>
        <NewLetterPageContent/>
      </SidebarDemo>
    </div>
  );
}



const NewLetterPageContent = () => {
  
  const [date, setDate] = useState(() => parseDate(new Date().toISOString().split("T")[0]));
  const [diary, setDiary] = useState(""); 
  const [language, setLanguage] = useState("");
  const [languageList, setLanguageList] = useState<string[]>(["English", "Spanish", "French", "German"]);
  const [title, setTitle] = useState(""); 
  const [letterContent, setLetterContent] = useState(""); 
  const [diaryList, setDiaryList] = useState<string[]>([]);
  const [diaryAddedPreviously, setDiaryAddedPreviously] = useState<boolean>(false);


  // Estados para manejar errores
  const [titleError, setTitleError] = useState(false);
  const [dateError, setDateError] = useState(false);

  
  const router = useRouter()
  
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

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitleError(false);
    console.log("Title changed:", event.target.value);
    setTitle(event.target.value); 
  }

  const handleDateChange = (newDate: React.ChangeEvent<HTMLInputElement>) => {
    setDateError(false);
    setDate(newDate)
  }

  const handleLanguageChange = (selectedLanguage: string) => {
    setLanguage(selectedLanguage); 
  }

  const handleDiaryChange = (selectedDiary: string) => {
    setDiary(selectedDiary);
    return; 
  };


  // Función para guardar la carta
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
      hasError = true;
    }
    if (!letterContent.trim()) {
      hasError = true;
    }
    if (hasError) {
      return;
    }

    // Save letter
    const res = await saveLetter(
      title,
      letterContent,
      diary,
      language,
      date
    );
    
    if (res) {
      router.push("/edit-letter/" + res._id); 
    } else {
      console.error("Error saving letter.");
    }
  };

  useEffect(() => {
    // Get languages from sessionStorage
    const userData = JSON.parse(sessionStorage.getItem("userData") || "{}");

    const learningLanguages = [
      userData.learningLanguage,
      userData.learningLanguage2,
      userData.learningLanguage3
    ].filter((lang) => lang !== null);

    const fetchDiaries = async () => {
      const res = await getDiaries();
      console.log("Diares: ", res);
      if (Array.isArray(res)) {
        setDiaryList(res);
      }
    };

    fetchDiaries();
    setLanguageList(learningLanguages);
    }, []);


  return (
      <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full">
        
        <div className="flex gap-2 flex-1">
            <div className="h-full w-full rounded-lg bg-gray-100 dark:bg-neutral-800 py-10 px-5 sm:px-20">

              {/* Title field */}
              <input
                type="text"
                value={title}
                onChange={handleTitleChange}
                className={`placeholder-gray-500 text-center text-2xl font-bold text-gray-700 bg-clip-text bg-gradient-to-r from-[#242424] via-[#333333] to-[#4d4d4d] p-4 transition-transform duration-300 animate-gradient-dark w-full focus:border-blue-500 outline-none caret-[#8EBA03] ${
                  titleError ? "placeholder-red-500" : "border-none"
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
                  {dateError && <Label className="text-red-500">Date missing</Label>}
                  {!dateError && <Label className="text-black">Date</Label>}
                  <DateInput className={`bg-white text-black  ${
                    dateError ? "border-red-500" : "border-neutral-300"
                  }`}/>
                  </DateField>
                </div>

                  
                {/* Diary select */}
                <div>
                  <Label className="text-black">Select diary</Label>
                  <Select value={diary} onValueChange={(diary) => {handleDiaryChange(diary)}}>
                    <SelectTrigger  className="text-black bg-white h-10 rounded-md ring-transparent">
                      <SelectValue placeholder="(None)"/>
                    </SelectTrigger>
                    <SelectContent>
                      {diaryList.map((diary) => (
                        <SelectItem key={diary} value={diary}>{diary}</SelectItem>
                      ))}
                      <div key="new" className="flex justify-center items-center hover:bg-gray-100 w-full text-sm bg-white h-8 rounded-md ring-transparent text-[#8EBA03]" onClick={
                        (e) => { 
                          e.preventDefault();
                          openDialog({
                            title: "Create New Diary",
                            description: "Enter a name for your new diary.",
                            primaryActionText: "OK",
                            size: 'md',
                            type: 'newDiary',
                            autoDismiss: false
                        })
                      }}>
                        <BookOpen className="mr-2" size={15} /> Create new diary
                      </div>
                    </SelectContent>
                  </Select>
                </div>

                {/* Language select*/}
                <div>
                  <Label className="text-black" >Select language</Label>
                  <Select value={language} onValueChange={(lang) => {handleLanguageChange(lang)}}>
                    <SelectTrigger  className="text-black bg-white h-10 rounded-md ring-transparent">
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
              
              <ReactQuill
              className="min-h-[62vh] sm:min-h-[65vh] border rounded-md bg-white text-gray-900
              rounded-md p-2 space-y-1 ring-transparent"
              theme="bubble" value={letterContent} onChange={(content) => setLetterContent(content)}
              />

              {/* Buttons */}
              <div className="flex justify-between h-[5%] items-end gap-4 mt-4">
                  <Link href={"/homepage"}>
                    <button
                    className="h-[100%] w-auto flex items-center justify-center bg-[#FF6347] text-white rounded py-2 px-4 hover:bg-[#c75945] transition-colors"
                    >
                        Back
                    </button>
                  </Link>
                  <div className="flex flex-row justify-end h-[5%] col items-center gap-4 mt-4">
                    <button onClick={() => {SaveLetterOnClick()}}
                      className="h-[100%] w-auto flex items-center justify-center bg-[#8EBA03] text-white rounded py-2 px-4 hover:bg-[#708e0b] transition-colors">
                        💾 Save Letter
                    </button>
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
          onNewDiaryCreated={
            (diaryName) => {
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
              setDiary(diaryName);
            }
          }
        />
      </div>
  );
}
