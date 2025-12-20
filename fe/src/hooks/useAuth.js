import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { clearAuthUser, loadAuthUser, loginRequest, registerRequest, saveAuthUser, getCurrentUser } from '../services/authService';

export function useAuth() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Start as true while checking localStorage
    const [error, setError] = useState(null);

    // Load user từ localStorage khi mount và verify with backend
    useEffect(() => {
        const initAuth = async () => {
            try {
                const stored = loadAuthUser();
                const token = localStorage.getItem('auth_token');
                
                if (stored && token) {
                    // Set user immediately from localStorage
                    setUser(stored);
                    setLoading(false);
                    
                    // Optional: Fetch fresh user data in background
                    getCurrentUser()
                        .then(userData => {
                            setUser(userData);
                            saveAuthUser({ ...userData, token });
                        })
                        .catch((err) => {
                            console.log('Failed to refresh user data:', err);
                            // Keep using cached data
                        });
                } else {
                    // No stored user or token
                    setUser(null);
                    setLoading(false);
                }
            } catch (error) {
                console.error('Error initializing auth:', error);
                setUser(null);
                setLoading(false);
            }
        };
        
        initAuth();
    }, []);

    const login = useCallback(async ({ username, password }) => {
        setLoading(true);
        setError(null);
        try {
            const data = await loginRequest({ username, password });
            
            // Extract user from response - handle both flat and nested formats
            let userData;
            if (data.user) {
                // Nested format: { token, user: {...} }
                userData = data.user;
            } else if (data.id) {
                // Flat format: { id, username, email, role, token }
                const { token, ...userDataOnly } = data;
                userData = userDataOnly;
            } else {
                userData = data;
            }
            
            // Save to localStorage
            saveAuthUser(data);
            
            // Update state với user data (đảm bảo có role)
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

    // Check if user is admin
    const isAdmin = useCallback(() => {
        return user?.role === 'admin';
    }, [user]);

    // Check if user has specific role
    const hasRole = useCallback((role) => {
        return user?.role === role;
    }, [user]);

    return {
        user,
        loading,
        error,
        isAuthenticated: !!user,
        isAdmin: isAdmin(),
        hasRole,
        login,
        register,
        logout,
    };
}


