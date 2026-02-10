import axios from "axios";

const API_URL = 'http://localhost:3090/api/community';


const getCommunities = async (language) => {
    try {
        const token = sessionStorage.getItem("authToken");
        const response = await axios.get(`${API_URL}/${language}`, {
            headers: {
                'Authorization': `${token}`
            }
        });
        if (response.status === 200) {
            console.log('communities fetched', response.data.communities)
            return { ok: true, communities: response.data.communities }
        }

        return { ok: false, error: response.data.message }

    } catch (error) {
        console.log('An error occurred when fetching the communities', error)
        return { ok: false, error: 'An error occurred when fetching the communities' }
    }
}

const getMyCommunities = async (language) => {
    try {
        const token = sessionStorage.getItem("authToken");
        const response = await axios.get(`${API_URL}/`, {
            headers: {
                'Authorization': `${token}`
            }
        });
        if (response.status === 200) {
            console.log('communities fetched', response.data.communities)
            return { ok: true, communities: response.data.communities || []}
        }

        return { ok: false, error: response.data.message }

    } catch (error) {
        console.log('An error occurred when fetching user communities', error)
        return { ok: false, error: 'An error occurred when fetching user communities' }
    }
}

const createCommunity = async ( communityName, language, description, isPrivate ) => {
    try {
        const token = sessionStorage.getItem("authToken");
        const response = await axios.post(`${API_URL}/new`, 
            {
                name: communityName,
                language: language,
                description: description,
                isPrivate: isPrivate
            },
            {
                headers: {
                    'Authorization': `${token}`
                }
            }
        );
        if (response.status === 200) {
            return { ok: true, community: response.data.community }
        }

        return { ok: false, error: response.data.message }
        
    } catch (error) {
        console.log('An error occurred when creating community', error)
        return { ok: false, error: 'An error occurred when creating community' }
    }
}

const requestMembership = async (communityId) => {
    try {
        const token = sessionStorage.getItem("authToken");
        console.log('token', token)
        const response = await axios.post(`${API_URL}/request/${communityId}`, {}, {
            headers: {
                'Authorization': `${token}`
            }
        });
        if (response.status === 200) {
            return { ok: true }
        }

        return { ok: false, error: response.data.message }

    } catch (error) {
        console.log('An error occurred when sending community request', error)
        return { ok: false, error: 'An error occurred when sending community request' }
    }
}



const getMembers = async (communityId, page, itemsPerPage) => {
    try {
        if (!communityId) {
            return { ok: false, error: 'An error occurred when fetching user communities' }
        }
        const token = sessionStorage.getItem("authToken");
        const response = await axios.get(`${API_URL}/members/${communityId}`, {
            headers: {
                'Authorization': `${token}`
            },
            params: {
                itemsPerPage: itemsPerPage,
                pagination: page
            }
        });
        if (response.status === 200) {
            return { ok: true, members: response.data.members || [], total: response.data.total || 0 }
        }

        return { ok: false, error: response.data.message }

    } catch (error) {
        console.log('An error occurred when fetching user communities', error)
        return { ok: false, error: 'An error occurred when fetching user communities' }
    }
}

export { getCommunities, createCommunity, requestMembership, getMyCommunities, getMembers }