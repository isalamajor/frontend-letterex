import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL + "/follow";

const declineFriendRequest = async (senderId) => {
  const token = sessionStorage.getItem("authToken");
  try {
    const response = await axios.post(
      `${API_URL}/decline/${senderId}`,
      {},
      {
        headers: {
          Authorization: `${token}`,
        },
      },
    );
    if (response.status === 200) {
      return 0;
    }
    console.error("Error declining friend request:", response.data.message);
    return -1;
  } catch (_error) {
    return -1;
  }
};

const acceptFriendRequest = async (senderId) => {
  const token = sessionStorage.getItem("authToken");
  try {
    const response = await axios.post(
      `${API_URL}/accept/${senderId}`,
      {},
      {
        headers: {
          Authorization: `${token}`,
        },
      },
    );
    if (response.status === 200) {
      return 0;
    }
    console.error("Error accepting friend request:", response.data.message);
    return -1;
  } catch (_error) {
    return -1;
  }
};

const getFriendRequests = async () => {
  const token = sessionStorage.getItem("authToken");
  try {
    const response = await axios.get(`${API_URL}/requests`, {
      headers: {
        Authorization: `${token}`,
      },
    });
    if (response.status === 200) {
      return response.data.requests;
    }
    return [];
  } catch (error) {
    console.error("Error obtaining friend requests:", error.message);
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.response?.data);
    } else {
      console.error("Unknown error:", error);
    }
    return [];
  }
};

const sendFollowRequest = async (receiverId) => {
  const token = sessionStorage.getItem("authToken");
  try {
    const response = await axios.post(
      `${API_URL}/request/${receiverId}`,
      {},
      {
        headers: {
          Authorization: `${token}`,
        },
      },
    );
    if (response.status === 200) {
      return 0;
    }
    return -1;
  } catch (error) {
    console.log("Error sending follow request:", error);
    return -1;
  }
};

const getNonFriendsByFilter = async (filter) => {
  if (!filter) {
    return (-1, []);
  }
  const token = sessionStorage.getItem("authToken");
  try {
    const response = await axios.get(`${API_URL}/non-friends/${filter}`, {
      headers: {
        Authorization: `${token}`,
      },
    });
    if (response.status === 200) {
      return (response.data.count, response.data.users);
    }
    return (-1, []);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.response?.data);
    } else {
      console.error("Unknown error:", error);
    }
    return (-1, []);
  }
};

const getSuggestedUsers = async () => {
  const token = sessionStorage.getItem("authToken");
  try {
    const response = await axios.get(`${API_URL}/suggested`, {
      headers: {
        Authorization: `${token}`,
      },
    });
    if (response.status === 200) {
      return (response.data.count, response.data.users);
    }
    return (-1, []);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.response?.data);
    } else {
      console.error("Unknown error:", error);
    }
    return (-1, []);
  }
};

const getFriends = async () => {
  const token = sessionStorage.getItem("authToken");
  try {
    const response = await axios.get(`${API_URL}/friends`, {
      headers: {
        Authorization: `${token}`,
      },
    });
    if (response.status === 200) {
      return (response.data.count, response.data.friends);
    }
    console.error("Error obtaining friends:", response.data.message);
    return (-1, []);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.response?.data);
    } else {
      console.error("Unknown error:", error);
    }
    return (-1, []);
  }
};

const getFriendsList = async () => {
  const token = sessionStorage.getItem("authToken");
  try {
    const response = await axios.get(`${API_URL}/friends`, {
      headers: {
        Authorization: `${token}`,
      },
    });
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

export {
  declineFriendRequest,
  acceptFriendRequest,
  getFriendRequests,
  sendFollowRequest,
  getNonFriendsByFilter,
  getFriends,
  getFriendsList,
  getSuggestedUsers,
};
