import { useCallback, useEffect, useState } from 'react';
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
            setUser(data);
            return data;
        } catch (err) {
            const message =
                err?.response?.data?.message ||
                err?.message ||
                'Đăng nhập thất bại, vui lòng thử lại';
            setError(message);
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
            return data;
        } catch (err) {
            const message =
                err?.response?.data?.message ||
                err?.message ||
                'Đăng ký thất bại, vui lòng thử lại';
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        clearAuthUser();
        setUser(null);
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


