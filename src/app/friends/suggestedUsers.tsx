import { useEffect, useState } from "react";
import { getSuggestedUsers, getNonFriendsByFilter } from "@/services/api";
import { SuccessDialog, DialogType } from "@/components/ui/dialog";
import { Ghost, Search } from "lucide-react";
import AddFriendCard from "@/components/addFriendCard";

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

  // Dialog
  const [dialogConfig, setDialogConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    primaryActionText: string;
    autoDismiss: boolean;
    size: "sm" | "md" | "lg";
    type: DialogType;
  }>({
    isOpen: false,
    title: "Payment Successful!",
    description:
      "Your payment has been processed successfully. You will receive a confirmation email shortly.",
    primaryActionText: "View Receipt",
    autoDismiss: false,
    size: "md",
    type: "success",
  });

  const openDialog = (config: Partial<typeof dialogConfig>) => {
    setDialogConfig((prev) => ({ ...prev, ...config, isOpen: true }));
  };

  const closeDialog = () => {
    setDialogConfig((prev) => ({ ...prev, isOpen: false }));
  };

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
            console.log("Primary action clicked for type:", dialogConfig.type);
          }}
        />
      </div>
    </>
  );
};

export default SuggestedUsers;
