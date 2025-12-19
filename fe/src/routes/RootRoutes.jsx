import { Navigate, Outlet, Route, Routes, useLocation, Link } from 'react-router-dom';
import App from '../App';
import { useAuth } from '../hooks/useAuth';
import { LoginPage } from '../pages/Auth/LoginPage';
import { RegisterPage } from '../pages/Auth/RegisterPage';
import { OAuth2CallbackPage } from '../pages/Auth/OAuth2CallbackPage';
import { ProfilePage } from '../pages/User/ProfilePage';
import { DashboardPage } from '../pages/Admin/DashboardPage';
import { CityManagementPage } from '../pages/Admin/CityManagementPage';
import { FavoritesPage } from '../pages/User/FavoritesPage';
import { AlertsPage } from '../pages/User/AlertsPage';
import { NotesPage } from '../pages/User/NotesPage';
import { WeatherPage } from '../pages/Weather/WeatherPage';
import { HourlyForecastPage } from '../pages/Weather/HourlyForecastPage';
import { DailyForecastPage } from '../pages/Weather/DailyForecastPage';
import { NavbarCitySearch } from '../components/NavbarCitySearch';
import { Heart, Bell, StickyNote } from 'lucide-react';

function ProtectedRoute({ children }) {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={ { from: location } } />;
    }

    return children;
}

function RootLayout() {
    const { user, isAuthenticated, logout } = useAuth();
    const location = useLocation();

    const isLogin = location.pathname === '/login';
    const isRegister = location.pathname === '/register';

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
                            <>
                                <Link
                                    to="/profile"
                                    className="rounded-full border border-white/20 px-2 lg:px-3 py-1 text-slate-200 hover:border-blue-400 hover:bg-blue-500/20 hover:text-blue-100 transition"
                                    title="Profile"
                                >
                                    👤<span className="hidden lg:inline"> Profile</span>
                                </Link>
                                <Link
                                    to="/admin"
                                    className="rounded-full border border-white/20 px-2 lg:px-3 py-1 text-slate-200 hover:border-purple-400 hover:bg-purple-500/20 hover:text-purple-100 transition"
                                    title="Dashboard"
                                >
                                    📊<span className="hidden lg:inline"> Dashboard</span>
                                </Link>
                                <div className="flex items-center gap-1.5 lg:gap-2 rounded-full bg-slate-900/70 px-2 lg:px-3 py-1 text-[11px] text-slate-200">
                                    <span className="max-w-[60px] lg:max-w-[100px] truncate font-medium">
                                        { user?.username }
                                    </span>
                                    <button
                                        type="button"
                                        onClick={ logout }
                                        className="rounded-full border border-white/20 px-1.5 lg:px-2 py-0.5 text-[10px] lg:text-[11px] text-slate-300 hover:border-white/40 hover:text-white"
                                    >
                                        <span className="hidden lg:inline">Đăng xuất</span>
                                        <span className="lg:hidden">X</span>
                                    </button>
                                </div>
                            </>
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

                {/* Protected Routes */ }
                <Route path="/profile" element={ <ProfilePage /> } />
                <Route path="/admin" element={ <DashboardPage /> } />
                <Route path="/admin/cities" element={ <CityManagementPage /> } />

                {/* Main Weather Page */ }
                <Route path="/weather" element={ <WeatherPage /> } />

                {/* New Feature Routes - Tạm thời không cần login để test UI */ }
                <Route path="/favorites" element={ <FavoritesPage /> } />
                <Route path="/alerts" element={ <AlertsPage /> } />
                <Route path="/notes" element={ <NotesPage /> } />

                {/* Weather Forecast Routes */ }
                <Route path="/hourly" element={ <HourlyForecastPage /> } />
                <Route path="/daily" element={ <DailyForecastPage /> } />

                {/* Redirects */ }
                <Route path="/" element={ <Navigate to="/weather" replace /> } />
                <Route path="*" element={ <Navigate to="/weather" replace /> } />
            </Route>
        </Routes>
    );
}


