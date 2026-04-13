"use client";
import { useState, useEffect, Suspense } from "react";
import { getFriends, getFriendRequests } from "@/services/api";
import FriendCard from "@/components/friendCard";
import { MessageCircleDashed, Frown } from "lucide-react";
import FriendRequestCard from "@/components/friendRequestCard";
import Pagination from "@mui/material/Pagination";
import dynamic from "next/dynamic";
import { Spinner } from "@/components/ui/spinner-1";

const SuggestedUsers = dynamic(() => import("./suggestedUsers"), {
  loading: () => (
    <div className="bg-white dark:bg-neutral-900 rounded-lg p-4 h-full flex items-center justify-center text-gray-500 dark:text-gray-300">
      <Spinner />
    </div>
  ),
});

const ITEMS_PER_PAGE = 6;

interface FriendList {
  friends: {
    id: string;
    nickname: string;
    image: string;
    lettersExchanged: number;
  }[];
}

interface FriendRequestList {
  senders: {
    id: string;
    sender: {
      id: string;
      nickname: string;
      image: string;
      profilePictureUrl: string;
    };
    created_at: Date;
  }[];
}

export default function Home() {
  return <SocialPageContent />;
}

const SocialPageContent = () => {
  const [friends, setFriends] = useState<FriendList["friends"]>([]);
  const [friendRequests, setFriendRequests] = useState<
    FriendRequestList["senders"]
  >([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Function to refresh all data in parallel
  const refreshData = async () => {
    setIsLoading(true);
    try {
      const [friendsRes, requestsRes] = await Promise.all([
        getFriends(),
        getFriendRequests(),
      ]);
      setFriends(friendsRes || []);
      setFriendRequests(requestsRes || []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  return (
    <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-850 flex flex-col gap-2 flex-1 w-full h-full">
      <h1 className="h-[5%] text-5xl font-semibold bg-gradient-to-r bg-clip-text text-transparent from-purple-500 via-indigo-500 to-purple-500 dark:from-indigo-500 dark:via-purple-300">
        Friends
      </h1>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <div className="flex gap-2 flex-1 h-[95%] text-xl">
          {/* Bloque pantalla */}
          <div className="h-full w-full rounded-lg mt-2 text-black dark:text-gray-100 flex flex-col">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full h-full">
              {/* Columna izquierda: dos filas iguales */}
              <div className="col-span-1 bg-gray-100 dark:bg-neutral-800 rounded-lg p-4 flex flex-col gap-4 h-full">
                <div className="items-center px-8 py-5 justify-center bg-white dark:bg-neutral-850 rounded-lg p-2 h-[35%]">
                  {/* Fila superior */}
                  <h2 className="text-3xl text-end text-indigo-500 dark:text-[#b63aff] h-[20%]">
                    Friend requests
                  </h2>
                  {friendRequests.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4 h-[80%] overflow-auto w-full pb-15">
                      {friendRequests.map((request) => (
                        <div key={request.sender.id} className="col-span-1">
                          <FriendRequestCard
                            {...request.sender}
                            onAcceptSuccess={refreshData}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex sm:h-[80%] overflow-auto items-center justify-center w-full sm:pb-15">
                      <MessageCircleDashed className="mr-2" color="gray" />
                      <p className="text-gray-500 dark:text-gray my-10">
                        No friend requests received...
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex-1 bg-white dark:bg-neutral-850 rounded-lg px-8 py-5 sm:h-[70%]">
                  {/* Fila inferior */}
                  <h2 className="text-3xl text-start mb-2 text-indigo-500 dark:text-[#b63aff]">
                    My friends
                  </h2>
                  {friends.length > 0 ? (
                    <div className="flex flex-col justify-between sm:h-[90%]">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 content-start">
                        {friends
                          .slice(
                            (currentPage - 1) * ITEMS_PER_PAGE,
                            currentPage * ITEMS_PER_PAGE,
                          )
                          .map((friend) => (
                            <div key={friend.id} className="col-span-1">
                              <FriendCard {...friend} />
                            </div>
                          ))}
                      </div>
                      {friends.length > ITEMS_PER_PAGE && (
                        <Pagination
                          count={Math.ceil(friends.length / ITEMS_PER_PAGE)}
                          variant="outlined"
                          shape="rounded"
                          onChange={(event, page) => setCurrentPage(page)}
                          size="large"
                          className="mt-2"
                        />
                      )}
                    </div>
                  ) : (
                    <div className="flex h-[80%] overflow-auto items-center gap-2 justify-center w-full pb-15">
                      <p className="text-gray-500 dark:text-gray">
                        No friends yet
                      </p>
                      <Frown color="gray" />
                    </div>
                  )}
                </div>
              </div>
              {/* Center column (larger) */}
              <div className="col-span-1 bg-gray-100 dark:bg-neutral-800 rounded-lg p-4">
                <SuggestedUsers />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
