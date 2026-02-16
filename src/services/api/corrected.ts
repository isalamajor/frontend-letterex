import axios from "axios";
import { UserInvolved, Correction, CorrectedLetter } from "../../../types";
import { parseDate } from "@internationalized/date";
import { CalendarDate } from "@internationalized/date";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL + "/corrected";

const deleteCorrectedLetter = async (correctedLetterId: string) => {
  const token = sessionStorage.getItem("authToken");
  try {
    const response = await axios.delete(`${API_URL}/${correctedLetterId}`, {
      headers: {
        Authorization: `${token}`,
      },
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

const getCountCorrectedLetters = async (userId: string | null) => {
  const token = sessionStorage.getItem("authToken");
  try {
    let response;
    if (userId) {
      response = await axios.get(`${API_URL}/count/${userId}`, {
        headers: {
          Authorization: `${token}`,
        },
      });
    } else {
      response = await axios.get(`${API_URL}/count`, {
        headers: {
          Authorization: `${token}`,
        },
      });
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
  const token = sessionStorage.getItem("authToken");
  try {
    const response = await axios.patch(
      `${API_URL}/send-back/${letterId}`,
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
  const token = sessionStorage.getItem("authToken");
  try {
    const response = await axios.put(
      `${API_URL}/update/${letterId}`,
      {
        corrections: corrections,
        comments: comments,
      },
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
  const token = sessionStorage.getItem("authToken");
  try {
    const response = await axios.get(
      `${API_URL}/correctedLetter/${correctionId}`,
      {
        headers: {
          Authorization: `${token}`,
        },
      },
    );
    console.log(response);
    if (response.status === 200) {
      const letterData = response.data.correctedLetter;
      console.log("letterData api", letterData);
      return {
        title: letterData.originalLetter.title,
        author: letterData.originalLetter.author,
        content: letterData.originalLetter.content,
        date: parseDate(
          letterData.originalLetter.created_at.split("T")[0],
        ) as CalendarDate,
        corrections: letterData.corrections,
        comments: letterData.originalLetter.comments,
        sentBack: letterData.sentBack,
        deleted: letterData.deleted,
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
  const token = sessionStorage.getItem("authToken");
  try {
    const response = await axios.get(`${API_URL}/received`, {
      headers: {
        Authorization: `${token}`,
      },
    });
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

export {
  deleteCorrectedLetter,
  getCountCorrectedLetters,
  sendLetterBack,
  updateLetterCorrections,
  getLetterToCorrect,
  getReceivedLetters,
};
