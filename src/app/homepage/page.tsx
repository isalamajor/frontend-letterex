"use client";
import LetterCardList from "@/components/LetterCardList";
import ReceivedLetterList from "@/components/ReceivedLetterList";
import { SidebarDemo } from "@/components/sidebardemo";
import { getReceivedLetters } from "@/services/api";
import { useState, useEffect, useCallback } from "react";
import { Search, RefreshCw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Spinner } from "@/components/ui/spinner-1";
import { ReceivedLetterListProps } from "../../lib/types";
import { LetterCardBlock } from "./LetterCardBlock";

export default function Home() {
  return (
    <SidebarDemo>
      <HomepageContent />
    </SidebarDemo>
  );
}

const HomepageContent = () => {
  const [senderFilter, setSenderFilter] = useState<string>("");
  // Filtros de búsqueda y ordenamiento
  const [filters, setFilters] = useState({
    received: "",
    senders: "",
    onlyPending: false,
  });

  // Estado de UI/Visual
  const [ui, setUI] = useState({
    sectionVisible: 0, // 0 for both, 1 for written, 2 for received
    isLoading: true,
  });

  // Datos del servidor
  const [data, setData] = useState({
    noReceivedLetters: true,
    sendersList: [] as string[],
  });

  // Triggers/eventos
  const [triggers, setTriggers] = useState({
    rotation: 0,
  });

  // Helpers para actualizar estados
  const updateFilters = useCallback(
    (updates: Partial<typeof filters>) =>
      setFilters((prev) => ({ ...prev, ...updates })),
    [],
  );
  const updateUI = useCallback(
    (updates: Partial<typeof ui>) => setUI((prev) => ({ ...prev, ...updates })),
    [],
  );
  const updateData = useCallback(
    (updates: Partial<typeof data>) =>
      setData((prev) => ({ ...prev, ...updates })),
    [],
  );
  const updateTriggers = useCallback(
    (updates: Partial<typeof triggers>) =>
      setTriggers((prev) => ({ ...prev, ...updates })),
    [],
  );

  useEffect(() => {
    updateUI({ isLoading: true });

    const fetchReceivedLetters = async () => {
      const lettersRecList: ReceivedLetterListProps["letters"] =
        await getReceivedLetters();
      if (!lettersRecList || lettersRecList.length === 0) {
        updateData({ noReceivedLetters: true });
      } else {
        updateData({
          noReceivedLetters: false,
          sendersList: [
            ...new Set(lettersRecList.map((letter) => letter.sender.nickname)),
          ],
        });
      }
    };

    const selectSectionVisible = () => {
      if (window.innerWidth < 768) {
        updateUI({ sectionVisible: 1 });
      }
    };

    Promise.all([fetchReceivedLetters()]).then(() => {
      selectSectionVisible();
      updateUI({ isLoading: false });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Action to change the value of the sender selected in Letters Received
  const trySetFilterSenders = useCallback((newSender: string) => {
    //updateFilters({ senders: newSender === "None" ? "" : newSender });
    setSenderFilter(newSender === "None" ? "" : newSender);
  }, []);

  const handleReceivedSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateFilters({ received: e.target.value });
    },
    [updateFilters],
  );

  const handlePendingSwitchChange = useCallback(
    (value: string | null) => {
      updateFilters({ onlyPending: value === "pending" });
    },
    [updateFilters],
  );

  if (ui.isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size={40} color="gray" />
      </div>
    );
  }

  return (
    <div
      className="p-2 md:p-10 md:pt-2 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900
      h-screen custom-scroll box-border overflow-auto overflow-x-hidden
      sm:h-full sm:overflow-hidden pb-6 sm:pb-2"
    >
      <img
        src="/letter-logo-2.png"
        alt="Letterex"
        className="h-15 m-2 sm:h-20 mx-auto object-cover transition-transform duration-300 hover:-translate-y-1 hover:scale-105"
      />

      <div className="flex flex-col pb-10 sm:pb-0 sm:flex-row gap-2 flex-1 sm:scrolling-auto h-[90%]">
        <div className="flex flex-row gap-2 justify-center sm:hidden">
          <button
            onClick={() => updateUI({ sectionVisible: 1 })}
            className={`rounded-full border border-1 px-3 py-1 ${ui.sectionVisible === 1 ? "border-black bg-gray-300 text-gray-900" : " border-gray-500 bg-gray-100 text-gray-800"}`}
          >
            Letters written
          </button>
          <button
            onClick={() => updateUI({ sectionVisible: 2 })}
            className={`rounded-full border border-1 px-3 py-1 ${ui.sectionVisible === 2 ? "border-black bg-gray-300 text-gray-900" : " border-gray-500 bg-gray-100 text-gray-800"}`}
          >
            Letters received
          </button>
        </div>
        {/* Letters written */}

        {ui.sectionVisible !== 2 && (
          <div className="flex-1 w-full rounded-lg bg-gray-100 dark:bg-neutral-800 px-8">
            <h2 className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#57A02D] via-[#39c167] to-[#004D40] p-4 transition-transform duration-300 animate-gradient">
              Letters written
            </h2>
            <LetterCardBlock />
          </div>
        )}

        {/* Letters received */}
        {ui.sectionVisible !== 1 && (
          <div className="flex-1 w-full rounded-lg bg-gray-100 dark:bg-neutral-800 px-8">
            <div className="flex flex-row justify-between items-center">
              <RefreshCw
                size={25}
                onClick={() =>
                  updateTriggers({ rotation: triggers.rotation + 360 })
                }
                style={{
                  transform: `rotate(${triggers.rotation}deg)`,
                  transition: "transform 0.6s ease-in-out",
                }}
                className="cursor-pointer select-none text-gray-500 active:text-yellow-300"
              />
              <h2 className="text-right font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#242424] via-[#333333] to-[#4d4d4d] py-4 transition-transform duration-300 animate-gradient-dark">
                Letters received
              </h2>
            </div>
            {!data.noReceivedLetters && (
              <div className="flex flex-col sm:flex-row justify-between mb-2 sm:mb-4">
                <div className="flex flex-row gap-2 cursor-pointer border border-lightblack text-gray-700 mb-2 sm:mb-0 rounded-sm py-2 px-4 bg-gray-50">
                  <Search className="text-gray-500"></Search>
                  <input
                    placeholder="Search a letter..."
                    className="w-full outline-none"
                    value={filters.received}
                    onChange={handleReceivedSearchChange}
                  ></input>
                </div>
                <div className="flex justify-center sm:justify-end gap-2">
                  <Switch
                    name="full-width"
                    style={{ width: "40%" }}
                    onChange={handlePendingSwitchChange}
                  >
                    <Switch.Control
                      defaultChecked
                      label="All"
                      size="large"
                      value="all"
                    />
                    <Switch.Control
                      label="Pending"
                      size="large"
                      value="pending"
                    />
                  </Switch>
                  {/* Sender select*/}
                  <div className="space-y-2 min-w-[200px]">
                    <Select
                      value={senderFilter}
                      onValueChange={(sender) => {
                        trySetFilterSenders(sender);
                      }}
                    >
                      <SelectTrigger className="text-black bg-white h-10 rounded-md ring-transparent">
                        <SelectValue placeholder="🙋 (Select a friend)" />
                      </SelectTrigger>
                      <SelectContent>
                        {senderFilter !== "" && (
                          <SelectItem
                            key={"None"}
                            value={"None"}
                            className="text-gray-500"
                          >
                            {" "}
                            (Clear selection)
                          </SelectItem>
                        )}
                        {data.sendersList.map((sender) => (
                          <SelectItem key={sender} value={sender}>
                            {sender}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
            <ReceivedLetterList
              orderBySender={senderFilter}
              searchFilter={filters.received}
              showOnlyPending={filters.onlyPending}
              refresh={triggers.rotation}
            />
          </div>
        )}
      </div>
    </div>
  );
};
