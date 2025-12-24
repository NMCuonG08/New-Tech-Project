import { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, AlertTriangle, Info, AlertCircle, Zap, RefreshCw } from 'lucide-react';
import { BroadcastAlertModal } from '../../components/admin/BroadcastAlertModal';
import { useWebSocketContext } from '../../contexts/WebSocketContext';
import toast from 'react-hot-toast';
import apiClient from '../../configs/apiClient';

const SEVERITY_CONFIG = {
    info: { icon: Info, color: 'blue', label: 'Thông tin' },
    warning: { icon: AlertTriangle, color: 'yellow', label: 'Cảnh báo' },
    danger: { icon: AlertCircle, color: 'orange', label: 'Nguy hiểm' },
    critical: { icon: Zap, color: 'red', label: 'Khẩn cấp' },
};

export function SystemAlertsPage() {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { isConnected } = useWebSocketContext();

    const fetchAlerts = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/alerts/system/all');
            setAlerts(response.data.data || []);
        } catch (error) {
            console.error('Fetch alerts error:', error);
            toast.error('Không thể tải danh sách alerts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
    }, []);

    const handleDelete = async (id) => {
        if (!confirm('Bạn có chắc muốn xóa alert này?')) return;

        try {
            await apiClient.delete(`/alerts/system/${id}`);
            toast.success('Đã xóa alert');
            fetchAlerts();
        } catch (error) {
            console.error('Delete alert error:', error);
            toast.error('Không thể xóa alert');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */ }
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-500/20 rounded-xl">
                                <Bell className="w-8 h-8 text-blue-400" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white">System Alerts</h1>
                                <p className="text-sm text-slate-400">Quản lý thông báo realtime cho users</p>
                            </div>
                        </div>
                        <button
                            onClick={ () => setIsModalOpen(true) }
                            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-xl text-white font-medium transition shadow-lg shadow-blue-500/25"
                        >
                            <Plus className="w-5 h-5" />
                            <span className="hidden sm:inline">Broadcast Alert</span>
                        </button>
                    </div>

                    {/* Status Bar */ }
                    <div className="flex items-center gap-4 p-4 bg-slate-900/50 border border-white/10 rounded-xl backdrop-blur-sm">
                        <div className="flex items-center gap-2">
                            <div className={ `w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}` } />
                            <span className="text-sm text-slate-300">
                                WebSocket: <span className={ isConnected ? 'text-green-400' : 'text-red-400' }>
                                    { isConnected ? 'Connected' : 'Disconnected' }
                                </span>
                            </span>
                        </div>
                        <div className="h-4 w-px bg-white/10" />
                        <div className="flex items-center gap-2">
                            <Bell className="w-4 h-4 text-slate-400" />
                            <span className="text-sm text-slate-300">
                                { alerts.length } active alerts
                            </span>
                        </div>
                        <button
                            onClick={ fetchAlerts }
                            disabled={ loading }
                            className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-slate-300 text-sm transition"
                        >
                            <RefreshCw className={ `w-4 h-4 ${loading ? 'animate-spin' : ''}` } />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Alerts List */ }
                { loading && alerts.length === 0 ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-slate-400">Đang tải...</p>
                        </div>
                    </div>
                ) : alerts.length === 0 ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <Bell className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                            <p className="text-xl text-slate-400 mb-2">Chưa có alert nào</p>
                            <p className="text-sm text-slate-500">Tạo alert đầu tiên để broadcast cho users</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        { alerts.map((alert) => {
                            const config = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.info;
                            const Icon = config.icon;
                            const isExpired = alert.expiresAt && new Date(alert.expiresAt) < new Date();

                            return (
                                <div
                                    key={ alert.id }
                                    className={ `group p-6 bg-slate-900/50 border border-white/10 rounded-xl backdrop-blur-sm transition hover:border-${config.color}-500/50 ${isExpired ? 'opacity-50' : ''
                                        }` }
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={ `p-3 bg-${config.color}-500/20 rounded-xl flex-shrink-0` }>
                                            <Icon className={ `w-6 h-6 text-${config.color}-400` } />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4 mb-2">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="text-lg font-semibold text-white">
                                                            { alert.title }
                                                        </h3>
                                                        <span className={ `px-2 py-0.5 text-xs font-medium bg-${config.color}-500/20 text-${config.color}-400 rounded-full` }>
                                                            { config.label }
                                                        </span>
                                                        { isExpired && (
                                                            <span className="px-2 py-0.5 text-xs font-medium bg-red-500/20 text-red-400 rounded-full">
                                                                Expired
                                                            </span>
                                                        ) }
                                                    </div>
                                                    <p className="text-sm text-slate-300 whitespace-pre-wrap">
                                                        { alert.message }
                                                    </p>
                                                </div>

                                                <button
                                                    onClick={ () => handleDelete(alert.id) }
                                                    className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 rounded-lg text-red-400 transition opacity-0 group-hover:opacity-100"
                                                    title="Xóa alert"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-3">
                                                <span>Created: { formatDate(alert.createdAt) }</span>
                                                { alert.expiresAt && (
                                                    <>
                                                        <span>•</span>
                                                        <span>Expires: { formatDate(alert.expiresAt) }</span>
                                                    </>
                                                ) }
                                                <span>•</span>
                                                <span>ID: #{ alert.id }</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        }) }
                    </div>
                ) }
            </div>

            {/* Broadcast Modal */ }
            <BroadcastAlertModal
                isOpen={ isModalOpen }
                onClose={ () => setIsModalOpen(false) }
                onSuccess={ fetchAlerts }
            />
        </div>
    );
}
