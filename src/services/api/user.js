import axios from "axios";

const API_URL = "http://localhost:3090/api/user";

const getUserData = async (id) => {
  const token = sessionStorage.getItem("authToken");
  let response;
  try {
    if (id) {
      response = await axios.get(`${API_URL}/profile/${id}`, {
        headers: {
          Authorization: `${token}`,
        },
      });
    } else {
      response = await axios.get(`${API_URL}/profile`, {
        headers: {
          Authorization: `${token}`,
        },
      });
    }
    if (response.status === 200) {
      return response.data.user;
    } else {
      console.error("Error fetching user data:", response.data);
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

const sendVerificationCode = async (email) => {
  try {
    const response = await axios.post(`${API_URL}/verificate-email/${email}`);
    if (response.data.code === 0) {
      return 0;
    }
    return -1;
  } catch (error) {
    return -1;
  }
};

const checkVerificationCode = async (email, code) => {
  try {
    const response = await axios.post(
      `${API_URL}/check-code`,
      { email: email, code: code },
      {
        validateStatus: (status) => status >= 200 && status < 500,
      },
    );
    if (response.data.code === 0) {
      return 0;
    }
    return response.data.message;
  } catch (error) {
    return "Server Error checking code";
  }
};

const register = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/register`, userData);
    if (response.data.status >= 0) {
      return response.data;
    }
  } catch (error) {
    return "An error occurred. Try again later";
  }
};

const login = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/login`, credentials);
    if (response.data.status === 0) {
      sessionStorage.setItem("authToken", response.data.token);
      sessionStorage.setItem(
        "userData",
        JSON.stringify(response.data.userData),
      );
      if (response.data.userData._id) {
        SavePPicInSessionStorage(
          response.data.token,
          response.data.userData._id,
        );
      }
      return response.data;
    } else if (response.data.status > 0) {
      return response.data;
    }
  } catch (_error) {
    return -1;
  }
};

const SavePPicInSessionStorage = async (token, userId) => {
  try {
    if (!token || !userId) return;
    const response = await axios.get(`${API_URL}/profile-picture/${userId}`, {
      responseType: "blob",
      headers: { Authorization: token },
    });
    if (response) {
      const file = response.data;
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        sessionStorage.setItem("profilePictureBase64", reader.result);
      };
    }
  } catch (error) {
    console.error("Error fetching profile picture:", error);
  }
};

const isUsernameInUse = async (username) => {
  const response = await axios.get(`${API_URL}/check-nickname/${username}`);
  if (response.data.status === 0) {
    return response.data.inUse;
  }
  return -1;
};

const isEmailInUse = async (email) => {
  const response = await axios.get(`${API_URL}/check-email/${email}`);
  if (response.data.result === 0) {
    return response.data.inUse;
  }
  return -1;
};

const getProfile = async (id, token) => {
  try {
    const response = await axios.get(`${API_URL}/profile/${id}`, {
      headers: { Authorization: token },
    });
    return response.data;
  } catch (error) {
    return handleRequestError(error);
  }
};

const listUsers = async (token, page = 1) => {
  try {
    const response = await axios.get(`${API_URL}/list-users/${page}`, {
      headers: { Authorization: token },
    });
    return response.data;
  } catch (error) {
    return handleRequestError(error);
  }
};

const updateUser = async (userData) => {
  // Quitar email y nickname de userData
  const { email: _, nickname: __, ...rest } = userData;
  const token = sessionStorage.getItem("authToken");
  try {
    const response = await axios.put(`${API_URL}/update`, rest, {
      headers: { Authorization: token },
    });
    if (response.status === 200) {
      return response.data;
    }
    console.error("Error updating user:", response.data);
    return null;
  } catch (error) {
    return handleRequestError(error);
  }
};

const changePassword = async (currentPass, newPass) => {
  const token = sessionStorage.getItem("authToken");
  try {
    const response = await axios.put(
      `${API_URL}/change-password`,
      {
        currentPassword: currentPass,
        newPassword: newPass,
      },
      {
        headers: { Authorization: token },
        validateStatus: (status) => status >= 200 && status < 500, // solo lanza excepción en 5xx
      },
    );
    if (response.status === 200) {
      return 0;
    }
    if (response.status === 401) {
      return -2;
    }
    console.log("Error changing password:", response.data.message);
    return -1;
  } catch (error) {
    console.log(error);
    return -1;
  }
};

const uploadProfilePicture = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file0", file);
    const token = sessionStorage.getItem("authToken");

    const response = await axios.put(`${API_URL}/profile-picture`, formData, {
      headers: { Authorization: token, "Content-Type": "multipart/form-data" },
    });
    if (response.status === 200) {
      // Guardar en sessionStorage como base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        sessionStorage.setItem("profilePictureBase64", reader.result);
      };
      return 0;
    }
    return null;
  } catch (error) {
    console.log("Error uploading profile picture:", error);
    return null;
  }
};

const deleteProfilePicture = async () => {
  try {
    console.log("delete api");
    const token = sessionStorage.getItem("authToken");

    const response = await axios.delete(`${API_URL}/profile-picture`, {
      headers: { Authorization: token },
    });
    if (response.status === 200) {
      sessionStorage.removeItem("profilePictureBase64");
      return 0;
    }
    return -1;
  } catch (error) {
    console.log("Error deleting profile picture:", error);
    return -1;
  }
};

const getProfilePictureUrl = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/profile-picture/${id}`, {
      responseType: "blob",
    });
    if (response.status === 200) {
      return URL.createObjectURL(response.data);
    }
    return null;
  } catch (_error) {
    return null;
  }
};

const deleteAccount = async (password) => {
  const token = sessionStorage.getItem("authToken");
  try {
    const response = await axios.delete(`${API_URL}/delete-account`, {
      headers: { Authorization: token },
      data: { password },
      validateStatus: (status) => status >= 200 && status < 500,
    });
    if (response.status === 200) {
      console.log("Account deleted successfully");
      return 0;
    }
    if (response.status === 401) {
      console.log("Unauthorized");
      return -2;
    }
    console.log("Error deleting account:", response.data.message);
    return -1;
  } catch (error) {
    console.log(error);
    return -1;
  }
};

export {
  getUserData,
  sendVerificationCode,
  checkVerificationCode,
  register,
  login,
  isUsernameInUse,
  isEmailInUse,
  getProfile,
  listUsers,
  updateUser,
  changePassword,
  uploadProfilePicture,
  deleteProfilePicture,
  getProfilePictureUrl,
  deleteAccount,
};
