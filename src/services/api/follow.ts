import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL + "/follow";

const declineFriendRequest = async (senderId: string) => {
  try {
    const response = await axios.post(`${API_URL}/decline/${senderId}`, {});
    if (response.status === 200) {
      return 0;
    }
    console.error("Error declining friend request:", response.data.message);
    return -1;
  } catch (error) {
    console.error("Error declining friend request:", error);
    return -1;
  }
};

const acceptFriendRequest = async (senderId: string) => {
  try {
    const response = await axios.post(`${API_URL}/accept/${senderId}`, {});
    if (response.status === 200) {
      return 0;
    }
    console.error("Error accepting friend request:", response.data.message);
    return -1;
  } catch (error) {
    console.error("Error accepting friend request:", error);
    return -1;
  }
};

const getFriendRequests = async () => {
  try {
    const response = await axios.get(`${API_URL}/requests`);
    if (response.status === 200) {
      return response.data.requests;
    }
    return [];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.response?.data);
    } else {
      console.error("Error obtaining friend requests:", error);
    }
    return [];
  }
};

const sendFollowRequest = async (receiverId: string) => {
  try {
    const response = await axios.post(`${API_URL}/request/${receiverId}`, {});
    if (response.status === 200) {
      return 0;
    }
    return -1;
  } catch (error) {
    console.log("Error sending follow request:", error);
    return -1;
  }
};

const getNonFriendsByFilter = async (filter: string) => {
  if (!filter) {
    return [-1, []];
  }
  try {
    const response = await axios.get(`${API_URL}/non-friends/${filter}`);
    if (response.status === 200) {
      return (response.data.count, response.data.users);
    }
    return [-1, []];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.response?.data);
    } else {
      console.error("Unknown error:", error);
    }
    return [-1, []];
  }
};

const getSuggestedUsers = async () => {
  try {
    const response = await axios.get(`${API_URL}/suggested`);
    if (response.status === 200) {
      return (response.data.count, response.data.users);
    }
    return [-1, []];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.response?.data);
    } else {
      console.error("Unknown error:", error);
    }
    return [-1, []];
  }
};

const getFriends = async () => {
  try {
    const response = await axios.get(`${API_URL}/friends`);
    if (response.status === 200) {
      return (response.data.count, response.data.friends);
    }
    console.error("Error obtaining friends:", response.data.message);
    return [-1, []];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.response?.data);
    } else {
      console.error("Unknown error:", error);
    }
    return [-1, []];
  }
};

const getFriendsList = async () => {
  try {
    const response = await axios.get(`${API_URL}/friends`);
    if (response.status === 200) {
      return response.data.friends;
    } else {
      console.error("Error fetching friends:", response.data);
      return [];
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.response?.data);
    } else {
      console.error("Unknown error:", error);
    }
    return [];
  }
};

const deleteFriend = async (userId: string) => {
  if (!userId) return { ok: false };
  try {
    const response = await axios.delete(`${API_URL}/friend/${userId}`);
    if (response.status === 204) {
      return { ok: true };
    }
    return { ok: false };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.response?.data);
    } else {
      console.error("Unknown error:", error);
    }
    return { ok: false };
  }
};

export {
  declineFriendRequest,
  acceptFriendRequest,
  getFriendRequests,
  sendFollowRequest,
  getNonFriendsByFilter,
  getFriends,
  getFriendsList,
  getSuggestedUsers,
  deleteFriend,
};
