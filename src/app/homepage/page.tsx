"use client";
import LetterCardList from "@/components/LetterCardList";
import ReceivedLetterList from "@/components/ReceivedLetterList";
import { SidebarDemo } from "@/components/sidebardemo";
import { getUserLetters, getReceivedLetters, deleteLetters } from "@/services/api";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Search, RefreshCw, Trash2, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { SuccessDialog, DialogType } from "@/components/ui/dialog";

export default function Home() {
  return (
    <SidebarDemo>
      <HomepageContent/>
    </SidebarDemo>
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
  const [showOnlyPending, setShowOnlyPending] = useState<boolean>(false);
  const [rotation, setRotation] = useState(0); // Spin Icon Refresh
  const [deleteLettersMode, setDeleteLettersMode] = useState(false);
  const [resetSelection, setResetSelection] = useState(false);
  const [reFetchLetters, setReFetchLetters] = useState(false);
  const [toDeleteLetters, setToDeleteLetters] = useState<string[]>([]);
  const [sectionVisible, setSectionVisible] = useState<number>(0); // 0 for both, 1 for written, 2 for received

  useEffect(() => {

    setDeleteLettersMode(false);
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

    const selectSectionVisible = () => {
      if (window.innerWidth < 768) {
        setSectionVisible(1)
      }
    }

    fetchletters();
    fetchReceivedLetters();
    selectSectionVisible();
  }, []);


  // Action to change the value of the sender selected in Letters Received
  const trySetFilterSenders = (newSender:string) => {
    if (newSender === "None") { setFilterSenders("") }
    else { setFilterSenders(newSender) }
  }

  
  const receiveDataAndDelete = async () => {
    if (toDeleteLetters.length < 1) return; 
    let deletedCount = 0; 
    if (deleteLettersMode) {
      // Delete
      openDialog({
        title: "Are you sure you want to delete the selected letters?",
        description: "This action cannot be undone.",
        type: "askConfirmation",
        primaryActionText: "Cancel",
        autoDismiss: false,
        onConfirmationPositive: async () => {
          deletedCount = await deleteLetters(toDeleteLetters);
          setDeleteLettersMode(false);
          setResetSelection(!resetSelection);
          closeDialog();
          if (deletedCount < 0) {
            openDialog({
              title: "Error",
              description: "An error occurred while deleting the letters.",
              type: "error",
              primaryActionText: "Ok",
              autoDismiss: true,
              autoDismissDelay: 10000
            });
          } else {
            setResetSelection(!resetSelection);
            setReFetchLetters(!reFetchLetters);
            closeDialog();
            setSearchFilter("");
          }
        }
      });
    } else {
      setDeleteLettersMode(true);
    }
  } 

  // Dialog
  const [dialogConfig, setDialogConfig] = useState<{
    isOpen: boolean
    title: string
    description: string
    primaryActionText: string
    autoDismiss: boolean
    size: 'sm' | 'md' | 'lg'
    type: DialogType
    onConfirmationPositive?: () => void
    autoDismissDelay: number
  }>({
    isOpen: false,
    title: "Payment Successful!",
    description: "Your payment has been processed successfully. You will receive a confirmation email shortly.",
    primaryActionText: "View Receipt",
    autoDismiss: true,
    size: 'md',
    type: 'success',
    onConfirmationPositive: undefined,
    autoDismissDelay: 10000
  })

  const openDialog = (config: Partial<typeof dialogConfig>) => {
    setDialogConfig(prev => ({ ...prev, ...config, isOpen: true }))
  }

  const closeDialog = () => {
    setDialogConfig(prev => ({ ...prev, isOpen: false }))
  }
  

  return (
      <div className="p-2 md:p-10 md:pt-2 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900
      h-screen custom-scroll box-border overflow-auto overflow-x-hidden
      sm:h-full sm:overflow-hidden pb-6 sm:pb-2">
        
        <img src="/letter-logo-2.png" alt="Letterex" className="h-15 m-2 sm:h-20 mx-auto object-cover transition-transform duration-300 hover:-translate-y-1 hover:scale-105"/>
        
        <div className="flex flex-col pb-10 sm:pb-0 sm:flex-row gap-2 flex-1 sm:scrolling-auto h-[90%]">
            
            
            <div className="flex flex-row gap-2 justify-center sm:hidden">
              <button onClick={() => setSectionVisible(1)} className={`rounded-full border border-1 px-3 py-1 ${sectionVisible === 1 ? "border-black bg-gray-300 text-gray-900" : " border-gray-500 bg-gray-100 text-gray-800" }`}>Letters written</button>
              <button onClick={() => setSectionVisible(2)} className={`rounded-full border border-1 px-3 py-1 ${sectionVisible === 2 ? "border-black bg-gray-300 text-gray-900" : " border-gray-500 bg-gray-100 text-gray-800" }`}>Letters received</button>
            </div>
            {/* Letters written */}
              
            {sectionVisible !== 2 && 
            <div className="flex-1 w-full rounded-lg bg-gray-100 dark:bg-neutral-800 px-8">
              <h2 className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#57A02D] via-[#39c167] to-[#004D40] p-4 transition-transform duration-300 animate-gradient">
                  Letters written
              </h2>

              <div className={`flex gap-2 flex-col lg:flex-row ${noLetters ? "justify-end" : "justify-between"}`}>
                { !noLetters &&
                <div className="flex flex-row gap-2 cursor-pointer border border-lightblack text-gray-700 rounded-sm py-2 px-4 sm:mb-4 bg-gray-50">
                  <Search className="text-gray-500"></Search>
                  <input placeholder="Search a letter..." className="w-full outline-none" value={searchFilter} onChange={(e) => setSearchFilter(e.target.value)}></input>
                </div> }
                <div className="flex justify-center sm:justify-end"> 
                  {!noLetters && 
                  <button className="cursor-pointer text-gray-700 border border-lightblack rounded-sm bg-gray-150 dark:bg-neutral-800 shadow-md py-2 px-4 mb-4 hover:bg-gray-50"
                  onClick={() =>{setOrderDiariesEvent(orderDiariesEvent + 1); }}>
                  {orderDiariesEvent % 2 === 0 ? "📚 Order by diary" : "✉️ Show all"}
                  </button>
                  }
                  <Link href={"/new-letter"}>
                    <button className="cursor-pointer ml-2 text-gray-700 border border-lightblack rounded-sm bg-gray-150 dark:bg-neutral-800 shadow-md py-2 px-4 mb-4 hover:bg-gray-50 text-res">
                      💌 New
                    </button>
                  </Link>
                  {!noLetters && 
                  <>
                  { deleteLettersMode &&
                    <>
                    <button className="cursor-pointer text-white border border-lightblack rounded-sm bg-red-500 shadow-md p-2 ml-2 mb-4 hover:bg-red-700" onClick={receiveDataAndDelete}>
                      <Trash2></Trash2>
                    </button>
                    <button className="cursor-pointer text-gray-700 border border-lightblack rounded-sm bg-gray-150 shadow-md p-2 ml-2 mb-4 hover:bg-gray-50" onClick={() => {setDeleteLettersMode(false); setResetSelection(!resetSelection);}}>
                      <X></X>
                    </button>
                    </>
                  }  
                  { !noLetters &&  !deleteLettersMode &&
                    <button className="cursor-pointer text-gray-700 border border-lightblack rounded-sm bg-gray-150 shadow-md p-2 ml-2 mb-4 hover:bg-gray-50" onClick={() => setDeleteLettersMode(true)}>
                      <Trash2></Trash2>
                    </button>
                  }   
                  </>}
                </div>
              </div>
                <LetterCardList orderByDiaryTrigger={orderDiariesEvent} searchFilter={searchFilter} deleteMode={deleteLettersMode} resetSelection={resetSelection} 
                onDeleteListChange={(ids)=> {setToDeleteLetters(ids);}} reFetchLetters={reFetchLetters}></LetterCardList>
            </div>
            }

            {/* Letters received */}
            {sectionVisible !== 1 && 
            <div className="flex-1 w-full rounded-lg bg-gray-100 dark:bg-neutral-800 px-8">
              <div className="flex flex-row justify-between items-center">
                <RefreshCw
                  size={25}
                  onClick={() => setRotation(rotation + 360)}
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    transition: "transform 0.6s ease-in-out",
                  }}
                  className="cursor-pointer select-none text-gray-500 active:text-yellow-300"
                />
                <h2 className="text-right font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#242424] via-[#333333] to-[#4d4d4d] py-4 transition-transform duration-300 animate-gradient-dark"> 
                  Letters received 
                </h2>
              </div>
              {!noReceivedLetters &&
              <div className="flex flex-col sm:flex-row justify-between mb-2 sm:mb-4">
                 
                <div className="flex flex-row gap-2 cursor-pointer border border-lightblack text-gray-700 mb-2 sm:mb-0 rounded-sm py-2 px-4 bg-gray-50">
                  <Search className="text-gray-500"></Search>
                  <input placeholder="Search a letter..." className="w-full outline-none" value={searchFilterReceived} onChange={(e) => setSearchFilterReceived(e.target.value)}></input>
                </div>
                <div className="flex justify-center sm:justify-end gap-2">
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
                    onValueChange={(sender) => {trySetFilterSenders(sender)}}>
                      <SelectTrigger className="text-black bg-white h-10 rounded-md ring-transparent">
                        <SelectValue placeholder="🙋 (Select a friend)"/>
                      </SelectTrigger>
                      <SelectContent>
                        {filterSenders !== "" && <SelectItem key={"None"} value={"None"} className="text-gray-500"> (Clear selection)</SelectItem>}
                        {sendersList.map((sender) => (
                          <SelectItem key={sender} value={sender}>{sender}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              }
              <ReceivedLetterList orderBySender={filterSenders} searchFilter={searchFilterReceived} showOnlyPending={showOnlyPending} refresh={rotation}></ReceivedLetterList>
            </div>
            }
        </div>
        <SuccessDialog
          isOpen={dialogConfig.isOpen}
          onClose={closeDialog}
          title={dialogConfig.title}
          description={dialogConfig.description}
          primaryActionText={dialogConfig.primaryActionText}
          autoDismiss={dialogConfig.autoDismiss}
          size={dialogConfig.size}
          type={dialogConfig.type}
          onConfirmationPositive={dialogConfig.onConfirmationPositive}
          autoDismissDelay={dialogConfig.autoDismissDelay}
        />
      </div>
  );
};

