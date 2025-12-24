import { Navigate, Outlet, Route, Routes, useLocation, Link, useSearchParams } from 'react-router-dom';
import App from '../App';
import { useAuth } from '../hooks/useAuth';
import { AdminRoute } from '../components/auth/AdminRoute';
import { LoginPage } from '../pages/Auth/LoginPage';
import { RegisterPage } from '../pages/Auth/RegisterPage';
import { OAuth2CallbackPage } from '../pages/Auth/OAuth2CallbackPage';
import { ProfilePage } from '../pages/User/ProfilePage';
import { DashboardPage } from '../pages/Admin/DashboardPage';
import { CityManagementPage } from '../pages/Admin/CityManagementPage';
import { SystemAlertsPage } from '../pages/Admin/SystemAlertsPage';
import { FavoritesPage } from '../pages/User/FavoritesPage';
import { AlertsPage } from '../pages/User/AlertsPage';
import { NotesPage } from '../pages/User/NotesPage';
import { WeatherPage } from '../pages/Weather/WeatherPage';
import { HourlyForecastPage } from '../pages/Weather/HourlyForecastPage';
import { DailyForecastPage } from '../pages/Weather/DailyForecastPage';
import { NavbarCitySearch } from '../components/NavbarCitySearch';
import { Heart, Bell, StickyNote, User, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { saveAuthUser } from '../services/authService';
import toast from 'react-hot-toast';

function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    // Show loading spinner while checking authentication
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-slate-100 text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                    <p className="text-sm text-slate-400">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={ { from: location } } />;
    }

    return children;
}

function RootLayout() {
    const { user, isAuthenticated, isAdmin, logout, loading } = useAuth();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    console.log('🎨 RootLayout render:', { loading, isAuthenticated, user: user?.username, path: location.pathname });

    // Handle OAuth2 callback in RootLayout
    useEffect(() => {
        const authStatus = searchParams.get('auth');
        const dataParam = searchParams.get('data');
        const errorMessage = searchParams.get('message');

        if (authStatus === 'error') {
            const message = errorMessage || 'Đăng nhập thất bại';

            if (message.includes('No account found') || message.includes('Please register first')) {
                toast.error('Tài khoản chưa được đăng ký. Vui lòng đăng ký trước!', {
                    duration: 5000,
                    icon: '⚠️',
                });
            } else {
                toast.error(message);
            }

            setSearchParams({});
            return;
        }

        if (authStatus === 'success' && dataParam) {
            try {
                const authData = JSON.parse(decodeURIComponent(dataParam));
                console.log('OAuth Auth Data:', authData);

                // Save user data and token to localStorage
                saveAuthUser(authData);

                const username = authData.username || authData.email || 'User';
                toast.success(`Chào mừng ${username}! 🎉`);

                // Clear query params and reload
                setSearchParams({});
                setTimeout(() => {
                    window.location.href = '/weather';
                }, 1000);
            } catch (err) {
                console.error('OAuth callback error:', err);
                toast.error('Lỗi xử lý dữ liệu người dùng');
                setSearchParams({});
            }
            return;
        }
    }, [searchParams, setSearchParams]);

    const isLogin = location.pathname === '/login';
    const isRegister = location.pathname === '/register';

    // Show loading spinner while checking authentication
    if (loading) {
        console.log('⏳ Showing loading spinner');
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-slate-100 text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                    <p className="text-sm text-slate-400">Loading...</p>
                </div>
            </div>
        );
    }

    // Navigation items for authenticated users
    const navItems = [
        { to: '/weather', label: 'Weather', icon: '🌤️' },
        { to: '/favorites', label: 'Favorites', icon: Heart },
        { to: '/alerts', label: 'Alerts', icon: Bell },
        { to: '/notes', label: 'Notes', icon: StickyNote },
    ];

    // Handle city selection from navbar
    const handleCitySelect = (selectedCity) => {
        if (selectedCity && selectedCity.name) {
            // Save city to localStorage (done in NavbarCitySearch)
            // Reload page to update weather
            setTimeout(() => {
                window.location.reload();
            }, 100);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/80 backdrop-blur">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 lg:px-6">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="flex items-center gap-2">
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-blue-500/20 text-sm font-semibold text-blue-300">
                                W
                            </span>
                            <div>
                                <p className="text-sm font-semibold">Weather </p>
                            </div>
                        </Link>

                        {/* City Search in Navbar */ }
                        <NavbarCitySearch onCitySelect={ handleCitySelect } />
                    </div>

                    {/* Navigation Menu - Only show when authenticated on large screens */ }
                    { isAuthenticated && (
                        <nav className="hidden lg:flex items-center gap-2">
                            { navItems.map((item) => {
                                const Icon = typeof item.icon === 'string' ? null : item.icon;
                                const isActive = location.pathname === item.to;

                                return (
                                    <Link
                                        key={ item.to }
                                        to={ item.to }
                                        className={ `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${isActive
                                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/50'
                                            : 'text-slate-300 hover:bg-white/5 hover:text-white'
                                            }` }
                                    >
                                        { Icon ? <Icon className="w-4 h-4" /> : <span>{ item.icon }</span> }
                                        <span>{ item.label }</span>
                                    </Link>
                                );
                            }) }
                        </nav>
                    ) }

                    <div className="flex items-center gap-3 text-xs">
                        { !isAuthenticated ? (
                            <>
                                <Link
                                    to="/login"
                                    className={ `rounded-full border px-3 py-1 transition ${isLogin
                                        ? 'border-blue-400 bg-blue-500/20 text-blue-100'
                                        : 'border-white/20 text-slate-200 hover:border-white/40'
                                        }` }
                                >
                                    Đăng nhập
                                </Link>
                                <Link
                                    to="/register"
                                    className={ `rounded-full border px-3 py-1 transition ${isRegister
                                        ? 'border-emerald-400 bg-emerald-500/20 text-emerald-100'
                                        : 'border-white/20 text-slate-200 hover:border-white/40'
                                        }` }
                                >
                                    Đăng ký
                                </Link>
                            </>
                        ) : (
                            <div className="relative" ref={ dropdownRef }>
                                <button
                                    onClick={ () => setIsDropdownOpen(!isDropdownOpen) }
                                    className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-1 transition hover:bg-white/10 lg:px-3 lg:py-1.5"
                                >
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-xs font-semibold text-blue-300">
                                        { user?.username?.charAt(0)?.toUpperCase() }
                                    </div>
                                    <span className="hidden max-w-[100px] truncate text-sm font-medium text-slate-200 lg:block">
                                        { user?.username }
                                    </span>
                                    <ChevronDown size={ 14 } className={ `text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}` } />
                                </button>

                                { isDropdownOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-48 origin-top-right overflow-hidden rounded-xl border border-white/10 bg-slate-900 shadow-xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
                                        <div className="border-b border-white/10 px-4 py-3">
                                            <p className="truncate text-sm font-medium text-white">{ user?.username }</p>
                                            <p className="truncate text-xs text-slate-400">{ isAdmin ? 'Admin' : 'User' }</p>
                                        </div>
                                        <div className="p-1">
                                            <Link
                                                to="/profile"
                                                onClick={ () => setIsDropdownOpen(false) }
                                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
                                            >
                                                <User size={ 16 } />
                                                Profile
                                            </Link>
                                            { isAdmin && (
                                                <Link
                                                    to="/admin"
                                                    onClick={ () => setIsDropdownOpen(false) }
                                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
                                                >
                                                    <LayoutDashboard size={ 16 } />
                                                    Dashboard
                                                </Link>
                                            ) }
                                            <div className="my-1 border-t border-white/5"></div>
                                            <button
                                                onClick={ () => {
                                                    setIsDropdownOpen(false);
                                                    logout();
                                                } }
                                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
                                            >
                                                <LogOut size={ 16 } />
                                                Đăng xuất
                                            </button>
                                        </div>
                                    </div>
                                ) }
                            </div>
                        ) }
                    </div>
                </div>

                {/* Mobile Navigation - Only show when authenticated */ }
                { isAuthenticated && (
                    <div className="lg:hidden border-t border-white/10">
                        <div className="flex justify-around py-2 px-4">
                            { navItems.map((item) => {
                                const Icon = typeof item.icon === 'string' ? null : item.icon;
                                const isActive = location.pathname === item.to;

                                return (
                                    <Link
                                        key={ item.to }
                                        to={ item.to }
                                        className={ `flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-all ${isActive
                                            ? 'text-blue-300'
                                            : 'text-slate-400 hover:text-white'
                                            }` }
                                    >
                                        { Icon ? <Icon className="w-5 h-5" /> : <span className="text-lg">{ item.icon }</span> }
                                        <span>{ item.label }</span>
                                    </Link>
                                );
                            }) }
                        </div>
                    </div>
                ) }
            </header>

            <Outlet />
        </div>
    );
}

