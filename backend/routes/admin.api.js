import api from './axios';

const getUsers = async(params) => {
    const { data } = await api.get('/admin/users', { params });
    return data;
};

const deleteUser = async(userId) => {
    const { data } = await api.delete(`/admin/users/${userId}`);
    return data;
};

const toggleUserVerification = async(userId, is_verified) => {
    const { data } = await api.patch(`/admin/users/${userId}/verify`, { is_verified });
    return data;
};

export const adminAPI = {
    getUsers,
    deleteUser,
    toggleUserVerification,
};