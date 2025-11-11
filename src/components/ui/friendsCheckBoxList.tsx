import { useState } from 'react';
import { Pagination } from '@mui/material';
//import { Search } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

interface Friend {
  _id: string;
  nickname: string;
  image?: string;
  alreadySent?: boolean;
}

interface FriendsCheckboxListProps {
  friends: Friend[];
  selected: string[];
  setSelected: React.Dispatch<React.SetStateAction<string[]>>;
}

const FriendsCheckboxList: React.FC<FriendsCheckboxListProps> = ({ friends, selected, setSelected }) => {
  const maxSelectable = 2 - friends.filter(friend => friend.alreadySent).length;
  const [currentPage, setCurrentPage] = useState(1);
  /*const [searchFilter, setSearchFilter] = useState("");

  const filteredFriends = friends.filter(friend => 
    friend.nickname.toLowerCase().includes(searchFilter.toLowerCase())
  );*/

  const handleToggle = (friendId: string) => {
    if (maxSelectable === 1) {
      if (selected.includes(friendId)) {
        setSelected([]);
      } else {
        setSelected([friendId]);
      }
    } else if (selected.includes(friendId)) {
      setSelected(prev => prev.filter(id => id !== friendId));
    } else {
      if (selected.length === 2) {
        setSelected(prev => [prev[0], friendId]);
      } else {
        setSelected(prev => [...prev, friendId]);
      }
    }
  };


  return (
    <div className="flex flex-col items-center py-3">
      <ul className="space-y-2 grid grid-cols-2 gap-x-4 mb-2">
        {friends
          .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
          .map((friend) => (
            <label
              key={friend._id}
              className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selected.includes(friend._id) || friend.alreadySent}
              disabled={friend.alreadySent || maxSelectable === 0}
              className="w-4 h-4"
              onChange={() => handleToggle(friend._id)}
            />
            {friend.nickname}
          </label>
        ))}
      </ul>
      {friends.length === 0 && (
        <p className="text-sm text-gray-500 mb-5">No friends matching the filter...</p>
      )}
      <div className='flex flex-row gap-1'>
        {friends.length > ITEMS_PER_PAGE && (
          <Pagination count={Math.ceil(friends.length / ITEMS_PER_PAGE)} variant="outlined" shape="rounded" 
          onChange={(event, page) => setCurrentPage(page)} size="small" />
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