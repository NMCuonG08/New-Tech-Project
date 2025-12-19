import { useState } from 'react';
import { Plus, Bell, BellOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAlerts } from '../../hooks/useAlerts';
import { useWebSocket } from '../../hooks/useWebSocket';
import { CreateAlertModal } from '../../components/alerts/CreateAlertModal';
import { AlertRuleCard } from '../../components/alerts/AlertRuleCard';
import { AlertHistoryDrawer } from '../../components/alerts/AlertHistoryDrawer';
import toast from 'react-hot-toast';

export const AlertsPage = () => {
  const { 
    rules, 
    addRuleWithValidation, 
    removeRule, 
    updateRule, 
    toggleRule,
    unreadCount,
    getActiveRules
  } = useAlerts();
  
  const { isConnected, requestNotificationPermission, sendTestAlert } = useWebSocket();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);

  const activeRules = getActiveRules();

  const handleCreateAlert = (ruleData) => {
    const success = addRuleWithValidation(ruleData);
    if (success) {
      toast.success('Alert rule created successfully!');
    } else {
      toast.error('Failed to create alert rule');
    }
  };

  const handleToggleRule = (id) => {
    toggleRule(id);
    const rule = rules.find(r => r.id === id);
    if (rule) {
      toast.success(`Alert ${rule.isActive ? 'disabled' : 'enabled'}`);
    }
  };

  const handleDeleteRule = (id) => {
    if (confirm('Are you sure you want to delete this alert rule?')) {
      removeRule(id);
      toast.success('Alert rule deleted');
    }
  };

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      toast.success('Browser notifications enabled!');
    } else {
      toast.error('Notification permission denied');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Bell className="w-8 h-8 text-yellow-400" />
              Weather Alerts
            </h1>
            <p className="text-slate-400 mt-2">
              Get notified when weather conditions match your criteria
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="relative flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 border border-white/10 text-white hover:bg-slate-700 transition-colors"
            >
              <Bell className="w-4 h-4" />
              History
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold bg-red-500 text-white rounded-full">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Alert
            </button>
          </div>
        </div>

        {/* Connection Status */}
        <div className="mb-6 p-4 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
            <div>
              <p className="text-white font-medium">
                Real-time Alerts: {isConnected ? 'Connected' : 'Disconnected'}
              </p>
              <p className="text-xs text-slate-400">
                {isConnected 
                  ? 'You will receive instant notifications'
                  : 'Reconnecting to server...'
                }
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {'Notification' in window && Notification.permission !== 'granted' && (
              <button
                onClick={handleEnableNotifications}
                className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors text-sm"
              >
                Enable Notifications
              </button>
            )}
            {import.meta.env.DEV && (
              <button
                onClick={sendTestAlert}
                className="px-3 py-1.5 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors text-sm"
              >
                Test Alert
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        {rules.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-slate-800 border border-white/10">
              <p className="text-slate-400 text-sm mb-1">Total Rules</p>
              <p className="text-2xl font-bold text-white">{rules.length}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800 border border-white/10">
              <p className="text-slate-400 text-sm mb-1">Active</p>
              <p className="text-2xl font-bold text-green-400">{activeRules.length}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800 border border-white/10">
              <p className="text-slate-400 text-sm mb-1">Unread Alerts</p>
              <p className="text-2xl font-bold text-yellow-400">{unreadCount}</p>
            </div>
          </div>
        )}

        {/* Alert Rules List */}
        {rules.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-800 mb-6">
              <BellOff className="w-10 h-10 text-slate-600" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">
              No alert rules yet
            </h2>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              Create your first alert rule to get notified about important weather changes
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Your First Alert
            </button>
          </motion.div>
        ) : (
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">
              Alert Rules ({rules.length})
            </h2>
            <AnimatePresence>
              <div className="space-y-3">
                {rules.map((rule) => (
                  <AlertRuleCard
                    key={rule.id}
                    rule={rule}
                    onToggle={handleToggleRule}
                    onEdit={setEditingRule}
                    onDelete={handleDeleteRule}
                  />
                ))}
              </div>
            </AnimatePresence>
          </div>
        )}

        {/* Info */}
        <div className="mt-8 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
          <p className="text-sm text-yellow-300">
            ⚡ <strong>Real-time Monitoring:</strong> Weather conditions are checked every 5 minutes. 
            You'll receive instant notifications when any rule condition is met.
          </p>
        </div>
      </div>

      {/* Create Alert Modal */}
      <CreateAlertModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateAlert}
      />

      {/* Alert History Drawer */}
      <AlertHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />
    </div>
  );
};
