import { useState } from "react";
import { Pagination } from "@mui/material";
//import { Search } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

interface Friend {
  id: string;
  nickname: string;
  image?: string;
  alreadySent?: boolean;
}

export interface SharedWithUser {
  id: string;
  nickname: string;
  image: string;
}

interface FriendsCheckboxListProps {
  friends: Friend[];
  selected: SharedWithUser[];
  setSelected: React.Dispatch<React.SetStateAction<SharedWithUser[]>>;
}

const FriendsCheckboxList: React.FC<FriendsCheckboxListProps> = ({
  friends,
  selected,
  setSelected,
}) => {
  const maxSelectable =
    2 - friends.filter((friend) => friend.alreadySent).length;
  const [currentPage, setCurrentPage] = useState(1);
  /*const [searchFilter, setSearchFilter] = useState("");

  const filteredFriends = friends.filter(friend =>
    friend.nickname.toLowerCase().includes(searchFilter.toLowerCase())
  );*/

  const handleToggle = (friend: Friend) => {
    const isSelected = selected.some((s) => s.id === friend.id);
    const sharedWithUser: SharedWithUser = {
      id: friend.id,
      nickname: friend.nickname,
      image: friend.image || "",
    };

    if (maxSelectable === 1) {
      if (isSelected) {
        // Remove this selection but keep alreadySent users
        setSelected((prev) =>
          prev.filter((s) => {
            const friendInList = friends.find((f) => f.id === s.id);
            return friendInList?.alreadySent;
          }),
        );
      } else {
        // Keep alreadySent users and add the new one
        setSelected((prev) => {
          const alreadySentUsers = prev.filter((s) => {
            const friendInList = friends.find((f) => f.id === s.id);
            return friendInList?.alreadySent;
          });
          return [...alreadySentUsers, sharedWithUser];
        });
      }
    } else if (isSelected) {
      setSelected((prev) => prev.filter((s) => s.id !== friend.id));
    } else {
      if (selected.length === 2) {
        setSelected((prev) => [prev[0], sharedWithUser]);
      } else {
        setSelected((prev) => [...prev, sharedWithUser]);
      }
    }
  };

  return (
    <div className="flex flex-col items-center py-3">
      <ul className="space-y-2 grid grid-cols-2 gap-x-4 mb-2">
        {friends
          .slice(
            (currentPage - 1) * ITEMS_PER_PAGE,
            currentPage * ITEMS_PER_PAGE,
          )
          .map((friend) => (
            <label
              key={friend.id}
              className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={
                  selected.some((s) => s.id === friend.id) || friend.alreadySent
                }
                disabled={friend.alreadySent || maxSelectable === 0}
                className="w-4 h-4 accent-blue-500 dark:accent-[#ffff4d] disabled:accent-gray-400"
                onChange={() => handleToggle(friend)}
              />
              {friend.nickname}
            </label>
          ))}
      </ul>
      {friends.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-200 mb-5">
          No friends matching the filter...
        </p>
      )}
      <div className="flex flex-row gap-1">
        {friends.length > ITEMS_PER_PAGE && (
          <Pagination
            count={Math.ceil(friends.length / ITEMS_PER_PAGE)}
            variant="outlined"
            shape="rounded"
            onChange={(event, page) => setCurrentPage(page)}
            size="small"
          />
        )}

        {/* --- Search bar ---
        <div className="flex flex-row gap-1 cursor-pointer border border-lightblack text-gray-700 rounded-sm py-0.5 pl-3 bg-gray-50 w-40">
          <Search className="text-gray-500" size={20}></Search>
          <input placeholder="Search..." className="w-full outline-none" value={searchFilter} onChange={(e) => setSearchFilter(e.target.value)}></input>
        </div>*/}
      </div>
    </div>
  );
};

export default FriendsCheckboxList;
