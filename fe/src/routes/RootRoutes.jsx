import { Navigate, Outlet, Route, Routes, useLocation, Link } from 'react-router-dom';
import App from '../App';
import { useAuth } from '../hooks/useAuth';
import { LoginPage } from '../pages/Auth/LoginPage';
import { RegisterPage } from '../pages/Auth/RegisterPage';
import { OAuth2CallbackPage } from '../pages/Auth/OAuth2CallbackPage';
import { ProfilePage } from '../pages/User/ProfilePage';
import { DashboardPage } from '../pages/Admin/DashboardPage';
import { WeatherPage } from '../pages/Weather/WeatherPage';

function ProtectedRoute({ children }) {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return children;
}

function RootLayout() {
    const { user, isAuthenticated, logout } = useAuth();
    const location = useLocation();

    const isLogin = location.pathname === '/login';
    const isRegister = location.pathname === '/register';

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/80 backdrop-blur">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 lg:px-6">
                    <Link to="/" className="flex items-center gap-2">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-blue-500/20 text-sm font-semibold text-blue-300">
                            W
                        </span>
                        <div>
                            <p className="text-sm font-semibold">Weather PWA</p>
                            <p className="text-[11px] text-slate-400">Real-time · Offline ready</p>
                        </div>
                    </Link>

                    <div className="flex items-center gap-3 text-xs">
                        {!isAuthenticated ? (
                            <>
                                <Link
                                    to="/login"
                                    className={`rounded-full border px-3 py-1 transition ${isLogin
                                        ? 'border-blue-400 bg-blue-500/20 text-blue-100'
                                        : 'border-white/20 text-slate-200 hover:border-white/40'
                                        }`}
                                >
                                    Đăng nhập
                                </Link>
                                <Link
                                    to="/register"
                                    className={`rounded-full border px-3 py-1 transition ${isRegister
                                        ? 'border-emerald-400 bg-emerald-500/20 text-emerald-100'
                                        : 'border-white/20 text-slate-200 hover:border-white/40'
                                        }`}
                                >
                                    Đăng ký
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/profile"
                                    className="rounded-full border border-white/20 px-3 py-1 text-slate-200 hover:border-blue-400 hover:bg-blue-500/20 hover:text-blue-100 transition"
                                >
                                    👤 Profile
                                </Link>
                                <Link
                                    to="/admin"
                                    className="rounded-full border border-white/20 px-3 py-1 text-slate-200 hover:border-purple-400 hover:bg-purple-500/20 hover:text-purple-100 transition"
                                >
                                    📊 Dashboard
                                </Link>
                                <div className="flex items-center gap-2 rounded-full bg-slate-900/70 px-3 py-1 text-[11px] text-slate-200">
                                    <span className="max-w-[140px] truncate font-medium">
                                        {user?.username}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={logout}
                                        className="rounded-full border border-white/20 px-2 py-0.5 text-[11px] text-slate-300 hover:border-white/40 hover:text-white"
                                    >
                                        Đăng xuất
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <Outlet />
        </div>
    );
}

export function RootRoutes() {
    return (
        <Routes>
            <Route element={<RootLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                
                {/* OAuth2 Callback Routes - Backend sẽ redirect về đây */}
                <Route path="/auth/callback/google" element={<OAuth2CallbackPage />} />
                <Route path="/auth/callback/github" element={<OAuth2CallbackPage />} />
                <Route path="/auth/callback/facebook" element={<OAuth2CallbackPage />} />
                
                {/* Protected Routes */}
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/admin" element={<DashboardPage />} />
                
                <Route path="/weather" element={<WeatherPage />} />
                <Route path="/" element={<Navigate to="/weather" replace />} />
                <Route path="*" element={<Navigate to="/weather" replace />} />
            </Route>
        </Routes>
    );
}


