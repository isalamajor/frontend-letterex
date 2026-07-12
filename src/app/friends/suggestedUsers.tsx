import { useEffect, useState } from "react";
import { getSuggestedUsers, getNonFriendsByFilter } from "@/services/api";
import { Ghost, Search } from "lucide-react";
import AddFriendCard from "./addFriendCard";
import { useDialog } from "@/context/dialogContext";

interface NonAddedList {
  users: {
    id: string;
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

const SuggestedUsers = () => {
  const [suggested, setSuggested] = useState<NonAddedList["users"]>([]);
  const [queryResults, setQueryResults] = useState<NonAddedList["users"]>([]);
  const [query, setQuery] = useState("");
  const { openDialog } = useDialog();

  useEffect(() => {
    const fetchNonFriends = async () => {
      const res = await getSuggestedUsers();
      setSuggested(res || []);
    };
    fetchNonFriends();
  }, []);

  useEffect(() => {
    if (!query) return;
    const getUsers = async () => {
      const res = await getNonFriendsByFilter(query);
      setQueryResults(res);
    };
    getUsers();
  }, [query]);

  return (
    <>
      <div className=" bg-white dark:bg-neutral-850 rounded-lg p-4 h-full px-4">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
          <h2 className="text-3xl text-center text-indigo-500 dark:text-[#b63aff]">
            Suggested users
          </h2>
          <div className="flex flex-row mt-2 sm:mt-0 ml-auto gap-2 cursor-pointer border border-lightblack dark:border-neutral-700 text-gray-700 dark:text-gray-200 rounded-sm py-2 px-4 bg-gray-50 dark:bg-neutral-800 w-full sm:w-[45%]">
            <Search className="text-gray-500 dark:text-gray-300"></Search>
            <input
              placeholder="Search for a user..."
              className="w-full outline-none bg-transparent text-gray-800 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            ></input>
          </div>
        </div>
        <>
          {(query ? queryResults : suggested).length === 0 ? (
            <div className="flex items-center gap-2 justify-center w-full h-full justify-center align-center items-center pb-15">
              <p className="text-gray-500 dark:text-gray">
                ...No users found...
              </p>
              <Ghost color="gray" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(query ? queryResults : suggested).map((user) => (
                <div key={user.id} className="col-span-1">
                  <AddFriendCard
                    {...user}
                    onAddFriend={(success) => {
                      if (success) {
                        openDialog({
                          title: "Follow request sent",
                          description: `You have sent a follow request to ${user.nickname}.`,
                          primaryActionText: "OK",
                          type: "success",
                        });
                      } else {
                        openDialog({
                          title: "Follow request failed",
                          description: `Failed to send a follow request to ${user.nickname}.`,
                          primaryActionText: "Try Again",
                          type: "error",
                        });
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </>
      </div>
    </>
  );
};

export default SuggestedUsers;
