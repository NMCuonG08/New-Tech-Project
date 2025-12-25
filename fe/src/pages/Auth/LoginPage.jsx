import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../../components/auth/LoginForm';
import { useAuth } from '../../hooks/useAuth';
import { useState } from 'react';

export function LoginPage() {
    const { login, loading, error } = useAuth();
    const navigate = useNavigate();
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const handleLogin = async (credentials) => {
        if (isLoggingIn) {
            console.log('⚠️ Already logging in, ignoring duplicate request');
            return;
        }
        
        setIsLoggingIn(true);
        try {
            console.log('🔑 Attempting login with:', credentials.username);
            const result = await login(credentials);
            console.log('✅ Login returned result:', result);
            
            // Only redirect if we got a successful result with token
            if (result && result.token) {
                console.log('✅ Token found, redirecting to home...');
                window.location.href = '/';
            } else {
                console.error('❌ No token in result:', result);
                setIsLoggingIn(false);
            }
        } catch (err) {
            // Error already handled in useAuth hook - it sets error state and shows toast
            console.error('❌ Login threw error:', err);
            console.error('❌ Error details:', {
                message: err?.message,
                response: err?.response?.data,
                status: err?.response?.status
            });
            setIsLoggingIn(false);
            // Don't redirect on error - stay on login page
        }
    };

    return (
        <LoginForm
            onLogin={handleLogin}
            loading={loading}
            error={error}
            onSwitchToRegister={() => navigate('/register')}
        />
    );
}

