import axios from "axios";

const API_URL = 'http://localhost:3090/api';


export const getLetterToCorrect = async () => {
    const token = sessionStorage.getItem("authToken");
    try {
        const response = await axios.get(`${API_URL}/corrected/corrections`, {
            headers: {
                'Authorization': `${token}`
            }
        });
        if (response.status === 200) {
            console.log("Corrected letter:", response.data.letter);
            return response.data.letter;
        } else {
            console.error("Error fetching corrected letter:", response.data);
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



export const getReceivedLetters = async () => {
    const token = sessionStorage.getItem("authToken");
    try {
        const response = await axios.get(`${API_URL}/corrected/received`, {
            headers: {
                'Authorization': `${token}`
            }
        });
        if (response.status === 200) {
            console.log("Received letters:", response.data.letters);
            return response.data.letters;
        } else {
            console.error("Error fetching received letters:", response.data);
            return [];
        }
    } catch (error) {

        if (axios.isAxiosError(error)) {
            console.error("Axios error:", error.response?.data);
        }
        else {
            console.error("Unknown error:", error);
        }
        return [];
    }
};


export const shareLetter = async (letterId, sharedWith) => {
    const token = sessionStorage.getItem("authToken");
    try {
        const response = await axios.post(`${API_URL}/letter/share/${letterId}`,
            { sharedWith: sharedWith },
            {
                headers: {
                    'Authorization': `${token}`
                }
            }
        );
        if (response.status === 200) {
            console.log("Letter shared successfully:", response.data);
            return 0;
        }
        console.error("Error sharing letter:", response.data);
        return -1;
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Axios error:", error.response?.data);
        } else {
            console.error("Unknown error:", error);
        }
        return -1;
    }
};


export const getFriendsList = async (id) => {
    const token = sessionStorage.getItem("authToken");
    try {
       const response = await axios.get(`${API_URL}/follow/friends`, {
        headers: {
            'Authorization': `${token}`
        }
       });
       console.log("RESPONSE: " + response.data.friends);
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




export const getUserData = async (id) => {
    const token = sessionStorage.getItem("authToken");
    let response;
    try {
        if (!id) {
            response = await axios.get(`${API_URL}/user/profile/${id}`, {
                headers: {
                    'Authorization': `${token}`
                }
            });
        }
        else {
            response = await axios.get(`${API_URL}/user/profile`, {
                headers: {
                    'Authorization': `${token}`
                }
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


export const getLetter = async (id) => {
    const token = sessionStorage.getItem("authToken");
    try {
        const response = await axios.get(`${API_URL}/letter/view/${id}`, {
            headers: {
                'Authorization': `${token}`
            }
        });
        if (response.status === 200) {
            
        console.log(response);
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



export const editLetter = async (id, title, content, diary, language, created_at, sharedWith) => {
    const token = sessionStorage.getItem("authToken");
    console.log("Token: " + token);
    
    try {
        const response = await axios.put(`${API_URL}/letter/edit/${id}`, 
            {
            title: title,
            content: content,
            diary: diary,
            language: language,
            created_at: created_at,
            sharedWith: sharedWith
            },
            {
            headers: {
              'Authorization': `${token}`
            }
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
}


export const saveLetter = async (title, content, diary, language, created_at) => {
    const token = sessionStorage.getItem("authToken");
    console.log("Token: " + token);
    // El body se ve así { title, content, diary, language, created_at } 
    
    try {
        const response = await axios.post(`${API_URL}/letter/new`, 
            {
            title: title,
            content: content,
            diary: diary,
            language: language,
            created_at: created_at
            },
            {
            headers: {
              'Authorization': `${token}`
            }
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
}


export const getUserLetters = async () => {
    const token = sessionStorage.getItem("authToken");
  
    const response = await fetch(`${API_URL}/letter/list/`, {
      method: "GET",
      headers: {
        "Authorization": `${token}`, // Incluir el token en el encabezado
      },
    });
    
    const data = await response.json();

    if (response.status === 200) {
        return data.letters;

    }
    console.error("Unauthorized access - token may be invalid or expired.");
    return [];
  };

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
    console.log("RESPONSE: " + response.data.status + " " + response.data.inUse);
    if (response.data.status === 0 ) { return response.data.inUse }
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
