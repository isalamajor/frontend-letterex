import axios from "axios";

const API_URL = 'http://localhost:3090/api';


const deleteCorrectedLetter = async (correctedLetterId) => {
    const token = sessionStorage.getItem("authToken");
    try {
        const response = await axios.delete(`${API_URL}/corrected/${correctedLetterId}`, {
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
        console.error("Axios error: ", error.message);
        return -1;
    }
}


const getCountCorrectedLetters = async (userId) => {
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


const sendLetterBack = async (letterId) => {
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


const updateLetterCorrections = async (letterId, corrections, comments) => {
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


const getLetterToCorrect = async (correctionId) => {
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



const getReceivedLetters = async () => {
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


export {
    deleteCorrectedLetter,
    getCountCorrectedLetters,
    sendLetterBack,
    updateLetterCorrections,
    getLetterToCorrect,
    getReceivedLetters
};
