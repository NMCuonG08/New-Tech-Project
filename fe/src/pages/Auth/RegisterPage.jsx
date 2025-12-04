import { useNavigate } from 'react-router-dom';
import { RegisterForm } from '../../components/auth/RegisterForm';
import { useAuth } from '../../hooks/useAuth';

export function RegisterPage() {
    const { register, loading, error } = useAuth();
    const navigate = useNavigate();

    const handleRegister = async (credentials) => {
        try {
            await register(credentials);
            // Sau khi đăng ký thành công, chuyển sang trang login
            navigate('/login', { replace: true });
        } catch (err) {
            // Error đã được xử lý trong useAuth
        }
    };

    return (
        <RegisterForm
            onRegister={handleRegister}
            loading={loading}
            error={error}
            onSwitchToLogin={() => navigate('/login')}
        />
    );
}


