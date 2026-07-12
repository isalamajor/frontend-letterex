import axios from "axios";
import {
  UserData,
  ApiResponse,
  Credentials,
  LoginData,
  RegisterData,
  ValidationCodePurpose,
} from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL + "/user";

axios.defaults.withCredentials = true;

const getUserData = async (id?: string): Promise<ApiResponse<UserData>> => {
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
    console.error("Error checking verification code:", error);
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
    const response = await axios.post(`${API_URL}/login`, credentials, {
      validateStatus: (status) => [200, 400, 401, 404].includes(status),
    });
    if (response.status === 200) {
      console.log("api", response);

      /*if (response.data.userData.id) {
        SavePPicInSessionStorage(
          response.data.token,
          response.data.userData.id,
        );
      }*/
      return {
        ok: true,
        data: response.data,
      };
    }
    return {
      ok: false,
      errorMessage: response.data?.message || "Login failed",
    };
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

const getProfile = async (id: string): Promise<ApiResponse<UserData>> => {
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
): Promise<ApiResponse<unknown>> => {
  void token;
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
  const { email, nickname, ...rest } = userData;
  void email;
  void nickname;
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
  const response = await axios.post(`${API_URL}/logout`);
  if (response.status === 200) {
    sessionStorage.clear();
    return { ok: true };
  }
  return { ok: false, errorMessage: "Failed to logout" };
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
