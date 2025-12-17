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
} from 'lucide-react';

export function DashboardPage() {
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8 px-4">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                        <BarChart3 size={36} className="text-blue-400" />
                        Admin Dashboard
                    </h1>
                    <p className="text-slate-400">
                        Tổng quan hệ thống và phân tích dữ liệu
                    </p>
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
            </div>
        </div>
    );
}
