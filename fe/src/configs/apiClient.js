import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (config) => {
        try {
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

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            const { status, config } = error.response;
            
            // Don't intercept 401 errors from login/register endpoints
            const isAuthEndpoint = config?.url?.includes('/auth/login') || 
                                  config?.url?.includes('/auth/register');
            
            if (status === 401 && !isAuthEndpoint) {
                console.warn('Unauthorized - token expired or invalid');
                
                // Clear expired token and redirect to login
                localStorage.removeItem('auth_token');
                localStorage.removeItem('access_token');
                localStorage.removeItem('auth_user');
                
                // Only redirect if not already on auth page
                if (!window.location.pathname.includes('/auth/')) {
                    window.location.href = '/auth/login';
                }
            }
        }

        return Promise.reject(error);
    },
);

export default apiClient;


