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

export const updateChartNarrative = async (chartId, { report_id, custom_text }) => {
    const res = await axios.patch(`${API_URL}/reports/charts/${chartId}/narrative`, { report_id, custom_text }, getAuthHeaders());
    return res.data;
};

export const resetChartNarrative = async (chartId, { report_id }) => {
    const res = await axios.delete(`${API_URL}/reports/charts/${chartId}/narrative`, {
        data: { report_id },
        ...getAuthHeaders()
    });
    return res.data;
};

export default {
    updateChartNarrative,
    resetChartNarrative
};
