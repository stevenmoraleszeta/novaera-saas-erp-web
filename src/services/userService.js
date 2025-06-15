// Servicio de gestión de usuarios
import axios from '../lib/axios';

export async function getUsers(params = {}) {
    const response = await axios.get('/users', { params });
    return response.data;
}

export async function getUserById(id) {
    const response = await axios.get(`/users/${id}`);
    return response.data;
}

export async function createUser(userData) {
    const response = await axios.post('/users', userData);
    return response.data;
}

export async function updateUser(id, userData) {
    const response = await axios.put(`/users/${id}`, userData);
    return response.data;
}

export async function updateUserPassword(id, passwordData) {
    const response = await axios.put(`/users/${id}/password`, passwordData);
    return response.data;
}

export async function deleteUser(id) {
    const response = await axios.delete(`/users/${id}`);
    return response.data;
}

export async function setUserActiveStatus(id, isActive) {
    const response = await axios.put(`/users/${id}/active`, { isActive });
    return response.data;
}

export async function blockUser(id) {
    const response = await axios.put(`/users/${id}/block`);
    return response.data;
}

export async function unblockUser(id) {
    const response = await axios.put(`/users/${id}/unblock`);
    return response.data;
}

export async function resetUserPasswordAdmin(id, newPassword) {
    const response = await axios.put(`/users/${id}/reset-password`, { password: newPassword });
    return response.data;
}

export async function checkEmailExists(email) {
    const response = await axios.get('/users/exists/email', {
        params: { email }
    });
    return response.data;
}

export async function setUserAvatar(id, avatarData) {
    const response = await axios.put(`/users/${id}/avatar`, avatarData);
    return response.data;
}

// Legacy function name for compatibility
export const toggleUserStatus = setUserActiveStatus; 