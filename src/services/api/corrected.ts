import axios from "axios";
import { Correction, CorrectedLetter } from "../../lib/types";
import { parseDate } from "@internationalized/date";
import { CalendarDate } from "@internationalized/date";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL + "/corrected";

const deleteCorrectedLetter = async (correctedLetterId: string) => {
  try {
    const response = await axios.delete(`${API_URL}/${correctedLetterId}`);
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

const getCountCorrectedLetters = async (userId: string | null) => {
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

const sendLetterBack = async (letterId: string) => {
  try {
    const response = await axios.patch(
      `${API_URL}/send-back/${letterId}`,
      {},
    );
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

const updateLetterCorrections = async (
  letterId: string,
  corrections: Correction[],
  comments: string,
) => {
  try {
    const response = await axios.put(
      `${API_URL}/update/${letterId}`,
      {
        corrections: corrections,
        comments: comments,
      },
    );
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

const getLetterToCorrect = async (
  correctionId: string,
): Promise<CorrectedLetter | null> => {
  try {
    const response = await axios.get(
      `${API_URL}/correctedLetter/${correctionId}`,
    );
    if (response.status === 200) {
      const letterData = response.data.correctedLetter;
      console.log("letterData api", letterData);
      return {
        id: letterData.id,
        title: letterData.originalLetter.title,
        author: letterData.originalLetter.author,
        content: letterData.originalLetter.content,
        date: parseDate(
          letterData.originalLetter.created_at.split("T")[0],
        ) as CalendarDate,
        corrections: letterData.corrections,
        comments: letterData.comments,
        sentBack: letterData.sentBack,
        deleted: letterData.originalLetter.deleted,
        sender: { ...letterData.sender },
        reviewer: { ...letterData.reviewer },
      };
    } else {
      console.error("Error fetching corrected letter:", response.data.message);
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

const getReceivedLetters = async () => {
  try {
    const response = await axios.get(`${API_URL}/received`);
    if (response.status === 200) {
      return response.data.letters;
    } else {
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

const searchReceivedLetters = async (
  query: string,
  page = 1,
  itemsPerPage = 10,
  sentBack: boolean | undefined,
  sender: string | undefined,
) => {
  try {
    const response = await axios.get(`${API_URL}/received/search`, {
      params: {
        q: query,
        page: page,
        itemsPerPage: itemsPerPage,
        sentBack: sentBack,
        sender: sender || null,
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
  deleteCorrectedLetter,
  getCountCorrectedLetters,
  sendLetterBack,
  updateLetterCorrections,
  getLetterToCorrect,
  getReceivedLetters,
  searchReceivedLetters,
};
