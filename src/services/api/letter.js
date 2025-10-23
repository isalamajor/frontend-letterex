import axios from "axios";

const API_URL = 'http://localhost:3090/api';


const deleteLetters = async (letterIds) => {
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


const getDiaries = async () => {
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



const getCountLetters = async (userId) => {
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


const shareLetter = async (letterId, sharedWith) => {
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



const getLetter = async (id) => {
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



const editLetter = async (id, title, content, diary, language, created_at, sharedWith) => {
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


const changeLetterDiary = async (letterId, diary) => {
    console.log("changeLetterDiary: ", letterId, diary);
    return 0;
    const token = sessionStorage.getItem("authToken");
    
    try {
        const response = await axios.put(`${API_URL}/letter/edit-diary`, 
            {
                letterId: letterId,
                diary: diary
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


const saveLetter = async (title, content, diary, language, created_at) => {
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


const getUserLetters = async () => {
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



export {
    deleteLetters,
    getDiaries,
    getCountLetters,
    shareLetter,
    getLetter,
    editLetter,
    changeLetterDiary, 
    saveLetter,
    getUserLetters
};