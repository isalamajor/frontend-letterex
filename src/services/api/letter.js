import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL + "/letter";

const deleteLetters = async (letterIds) => {
  console.log("API - Deleting letters with IDs:", letterIds);
  try {
    const response = await axios.delete(`${API_URL}/delete`, {
      data: { letters: letterIds },
    });
    if (response.status === 200) {
      console.log("Letters deleted successfully:", response.data);
      return response.data.countDeleted;
    }
    console.error("Error deleting letters:", response.data.message);
    return -1;
  } catch (error) {
    console.error("Axios error: ", error.message);
    return -1;
  }
};

const getDiaries = async () => {
  try {
    const response = await axios.get(`${API_URL}/diaries`);
    if (response.status === 200) {
      console.log("Diaries API:", response.data.diaries);
      return response.data.diaries;
    }
    console.error("Error obtaining diaries:", response.data.message);
    return -1;
  } catch (error) {
    console.error("Error obtaining diaries:", error.message);
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.response?.data);
    } else {
      console.error("Unknown error:", error);
    }
    return -1;
  }
};

const getCountLetters = async (userId) => {
  try {
    let response;
    if (userId) {
      response = await axios.get(`${API_URL}/count/${userId}`);
    } else {
      response = await axios.get(`${API_URL}/count`);
    }

    if (response.status === 200) {
      return response.data.counts;
    }
    return -1;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.response?.data);
    } else {
      console.error("Unknown error:", error);
    }
    return -1;
  }
};

const shareLetter = async (letterId, sharedWith) => {
  try {
    const response = await axios.post(`${API_URL}/share/${letterId}`, {
      sharedWith: sharedWith,
    });
    if (response.status === 200) {
      return 0;
    }
    return -1;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.response?.data);
    } else {
      console.error("Unknown error:", error);
    }
    return -1;
  }
};

const getLetter = async (id) => {
  if (!id) return null;
  try {
    const response = await axios.get(`${API_URL}/view/${id}`);
    if (response.status === 200) {
      return response.data.letter;
    } else {
      console.error("Error fetching letter:", response.data);
      return null;
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.response?.data);
    } else {
      console.error("Unknown error:", error);
    }
    return null;
  }
};

const editLetter = async (
  id,
  title,
  content,
  diary,
  language,
  created_at,
  sharedWith,
) => {
  try {
    const response = await axios.put(`${API_URL}/edit/${id}`, {
      title: title,
      content: content,
      diary: diary,
      language: language,
      created_at: created_at,
      sharedWith: sharedWith,
    });

    if (response.status === 200) {
      return 0;
    } else {
      console.error("Error saving letter:", data);
      return -1;
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.response?.data);
    } else {
      console.error("Unknown error:", error);
    }
  }
};

const changeLetterDiary = async (letterId, diary) => {
  try {
    const response = await axios.put(`${API_URL}/edit-diary`, {
      letterId: letterId,
      diary: diary,
    });

    if (response.status === 200) {
      return 0;
    } else {
      console.error("Error saving letter:", data);
      return -1;
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.response?.data);
    } else {
      console.error("Unknown error:", error);
    }
  }
};

const saveLetter = async (title, content, diary, language, created_at) => {
  try {
    const response = await axios.post(`${API_URL}/new`, {
      title: title,
      content: content,
      diary: diary,
      language: language,
      created_at: created_at,
    });

    if (response.status === 200) {
      return response.data.letter;
    } else {
      console.error("Error saving letter:", data);
      return null;
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.response?.data);
    } else {
      console.error("Unknown error:", error);
    }
  }
};

const getUserLetters = async () => {
  const response = await axios.get(`${API_URL}/list/`);
  console.log("getUserLetters", response.data.letters);
  if (response.status === 200) {
    return response.data.letters;
  }
  return [];
};

const searchLetters = async (query, page = 1, itemsPerPage = 10) => {
  try {
    const response = await axios.get(`${API_URL}/list/search`, {
      params: {
        q: query,
        page: page,
        itemsPerPage: itemsPerPage,
      },
    });

    if (response.status === 200) {
      return response.data;
    }
    console.error("Error searching letters:", response.data);
    return null;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.response?.data);
    } else {
      console.error("Unknown error:", error);
    }
    return null;
  }
};

export {
  deleteLetters,
  getDiaries,
  getCountLetters,
  shareLetter,
  getLetter,
  editLetter,
  changeLetterDiary,
  saveLetter,
  getUserLetters,
  searchLetters,
};
