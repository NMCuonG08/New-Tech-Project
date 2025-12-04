import apiClient from '../configs/apiClient';

// Gọi BE: POST /auth/login { username, password }
export async function loginRequest({ username, password }) {
    const response = await apiClient.post('/auth/login', { username, password });
    return response.data; // { id, username }
}

// Gọi BE: POST /auth/register { username, password }
export async function registerRequest({ username, password }) {
    const response = await apiClient.post('/auth/register', { username, password });
    return response.data; // { id, username }
}

export function saveAuthUser(user) {
    localStorage.setItem('auth_user', JSON.stringify(user));
}

export function loadAuthUser() {
    try {
        const raw = localStorage.getItem('auth_user');
        if (!raw) return null;
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

export function clearAuthUser() {
    localStorage.removeItem('auth_user');
}


