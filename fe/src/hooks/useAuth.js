import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { clearAuthUser, loadAuthUser, loginRequest, registerRequest, saveAuthUser } from '../services/authService';

export function useAuth() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Load user từ localStorage khi mount
    useEffect(() => {
        const stored = loadAuthUser();
        if (stored) {
            setUser(stored);
        }
    }, []);

    const login = useCallback(async ({ username, password }) => {
        setLoading(true);
        setError(null);
        try {
            const data = await loginRequest({ username, password });
            saveAuthUser(data);
            
            // Extract user từ response (tương thích cả backend mới và cũ)
            const userData = data.user || data;
            setUser(userData);
            
            // Toast notification
            toast.success(`Chào mừng ${userData.username}! 👋`, {
                duration: 3000,
            });
            
            return data;
        } catch (err) {
            const message =
                err?.response?.data?.message ||
                err?.message ||
                'Đăng nhập thất bại, vui lòng thử lại';
            setError(message);
            
            // Toast error
            toast.error(message, {
                duration: 4000,
            });
            
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const register = useCallback(async ({ username, password }) => {
        setLoading(true);
        setError(null);
        try {
            const data = await registerRequest({ username, password });
            
            // Toast success
            toast.success('Đăng ký thành công! 🎉', {
                duration: 3000,
            });
            
            return data;
        } catch (err) {
            const message =
                err?.response?.data?.message ||
                err?.message ||
                'Đăng ký thất bại, vui lòng thử lại';
            setError(message);
            
            // Toast error
            toast.error(message, {
                duration: 4000,
            });
            
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        clearAuthUser();
        setUser(null);
        
        // Toast notification
        toast.success('Đã đăng xuất thành công', {
            duration: 2000,
        });
    }, []);

    return {
        user,
        loading,
        error,
        isAuthenticated: !!user,
        login,
        register,
        logout,
    };
}


