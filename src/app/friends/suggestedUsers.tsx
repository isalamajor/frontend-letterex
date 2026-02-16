import { useEffect, useState } from "react";
import { getSuggestedUsers, getNonFriendsByFilter } from "@/services/api";
import { Ghost, Search } from "lucide-react";
import AddFriendCard from "@/components/addFriendCard";
import { useDialog } from "@/context/dialogContext";

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

const SuggestedUsers = () => {
  const [suggested, setSuggested] = useState<NonAddedList["users"]>([]);
  const [queryResults, setQueryResults] = useState<NonAddedList["users"]>([]);
  const [query, setQuery] = useState("");
  const { openDialog, closeDialog } = useDialog();

  useEffect(() => {
    const fetchNonFriends = async () => {
      const res = await getSuggestedUsers();
      setSuggested(res || []);
    };
    fetchNonFriends();
  }, []);

  useEffect(() => {
    if (!query) return;

    const timeout = setTimeout(async () => {
      const res = await getNonFriendsByFilter(query);
      setQueryResults(res);
    }, 400);

    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <>
      <div className=" bg-white rounded-lg p-4 h-full px-4">
        <div className="flex flex-row justify-between items-center mb-4">
          <h2 className="text-3xl text-center text-indigo-500">
            Suggested users
          </h2>
          <div className="flex flex-row ml-auto gap-2 cursor-pointer border border-lightblack text-gray-700 rounded-sm py-2 px-4 bg-gray-50 w-[45%]">
            <Search className="text-gray-500"></Search>
            <input
              placeholder="Search for a user..."
              className="w-full outline-none"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            ></input>
          </div>
        </div>
        <>
          {(query ? queryResults : suggested).length === 0 ? (
            <div className="flex items-center gap-2 justify-center w-full h-full justify-center align-center items-center pb-15">
              <p className="text-gray-500">...No users found...</p>
              <Ghost color="gray" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {(query ? queryResults : suggested).map((user) => (
                <div key={user._id} className="col-span-1">
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
