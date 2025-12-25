import { useEffect } from 'react';
import { Bell, BellOff, Clock, CheckCircle, X, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWebSocketContext } from '../../contexts/WebSocketContext';
import { useAllAlerts } from '../../hooks/useAllAlerts';

const SEVERITY_CONFIG = {
  info: { icon: 'ℹ️', color: 'blue', label: 'Info', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  warning: { icon: '⚠️', color: 'yellow', label: 'Warning', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
  danger: { icon: '🔴', color: 'orange', label: 'Danger', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  critical: { icon: '🚨', color: 'red', label: 'Critical', bg: 'bg-red-500/10', border: 'border-red-500/30' },
};

const ALERT_TYPE_CONFIG = {
  WEATHER_WARNING: { icon: '🌧️', label: 'Weather Warning' },
  TEMPERATURE_EXTREME: { icon: '🌡️', label: 'Temperature Alert' },
  AIR_QUALITY: { icon: '💨', label: 'Air Quality' },
  SYSTEM: { icon: '📢', label: 'System Notification' },
};

export const AlertsPage = () => {
  const { isConnected } = useWebSocketContext();
  const {
    userAlerts,
    systemNotifications,
    allAlerts,
    loading,
    unreadCount,
    fetchUserAlerts,
    fetchSystemAlerts,
    addSystemNotification,
    markAsRead,
    markAllAsRead,
    deleteSystemNotification,
    deleteUserAlert,
    clearAllSystemNotifications,
  } = useAllAlerts();

  // Load user alerts AND system alerts on mount
  useEffect(() => {
    fetchUserAlerts();
    fetchSystemAlerts();
  }, [fetchUserAlerts, fetchSystemAlerts]);

  // Listen for system alerts from WebSocket
  useEffect(() => {
    const handleSystemAlert = (event) => {
      console.log('📢 AlertsPage received system_alert event:', event.detail);
      addSystemNotification(event.detail);
    };

    console.log('🎧 AlertsPage: Setting up system_alert listener');
    window.addEventListener('system_alert', handleSystemAlert);

    return () => {
      console.log('🔇 AlertsPage: Cleaning up system_alert listener');
      window.removeEventListener('system_alert', handleSystemAlert);
    };
  }, [addSystemNotification]);

  const handleDelete = (id, source) => {
    if (source === 'SYSTEM') {
      deleteSystemNotification(id);
    } else {
      deleteUserAlert(id);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */ }
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Bell className="w-8 h-8 text-blue-400" />
              Alerts & Notifications
            </h1>
            <p className="text-slate-400 mt-2">
              System notifications và weather alerts
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={ fetchUserAlerts }
              disabled={ loading }
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 border border-white/10 text-white hover:bg-slate-700 transition text-sm disabled:opacity-50"
            >
              <RefreshCw className={ `w-4 h-4 ${loading ? 'animate-spin' : ''}` } />
              Refresh
            </button>
            { systemNotifications.length > 0 && (
              <>
                { unreadCount > 0 && (
                  <button
                    onClick={ markAllAsRead }
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition text-sm"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark all
                  </button>
                ) }
                <button
                  onClick={ () => {
                    if (confirm('Clear all system notifications?')) {
                      clearAllSystemNotifications();
                    }
                  } }
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition text-sm"
                >
                  <X className="w-4 h-4" />
                  Clear
                </button>
              </>
            ) }
          </div>
        </div>

        {/* Connection Status */ }
        <div className="mb-6 p-4 rounded-xl bg-slate-800/50 border border-white/10 flex items-center gap-3">
          <div className={ `w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}` } />
          <div className="flex-1">

          </div>
          <div className="flex gap-3 text-xs">
            <div className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400">
              📢 { systemNotifications.length } System
            </div>
            <div className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400">
              🌤️ { userAlerts.length } Weather
            </div>
          </div>
        </div>

        {/* Alerts List */ }
        { loading && allAlerts.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-400">Loading alerts...</p>
            </div>
          </div>
        ) : allAlerts.length === 0 ? (
          <motion.div
            initial={ { opacity: 0, y: 20 } }
            animate={ { opacity: 1, y: 0 } }
            className="text-center py-20"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-800 mb-6">
              <BellOff className="w-10 h-10 text-slate-600" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">
              No alerts yet
            </h2>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              You'll receive notifications here from admins and weather alerts
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              { allAlerts.map((alert) => {
                const isSystem = alert.source === 'SYSTEM';
                const config = isSystem
                  ? SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.info
                  : ALERT_TYPE_CONFIG[alert.type] || ALERT_TYPE_CONFIG.WEATHER_WARNING;

                const severityForUser = alert.isActive === false ? SEVERITY_CONFIG.info : SEVERITY_CONFIG.warning;
                const finalConfig = isSystem ? config : severityForUser;

                return (
                  <motion.div
                    key={ `${alert.source}-${alert.id}` }
                    initial={ { opacity: 0, y: -10 } }
                    animate={ { opacity: 1, y: 0 } }
                    exit={ { opacity: 0, height: 0 } }
                    className={ `relative p-5 rounded-xl border backdrop-blur-sm transition-all ${finalConfig.bg} ${alert.isRead
                      ? `${finalConfig.border} opacity-60`
                      : `${finalConfig.border} shadow-lg`
                      }` }
                  >
                    {/* Badge */ }
                    <div className="absolute top-3 right-3 flex items-center gap-2">
                      <span className={ `px-2 py-0.5 text-xs font-medium rounded-full ${isSystem
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-purple-500/20 text-purple-400'
                        }` }>
                        { isSystem ? '📢 System' : '🌤️ Weather' }
                      </span>
                      { isSystem && !alert.isRead && (
                        <div className={ `w-2.5 h-2.5 bg-${finalConfig.color}-500 rounded-full animate-pulse` } />
                      ) }
                    </div>

                    <div className="flex items-start gap-4 mt-6">
                      <div className="text-3xl flex-shrink-0">
                        { isSystem ? finalConfig.icon : config.icon }
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          { isSystem && (
                            <span className={ `px-2 py-0.5 text-xs font-medium rounded-full bg-${finalConfig.color}-500/20 text-${finalConfig.color}-400` }>
                              { finalConfig.label }
                            </span>
                          ) }
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <Clock className="w-3 h-3" />
                            { formatTime(alert.receivedAt || alert.createdAt) }
                          </div>
                        </div>

                        <h3 className="text-lg font-semibold text-white mb-1">
                          { alert.title || `${config.label} - ${alert.location?.name || 'Unknown'}` }
                        </h3>
                        <p className="text-sm text-slate-300 whitespace-pre-wrap">
                          { alert.message || alert.description || 'No description' }
                        </p>

                        {/* User alert details */ }
                        { !isSystem && (
                          <div className="mt-3 text-xs text-slate-400 space-y-1">
                            <p>📍 Location: { alert.location?.name || 'N/A' }</p>
                            { alert.threshold && <p>⚡ Threshold: { alert.threshold }</p> }
                            <p>🔔 Status: { alert.isActive ? 'Active' : 'Inactive' }</p>
                          </div>
                        ) }

                        {/* Actions */ }
                        <div className="flex gap-3 mt-4 pt-3 border-t border-white/10">
                          { isSystem && !alert.isRead && (
                            <button
                              onClick={ () => markAsRead(alert.id) }
                              className="text-xs text-blue-400 hover:text-blue-300 transition"
                            >
                              Mark as read
                            </button>
                          ) }
                          <button
                            onClick={ () => handleDelete(alert.id, alert.source) }
                            className="text-xs text-red-400 hover:text-red-300 transition ml-auto"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              }) }
            </AnimatePresence>
          </div>
        ) }

        {/* Info */ }
        <div className="mt-8 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
          <p className="text-sm text-blue-300">
            💡 <strong>Real-time Updates:</strong> System notifications (📢) are sent by admins via broadcast.
            Weather alerts (🌤️) are your personal notifications based on weather conditions.
          </p>
        </div>
      </div>
    </div>
  );
};
