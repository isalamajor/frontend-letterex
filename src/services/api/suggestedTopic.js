import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL + "/suggested-topic";

const addNewTopic = async (communityId, title, description) => {
  try {
    const token = sessionStorage.getItem("authToken");
    const response = await axios.post(
      `${API_URL}/`,
      {
        communityId,
        title,
        description,
      },
      {
        headers: {
          Authorization: `${token}`,
        },
      },
    );

    if (response.status === 200) {
      return { ok: true, topic: response.data.suggestedTopic };
    } else {
      return { ok: false, error: response.data.error };
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error at addNewTopic:", error.response?.data);
    } else {
      console.error("Unknown error at addNewTopic:", error);
    }
    return { ok: false, error: error.response?.data || error };
  }
};

const deleteTopic = async (topicId) => {
  try {
    const token = sessionStorage.getItem("authToken");
    const response = await axios.delete(`${API_URL}/${topicId}`, {
      headers: {
        Authorization: `${token}`,
      },
      validateStatus: (status) => status < 500,
    });

    if (response.status === 204) {
      return { ok: true };
    } else {
      return { ok: false, error: response.data.error };
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error at deleteTopic:", error.response?.data);
    } else {
      console.error("Unknown error at deleteTopic:", error);
    }
    return { ok: false, error: error.response?.data || error };
  }
};

const getCommunityTopics = async (communityId) => {
  try {
    const token = sessionStorage.getItem("authToken");
    const response = await axios.get(`${API_URL}/${communityId}`, {
      headers: {
        Authorization: `${token}`,
      },
    });

    if (response.status === 200) {
      console.log(response.data.topics);
      return { ok: true, topics: response.data.topics };
    } else {
      return { ok: false, error: response.data.error };
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error at getCommunityTopics:", error.response?.data);
    } else {
      console.error("Unknown error at getCommunityTopics:", error);
    }
    return { ok: false, error: error.response?.data || error };
  }
};

export { addNewTopic, deleteTopic, getCommunityTopics };
