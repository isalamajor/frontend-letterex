import axios, { AxiosError } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL + "/user";

// Configurar Axios para enviar/recibir cookies
// This allows the backend to return Set-Cookie and Axios to handle it automatically
axios.defaults.withCredentials = true;

// Generic API Response
export interface ApiResponse<T = any> {
  ok: boolean;
  data?: T;
  errorMessage?: string;
}

export interface UserData {
  id?: string;
  email?: string;
  nickname?: string;
  password?: string;
  learningLanguage?: string | null;
  learningLanguage2?: string | null;
  learningLanguage3?: string | null;
  masterLanguage?: string | null;
  masterLanguage2?: string | null;
  masterLanguage3?: string | null;
  countLetters?: Record<string, number>;
  countCorrectedLetter?: Record<string, number>;
  country?: string;
  bio?: string;
  image?: File | null;
  location?: {
    city?: string;
    country?: string;
  };
}

export interface Credentials {
  email: string;
  password: string;
}

export interface LoginData {
  token: string;
  userData: UserData;
}

export interface RegisterData {
  message: string;
  userId?: string;
}

export enum ValidationCodePurpose {
  PASSWORD_RESET = "password_reset",
  REGISTER = "register",
}

const getUserData = async (id?: string): Promise<ApiResponse<UserData>> => {
  try {
    let response;
    if (id) {
      response = await axios.get(`${API_URL}/profile/${id}`);
    } else {
      response = await axios.get(`${API_URL}/profile`);
    }
    if (response.status === 200) {
      return { ok: true, data: response.data.user };
    } else {
      console.error("Error fetching user data:", response.data);
      return { ok: false, errorMessage: "Error fetching user data" };
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.response?.data);
      return {
        ok: false,
        errorMessage: error.response?.data?.message || "Network error",
      };
    } else {
      console.error("Unknown error:", error);
      return { ok: false, errorMessage: "Unknown error occurred" };
    }
  }
};

const sendVerificationCode = async (
  email: string,
  purpose: ValidationCodePurpose,
): Promise<ApiResponse<void>> => {
  try {
    const response = await axios.post(`${API_URL}/verification-code`, {
      email,
      purpose,
    });
    if (response.status === 201) {
      return { ok: true };
    }
    return { ok: false, errorMessage: "Failed to send verification code" };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        ok: false,
        errorMessage: error.response?.data?.message || "Failed to send code",
      };
    }
    return { ok: false, errorMessage: "Network error" };
  }
};

const checkVerificationCode = async (
  email: string,
  code: string,
  purpose: ValidationCodePurpose,
): Promise<ApiResponse<void>> => {
  try {
    const response = await axios.post(
      `${API_URL}/check-code`,
      { email, code, purpose },
      {
        validateStatus: (status) => status >= 200 && status < 500,
      },
    );
    if (response.status === 200) {
      return { ok: true };
    }
    return {
      ok: false,
      errorMessage: response.data.message || "Invalid code",
    };
  } catch (error) {
    return { ok: false, errorMessage: "Server Error checking code" };
  }
};

const register = async (
  userData: UserData,
): Promise<ApiResponse<RegisterData>> => {
  try {
    const response = await axios.post(`${API_URL}/register`, userData);
    if (response.data.status >= 0) {
      return { ok: true, data: response.data };
    }
    return {
      ok: false,
      errorMessage: response.data.message || "Registration failed",
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        ok: false,
        errorMessage:
          error.response?.data?.message || "An error occurred. Try again later",
      };
    }
    return { ok: false, errorMessage: "An error occurred. Try again later" };
  }
};

