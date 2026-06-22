import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

export const updateInsight = async (reportId, { type, text }) => {
    const res = await axios.patch(`${API_URL}/reports/${reportId}/insight`, { type, text }, getAuthHeaders());
    return res.data;
};

export const resetInsight = async (reportId, { type }) => {
    const res = await axios.delete(`${API_URL}/reports/${reportId}/insight`, {
        data: { type },
        ...getAuthHeaders()
    });
    return res.data;
};

export default {
    updateInsight,
    resetInsight
};
