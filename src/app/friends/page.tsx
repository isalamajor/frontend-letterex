"use client";
import { SidebarDemo } from "@/components/sidebardemo";
import { useState, useEffect, use } from "react";
import { getFriends, getNonFriends, getFriendRequests } from "@/services/api";
import { SuccessDialog, DialogType } from "@/components/ui/dialog";
import FriendCard from "@/components/friendCard";
import AddFriendCard from "@/components/addFriendCard";
import { MessageCircleDashed, Frown, Ghost, Search } from "lucide-react";
import FriendRequestCard from "@/components/friendRequestCard";
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';


const ITEMS_PER_PAGE = 4;

function PaginationRounded() {
  return (
    <Stack spacing={2}>
      <Pagination count={10} shape="rounded" />
      <Pagination count={10} variant="outlined" shape="rounded" />
    </Stack>
  );
}

interface FriendList {
  friends: {
    _id: string;
    nickname: string;
    image: string;
    lettersExchanged: number;
  }[];
}

interface NonAddedList {
  users: {
    _id: string;
    nickname: string;
    image: string;
    masterLanguage: string;
    masterLanguage2: string;
    masterLanguage3: string;
    learningLanguage: string;
    learningLanguage2: string;
    learningLanguage3: string;
    friendRequestSent: boolean;
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
        <SocialPageContent/>
      </SidebarDemo>
    </div>
  );
}



const SocialPageContent = () => {
  const id = "friends-dialog";
  const [friends, setFriends] = useState<FriendList["friends"]>([]);
  const [nonFriends, setNonFriends] = useState<NonAddedList["users"]>([]);
  const [nonFriendsFiltered, setNonFriendsFiltered] = useState<NonAddedList["users"]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequestList["senders"]>([]);
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);

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
    autoDismiss: false,
    size: 'md',
    type: 'success'
  })

  const openDialog = (config: Partial<typeof dialogConfig>) => {
    setDialogConfig(prev => ({ ...prev, ...config, isOpen: true }))
  }

  const closeDialog = () => {
    setDialogConfig(prev => ({ ...prev, isOpen: false }))
  }


  useEffect(() => {
    const filtered = nonFriends.filter((user: NonAddedList["users"][number]) =>
      user.nickname.toLowerCase().includes(searchFilter.toLowerCase())
    );
    setNonFriendsFiltered(filtered);
  }, [searchFilter])

 const fetchFriends = async () => {
    const res = await getFriends();
    setFriends(res || []);
  };
  const fetchNonFriends = async () => {
    const res = await getNonFriends();
    setNonFriends(res || []);
    setNonFriendsFiltered(res || []);
  };
  const fetchFriendRequests = async () => {
    const res = await getFriendRequests();
    setFriendRequests(res || []);
  };

  // Función para refrescar todos los datos
  const refreshData = () => {
    fetchFriends();
    fetchNonFriends();
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
                  <div className="flex-1 items-center px-8 py-5 justify-center bg-white h-full rounded-lg p-2 h-[50%]">
                    {/* Fila superior */}
                    <h2 className="text-3xl text-end text-indigo-500 h-[20%]">
                      Friend requests
                    </h2>
                    {friendRequests.length > 0 ? (
                      <div className="grid grid-cols-2 gap-4 h-[80%] overflow-auto w-full pb-15">
                        {friendRequests.map(request => (
                          <div key={request.sender._id} className="col-span-1">
                            <FriendRequestCard {...request.sender} idRequest={request._id}
                            onAcceptSuccess={refreshData}/>
                          </div>
                        ))}
                      </div>
                    ) :
                    <div className="flex h-[80%] overflow-auto items-center justify-center w-full pb-15">
                      <MessageCircleDashed className="mr-2" color="gray" /> 
                      <p className="text-gray-500">No friend requests received...</p>
                    </div>}
                  </div>

                  <div className="flex-1 bg-white rounded-lg px-8 py-5 h-[50%]">
                    {/* Fila inferior */}
                    <h2 className="text-3xl text-start mb-[3%] text-indigo-500 h-[7%]">
                      My friends
                    </h2>
                    {friends.length > 0 ? (
                     <div className="flex flex-col h-[88%]">
                      <div className="grid grid-cols-2 gap-2  mt-[2%] h-[80%] overflow-auto custom-scroll">
                        {friends
                        .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                        .map(friend => (
                          <div key={friend._id} className="col-span-1"> 
                            <FriendCard {...friend} />
                          </div>
                        ))}
                      </div>
                      {friends.length > ITEMS_PER_PAGE && (
                        <Pagination count={Math.ceil(friends.length / ITEMS_PER_PAGE)} variant="outlined" shape="rounded" 
                        onChange={(event, page) => setCurrentPage(page)} size="large" />
                      )}
                    </div>
                      ) :
                    <div className="flex h-[80%] overflow-auto items-center gap-2 justify-center w-full pb-15">
                    <p className="text-gray-500">No friends yet</p>
                    <Frown color="gray" /> 
                    </div>}
                  </div>
                </div>
                {/* Columna central (más grande) */}
                <div className="col-span-1 bg-gray-100 rounded-lg p-4">
                  <div className=" bg-white rounded-lg p-4 h-full">
                  {/* Columna central */}
                    <h2 className="text-3xl text-center mb-8 text-indigo-500">
                      Explore
                    </h2>
                    {nonFriends.length === 0 ?
                    (<div className="flex h-[80%] overflow-auto items-center gap-2 justify-center w-full pb-15">
                    <p className="text-gray-500">...no users found...</p>
                    <Ghost color="gray" /> 
                    </div>) :
                    <>
                    <div className="flex flex-row ml-auto gap-2 cursor-pointer border border-lightblack text-gray-700 rounded-sm py-2 px-4 mb-4 bg-gray-50 w-[45%]">
                      <Search className="text-gray-500"></Search>
                      <input placeholder="Search a user..." className="w-full outline-none" value={searchFilter} onChange={(e) => setSearchFilter(e.target.value)}></input>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {nonFriendsFiltered.length > 0 && nonFriendsFiltered.map(user => (
                         <div key={user._id} className="col-span-1"> 
                         <AddFriendCard {...user} onAddFriend={(success) => {
                           if (success) {
                             openDialog({
                               title: "Follow request sent",
                               description: `You have sent a follow request to ${user.nickname}.`,
                               primaryActionText: "OK",
                               type: 'success'
                             });
                           } else {
                             openDialog({
                               title: "Follow request failed",
                               description: `Failed to send a follow request to ${user.nickname}.`,
                               primaryActionText: "Try Again",
                               type: 'error'
                             });
                           }
                         }}/>
                        </div>
                      ))}
                    </div>
                    </>}
                  </div>
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
          sharedWith={[]}
          onShareSuccess={() => {}}
        />
      </div>
  );
};