export function RootRoutes() {
    console.log('🔄 RootRoutes rendering');
    return (
        <Routes>
            <Route element={ <RootLayout /> }>
                <Route path="/login" element={ <LoginPage /> } />
                <Route path="/register" element={ <RegisterPage /> } />

                {/* OAuth2 Callback Routes - Backend sẽ redirect về đây */ }
                <Route path="/auth/callback/google" element={ <OAuth2CallbackPage /> } />
                <Route path="/auth/callback/github" element={ <OAuth2CallbackPage /> } />
                <Route path="/auth/callback/facebook" element={ <OAuth2CallbackPage /> } />

                {/* OAuth2 Callback Handler */ }
                <Route path="/callback" element={ <App /> } />


                {/* Admin Routes - Protected */ }
                <Route path="/admin" element={ <AdminRoute><DashboardPage /></AdminRoute> } />
                <Route path="/admin/cities" element={ <AdminRoute><CityManagementPage /></AdminRoute> } />
                <Route path="/admin/system-alerts" element={ <AdminRoute><SystemAlertsPage /></AdminRoute> } />

                {/* Main Weather Page */ }
                <Route path="/weather" element={ <WeatherPage /> } />

                {/* New Feature Routes - Tạm thời không cần login để test UI */ }
                <Route path="/favorites" element={ <FavoritesPage /> } />
                <Route path="/alerts" element={ <AlertsPage /> } />
                <Route path="/notes" element={ <NotesPage /> } />

                {/* Weather Forecast Routes */ }
                <Route path="/hourly" element={ <HourlyForecastPage /> } />
                <Route path="/daily" element={ <DailyForecastPage /> } />

                {/* User Profile - Protected */ }
                <Route path="/profile" element={ <ProtectedRoute><ProfilePage /></ProtectedRoute> } />

                {/* Redirects */ }
                <Route path="/" element={ <Navigate to="/weather" replace /> } />
                <Route path="*" element={ <Navigate to="/weather" replace /> } />
            </Route>
        </Routes>
    );
}


