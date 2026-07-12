import { useState, useEffect, useCallback, useRef } from "react";
import ReceivedLetterList from "./ReceivedLetterList";
import type { ReceivedLetter } from "@/lib/types";
import { searchReceivedLetters } from "@/services/api";
import { Search, RefreshCw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { SkeletonBlock } from "./loading";
import TablePagination from "@mui/material/TablePagination";

const ITEMS_PER_PAGE = 5;

export default function ReceivedLetterBlock() {
  // Search and sorting filters
  const [filters, setFilters] = useState({
    received: "",
    senders: "",
    onlyPending: false,
  });

  // Server data
  const [data, setData] = useState({
    receivedLetters: [] as ReceivedLetter[],
    sendersList: [] as string[],
    isLoading: true,
    totalLettersCount: 0,
    totalFilteredCount: 0,
    serverError: false,
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pagesCacheRef = useRef<Record<number, ReceivedLetter[]>>({});
  const sendersListRef = useRef<string[]>([]);
  const previousFiltersRef = useRef(filters);
  const isInitialMount = useRef(true);
  const justChangedFilters = useRef(false);

  // Triggers/eventos
  const [rotation, setRotation] = useState<number>(0);

  const fetchReceivedLetters = useCallback(
    async (page: number = currentPage) => {
      const query = filters.received || "";
      const sender = filters.senders || undefined;
      const sentBack = filters.onlyPending ? false : undefined;
      const isBaseQuery =
        query === "" && sender === undefined && filters.onlyPending === false;

      // Check if page is already cached
      if (pagesCacheRef.current[page]) {
        setData((prev) => ({
          receivedLetters: pagesCacheRef.current[page],
          sendersList: sendersListRef.current,
          isLoading: false,
          totalLettersCount: prev.totalLettersCount,
          totalFilteredCount: prev.totalFilteredCount,
          serverError: false,
        }));
        return;
      }

      const result = await searchReceivedLetters(
        query,
        page,
        ITEMS_PER_PAGE,
        sentBack,
        sender,
      );

      if (!result || !result.letters) {
        setData({
          receivedLetters: [],
          sendersList: [],
          isLoading: false,
          totalLettersCount: 0,
          totalFilteredCount: 0,
          serverError: true,
        });
        return;
      }

      const letters = result.letters || [];
      const sendersList = result.senders || [];

      // Cache the page
      pagesCacheRef.current[page] = letters;
      if (isBaseQuery) {
        sendersListRef.current = sendersList;
      }

      // Store total letters count and total filtered count
      const totalCount = result.totalLetters || 0;
      const totalFiltered = result.totalFiltered || 0;

      setData({
        receivedLetters: letters,
        sendersList: isBaseQuery ? sendersList : sendersListRef.current,
        isLoading: false,
        totalLettersCount: totalCount,
        totalFilteredCount: totalFiltered,
        serverError: false,
      });
    },
    [filters.received, filters.senders, filters.onlyPending],
  );

  const updateFilters = useCallback(
    (updates: Partial<typeof filters>) =>
      setFilters((prev) => ({ ...prev, ...updates })),
    [],
  );

  // Action to change the value of the sender selected in Letters Received
  const trySetFilterSenders = useCallback(
    (newSender: string) => {
      updateFilters({ senders: newSender === "None" ? "" : newSender });
    },
    [updateFilters],
  );

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

  const handlePageChange = (
    _event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    // TablePagination uses 0-based indexing, convert to 1-based
    setCurrentPage(newPage + 1);
  };

  // Initial fetch and on filter changes
  useEffect(() => {
    // Clear cache when filters change (detect any change in filters)
    const filtersChanged =
      previousFiltersRef.current.received !== filters.received ||
      previousFiltersRef.current.senders !== filters.senders ||
      previousFiltersRef.current.onlyPending !== filters.onlyPending;

    if (filtersChanged || isInitialMount.current) {
      pagesCacheRef.current = {};
      // Only clear sendersList on initial mount, not on filter changes
      if (isInitialMount.current) {
        sendersListRef.current = [];
      }
      previousFiltersRef.current = filters;
      setCurrentPage(1);
      fetchReceivedLetters(1);
      isInitialMount.current = false;
      justChangedFilters.current = true;
    }
  }, [
    filters.received,
    filters.senders,
    filters.onlyPending,
    fetchReceivedLetters,
  ]);

  // Fetch when page changes (not on filter changes)
  useEffect(() => {
    // Skip if we just changed filters (first useEffect handles that)
    if (justChangedFilters.current) {
      justChangedFilters.current = false;
      return;
    }

    // Fetch for any page change including back to page 1
    if (!isInitialMount.current) {
      fetchReceivedLetters(currentPage);
    }
  }, [currentPage, fetchReceivedLetters]);

  // Refresh when rotation changes
  useEffect(() => {
    if (rotation > 0) {
      pagesCacheRef.current = {};
      fetchReceivedLetters(currentPage);
    }
  }, [rotation, currentPage, fetchReceivedLetters]);

  return (
    <>
      {/* Letters received */}
      <div className="flex-1 w-full rounded-lg bg-gray-100 dark:bg-neutral-800 px-8">
        <div className="flex flex-row justify-between items-center">
          <RefreshCw
            size={25}
            onClick={() => setRotation(rotation + 360)}
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: "transform 0.6s ease-in-out",
            }}
            className="cursor-pointer select-none text-gray-500 active:text-yellow-300 dark:active:text-green-500"
          />
          <h2 className="text-right font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#242424] via-[#333333] to-[#4d4d4d] dark:from-green-100 dark:via-green-200 dark:to-green-300 py-4">
            Letters received
          </h2>
        </div>

        {data.isLoading ? (
          <div className="flex justify-center items-center h-[70vh]">
            <SkeletonBlock />
          </div>
        ) : (
          <>
            {data.totalLettersCount > 0 && (
              <div className="flex flex-col sm:flex-row justify-between mb-2 sm:mb-4">
                <div className="flex flex-row gap-2 cursor-pointer border border-lightblack dark:border-neutral-700 mb-2 sm:mb-0 rounded-sm py-2 px-4 bg-gray-50 dark:bg-neutral-850 text-gray-800 dark:text-gray-200">
                  <Search className="text-gray-500" />
                  <input
                    placeholder="Search a letter..."
                    className="w-full outline-none bg-transparent text-gray-800 dark:text-white placeholder:text-gray-500"
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
                      value={filters.senders}
                      onValueChange={(sender) => {
                        trySetFilterSenders(sender);
                      }}
                    >
                      <SelectTrigger className="text-black dark:text-gray-100 bg-white dark:bg-neutral-900 h-10 rounded-md ring-transparent border border-neutral-300 dark:border-neutral-700">
                        <SelectValue placeholder="🙋 (Select a friend)" />
                      </SelectTrigger>
                      <SelectContent>
                        {filters.senders !== "" && (
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
            {data.serverError ? (
              <div className="flex justify-center items-center h-[70vh] text-gray-500">
                A Server Error occurred. Please try again later
              </div>
            ) : (
              <>
                {/* Pagination */}
                {data.totalFilteredCount > 0 && (
                  <div className="flex justify-end mt-2 mb-2">
                    <TablePagination
                      component="div"
                      count={data.totalFilteredCount}
                      page={currentPage - 1}
                      onPageChange={handlePageChange}
                      rowsPerPage={ITEMS_PER_PAGE}
                      rowsPerPageOptions={[]}
                      className="text-gray-700 dark:text-gray-200"
                      sx={{
                        color: "rgb(55 65 81)",
                        "& .MuiTablePagination-toolbar": { color: "inherit" },
                        "& .MuiTablePagination-selectLabel": {
                          color: "inherit",
                        },
                        "& .MuiTablePagination-displayedRows": {
                          color: "inherit",
                        },
                        "& .MuiTablePagination-actions": { color: "inherit" },
                        "& .MuiSvgIcon-root": { color: "inherit" },
                        ".dark &": { color: "rgb(243 244 246)" },
                        ".dark & .MuiTablePagination-toolbar": {
                          color: "rgb(243 244 246)",
                        },
                        ".dark & .MuiTablePagination-selectLabel": {
                          color: "rgb(243 244 246)",
                        },
                        ".dark & .MuiTablePagination-displayedRows": {
                          color: "rgb(243 244 246)",
                        },
                        ".dark & .MuiTablePagination-actions": {
                          color: "rgb(243 244 246)",
                        },
                        ".dark & .MuiSvgIcon-root": {
                          color: "rgb(243 244 246)",
                        },
                      }}
                    />
                  </div>
                )}
                <ReceivedLetterList
                  letters={data.receivedLetters}
                  noLetters={data.totalLettersCount === 0}
                />
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}
