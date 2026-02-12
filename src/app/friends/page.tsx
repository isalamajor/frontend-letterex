"use client";
import { SidebarDemo } from "@/components/sidebardemo";
import { useState, useEffect } from "react";
import { getFriends, getFriendRequests } from "@/services/api";
import FriendCard from "@/components/friendCard";
import { MessageCircleDashed, Frown } from "lucide-react";
import FriendRequestCard from "@/components/friendRequestCard";
import Pagination from "@mui/material/Pagination";
import SuggestedUsers from "./suggestedUsers";

const ITEMS_PER_PAGE = 6;

interface FriendList {
  friends: {
    _id: string;
    nickname: string;
    image: string;
    lettersExchanged: number;
  }[];
}

interface FriendRequestList {
  senders: {
    _id: string;
    sender: {
      _id: string;
      nickname: string;
      image: string;
      profilePictureUrl: string;
    };
    created_at: Date;
  }[];
}

export default function Home() {
  return (
    <div className="page-container">
      <SidebarDemo>
        <SocialPageContent />
      </SidebarDemo>
    </div>
  );
}

const SocialPageContent = () => {
  const [friends, setFriends] = useState<FriendList["friends"]>([]);
  const [friendRequests, setFriendRequests] = useState<
    FriendRequestList["senders"]
  >([]);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchFriends = async () => {
    const res = await getFriends();
    setFriends(res || []);
  };
  const fetchFriendRequests = async () => {
    const res = await getFriendRequests();
    setFriendRequests(res || []);
  };

  // Función para refrescar todos los datos
  const refreshData = () => {
    fetchFriends();
    fetchFriendRequests();
  };

  useEffect(() => {
    refreshData();
  }, []);

  return (
    <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full">
      <h1 className="h-[5%] text-5xl font-semibold bg-gradient-to-r bg-clip-text text-transparent from-purple-500 via-indigo-500 to-purple-500 animate-text">
        Friends
      </h1>

      <div className="flex gap-2 flex-1 h-[95%] text-xl">
        {/* Bloque pantalla */}
        <div className="h-full w-full rounded-lg mt-2 text-black flex flex-col">
          <div className="grid grid-cols-2 gap-4 w-full h-full">
            {/* Columna izquierda: dos filas iguales */}
            <div className="col-span-1 bg-gray-100 rounded-lg p-4 flex flex-col gap-4 h-full">
              <div className="items-center px-8 py-5 justify-center bg-white rounded-lg p-2 h-[35%]">
                {/* Fila superior */}
                <h2 className="text-3xl text-end text-indigo-500 h-[20%]">
                  Friend requests
                </h2>
                {friendRequests.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4 h-[80%] overflow-auto w-full pb-15">
                    {friendRequests.map((request) => (
                      <div key={request.sender._id} className="col-span-1">
                        <FriendRequestCard
                          {...request.sender}
                          onAcceptSuccess={refreshData}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-[80%] overflow-auto items-center justify-center w-full pb-15">
                    <MessageCircleDashed className="mr-2" color="gray" />
                    <p className="text-gray-500">
                      No friend requests received...
                    </p>
                  </div>
                )}
              </div>

              <div className="flex-1 bg-white rounded-lg px-8 py-5 h-[70%]">
                {/* Fila inferior */}
                <h2 className="text-3xl text-start mb-2 text-indigo-500">
                  My friends
                </h2>
                {friends.length > 0 ? (
                  <div className="flex flex-col justify-between h-[90%]">
                    <div className="grid grid-cols-2 gap-2 content-start">
                      {friends
                        .slice(
                          (currentPage - 1) * ITEMS_PER_PAGE,
                          currentPage * ITEMS_PER_PAGE,
                        )
                        .map((friend) => (
                          <div key={friend._id} className="col-span-1">
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
                      />
                    )}
                  </div>
                ) : (
                  <div className="flex h-[80%] overflow-auto items-center gap-2 justify-center w-full pb-15">
                    <p className="text-gray-500">No friends yet</p>
                    <Frown color="gray" />
                  </div>
                )}
              </div>
            </div>
            {/* Columna central (más grande) */}
            <div className="col-span-1 bg-gray-100 rounded-lg p-4">
              <SuggestedUsers />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
