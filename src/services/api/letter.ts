import axios from "axios";
import { CalendarDate } from "@internationalized/date";
import { SharedWithUser, EditLetter } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL + "/letter";

const deleteLetters = async (letterIds: string[]) => {
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
    console.error("Axios error: ", error);
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
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.response?.data);
    } else {
      console.error("Unknown error:", error);
    }
    return -1;
  }
};

const getDiariesWithCount = async () => {
  try {
    const response = await axios.get(`${API_URL}/diaries/counts`);
    if (response.status === 200) {
      console.log("Diaries API:", response.data);
      return { ok: true, data: response.data };
    }
    console.error("Error obtaining diaries:", response.data.message);
    return { ok: false, message: response.data.message };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.response?.data);
    } else {
      console.error("Unknown error:", error);
    }
    return { ok: false, message: error || "Error obtaining diaries" };
  }
};

const getCountLetters = async (userId: string) => {
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

const shareLetter = async (letterId: string, sharedWith: string[]) => {
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

const getLetter = async (id: string) => {
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

const editLetter = async (letter: EditLetter) => {
  try {
    const response = await axios.put(`${API_URL}/edit/${letter.id}`, letter);

    if (response.status === 200) {
      return 0;
    } else {
      console.error("Error saving letter:", response);
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

const changeLetterDiary = async (letterId: string, diary: string) => {
  try {
    const response = await axios.put(`${API_URL}/edit-diary`, {
      letterId: letterId,
      diary: diary,
    });

    if (response.status === 200) {
      return 0;
    } else {
      console.error("Error saving letter");
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

type SaveLetter = Omit<EditLetter, "id" | "sharedWith">;
const saveLetter = async (letter: SaveLetter) => {
  try {
    const response = await axios.post(`${API_URL}/new`, letter);

    if (response.status === 200) {
      return response.data.letter;
    } else {
      console.error("Error saving letter");
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
  const response = await axios.get(`${API_URL}/list/search`);
  console.log("getUserLetters", response.data.letters);
  if (response.status === 200) {
    return response.data.letters;
  }
  return [];
};

const searchLetters = async (query: string, page = 1, itemsPerPage = 10) => {
  try {
    const response = await axios.get(`${API_URL}/list/search`, {
      params: {
        q: query,
        page: page,
        itemsPerPage: itemsPerPage,
        _: Date.now(),
      },
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    });

    if (response.status === 200) {
      console.log("letters", response);
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

const searchDiaryLetters = async (
  query: string,
  page = 1,
  itemsPerPage = 6,
  diary: string,
) => {
  try {
    if (!diary) return;
    const response = await axios.get(`${API_URL}/list/diary`, {
      params: {
        q: query,
        page: page,
        itemsPerPage: itemsPerPage,
        diary: diary,
        _: Date.now(),
      },
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    });

    if (response.status === 200) {
      console.log("letters", response);
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
  getDiariesWithCount,
  getCountLetters,
  shareLetter,
  getLetter,
  editLetter,
  changeLetterDiary,
  saveLetter,
  getUserLetters,
  searchLetters,
  searchDiaryLetters,
};