const login = async (
  credentials: Credentials,
): Promise<ApiResponse<LoginData>> => {
  try {
    const response = await axios.post(`${API_URL}/login`, credentials);
    if (response.status === 200 && response.data.status === 0) {
      sessionStorage.setItem("authToken", response.data.token);
      sessionStorage.setItem(
        "userData",
        JSON.stringify(response.data.userData),
      );
      if (response.data.userData.id) {
        SavePPicInSessionStorage(
          response.data.token,
          response.data.userData.id,
        );
      }
      return {
        ok: true,
        data: {
          token: response.data.token,
          userData: response.data.userData,
        },
      };
    } else if (response.data.status > 0) {
      return {
        ok: false,
        errorMessage: response.data.message || "Invalid credentials",
      };
    }
    return { ok: false, errorMessage: "Login failed" };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        ok: false,
        errorMessage: error.response?.data?.message || "Network error",
      };
    }
    return { ok: false, errorMessage: "Network error" };
  }
};

const SavePPicInSessionStorage = async (
  token: string,
  userId: string,
): Promise<void> => {
  try {
    if (!token || !userId) return;
    const response = await axios.get(`${API_URL}/profile-picture/${userId}`, {
      responseType: "blob",
    });
    if (response) {
      const file = response.data;
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        sessionStorage.setItem("profilePictureBase64", reader.result as string);
      };
    }
  } catch (error) {
    console.error("Error fetching profile picture:", error);
  }
};

const isUsernameInUse = async (
  username: string,
): Promise<ApiResponse<boolean>> => {
  try {
    const response = await axios.get(`${API_URL}/check-nickname/${username}`);
    if (response.data.status === 0) {
      return { ok: true, data: response.data.inUse };
    }
    return { ok: false, errorMessage: "Failed to check username" };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        ok: false,
        errorMessage: error.response?.data?.message || "Network error",
      };
    }
    return { ok: false, errorMessage: "Network error" };
  }
};

const isEmailInUse = async (email: string): Promise<ApiResponse<boolean>> => {
  try {
    const response = await axios.get(`${API_URL}/check-email/${email}`);
    if (response.data.result === 0) {
      return { ok: true, data: response.data.inUse };
    }
    return { ok: false, errorMessage: "Failed to check email" };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        ok: false,
        errorMessage: error.response?.data?.message || "Network error",
      };
    }
    return { ok: false, errorMessage: "Network error" };
  }
};

const getProfile = async (
  id: string,
  token: string,
): Promise<ApiResponse<UserData>> => {
  try {
    const response = await axios.get(`${API_URL}/profile/${id}`);
    return { ok: true, data: response.data };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        ok: false,
        errorMessage: error.response?.data?.message || "Failed to get profile",
      };
    }
    return { ok: false, errorMessage: "Network error" };
  }
};

const listUsers = async (
  token: string,
  page: number = 1,
): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.get(`${API_URL}/list-users/${page}`);
    return { ok: true, data: response.data };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        ok: false,
        errorMessage: error.response?.data?.message || "Failed to list users",
      };
    }
    return { ok: false, errorMessage: "Network error" };
  }
};

const updateUser = async (
  userData: UserData,
): Promise<ApiResponse<UserData>> => {
  // Quitar email y nickname de userData
  const { email: _, nickname: __, ...rest } = userData;
  try {
    const response = await axios.put(`${API_URL}/update`, rest);
    if (response.status === 200) {
      sessionStorage.setItem(
        "userData",
        JSON.stringify(response.data.userData),
      );
      return { ok: true, data: response.data.userData };
    }
    console.error("Error updating user:", response.data);
    return { ok: false, errorMessage: "Failed to update user" };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        ok: false,
        errorMessage: error.response?.data?.message || "Failed to update user",
      };
    }
    return { ok: false, errorMessage: "Network error" };
  }
};

const changePassword = async (
  currentPass: string,
  newPass: string,
): Promise<ApiResponse<void>> => {
  try {
    const response = await axios.put(
      `${API_URL}/change-password`,
      {
        currentPassword: currentPass,
        newPassword: newPass,
      },
      {
        validateStatus: (status) => status >= 200 && status < 500,
      },
    );
    if (response.status === 200) {
      return { ok: true };
    }
    if (response.status === 401) {
      return { ok: false, errorMessage: "Current password is incorrect" };
    }
    console.log("Error changing password:", response.data.message);
    return {
      ok: false,
      errorMessage: response.data.message || "Failed to change password",
    };
  } catch (error) {
    console.log(error);
    return { ok: false, errorMessage: "Network error" };
  }
};

