import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDashboard } from '../../hooks/useDashboard';
import {
    Users,
    Activity,
    Cloud,
    TrendingUp,
    UserPlus,
    MessageSquare,
    BarChart3,
    AlertCircle,
    CheckCircle,
    Clock,
    Zap,
    MapPin,
    RefreshCw,
    Loader2,
} from 'lucide-react';

export function DashboardPage() {
    const { stats, recentUsers, systemHealth, loading, error, refresh } = useDashboard();

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
                return <CheckCircle size={ 16 } />;
            case 'warning':
                return <AlertCircle size={ 16 } />;
            case 'error':
                return <AlertCircle size={ 16 } />;
            default:
                return <Clock size={ 16 } />;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-6 px-3 sm:py-8 sm:px-4">
            <div className="mx-auto max-w-7xl">
                {/* Header with Tabs */ }
                <div className="mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-2">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white flex items-center gap-2 sm:gap-3">
                            <BarChart3 size={ 28 } className="text-blue-400 sm:w-9 sm:h-9" />
                            <span className="hidden sm:inline">Admin Dashboard</span>
                            <span className="sm:hidden">Dashboard</span>
                        </h1>
                        <button
                            onClick={ refresh }
                            disabled={ loading }
                            className="flex items-center gap-2 rounded-lg bg-blue-500/20 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-blue-300 transition hover:bg-blue-500/30 disabled:opacity-50"
                        >
                            <RefreshCw size={ 14 } className={ `${loading ? 'animate-spin' : ''} sm:w-4 sm:h-4` } />
                            <span className="hidden sm:inline">Làm mới</span>
                            <span className="sm:hidden">Refresh</span>
                        </button>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-400 mb-4 sm:mb-6">
                        Tổng quan hệ thống và phân tích dữ liệu
                    </p>

                    {/* Navigation */ }
                    <div className="flex gap-2 border-b border-white/10">
                        <div className="px-4 py-2 text-sm font-medium text-blue-400 border-b-2 border-blue-400">
                            <div className="flex items-center gap-2">
                                <BarChart3 className="w-4 h-4" />
                                Overview
                            </div>
                        </div>
                        <Link
                            to="/admin/cities"
                            className="px-4 py-2 text-sm font-medium transition-colors text-slate-400 hover:text-white"
                        >
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                City Management
                                <span className="px-1.5 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded">
                                    →
                                </span>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Loading State */ }
                { loading && !stats && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 size={ 48 } className="animate-spin text-blue-400" />
                    </div>
                ) }

                {/* Error State */ }
                { error && (
                    <div className="rounded-2xl border border-red-500/50 bg-red-500/10 p-6 backdrop-blur-sm mb-8">
                        <p className="text-red-400">{ error }</p>
                    </div>
                ) }

                {/* Stats Grid */ }
                { stats && (
                    <div className="grid gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Total Users */ }
                    <div className="group rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-6 backdrop-blur-sm transition hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/20">
                        <div className="flex items-center justify-between mb-3">
                            <div className="rounded-xl bg-blue-500/20 p-3 text-blue-400 group-hover:scale-110 transition">
                                <Users size={ 24 } />
                            </div>
                            <TrendingUp size={ 20 } className="text-emerald-400" />
                        </div>
                        <p className="text-3xl font-bold text-white mb-1">
                            { stats.totalUsers.toLocaleString() }
                        </p>
                        <p className="text-sm text-slate-400">Tổng người dùng</p>
                        <p className="mt-2 text-xs text-emerald-400">
                            +{ stats.newUsersToday } hôm nay
                        </p>
                    </div>

                    {/* Active Users */ }
                    <div className="group rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 p-6 backdrop-blur-sm transition hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/20">
                        <div className="flex items-center justify-between mb-3">
                            <div className="rounded-xl bg-emerald-500/20 p-3 text-emerald-400 group-hover:scale-110 transition">
                                <Activity size={ 24 } />
                            </div>
                            <Zap size={ 20 } className="text-yellow-400" />
                        </div>
                        <p className="text-3xl font-bold text-white mb-1">
                            { stats.activeUsers.toLocaleString() }
                        </p>
                        <p className="text-sm text-slate-400">Đang hoạt động</p>
                        <p className="mt-2 text-xs text-slate-500">
                            { ((stats.activeUsers / stats.totalUsers) * 100).toFixed(1) }% tổng số
                        </p>
                    </div>

                    {/* Weather Requests */ }
                    <div className="group rounded-2xl border border-white/10 bg-gradient-to-br from-purple-500/10 to-purple-600/5 p-6 backdrop-blur-sm transition hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20">
                        <div className="flex items-center justify-between mb-3">
                            <div className="rounded-xl bg-purple-500/20 p-3 text-purple-400 group-hover:scale-110 transition">
                                <Cloud size={ 24 } />
                            </div>
                            <TrendingUp size={ 20 } className="text-emerald-400" />
                        </div>
                        <p className="text-3xl font-bold text-white mb-1">
                            { stats.weatherRequests.toLocaleString() }
                        </p>
                        <p className="text-sm text-slate-400">Lượt tra cứu thời tiết</p>
                        <p className="mt-2 text-xs text-purple-400">
                            Hôm nay: { Math.floor(stats.weatherRequests / 30) }
                        </p>
                    </div>

                    {/* AI Queries */ }
                    <div className="group rounded-2xl border border-white/10 bg-gradient-to-br from-orange-500/10 to-orange-600/5 p-6 backdrop-blur-sm transition hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/20">
                        <div className="flex items-center justify-between mb-3">
                            <div className="rounded-xl bg-orange-500/20 p-3 text-orange-400 group-hover:scale-110 transition">
                                <MessageSquare size={ 24 } />
                            </div>
                            <Zap size={ 20 } className="text-yellow-400" />
                        </div>
                        <p className="text-3xl font-bold text-white mb-1">
                            { stats.aiQueries.toLocaleString() }
                        </p>
                        <p className="text-sm text-slate-400">Câu hỏi AI</p>
                        <p className="mt-2 text-xs text-slate-500">
                            Avg: { stats.avgResponseTime }
                        </p>
                    </div>
                </div>
                ) }

                { stats && recentUsers && systemHealth && (
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Recent Users Table */ }
                    <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-sm">
                        <h3 className="mb-4 text-xl font-semibold text-white flex items-center gap-2">
                            <UserPlus size={ 20 } />
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
                                    { recentUsers.map((user) => (
                                        <tr key={ user.id } className="group hover:bg-white/5 transition">
                                            <td className="py-3 text-slate-300">{ user.id }</td>
                                            <td className="py-3 font-medium text-white">{ user.username }</td>
                                            <td className="py-3 text-slate-400">{ user.email }</td>
                                            <td className="py-3 text-slate-400">
                                                { new Date(user.joinDate).toLocaleDateString('vi-VN') }
                                            </td>
                                            <td className="py-3">
                                                <span
                                                    className={ `inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${user.status === 'active'
                                                        ? 'bg-emerald-500/20 text-emerald-400'
                                                        : 'bg-slate-500/20 text-slate-400'
                                                        }` }
                                                >
                                                    { user.status === 'active' ? '🟢' : '⚫' }
                                                    { user.status }
                                                </span>
                                            </td>
                                        </tr>
                                    )) }
                                </tbody>
                            </table>
                        </div>
                        <button className="mt-4 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10">
                            Xem tất cả người dùng
                        </button>
                    </div>

                    {/* System Health */ }
                    <div className="space-y-6">
                        <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-sm">
                            <h3 className="mb-4 text-xl font-semibold text-white flex items-center gap-2">
                                <Activity size={ 20 } />
                                Tình Trạng Hệ Thống
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-800/50 p-3">
                                    <span className="text-sm text-slate-300 flex items-center gap-2">
                                        Database
                                    </span>
                                    <span className={ `flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(systemHealth.database)}` }>
                                        { getStatusIcon(systemHealth.database) }
                                        { systemHealth.database }
                                    </span>
                                </div>
                                <div className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-800/50 p-3">
                                    <span className="text-sm text-slate-300 flex items-center gap-2">
                                        API Server
                                    </span>
                                    <span className={ `flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(systemHealth.api)}` }>
                                        { getStatusIcon(systemHealth.api) }
                                        { systemHealth.api }
                                    </span>
                                </div>
                                <div className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-800/50 p-3">
                                    <span className="text-sm text-slate-300 flex items-center gap-2">
                                        AI Service
                                    </span>
                                    <span className={ `flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(systemHealth.ai)}` }>
                                        { getStatusIcon(systemHealth.ai) }
                                        { systemHealth.ai }
                                    </span>
                                </div>
                                <div className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-800/50 p-3">
                                    <span className="text-sm text-slate-300 flex items-center gap-2">
                                        Cache
                                    </span>
                                    <span className={ `flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(systemHealth.cache)}` }>
                                        { getStatusIcon(systemHealth.cache) }
                                        { systemHealth.cache }
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */ }
                        <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-sm">
                            <h3 className="mb-4 text-xl font-semibold text-white flex items-center gap-2">
                                <Zap size={ 20 } />
                                Thao Tác Nhanh
                            </h3>
                            <div className="space-y-2">
                                <button className="w-full rounded-lg bg-blue-500/20 px-4 py-2.5 text-sm font-medium text-blue-300 transition hover:bg-blue-500/30 flex items-center justify-center gap-2">
                                    <Users size={ 16 } />
                                    Quản lý người dùng
                                </button>
                                <button className="w-full rounded-lg bg-purple-500/20 px-4 py-2.5 text-sm font-medium text-purple-300 transition hover:bg-purple-500/30 flex items-center justify-center gap-2">
                                    <BarChart3 size={ 16 } />
                                    Xem báo cáo
                                </button>
                                <button className="w-full rounded-lg bg-emerald-500/20 px-4 py-2.5 text-sm font-medium text-emerald-300 transition hover:bg-emerald-500/30 flex items-center justify-center gap-2">
                                    <Activity size={ 16 } />
                                    Kiểm tra logs
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                ) }
            </div>
        </div>
    );
}
