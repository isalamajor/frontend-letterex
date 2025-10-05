import axios from "axios";

const API_URL = 'http://localhost:3090/api';

/*
List of functions:

DIARIES:
- getDiaries() - Get user's diaries

FRIEND REQUESTS:
- declineFriendRequest(senderId) - Decline a friend request
- acceptFriendRequest(senderId) - Accept a friend request  
- getFriendRequests() - Get pending friend requests
- sendFollowRequest(receiverId) - Send follow request to user

FRIENDS:
- getNonFriends() - Get users who are not friends
- getFriends() - Get user's friends list
- getFriendsList(id) - Get friends list for specific user

COUNTERS:
- getCountCorrectedLetters(userId?) - Get count of corrected letters
- getCountLetters(userId?) - Get count of letters written

CORRECTIONS:
- sendLetterBack(letterId) - Send corrected letter back to author
- updateLetterCorrections(letterId, corrections, comments) - Update letter corrections
- getLetterToCorrect(correctionId) - Get letter to correct by ID
- getReceivedLetters() - Get received letters for correction

LETTERS:
- shareLetter(letterId, sharedWith) - Share letter with friends
- getLetter(id) - Get specific letter by ID
- editLetter(id, title, content, diary, language, created_at, sharedWith) - Edit existing letter
- saveLetter(title, content, diary, language, created_at) - Save new letter
- getUserLetters() - Get user's letters

AUTHENTICATION:
- sendVerificationCode(email) - Send verification code to email
- checkVerificationCode(email, code) - Verify email code
- register(userData) - Register new user
- login(credentials) - Login user
- isUsernameInUse(username) - Check if username is taken
- isEmailInUse(email) - Check if email is taken

PROFILE:
- getUserData(id?) - Get user data (own or by ID)
- getProfile(id, token) - Get user profile
- listUsers(token, page?) - List all users with pagination
- updateUser(userData) - Update user profile
- changePassword(currentPass, newPass) - Change user password
- uploadProfilePicture(file) - Upload profile picture
- getProfilePictureUrl(id) - Get profile picture URL
- deleteAccount(password) - Delete user account

UTILS:
- handleRequestError(error) - Handle axios errors
- SavePPicInSessionStorage(token, userId) - Save profile pic in session storage
*/

export const deleteLetters = async (letterIds) => {
    const token = sessionStorage.getItem("authToken");
    console.log("API - Deleting letters with IDs:", letterIds);
    try {
        const response = await axios.delete(`${API_URL}/letter/delete`, {
            headers: {
                'Authorization': `${token}`
            },
            data: { letters: letterIds }
        });
        if (response.status === 200) {
            console.log("Letters deleted successfully:", response.data);
            return response.data.countDeleted;
        }
        console.error("Error deleting letters:", response.data.message);
        return -1;
    }
    catch (error) {
        console.error("Axios error: ", error.message);
        return -1;
    }
}


export const getDiaries = async () => {
    const token = sessionStorage.getItem("authToken");
    try {
        const response = await axios.get(`${API_URL}/letter/diaries`, {
            headers: {
                'Authorization': `${token}`
            }
        });
        if (response.status === 200) {
            console.log("Diaries API:", response.data.diaries);
            return response.data.diaries;
        }
        console.error("Error obtaining diaries:", response.data.message);
        return -1;
    }
    catch (error) {
        console.error("Error obtaining diaries:", error.message);
        if (axios.isAxiosError(error)) {
            console.error("Axios error:", error.response?.data);
        } else {
            console.error("Unknown error:", error);
        }
        return -1;
    }
}


export const declineFriendRequest = async (senderId) => {
    const token = sessionStorage.getItem("authToken");
    try {
        const response = await axios.post(`${API_URL}/follow/decline/${senderId}`, {}, {
            headers: {
                'Authorization': `${token}`
            }
        });
        if (response.status === 200) {
            return 0;
        }
        console.error("Error declining friend request:", response.data.message);
        return -1;
    }
    catch (error) {
        return -1;
    }
}

