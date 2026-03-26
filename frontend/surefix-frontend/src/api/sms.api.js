import api from './axios';

export const getSmsSimulator = async() => {
    const response = await api.get('/sms/simulator');
    return response.data;
};

export const clearSmsSimulator = async() => {
    const response = await api.delete('/sms/simulator');
    return response.data;
};

export const smsAPI = {
    getSmsSimulator,
    clearSmsSimulator,
};

export default smsAPI;