const uploadProfilePicture = async (file: File): Promise<ApiResponse<void>> => {
  try {
    const formData = new FormData();
    formData.append("file0", file);

    const response = await axios.put(`${API_URL}/profile-picture`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (response.status === 200) {
      // Guardar en sessionStorage como base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        sessionStorage.setItem("profilePictureBase64", reader.result as string);
      };
      return { ok: true };
    }
    return { ok: false, errorMessage: "Failed to upload profile picture" };
  } catch (error) {
    console.log("Error uploading profile picture:", error);
    if (axios.isAxiosError(error)) {
      return {
        ok: false,
        errorMessage:
          error.response?.data?.message || "Failed to upload profile picture",
      };
    }
    return { ok: false, errorMessage: "Network error" };
  }
};

const deleteProfilePicture = async (): Promise<ApiResponse<void>> => {
  try {
    console.log("delete api");

    const response = await axios.delete(`${API_URL}/profile-picture`);
    if (response.status === 200) {
      sessionStorage.removeItem("profilePictureBase64");
      return { ok: true };
    }
    return { ok: false, errorMessage: "Failed to delete profile picture" };
  } catch (error) {
    console.log("Error deleting profile picture:", error);
    if (axios.isAxiosError(error)) {
      return {
        ok: false,
        errorMessage:
          error.response?.data?.message || "Failed to delete profile picture",
      };
    }
    return { ok: false, errorMessage: "Network error" };
  }
};

const getProfilePictureUrl = async (
  id: string,
): Promise<ApiResponse<string>> => {
  try {
    const response = await axios.get(`${API_URL}/profile-picture/${id}`, {
      responseType: "blob",
    });
    if (response.status === 200) {
      return { ok: true, data: URL.createObjectURL(response.data) };
    }
    return { ok: false, errorMessage: "Failed to get profile picture" };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        ok: false,
        errorMessage:
          error.response?.data?.message || "Failed to get profile picture",
      };
    }
    return { ok: false, errorMessage: "Network error" };
  }
};

const deleteAccount = async (password: string): Promise<ApiResponse<void>> => {
  try {
    const response = await axios.delete(`${API_URL}/delete-account`, {
      data: { password },
      validateStatus: (status) => status >= 200 && status < 500,
    });
    if (response.status === 200) {
      console.log("Account deleted successfully");
      return { ok: true };
    }
    if (response.status === 401) {
      console.log("Unauthorized");
      return { ok: false, errorMessage: "Password is incorrect" };
    }
    console.log("Error deleting account:", response.data.message);
    return {
      ok: false,
      errorMessage: response.data.message || "Failed to delete account",
    };
  } catch (error) {
    console.log(error);
    return { ok: false, errorMessage: "Network error" };
  }
};

const resetPassword = async (
  email: string,
  code: string,
  newPassword: string,
): Promise<ApiResponse<void>> => {
  const response = await axios.put(`${API_URL}/reset-password`, {
    email,
    code,
    newPassword,
  });
  if (response.status === 200) {
    return { ok: true };
  }
  return { ok: false, errorMessage: response.data.message };
};

const logout = async (): Promise<ApiResponse<void>> => {
  try {
    const response = await axios.post(`${API_URL}/logout`);
    if (response.status === 200) {
      sessionStorage.clear();
      return { ok: true };
    }
    return { ok: false, errorMessage: "Failed to logout" };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        ok: false,
        errorMessage: error.response?.data?.message || "Logout failed",
      };
    }
    return { ok: false, errorMessage: "Network error" };
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
  resetPassword,
  logout,
};
