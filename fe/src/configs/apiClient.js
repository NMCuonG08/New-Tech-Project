import axios from 'axios';

// Base URL mặc định là /api để tận dụng Vercel Rewrites
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // nếu BE dùng cookie/session
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor: gắn token (nếu có) vào header
apiClient.interceptors.request.use(
    (config) => {
        try {
            // Thử lấy token từ 'auth_token' (mới) hoặc 'access_token' (cũ)
            const token = localStorage.getItem('auth_token') || localStorage.getItem('access_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (e) {
            console.warn('Cannot read token from localStorage', e);
        }
        return config;
    },
    (error) => Promise.reject(error),
);

// Response interceptor: xử lý lỗi chung (401, 500, ...)
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            const { status } = error.response;
            // Ví dụ: nếu 401 thì có thể logout / điều hướng login
            if (status === 401) {
                console.warn('Unauthorized - maybe token expired');
                // TODO: dispatch logout, redirect, ...
            }
        }

        return Promise.reject(error);
    },
);

export default apiClient;


