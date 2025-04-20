import axios from "axios";

const API_URL = 'http://localhost:3090/api';

export const sendVerificationCode = async (email) => {
    try {
        console.log(email);
        const response = await axios.post(`${API_URL}/user/verificate-email/${email}`);
        console.log("RESPONSE: " + response.data.status);
        if (response.data.code === 0) { return 0}
        return -1;
    } catch (error) {
        return handleRequestError(error);
    }
};

export const checkVerificationCode = async (email, code) => {
    try {
        console.log(email + " " + code);
        const response = await axios.post(`${API_URL}/user/check-code`, { email: email, code: code });
        console.log("RESPONSE: " + response.data.code);
        if (response.data.code === 0) { return 0 }
        return response.data.message;
    } catch (error) {
        return handleRequestError(error);
    }
};

export const register = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/user/register`, userData);
        console.log("RESPONSE: " + response.data);
        if (response.data.status >= 0) { return response.data }
    } catch (error) {
        return handleRequestError(error);
    }
};

export const login = async (credentials) => {
    try {
        const response = await axios.post(`${API_URL}/user/login`, credentials);
        if (response.data.status >= 0) { return response.data }
    } catch (error) {
        return handleRequestError(error);
    }
};

export const isUsernameInUse = async (username) => {
    const response = await axios.get(`${API_URL}/user/check-nickname/${username}`);
    if (response.status === 0 ) { return response.inUse }
    return -1;
}

export const isEmailInUse = async (email) => {
    const response = await axios.get(`${API_URL}/user/check-email/${email}`);
    console.log("RESPONSE: " + response.data.inUse + response.data.result);
    if (response.data.result === 0 ) { return response.data.inUse }
    return -1;
}

export const getProfile = async (id, token) => {
    try {
        const response = await axios.get(`${API_URL}/user/profile/${id}`, {
            headers: { Authorization: token },
        });
        return response.data;
    } catch (error) {
        return handleRequestError(error);
    }
};

export const listUsers = async (token, page = 1) => {
    try {
        const response = await axios.get(`${API_URL}/user/list-users/${page}`, {
            headers: { Authorization: token },
        });
        return response.data;
    } catch (error) {
        return handleRequestError(error);
    }
};

export const updateUser = async (userData, token) => {
    try {
        const response = await axios.put(`${API_URL}/user/update`, userData, {
            headers: { Authorization: token },
        });
        return response.data;
    } catch (error) {
        return handleRequestError(error);
    }
};

export const changePassword = async (passwords, token) => {
    try {
        const response = await axios.put(`${API_URL}/user/change-password`, passwords, {
            headers: { Authorization: token },
        });
        return response.data;
    } catch (error) {
        return handleRequestError(error);
    }
};

export const uploadProfilePicture = async (file, token) => {
    try {
        const formData = new FormData();
        formData.append("file0", file);

        const response = await axios.post(`${API_URL}/user/profile-picture`, formData, {
            headers: { Authorization: token, "Content-Type": "multipart/form-data" },
        });
        return response.data;
    } catch (error) {
        return handleRequestError(error);
    }
};

export const getProfilePicture = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/user/profile-picture/${id}`, {
            responseType: "blob",
        });
        return response.data;
    } catch (error) {
        return handleRequestError(error);
    }
};

// Función auxiliar para manejar errores de Axios
const handleRequestError = (error) => {
    if (error.response) {
        console.error("Error en la respuesta del servidor:", error.response.data);
        return { error: error.response.data };
    } else if (error.request) {
        console.error("No se recibió respuesta del servidor.");
        return { error: "No se recibió respuesta del servidor" };
    } else {
        console.error("Error al realizar la solicitud:", error.message);
        return { error: error.message };
    }
};
