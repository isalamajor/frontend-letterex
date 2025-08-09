import * as React from 'react';

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
  const handleToggle = (friendId: string) => {
    setSelected((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  return (
    <ul className="space-y-2">
      {friends.map((friend) => (
        <label
        key={friend._id}
        className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
        >
        <input
          type="checkbox"
          defaultChecked={friend.alreadySent}
          disabled={friend.alreadySent}
          className="w-4 h-4"
          onChange={() => handleToggle(friend._id)}
        />
        {friend.nickname}
      </label>
      ))}
    </ul>
  );
};

export default FriendsCheckboxList;
