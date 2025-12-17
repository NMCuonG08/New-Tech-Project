import apiClient from '../configs/apiClient';

// Gọi BE: POST /auth/login { username, password }
export async function loginRequest({ username, password }) {
    const response = await apiClient.post('/auth/login', { username, password });
    return response.data; // Backend sẽ trả về: { user: { id, username }, token: "jwt_token" }
}

// Gọi BE: POST /auth/register { username, password }
export async function registerRequest({ username, password }) {
    const response = await apiClient.post('/auth/register', { username, password });
    return response.data; // Backend sẽ trả về: { user: { id, username }, token: "jwt_token" }
}

// OAuth2 callback handler
export async function handleOAuth2Callback(provider, code) {
    const response = await apiClient.get(`/auth/${provider}/callback?code=${code}`);
    return response.data; // { user: { id, username, email }, token: "jwt_token" }
}

// Lưu user và token vào localStorage
export function saveAuthUser(data) {
    // Nếu backend trả về { user, token }, lưu riêng
    if (data.user && data.token !== undefined) {
        localStorage.setItem('auth_user', JSON.stringify(data.user));
        if (data.token) {
            localStorage.setItem('auth_token', data.token);
        }
    } else {
        // Tương thích với backend cũ (chỉ trả về user)
        localStorage.setItem('auth_user', JSON.stringify(data));
    }
}

// Load user từ localStorage
export function loadAuthUser() {
    try {
        const raw = localStorage.getItem('auth_user');
        if (!raw) return null;
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

// Load token từ localStorage
export function loadAuthToken() {
    try {
        return localStorage.getItem('auth_token');
    } catch {
        return null;
    }
}

// Clear tất cả auth data
export function clearAuthUser() {
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
}

// Verify token với backend (optional - để check token còn valid không)
export async function verifyToken() {
    try {
        const response = await apiClient.get('/auth/verify');
        return response.data; // { valid: true, user: {...} }
    } catch {
        return { valid: false };
    }
}


