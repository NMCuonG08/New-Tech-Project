import { X, Clock, MapPin, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAlerts } from '../../hooks/useAlerts';

const ALERT_ICONS = {
  rain: '🌧️',
  temp_high: '🔥',
  temp_low: '❄️',
  aqi: '😷',
  wind: '💨'
};

const SEVERITY_COLORS = {
  low: 'bg-blue-500/10 border-blue-500/30',
  medium: 'bg-orange-500/10 border-orange-500/30',
  high: 'bg-red-500/10 border-red-500/30'
};

export const AlertHistoryDrawer = ({ isOpen, onClose }) => {
  const { alerts, unreadCount, markAsRead, markAllAsRead, deleteAlert, clearHistory } = useAlerts();

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const groupedAlerts = alerts.reduce((groups, alert) => {
    const date = new Date(alert.timestamp).toDateString();
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    let label = date;
    if (date === today) label = 'Today';
    else if (date === yesterday) label = 'Yesterday';

    if (!groups[label]) groups[label] = [];
    groups[label].push(alert);
    return groups;
  }, {});

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Drawer */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-md h-full bg-slate-900 shadow-2xl border-l border-white/10 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div>
              <h2 className="text-xl font-semibold text-white">Alert History</h2>
              {unreadCount > 0 && (
                <p className="text-sm text-slate-400 mt-1">
                  {unreadCount} unread alert{unreadCount > 1 ? 's' : ''}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Actions */}
          {alerts.length > 0 && (
            <div className="flex gap-2 p-4 border-b border-white/10">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors text-sm"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark all read
                </button>
              )}
              <button
                onClick={clearHistory}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors text-sm"
              >
                <X className="w-4 h-4" />
                Clear history
              </button>
            </div>
          )}

          {/* Alert List */}
          <div className="flex-1 overflow-y-auto">
            {alerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="text-6xl mb-4">🔕</div>
                <h3 className="text-lg font-medium text-white mb-2">No alerts yet</h3>
                <p className="text-sm text-slate-400">
                  You'll see weather alerts here when conditions match your rules
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-6">
                {Object.entries(groupedAlerts).map(([dateLabel, dateAlerts]) => (
                  <div key={dateLabel}>
                    <h3 className="text-sm font-medium text-slate-400 mb-3 px-2">
                      {dateLabel}
                    </h3>
                    <div className="space-y-2">
                      {dateAlerts.map((alert) => (
                        <motion.div
                          key={alert.id}
                          layout
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className={`relative rounded-xl border p-4 ${
                            SEVERITY_COLORS[alert.severity]
                          } ${alert.isRead ? 'opacity-60' : ''}`}
                        >
                          {/* Unread Indicator */}
                          {!alert.isRead && (
                            <div className="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full" />
                          )}

                          <div className="flex items-start gap-3">
                            <div className="text-2xl">{ALERT_ICONS[alert.type]}</div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                <span className="font-medium text-white">{alert.city}</span>
                              </div>
                              
                              <p className="text-sm text-slate-300 mb-2">
                                {alert.message}
                              </p>
                              
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-400">
                                  {alert.currentValue} (threshold: {alert.threshold})
                                </span>
                                <div className="flex items-center gap-1 text-slate-500">
                                  <Clock className="w-3 h-3" />
                                  {formatTime(alert.timestamp)}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 mt-3 pt-3 border-t border-white/10">
                            {!alert.isRead && (
                              <button
                                onClick={() => markAsRead(alert.id)}
                                className="text-xs text-blue-400 hover:text-blue-300"
                              >
                                Mark as read
                              </button>
                            )}
                            <button
                              onClick={() => deleteAlert(alert.id)}
                              className="text-xs text-red-400 hover:text-red-300 ml-auto"
                            >
                              Delete
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
