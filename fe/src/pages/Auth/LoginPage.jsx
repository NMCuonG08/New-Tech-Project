import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../../components/auth/LoginForm';
import { useAuth } from '../../hooks/useAuth';

export function LoginPage() {
    const { login, loading, error } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (credentials) => {
        try {
            await login(credentials);
            // Reload the page to update user state across all components
            window.location.href = '/';
        } catch (err) {
            // Error đã được xử lý trong useAuth
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


