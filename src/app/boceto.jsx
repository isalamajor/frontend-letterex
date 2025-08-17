"use client";
import { SidebarDemo } from "@/components/sidebardemo";
import { useState, useEffect } from "react";
import { CircleUserRound, Mail, Leaf, SquarePen, Save, Plus, Trash2 } from "lucide-react";
import { getCountLetters, getCountCorrectedLetters } from "@/services/api";
import Mapa from "@/components/ui/map";
import dynamic from "next/dynamic";
import {Tooltip} from 'react-tooltip';
import LanguageSelector from "@/components/languageSelector";
const MapNoSSR = dynamic(() => import("@/components/ui/map"), { ssr: false });

export interface User {
  _id: string;
  nickname: string;
  created_at: string;
  email: string;
  image: string;
  learningLanguage: string;
  learningLanguage2: string;
  learningLanguage3: string | null;
  masterLanguage: string;
  masterLanguage2: string;
  masterLanguage3: string;
  bio: string;
  location: {
    city: string;
    country: string;
  };
}

const languagesData = [
  { name: "English", image: "/flags/english.svg" },
  { name: "Spanish", image: "/flags/spanish.svg" },
  { name: "French", image: "/flags/french.svg" },
  { name: "Italian", image: "/flags/italian.svg" },
  { name: "Portuguese", image: "/flags/portuguese.svg" },
  { name: "German", image: "/flags/german.svg" },
  { name: "Chinese", image: "/flags/chinese.svg" },
  { name: "Japanese", image: "/flags/japanese.svg" },
  { name: "Russian", image: "/flags/russian.svg" },
  { name: "Arabic", image: "/flags/arabic.svg" },
  { name: "Hindi", image: "/flags/hindi.svg" },
  { name: "Turkish", image: "/flags/turkish.svg" },
];


export default function Home() {
  return (
    <div className="page-container">
      <SidebarDemo>
        <ProfilePageContent/>
      </SidebarDemo>
    </div>
  );
}



