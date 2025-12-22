// App component - OAuth callback handler

import { useEffect } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { saveAuthUser } from './services/authService';
import toast from 'react-hot-toast';

function App() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Handle OAuth2 callback
  useEffect(() => {
    const authStatus = searchParams.get('auth');
    const dataParam = searchParams.get('data');
    const errorMessage = searchParams.get('message');

    if (authStatus === 'error') {
      const message = errorMessage || 'Đăng nhập thất bại';

      // Check if it's a "no account found" error
      if (message.includes('No account found') || message.includes('Please register first')) {
        toast.error('Tài khoản chưa được đăng ký. Vui lòng đăng ký trước!', {
          duration: 5000,
          icon: '⚠️',
        });
      } else {
        toast.error(message);
      }

      setSearchParams({}); // Clear query params
      return;
    }

    if (authStatus === 'success' && dataParam) {
      try {
        const authData = JSON.parse(decodeURIComponent(dataParam));
        console.log('OAuth Auth Data:', authData); // Debug log

        // Save user data and token to localStorage
        saveAuthUser(authData);

        const username = authData.username || authData.email || 'User';
        toast.success(`Chào mừng ${username}! 🎉`);

        // Clear query params after processing
        setSearchParams({});

        // Reload to update auth state
        window.location.reload();
      } catch (err) {
        console.error('Error processing OAuth callback:', err);
        toast.error('Lỗi xử lý dữ liệu người dùng');
        setSearchParams({});
      }
    }
  }, [searchParams, setSearchParams]);

  // Redirect to weather page
  return <Navigate to="/weather" replace />;
}

export default App;
