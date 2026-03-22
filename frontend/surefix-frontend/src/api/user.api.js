import api from './axios';

const updateProfile = async(profileData) => {
    const { data } = await api.put('/auth/profile', profileData);
    return data;
};

const changePassword = async(passwordData) => {
    const { data } = await api.post('/auth/change-password', passwordData);
    return data;
};

const deleteAccount = async() => {
    const { data } = await api.delete('/auth/profile');
    return data;
};

export const userAPI = {
    updateProfile,
    changePassword,
    deleteAccount,
};