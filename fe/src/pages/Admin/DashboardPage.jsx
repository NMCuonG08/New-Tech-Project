import { useState } from 'react';
import {
    Users,
    Activity,
    Cloud,
    TrendingUp,
    UserPlus,
    MessageSquare,
    BarChart3,
    PieChart,
    Calendar,
    AlertCircle,
    CheckCircle,
    Clock,
    Zap,
    MapPin,
    Plus,
    Search,
    Globe
} from 'lucide-react';
import { useAdminCities } from '../../hooks/useAdminCities';
import { AddCityModal } from '../../components/admin/AddCityModal';
import { CityManagementTable } from '../../components/admin/CityManagementTable';
import toast from 'react-hot-toast';

export function DashboardPage() {
    // City Management
    const { 
        cities, 
        addCityWithValidation, 
        deleteCity, 
        toggleCityStatus,
        getStats,
        searchCities
    } = useAdminCities();
    
    const [isAddCityModalOpen, setIsAddCityModalOpen] = useState(false);
    const [citySearchQuery, setCitySearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'cities'
    
    const cityStats = getStats();
    const displayedCities = citySearchQuery 
        ? searchCities(citySearchQuery)
        : cities;
    // Mock data - Backend sẽ thay thế bằng API
    const [stats] = useState({
        totalUsers: 1234,
        activeUsers: 856,
        weatherRequests: 45678,
        aiQueries: 3421,
        newUsersToday: 23,
        avgResponseTime: '1.2s',
    });

    const [recentUsers] = useState([
        { id: 1, username: 'john_doe', email: 'john@example.com', joinDate: '2024-12-10', status: 'active' },
        { id: 2, username: 'jane_smith', email: 'jane@example.com', joinDate: '2024-12-09', status: 'active' },
        { id: 3, username: 'bob_wilson', email: 'bob@example.com', joinDate: '2024-12-08', status: 'inactive' },
        { id: 4, username: 'alice_brown', email: 'alice@example.com', joinDate: '2024-12-07', status: 'active' },
        { id: 5, username: 'charlie_davis', email: 'charlie@example.com', joinDate: '2024-12-06', status: 'active' },
    ]);

    const [systemHealth] = useState({
        database: 'healthy',
        api: 'healthy',
        ai: 'warning',
        cache: 'healthy',
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'healthy':
                return 'text-emerald-400 bg-emerald-500/20';
            case 'warning':
                return 'text-yellow-400 bg-yellow-500/20';
            case 'error':
                return 'text-red-400 bg-red-500/20';
            default:
                return 'text-slate-400 bg-slate-500/20';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'healthy':
                return <CheckCircle size={16} />;
            case 'warning':
                return <AlertCircle size={16} />;
            case 'error':
                return <AlertCircle size={16} />;
            default:
                return <Clock size={16} />;
        }
    };

    const handleAddCity = (cityData) => {
        const success = addCityWithValidation(cityData);
        if (success) {
            toast.success(`${cityData.name} added successfully!`);
        } else {
            toast.error('Failed to add city. Please check the data.');
        }
    };

    const handleDeleteCity = (id) => {
        const city = cities.find(c => c.id === id);
        if (confirm(`Are you sure you want to delete ${city?.name}?`)) {
            deleteCity(id);
            toast.success('City deleted successfully');
        }
    };

    const handleToggleStatus = (id) => {
        const city = cities.find(c => c.id === id);
        toggleCityStatus(id);
        toast.success(`${city?.name} ${city?.isActive ? 'deactivated' : 'activated'}`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8 px-4">
            <div className="mx-auto max-w-7xl">
                {/* Header with Tabs */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                        <BarChart3 size={36} className="text-blue-400" />
                        Admin Dashboard
                    </h1>
                    <p className="text-slate-400 mb-6">
                        Tổng quan hệ thống và phân tích dữ liệu
                    </p>

                    {/* Tabs */}
                    <div className="flex gap-2 border-b border-white/10">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`px-4 py-2 text-sm font-medium transition-colors ${
                                activeTab === 'overview'
                                    ? 'text-blue-400 border-b-2 border-blue-400'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <BarChart3 className="w-4 h-4" />
                                Overview
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('cities')}
                            className={`px-4 py-2 text-sm font-medium transition-colors ${
                                activeTab === 'cities'
                                    ? 'text-blue-400 border-b-2 border-blue-400'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                City Management
                                <span className="px-1.5 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded">
                                    {cityStats.total}
                                </span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Total Users */}
                    <div className="group rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-6 backdrop-blur-sm transition hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/20">
                        <div className="flex items-center justify-between mb-3">
                            <div className="rounded-xl bg-blue-500/20 p-3 text-blue-400 group-hover:scale-110 transition">
                                <Users size={24} />
                            </div>
                            <TrendingUp size={20} className="text-emerald-400" />
                        </div>
                        <p className="text-3xl font-bold text-white mb-1">
                            {stats.totalUsers.toLocaleString()}
                        </p>
                        <p className="text-sm text-slate-400">Tổng người dùng</p>
                        <p className="mt-2 text-xs text-emerald-400">
                            +{stats.newUsersToday} hôm nay
                        </p>
                    </div>

                    {/* Active Users */}
                    <div className="group rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 p-6 backdrop-blur-sm transition hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/20">
                        <div className="flex items-center justify-between mb-3">
                            <div className="rounded-xl bg-emerald-500/20 p-3 text-emerald-400 group-hover:scale-110 transition">
                                <Activity size={24} />
                            </div>
                            <Zap size={20} className="text-yellow-400" />
                        </div>
                        <p className="text-3xl font-bold text-white mb-1">
                            {stats.activeUsers.toLocaleString()}
                        </p>
                        <p className="text-sm text-slate-400">Đang hoạt động</p>
                        <p className="mt-2 text-xs text-slate-500">
                            {((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}% tổng số
                        </p>
                    </div>

                    {/* Weather Requests */}
                    <div className="group rounded-2xl border border-white/10 bg-gradient-to-br from-purple-500/10 to-purple-600/5 p-6 backdrop-blur-sm transition hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20">
                        <div className="flex items-center justify-between mb-3">
                            <div className="rounded-xl bg-purple-500/20 p-3 text-purple-400 group-hover:scale-110 transition">
                                <Cloud size={24} />
                            </div>
                            <TrendingUp size={20} className="text-emerald-400" />
                        </div>
                        <p className="text-3xl font-bold text-white mb-1">
                            {stats.weatherRequests.toLocaleString()}
                        </p>
                        <p className="text-sm text-slate-400">Lượt tra cứu thời tiết</p>
                        <p className="mt-2 text-xs text-purple-400">
                            Hôm nay: {Math.floor(stats.weatherRequests / 30)}
                        </p>
                    </div>

                    {/* AI Queries */}
                    <div className="group rounded-2xl border border-white/10 bg-gradient-to-br from-orange-500/10 to-orange-600/5 p-6 backdrop-blur-sm transition hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/20">
                        <div className="flex items-center justify-between mb-3">
                            <div className="rounded-xl bg-orange-500/20 p-3 text-orange-400 group-hover:scale-110 transition">
                                <MessageSquare size={24} />
                            </div>
                            <Zap size={20} className="text-yellow-400" />
                        </div>
                        <p className="text-3xl font-bold text-white mb-1">
                            {stats.aiQueries.toLocaleString()}
                        </p>
                        <p className="text-sm text-slate-400">Câu hỏi AI</p>
                        <p className="mt-2 text-xs text-slate-500">
                            Avg: {stats.avgResponseTime}
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Recent Users Table */}
                    <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-sm">
                        <h3 className="mb-4 text-xl font-semibold text-white flex items-center gap-2">
                            <UserPlus size={20} />
                            Người Dùng Mới Nhất
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-white/10 text-xs uppercase text-slate-400">
                                    <tr>
                                        <th className="pb-3 font-medium">ID</th>
                                        <th className="pb-3 font-medium">Tên người dùng</th>
                                        <th className="pb-3 font-medium">Email</th>
                                        <th className="pb-3 font-medium">Ngày tham gia</th>
                                        <th className="pb-3 font-medium">Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {recentUsers.map((user) => (
                                        <tr key={user.id} className="group hover:bg-white/5 transition">
                                            <td className="py-3 text-slate-300">{user.id}</td>
                                            <td className="py-3 font-medium text-white">{user.username}</td>
                                            <td className="py-3 text-slate-400">{user.email}</td>
                                            <td className="py-3 text-slate-400">
                                                {new Date(user.joinDate).toLocaleDateString('vi-VN')}
                                            </td>
                                            <td className="py-3">
                                                <span
                                                    className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                                                        user.status === 'active'
                                                            ? 'bg-emerald-500/20 text-emerald-400'
                                                            : 'bg-slate-500/20 text-slate-400'
                                                    }`}
                                                >
                                                    {user.status === 'active' ? '🟢' : '⚫'}
                                                    {user.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <button className="mt-4 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10">
                            Xem tất cả người dùng
                        </button>
                    </div>

                    {/* System Health */}
                    <div className="space-y-6">
                        <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-sm">
                            <h3 className="mb-4 text-xl font-semibold text-white flex items-center gap-2">
                                <Activity size={20} />
                                Tình Trạng Hệ Thống
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-800/50 p-3">
                                    <span className="text-sm text-slate-300 flex items-center gap-2">
                                        Database
                                    </span>
                                    <span className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(systemHealth.database)}`}>
                                        {getStatusIcon(systemHealth.database)}
                                        {systemHealth.database}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-800/50 p-3">
                                    <span className="text-sm text-slate-300 flex items-center gap-2">
                                        API Server
                                    </span>
                                    <span className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(systemHealth.api)}`}>
                                        {getStatusIcon(systemHealth.api)}
                                        {systemHealth.api}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-800/50 p-3">
                                    <span className="text-sm text-slate-300 flex items-center gap-2">
                                        AI Service
                                    </span>
                                    <span className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(systemHealth.ai)}`}>
                                        {getStatusIcon(systemHealth.ai)}
                                        {systemHealth.ai}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-800/50 p-3">
                                    <span className="text-sm text-slate-300 flex items-center gap-2">
                                        Cache
                                    </span>
                                    <span className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(systemHealth.cache)}`}>
                                        {getStatusIcon(systemHealth.cache)}
                                        {systemHealth.cache}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-sm">
                            <h3 className="mb-4 text-xl font-semibold text-white flex items-center gap-2">
                                <Zap size={20} />
                                Thao Tác Nhanh
                            </h3>
                            <div className="space-y-2">
                                <button className="w-full rounded-lg bg-blue-500/20 px-4 py-2.5 text-sm font-medium text-blue-300 transition hover:bg-blue-500/30 flex items-center justify-center gap-2">
                                    <Users size={16} />
                                    Quản lý người dùng
                                </button>
                                <button className="w-full rounded-lg bg-purple-500/20 px-4 py-2.5 text-sm font-medium text-purple-300 transition hover:bg-purple-500/30 flex items-center justify-center gap-2">
                                    <BarChart3 size={16} />
                                    Xem báo cáo
                                </button>
                                <button className="w-full rounded-lg bg-emerald-500/20 px-4 py-2.5 text-sm font-medium text-emerald-300 transition hover:bg-emerald-500/30 flex items-center justify-center gap-2">
                                    <Activity size={16} />
                                    Kiểm tra logs
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* City Management Tab */}
                {activeTab === 'cities' && (
                    <div className="space-y-6">
                        {/* City Stats */}
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4 backdrop-blur-sm">
                                <div className="flex items-center gap-3 mb-2">
                                    <Globe className="w-5 h-5 text-blue-400" />
                                    <p className="text-sm text-slate-400">Total Cities</p>
                                </div>
                                <p className="text-2xl font-bold text-white">{cityStats.total}</p>
                            </div>
                            <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4 backdrop-blur-sm">
                                <div className="flex items-center gap-3 mb-2">
                                    <CheckCircle className="w-5 h-5 text-green-400" />
                                    <p className="text-sm text-slate-400">Active</p>
                                </div>
                                <p className="text-2xl font-bold text-green-400">{cityStats.active}</p>
                            </div>
                            <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4 backdrop-blur-sm">
                                <div className="flex items-center gap-3 mb-2">
                                    <AlertCircle className="w-5 h-5 text-slate-400" />
                                    <p className="text-sm text-slate-400">Inactive</p>
                                </div>
                                <p className="text-2xl font-bold text-slate-400">{cityStats.inactive}</p>
                            </div>
                            <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4 backdrop-blur-sm">
                                <div className="flex items-center gap-3 mb-2">
                                    <MapPin className="w-5 h-5 text-purple-400" />
                                    <p className="text-sm text-slate-400">Countries</p>
                                </div>
                                <p className="text-2xl font-bold text-purple-400">{cityStats.countries}</p>
                            </div>
                        </div>

                        {/* City Management Section */}
                        <div className="rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-sm">
                            {/* Toolbar */}
                            <div className="p-6 border-b border-white/10">
                                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                            <MapPin className="w-5 h-5" />
                                            Cities Database
                                        </h2>
                                        <p className="text-sm text-slate-400 mt-1">
                                            Manage cities available for user selection
                                        </p>
                                    </div>
                                    
                                    <button
                                        onClick={() => setIsAddCityModalOpen(true)}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add City
                                    </button>
                                </div>

                                {/* Search Bar */}
                                <div className="mt-4 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        value={citySearchQuery}
                                        onChange={(e) => setCitySearchQuery(e.target.value)}
                                        placeholder="Search cities by name or country..."
                                        className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-white/10 rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Table */}
                            <div className="p-6">
                                <CityManagementTable
                                    cities={displayedCities}
                                    onEdit={(city) => {
                                        toast('Edit feature coming soon!', { icon: '🚧' });
                                    }}
                                    onDelete={handleDeleteCity}
                                    onToggleStatus={handleToggleStatus}
                                />
                            </div>

                            {/* Info */}
                            <div className="p-4 border-t border-white/10 bg-blue-500/5">
                                <p className="text-xs text-blue-300">
                                    💡 <strong>Tip:</strong> Active cities will be available for users to select in the Favorites section. 
                                    Inactive cities are hidden from users but data is preserved.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Add City Modal */}
            <AddCityModal
                isOpen={isAddCityModalOpen}
                onClose={() => setIsAddCityModalOpen(false)}
                onSubmit={handleAddCity}
            />
        </div>
    );
}