export const acceptFriendRequest = async (senderId) => {
    const token = sessionStorage.getItem("authToken");
    try {
        const response = await axios.post(`${API_URL}/follow/accept/${senderId}`, {}, {
            headers: {
                'Authorization': `${token}`
            }
        });
        if (response.status === 200) {
            return 0;
        }
        console.error("Error accepting friend request:", response.data.message);
        return -1;
    }
    catch (error) {
        return -1;
    }
}

export const getFriendRequests = async () => {
    const token = sessionStorage.getItem("authToken");
    try {
        const response = await axios.get(`${API_URL}/follow/requests`, {
            headers: {
                'Authorization': `${token}`
            }
        });
        if (response.status === 200) {
            return response.data.requests;
        }
        return [];
    }
    catch (error) {
        console.error("Error obtaining friend requests:", error.message);
        if (axios.isAxiosError(error)) {
            console.error("Axios error:", error.response?.data);
        } else {
            console.error("Unknown error:", error);
        }
        return [];
    }
}

export const sendFollowRequest = async(receiverId) => {
    const token = sessionStorage.getItem("authToken");
    try {
        const response = await axios.post(`${API_URL}/follow/request/${receiverId}`, {}, {
            headers: {
                'Authorization': `${token}`
            }
        });
        if (response.status === 200) {
            return 0;
        }
        return -1;
    }
    catch (error) {
        console.log("Error sending follow request:", error);
        return -1;
    }
}



export const getNonFriends = async () => {
    const token = sessionStorage.getItem("authToken");
    try {
        const response = await axios.get(`${API_URL}/follow/non-friends`, {
            headers: {
                'Authorization': `${token}`
            }
        });
        if (response.status === 200) {
            return response.data.count, response.data.users;
        }
        return -1, [];
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Axios error:", error.response?.data);
        } else {
            console.error("Unknown error:", error);
        }
        return -1, [];
    }
}


export const getFriends = async () => {
    const token = sessionStorage.getItem("authToken");
    try {
        const response = await axios.get(`${API_URL}/follow/friends`, {
            headers: {
                'Authorization': `${token}`
            }
        });
        if (response.status === 200) {
            return response.data.count, response.data.friends;
        }
        console.error("Error obtaining friends:", response.data.message);
        return -1, [];
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Axios error:", error.response?.data);
        } else {
            console.error("Unknown error:", error);
        }
        return -1, [];
    }
}