const ProfilePageContent = () => {
  const [user, setUser] = useState<User>({} as User);
  const [letterCounts, setLetterCounts] = useState<Record<string, number>>({});
  const [correctionCounts, setCorrectionCounts] = useState<Record<string, number>>({});
  const [editing, setEditing] = useState(false);
  const [bioUser, setBioUser] = useState("");
  const [bioUserDB, setBioUserDB] = useState("");
  const [locationUser, setLocationUser] = useState({
    city: "Madrid",
    country: "Spain"
  });
  
  const [languagesLearning, setLanguagesLearning] = useState<string[]>([]);
  const [languagesSpoken, setLanguagesSpoken] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      // Get languages from sessionStorage
      const userData = JSON.parse(sessionStorage.getItem("userData") || "{}");
  
      // If userData is not available, redirect to login
      if (Object.keys(userData).length === 0) {
        console.error("User data not found in sessionStorage.");
        window.location.href = "/";
        return;
      }
  
      setUser(userData);
      console.log("User Data: ", userData);
  
      // Obtener contadores de cartas y correcciones
      try {
        const counts = await getCountLetters();
        console.log("Letter counts per language:", counts);
        if (counts !== -1) {
          setLetterCounts(counts);
        }

        const countsCorrections = await getCountCorrectedLetters();
        console.log("Letter corrected counts per language:", countsCorrections);
        if (countsCorrections !== -1) {
          setCorrectionCounts(countsCorrections);
        }

        // Aquí podrías hacer setState para guardar los counts si lo necesitas
      } catch (error) {
        console.error("Error fetching letter counts:", error);
      }
    };
  
    fetchData();
  }, []);
  
  const saveBioAndLocation = async () => {
    try {
      const response = await fetch("/api/user", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bio: bioUser,
          location: user.location,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save bio and location");
      }

      const data = await response.json();
      console.log("Bio and location saved:", data);
    } catch (error) {
      console.error("Error saving bio and location:", error);
    }
  };

  return (
      <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full">
        
        <h1 className="text-5xl font-semibold 
                    bg-gradient-to-r bg-clip-text text-transparent 
                    from-[#8EBA03] via-yellow-500 to-[#8EBA03]
                    animate-text">
          Your profile
        </h1>

        <div className="flex gap-2 flex-1 h-[85%] text-xl">
            {/* Bloque pantalla */}
            <div
              className="h-full w-full rounded-lg bg-gray-50 px-15 py-10 text-black flex flex-col"
            >
              <div className="h-full flex justify-end">
                { editing ? 
                <><button 
                onClick={() => setEditing(!editing)}
                className="w-[8%] cursor-pointer text-gray-700 border border-lightblack rounded-sm bg-gray-200 shadow-md py-2 px-4 hover:bg-white flex flex-row gap-2 justify-center items-center mr-2">
                Cancel
                </button>
                <button 
                onClick={() => setEditing(!editing)}
                className="w-[8%] cursor-pointer text-white border border-lightblack rounded-sm bg-[#8EBA03] shadow-md py-2 px-4 hover:bg-[#7BA102] flex flex-row gap-2 justify-center items-center">
                <Save></Save> 
                Save
                </button></>
                :
                <button 
                onClick={() => setEditing(!editing)}
                data-tooltip-id="btnId"
                data-tooltip-place="bottom"
                data-tooltip-content="Your bio and location may be edited"
                className="w-[8%] cursor-pointer text-gray-700 hover:text-[#8EBA03] border border-lightblack rounded-sm bg-gray-50 shadow-md py-2 px-4 hover:bg-white flex flex-row gap-2 justify-center items-center">
                <SquarePen></SquarePen> 
                Edit
                </button>
                }
              </div>
              <Tooltip
                id={"btnId"}
                className="!z-[9999]"
                data-tooltip-variant="dark"
              ></Tooltip>
              {/* Primera fila info */}
              <div className="flex flex-row gap-15 w-full h-[20%] justify-space-around items-start mb-15">
                
                <img src="default.png" className="rounded-full h-full"></img>
                
                <div className="h-full w-[30%]">
                  <div className="flex flex-col gap-1 w-auto">
                    <span className="font-bold">Nickname</span>
                    <div className="flex flex-row align-center items-center gap-2 cursor-pointer bg-white border border-lightblack text-gray-700 rounded-sm py-2 px-4 mb-4 bg-gray-50">
                        <CircleUserRound className="text-gray-500"></CircleUserRound>
                        <p className="w-full outline-none">{user.nickname}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 w-auto flex-grow">
                    <span className="font-bold">Email</span>
                    <div className="flex flex-row align-center items-center gap-2 cursor-pointer bg-white border border-lightblack text-gray-700 rounded-sm py-2 px-4 mb-4 bg-gray-50">
                        <Mail className="text-gray-500"></Mail>
                        <p className="w-full outline-none">{user.email}</p>
                    </div>
                  </div>
                </div>
               
                <div className="flex flex-col gap-1 w-[50%] h-fill flex-grow">
                  <span className="font-bold">Bio</span>
                  <div className="flex flex-row h-35 w-full gap-2 cursor-pointer bg-white border border-lightblack text-gray-700 rounded-sm p-5 bg-gray-50">
                      <Leaf className="text-gray-500"></Leaf>
                      <textarea disabled={!editing} value={bioUser} onChange={(e) => setBioUser(e.target.value)}
                      placeholder="This is where I'd put my biograpghy... if only I had one! 😩" className="w-full outline-none align-top resize-none"></textarea>
                  </div>
                </div>
              </div>

              {/* Segunda fila info */}
              <div className="flex flex-row gap-10 w-full justify-between">
            
                {/* Bloque izquierda */}
              <div className="w-[40%]">
                <div className="flex flex-col gap-10 items-center p-7 rounded-lg bg-[#8EBA03] bg-white border border-gray-200 border-2 mb-3">

                  {editing ? 
                  <div className="slide-form flex flex-row justify-between">
                      <LanguageSelector
                      languagesAvailable={languagesData.filter(lang => (!languagesLearning.includes(lang.name) && !languagesSpoken.includes(lang.name)))}  
                      languagesTaken={languagesLearning} 
                      titleText="Select the languages you are learning"
                      noneText="...or don't choose any" 
                      tooManyText="Why so ambitious? Let's set a goal of 3 languages"
                      onSelectionChange={(selected) => setLanguagesLearning(selected)}></LanguageSelector>  
                      <LanguageSelector
                      languagesAvailable={languagesData.filter(lang => !languagesLearning.includes(lang.name) && !languagesSpoken.includes(lang.name))}
                      languagesTaken={languagesSpoken} 
                      titleText="Select the languages you master"
                      noneText="what will it be?" 
                      tooManyText="Three is enough don't be cocky!"
                      onSelectionChange={(selected) => setLanguagesSpoken(selected)}></LanguageSelector>
                  </div>
                  :
                  <div className="flex flex-row gap-15">
                    <div className="flex flex-col gap-5">  
                      <h2 className="font-semibold">Languages learning</h2>
                        <div className="flex flex-row gap-5">
                          <img src={`/flags/${user.learningLanguage}.svg`} className={`h-10 w-10 rounded-full ${editing ? "border-2 border-blue-500" : ""}`}></img>
                          {user.learningLanguage2 && <img src={`/flags/${user.learningLanguage2}.svg`} className={`h-10 w-10 rounded-full ${editing ? "border-2 border-blue-500" : ""}`}></img>}
                          {user.learningLanguage3 && <img src={`/flags/${user.learningLanguage3}.svg`} className={`h-10 w-10 rounded-full ${editing ? "border-2 border-blue-500" : ""}`}></img>}
                        </div>
                    </div> 
                    <div className="flex flex-col gap-5">
                      <h2 className="font-semibold">Mastered languages</h2>
                        <div className="flex flex-row gap-5">
                          <img src={`/flags/${user.masterLanguage}.svg`} className="h-10 w-10 rounded-full"></img>
                          {user.masterLanguage2 && <img src={`/flags/${user.masterLanguage2}.svg`} className="h-10 w-10 rounded-full"></img>}
                          {user.masterLanguage3 && <img src={`/flags/${user.masterLanguage3}.svg`} className="h-10 w-10 rounded-full"></img>}
                          {editing && <Plus className="h-10 w-10 rounded-full bg-gray-200 p-2"></Plus>}
                        </div>
                    </div>
                  </div>}
                </div>

                <div className="flex flex-col items-center p-7 rounded-lg bg-[#8EBA03] bg-white border border-gray-200 border-2">        
                  <div className="flex flex-row text-xl w-full justify-around">
                    
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-5xl font-medium">2 ✉️</p>
                      <h2 className="font-bold"> Letters written</h2>
                      <ul className="flex flex-col gap-2 mt-3">
                        { letterCounts && Object.entries(letterCounts).map(([lang, count]) => (
                          <li key={lang} className="flex flex-row gap-3">
                            <img src={`/flags/${lang}.svg`} className="h-7 w-7 rounded-full"></img>
                            {count} in {lang}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="flex flex-col items-center gap-2">
                      <p  className="text-5xl font-medium">3 💌</p>
                      <h2 className="font-bold"> Letters corrected</h2>
                      <ul className="flex flex-col gap-2 mt-3">
                        { correctionCounts && Object.entries(correctionCounts).map(([lang, count]) => (
                          <li key={lang} className="flex flex-row gap-3">
                            <img src={`/flags/${lang}.svg`} className="h-7 w-7 rounded-full"></img>
                            {count} in {lang}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div> 
                </div>
              </div>

              {/* Bloque derecha      
              <div className="w-[60%] h-[90%] flex flex-col items-center p-2 rounded-lg bg-[#8EBA03] bg-white border border-gray-200 border-2">
                <MapNoSSR key={locationUser.country + "_" + editing} selectedCountry={locationUser.country} editing={editing} onCountryChange={(newCountry) => setLocationUser((prev) => ({ ...prev, country: newCountry }))}/>
              </div>*/} 

              </div>
            </div>
            
        </div>
      </div>
  );
};

