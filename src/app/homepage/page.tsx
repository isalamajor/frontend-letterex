"use client";
import LetterCard from "@/components/LetterCard";
import LetterCardList from "@/components/LetterCardList";
import ReceivedLetterList from "@/components/ReceivedLetterList";
import { SidebarDemo } from "@/components/sidebardemo";
import { getUserLetters, getReceivedLetters } from "../../services/api";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export default function Home() {
  return (
    <div className="page-container">
      <SidebarDemo>
        <HomepageContent/>
      </SidebarDemo>
    </div>
  );
}


interface ReceivedLetterListProps {
  letters: {
    _id: string;
    originalLetter: {
      _id: string;
      author: string;
      title: string;
      language: string;
      created_at: string;
    };
    sender: {
      nickname: string;
      avatar: string;
    };
    sentBack: boolean;
    corrected_at: string;
    seen: boolean;
  }[];
}



const HomepageContent = () => {
  const [orderDiariesEvent, setOrderDiariesEvent] = useState(0);
  const [filterSenders, setFilterSenders] = useState("");
  const [sendersList, setSendersList] = useState<string[]>([]);
  const [noLetters, setNoLetters] = useState<boolean>(true);
  const [noReceivedLetters, setNoReceivedLetters] =  useState<boolean>(true); 
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [searchFilterReceived, setSearchFilterReceived] = useState<string>("");
  const [language, setLanguage] = useState("");
  const [languageList, setLanguageList] = useState<string[]>([]);
  const [showOnlyPending, setShowOnlyPending] = useState<boolean>(false);

  useEffect(() => {
    const fetchletters = async () => {
      const response = await getUserLetters();
      if (!response || response.length === 0) { setNoLetters(true)} else { setNoLetters(false) }
    };

    const fetchReceivedLetters = async () => {
      const lettersRecList: ReceivedLetterListProps["letters"] = await getReceivedLetters();
      if (!lettersRecList || lettersRecList.length === 0) { setNoReceivedLetters(true) } 
      else { 
        setNoReceivedLetters(false);
        setSendersList([...new Set(lettersRecList.map(letter => letter.sender.nickname))]);
      }
    };
    
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

    fetchletters();
    fetchReceivedLetters();
    setLanguageList(learningLanguages);
  }, []);


  // Action to change the value of the sender selected in Letters Received
  const trySetFilterSenders = (newSender:string) => {
    if (newSender === "None") { setFilterSenders("") }
    else { setFilterSenders(newSender) }
  }

  return (
      <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full">
        <div className="flex gap-2 h-[15%]">
          <img src="/letter-logo.png" className="h-25 mx-auto mt-4 object-cover transition-transform duration-300 hover:-translate-y-1 hover:scale-105"/>
        </div>
        <div className="flex gap-2 flex-1 h-[85%]">
            {/* Letters written */}
            <div
              className="h-full w-full rounded-lg bg-gray-100 dark:bg-neutral-800 px-6"
            >
             <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#57A02D] via-[#39c167] to-[#004D40] p-4 transition-transform duration-300 animate-gradient">
                Letters written
              </h2>

              <div className={`flex gap-2 ${noLetters ? "justify-end" : "justify-between"}`}>
                { !noLetters &&
                <div className="flex flex-row gap-2 cursor-pointer border border-lightblack text-gray-700 rounded-sm py-2 px-4 mb-4 bg-gray-50">
                  <Search className="text-gray-500"></Search>
                  <input placeholder="Search a letter..." className="w-full outline-none" value={searchFilter} onChange={(e) => setSearchFilter(e.target.value)}></input>
                </div> }
                <div> 
                  {!noLetters && 
                  <button className="cursor-pointer text-gray-700 border border-lightblack rounded-sm bg-gray-150 dark:bg-neutral-800 shadow-md py-2 px-4 mb-4 hover:bg-gray-50"
                  onClick={() =>{setOrderDiariesEvent(orderDiariesEvent + 1); }}>
                  {orderDiariesEvent % 2 === 0 ? "📚 Order by diary" : "✉️ Show all"}
                  </button>
                  }
                  <Link href={"/new-letter"}>
                    <button className="cursor-pointer ml-2 text-gray-700 border border-lightblack rounded-sm bg-gray-150 dark:bg-neutral-800 shadow-md py-2 px-4 mb-4 hover:bg-gray-50">
                      💌 New
                    </button>
                  </Link>
                </div>
              </div>
              <LetterCardList orderByDiaryTrigger={orderDiariesEvent} searchFilter={searchFilter}></LetterCardList>
            </div>

            {/* Letters received */}
            <div
              className="h-full w-full rounded-lg bg-gray-100 dark:bg-neutral-800 px-8"
            >
              <h2 className="text-right text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#242424] via-[#333333] to-[#4d4d4d] py-4 transition-transform duration-300 animate-gradient-dark"
              > Letters received </h2>
              {!noReceivedLetters &&
              <div className="flex flex-row justify-between">
                 
                <div className="flex flex-row gap-2 cursor-pointer border border-lightblack text-gray-700  rounded-sm py-2 px-4 mb-4 bg-gray-50">
                  <Search className="text-gray-500"></Search>
                  <input placeholder="Search a letter..." className="w-full outline-none" value={searchFilterReceived} onChange={(e) => setSearchFilterReceived(e.target.value)}></input>
                </div>
                <div className="flex justify-end gap-2">
                  <Switch name="full-width" style={{ width: "40%" }} onChange={(value) => setShowOnlyPending(value === "pending")}>
                      <Switch.Control
                        defaultChecked
                        label="All"
                        size="large"
                        value="all"
                    />
                    <Switch.Control label="Pending" size="large" value="pending" />
                  </Switch>
                  {/* Sender select*/}
                  <div className="space-y-2 min-w-[200px]">
                  <Select 
                    value={filterSenders} 
                    onValueChange={(sender) => {trySetFilterSenders(sender); console.log("Selected .", sender);}}>
                      <SelectTrigger className="text-black bg-white h-10 rounded-md ring-transparent">
                        <SelectValue placeholder="🙋 (Select a friend)"/>
                      </SelectTrigger>
                      <SelectContent>
                        {filterSenders !== "" && <SelectItem key={"None"} value={"None"} className="text-gray-400"> (Clear selection)</SelectItem>}
                        {sendersList.map((sender) => (
                          <SelectItem key={sender} value={sender}>{sender}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              }
              <ReceivedLetterList orderBySender={filterSenders} searchFilter={searchFilterReceived} showOnlyPending={showOnlyPending}></ReceivedLetterList>
            </div>
        </div>
      </div>
  );
};

