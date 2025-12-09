import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { handleOAuth2Callback, saveAuthUser } from '../../services/authService';

export function OAuth2CallbackPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('processing'); // processing, success, error

    useEffect(() => {
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const provider = window.location.pathname.split('/')[3]; // /auth/callback/google

        if (error) {
            setStatus('error');
            toast.error('Đăng nhập thất bại: ' + error);
            setTimeout(() => navigate('/login'), 2000);
            return;
        }

        if (!code) {
            setStatus('error');
            toast.error('Không tìm thấy mã xác thực');
            setTimeout(() => navigate('/login'), 2000);
            return;
        }

        // Xử lý OAuth2 callback
        handleOAuth2Callback(provider, code)
            .then((data) => {
                saveAuthUser(data);
                setStatus('success');
                
                const username = data.user?.username || data.username || 'User';
                toast.success(`Chào mừng ${username}! 🎉`);
                
                setTimeout(() => navigate('/'), 1500);
            })
            .catch((err) => {
                setStatus('error');
                const message = err?.response?.data?.message || 'Đăng nhập thất bại';
                toast.error(message);
                setTimeout(() => navigate('/login'), 2000);
            });
    }, [searchParams, navigate]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
            >
                {status === 'processing' && (
                    <>
                        <div className="mb-4 inline-block">
                            <svg
                                className="h-16 w-16 animate-spin text-blue-500"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold">Đang xác thực...</h2>
                        <p className="mt-2 text-sm text-slate-400">Vui lòng đợi trong giây lát</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="mb-4 inline-block">
                            <svg
                                className="h-16 w-16 text-green-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold">Đăng nhập thành công!</h2>
                        <p className="mt-2 text-sm text-slate-400">Đang chuyển hướng...</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="mb-4 inline-block">
                            <svg
                                className="h-16 w-16 text-red-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold">Đăng nhập thất bại</h2>
                        <p className="mt-2 text-sm text-slate-400">Đang quay lại trang đăng nhập...</p>
                    </>
                )}
            </motion.div>
        </div>
    );
}
