import { useState } from 'react';
import { Plus, Bell, BellOff, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAlerts } from '../../hooks/useAlerts';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useAuth } from '../../hooks/useAuth';
import { CreateAlertModal } from '../../components/alerts/CreateAlertModal';
import { AlertRuleCard } from '../../components/alerts/AlertRuleCard';
import { AlertHistoryDrawer } from '../../components/alerts/AlertHistoryDrawer';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export const AlertsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
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

  // Debug logging
  console.log('🔍 AlertsPage rendered');
  console.log('  - isAuthenticated:', isAuthenticated);
  console.log('  - user:', user?.username || 'guest');
  console.log('  - isConnected:', isConnected);
  console.log('  - sendTestAlert:', typeof sendTestAlert);
  console.log('  - rules count:', rules.length);
  console.log('  - Notification.permission:', 'Notification' in window ? Notification.permission : 'N/A');
  console.log('  - import.meta.env.DEV:', import.meta.env.DEV);

  const handleCreateAlert = async (ruleData) => {
    console.log('handleCreateAlert called with:', ruleData);
    const success = await addRuleWithValidation(ruleData);
    if (success) {
      toast.success('Alert rule created successfully!');
    } else {
      toast.error('Failed to create alert rule. Please try again.');
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
    console.log('');
    console.log('═══════════════════════════════════════');
    console.log('🔔 REQUESTING BROWSER NOTIFICATION PERMISSION');
    console.log('═══════════════════════════════════════');
    console.log('Current permission:', 'Notification' in window ? Notification.permission : 'N/A');
    
    if (!('Notification' in window)) {
      const msg = 'This browser does not support notifications';
      toast.error(msg);
      console.error('❌', msg);
      console.log('═══════════════════════════════════════');
      console.log('');
      return;
    }
    
    try {
      console.log('Calling Notification.requestPermission()...');
      const granted = await requestNotificationPermission();
      console.log('Permission result:', granted);
      
      if (granted === 'granted') {
        toast.success('✅ Browser notifications enabled!', { duration: 3000 });
        console.log('✅ Permission GRANTED');
        
        // Show a REAL browser notification immediately as proof
        console.log('Creating test browser notification...');
        setTimeout(() => {
          try {
            const testNotification = new Notification('✅ Browser Notifications Enabled!', {
              body: 'Success! You will now receive weather alerts as browser notifications.\n\nThis notification appeared in your Windows notification area.',
              icon: '/pwa-192x192.png',
              badge: '/pwa-192x192.png',
              requireInteraction: true, // Keep visible until dismissed
              tag: 'permission-granted',
              vibrate: [200, 100, 200]
            });
            
            testNotification.onclick = () => {
              console.log('✅ User clicked the permission granted notification');
              window.focus();
            };
            
            console.log('✅ Test browser notification created:', testNotification);
            console.log('✅ CHECK YOUR NOTIFICATION AREA (bottom-right on Windows)');
          } catch (error) {
            console.error('❌ Failed to show test notification:', error);
          }
        }, 500);
      } else {
        const msg = 'Notification permission denied - check browser settings';
        toast.error(msg);
        console.warn('⚠️', msg);
        console.warn('Permission value:', granted);
      }
      
      console.log('═══════════════════════════════════════');
      console.log('');
    } catch (error) {
      console.error('');
      console.error('═══════════════════════════════════════');
      console.error('❌ ERROR requesting notification permission');
      console.error('═══════════════════════════════════════');
      console.error('Error:', error);
      console.error('═══════════════════════════════════════');
      console.error('');
      toast.error('Failed to request notification permission');
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

        {/* Guest Mode Warning */}
        {!isAuthenticated && (
          <div className="mb-6 p-6 rounded-xl bg-yellow-500/10 border-2 border-yellow-500/30">
            <div className="flex items-start gap-4">
              <LogIn className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-yellow-300 mb-2">
                  Login Required for Real-Time Alerts
                </h3>
                <p className="text-slate-300 mb-4">
                  You're currently in guest mode. To create alert rules and receive real-time weather notifications, you need to log in.
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500 text-slate-900 font-medium hover:bg-yellow-400 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Log In to Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Connection Status */}
        {isAuthenticated && (
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
                {'Notification' in window && (
                  <p className="text-xs mt-1">
                    <span className="text-slate-500">Browser Notifications: </span>
                    <span className={`font-medium ${
                      Notification.permission === 'granted' ? 'text-green-400' : 
                      Notification.permission === 'denied' ? 'text-red-400' : 
                      'text-yellow-400'
                    }`}>
                      {Notification.permission === 'granted' ? '✓ Enabled' : 
                       Notification.permission === 'denied' ? '✗ Denied (check browser settings)' : 
                       '○ Not Set'}
                    </span>
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              {'Notification' in window && Notification.permission !== 'granted' && (
                <button
                  onClick={handleEnableNotifications}
                  className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors text-sm font-medium"
                >
                  🔔 Enable Browser Notifications
                </button>
              )}
              {'Notification' in window && Notification.permission === 'granted' && (
                <button
                  onClick={() => {
                    console.log('');
                    console.log('═══════════════════════════════════════');
                    console.log('🧪 BROWSER NOTIFICATION TEST - DIRECT');
                    console.log('═══════════════════════════════════════');
                    console.log('Creating native OS/browser notification...');
                    console.log('This should appear OUTSIDE the browser window');
                    console.log('Look at your Windows notification area!');
                    console.log('');
                    
                    try {
                      const notification = new Notification('🧪 Weather PWA - Browser Notification Test', {
                        body: 'SUCCESS! This is a REAL browser notification.\n\nIt should appear in your Windows notification center (bottom-right corner).\n\nThis proves browser notifications are working!',
                        icon: '/pwa-192x192.png',
                        badge: '/pwa-192x192.png',
                        requireInteraction: true, // Keep it visible until user dismisses
                        tag: 'test-browser-notification',
                        vibrate: [200, 100, 200],
                        silent: false
                      });
                      
                      notification.onclick = () => {
                        console.log('✅ User clicked the browser notification!');
                        window.focus();
                      };
                      
                      console.log('✅ Browser notification object created:', notification);
                      console.log('✅ Check your system notification area (Windows: bottom-right)');
                      console.log('═══════════════════════════════════════');
                      console.log('');
                      
                      toast.success('✅ Browser notification sent! Check your notification area!', {
                        duration: 5000
                      });
                    } catch (error) {
                      console.error('');
                      console.error('═══════════════════════════════════════');
                      console.error('❌ FAILED to create browser notification');
                      console.error('═══════════════════════════════════════');
                      console.error('Error:', error);
                      console.error('Error message:', error.message);
                      console.error('Error stack:', error.stack);
                      console.error('═══════════════════════════════════════');
                      console.error('');
                      
                      toast.error('❌ Failed: ' + error.message);
                    }
                  }}
                  className="px-4 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-colors text-sm font-medium"
                >
                  🔔 Test Browser Notification
                </button>
              )}
              <button
                onClick={sendTestAlert}
                disabled={!isConnected}
                className="px-3 py-1.5 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                title={!isConnected ? 'WebSocket not connected' : 'Send test via WebSocket'}
              >
                WebSocket Test
              </button>
            </div>
            </div>
          </div>
        )}

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
        <div className="mt-8 space-y-4">
          <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
            <p className="text-sm text-yellow-300">
              ⚡ <strong>Real-time Monitoring:</strong> Weather conditions are checked every 5 minutes. 
              You'll receive instant notifications when any rule condition is met.
            </p>
          </div>
          
          {isAuthenticated && (
            <div className="p-6 rounded-xl bg-blue-500/10 border-2 border-blue-500/30">
              <h3 className="text-lg font-semibold text-blue-300 mb-3 flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Testing Browser Notifications
              </h3>
              <div className="space-y-3 text-sm text-slate-300">
                <p className="font-medium text-white">📋 How to test:</p>
                <ol className="list-decimal list-inside space-y-2 ml-2">
                  <li>
                    {Notification.permission === 'granted' ? (
                      <span className="text-green-400">✅ Notifications enabled</span>
                    ) : (
                      <span>Click <strong className="text-blue-400">"Enable Browser Notifications"</strong> button above</span>
                    )}
                  </li>
                  <li>Allow when browser asks for permission</li>
                  <li>Click <strong className="text-purple-400">"Test Browser Notification"</strong> button</li>
                  <li className="text-yellow-300">
                    <strong>Look at bottom-right corner of your screen</strong> - notification will appear there!
                  </li>
                </ol>
                <div className="mt-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                  <p className="text-xs text-slate-400 mb-1">💡 What you should see:</p>
                  <p className="text-xs">
                    A popup notification will appear in your <strong className="text-white">system notification center</strong> 
                    {' '}(Windows: bottom-right, Mac: top-right). It will show the Weather PWA icon and the test message.
                  </p>
                </div>
              </div>
            </div>
          )}
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