export const getCountCorrectedLetters = async (userId) => {
    const token = sessionStorage.getItem("authToken");
    try {
        let response;
        if (userId) {
            response = await axios.get(`${API_URL}/corrected/count/${userId}`,
                {
                    headers: {
                        'Authorization': `${token}`
                    }
                }
        );}
        else {
            response = await axios.get(`${API_URL}/corrected/count`,
                {
                    headers: {
                        'Authorization': `${token}`
                    }
                }
        );}
        
        if (response.status === 200) {
            return response.data.counts;
        }
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
}

export const getCountLetters = async (userId) => {
    const token = sessionStorage.getItem("authToken");
    try {
        let response;
        if (userId) {
            response = await axios.get(`${API_URL}/letter/count/${userId}`,
                {
                    headers: {
                        'Authorization': `${token}`
                    }
                }
        );}
        else {
            response = await axios.get(`${API_URL}/letter/count`,
                {
                    headers: {
                        'Authorization': `${token}`
                    }
                }
        );}
        
        if (response.status === 200) {
            return response.data.counts;
        }
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
}

 
export const sendLetterBack = async (letterId) => {
    return 0;
    const token = sessionStorage.getItem("authToken");
    try {
        const response = await axios.patch(
            `${API_URL}/corrected/send-back/${letterId}`,
            {}, 
            {
                headers: {
                    'Authorization': `${token}`
                }
            }
        );
        if (response.status === 200) {
            return 0;
        }
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


export const updateLetterCorrections = async (letterId, corrections, comments) => {
    const token = sessionStorage.getItem("authToken");
    try {
        const response = await axios.put(`${API_URL}/corrected/update/${letterId}`,
            {       
                corrections: corrections,
                comments: comments
             },
            {
                headers: {
                    'Authorization': `${token}`
                }
            }
        );
        if (response.status === 200) {
            return 0;
        }
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

export const getLetterToCorrect = async (correctionId) => {
    const token = sessionStorage.getItem("authToken");
    try {
        const response = await axios.get(`${API_URL}/corrected/correctedLetter/${correctionId}`, {
            headers: {
                'Authorization': `${token}`
            }
        });
        if (response.status === 200) {
            return response.data.correctedLetter;
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



export const getReceivedLetters = async () => {
    const token = sessionStorage.getItem("authToken");
    try {
        const response = await axios.get(`${API_URL}/corrected/received`, {
            headers: {
                'Authorization': `${token}`
            }
        });
        if (response.status === 200) {
            return response.data.letters;
        } else {
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
            return 0;
        }
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
        if (id) {
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
  
    const response = await axios.get(`${API_URL}/letter/list/`, {
      headers: {
        "Authorization": `${token}`, // Incluir el token en el encabezado
      },
    });
    if (response.status === 200) {
        return response.data.letters;

    }
    return [];
};

export const sendVerificationCode = async (email) => {
    try {
        const response = await axios.post(`${API_URL}/user/verificate-email/${email}`);
        if (response.data.code === 0) { return 0}
        return -1;
    } catch (error) {
        return handleRequestError(error);
    }
};

export const checkVerificationCode = async (email, code) => {
    try {
    const response = await axios.post(`${API_URL}/user/check-code`, { email: email, code: code }, {
        validateStatus: status => status >= 200 && status < 500
    });
    if (response.data.code === 0) { return 0 }
    return response.data.message;
} catch (error) {
    return handleRequestError(error);
}
};

export const register = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/user/register`, userData);
        if (response.data.status >= 0) { return response.data }
    } catch (error) {
        return handleRequestError(error);
    }
};

export const login = async (credentials) => {
    try {
        const response = await axios.post(`${API_URL}/user/login`, credentials);
        if (response.data.status === 0) { 
            sessionStorage.setItem("authToken", response.data.token);
            sessionStorage.setItem("userData", JSON.stringify(response.data.userData));
            if (response.data.userData._id) {
                SavePPicInSessionStorage(response.data.token, response.data.userData._id);
            }
            return response.data 
        }
        else if (response.data.status > 0) {
            return response.data;
        }
    } catch (error) {
        return -1;
    }
};

const SavePPicInSessionStorage = async(token, userId) => {
    try {
        if (!token || !userId) return;
        const response = await axios.get(`${API_URL}/user/profile-picture/${userId}`,         
            {
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

export const isUsernameInUse = async (username) => {
    const response = await axios.get(`${API_URL}/user/check-nickname/${username}`);
    if (response.data.status === 0 ) { return response.data.inUse }
    return -1;
}

export const isEmailInUse = async (email) => {
    const response = await axios.get(`${API_URL}/user/check-email/${email}`);
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

export const updateUser = async (userData) => {
    // Quitar email y nickname de userData
    const { email, nickname, ...rest } = userData;
    const token = sessionStorage.getItem("authToken");
    try {
        const response = await axios.put(`${API_URL}/user/update`, rest, {
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

export const changePassword = async (currentPass, newPass) => {
    const token = sessionStorage.getItem("authToken");
    try {
        const response = await axios.put(`${API_URL}/user/change-password`, { 
            currentPassword: currentPass, newPassword: newPass }, {
            headers: { Authorization: token },
            validateStatus: status => status >= 200 && status < 500 // solo lanza excepción en 5xx
        });
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

export const uploadProfilePicture = async (file) => {
    try {
        const formData = new FormData();
        formData.append("file0", file);
        const token = sessionStorage.getItem("authToken");

        const response = await axios.put(`${API_URL}/user/profile-picture`, formData, {
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

export const getProfilePictureUrl = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/user/profile-picture/${id}`, {
            responseType: "blob",
        });
        if (response.status === 200) {
            return URL.createObjectURL(response.data);
        }
        return null;
    } catch (error) {
        return null;
    }
};


export const deleteAccount = async (password) => {
    const token = sessionStorage.getItem("authToken");
    try {
        const response = await axios.delete(`${API_URL}/user/delete-account`, {
            headers: { Authorization: token },
            data: { password },
            validateStatus: status => status >= 200 && status < 500 
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
