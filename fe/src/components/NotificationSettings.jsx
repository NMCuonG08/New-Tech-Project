import { useState } from 'react';
import { Bell, BellOff } from 'lucide-react';

export function NotificationSettings({
    permission,
    onSendPush,
    onRequestPermission,
}) {
    const [title, setTitle] = useState('Weather PWA');
    const [message, setMessage] = useState('Test notification from Weather App');
    const [sending, setSending] = useState(false);

    const handleSendTest = async () => {
        setSending(true);
        try {
            await onSendPush({ title, message });
        } catch (error) {
            console.error('Failed to send notification:', error);
            alert('Failed to send notification. Please check browser permissions.');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 text-slate-100 shadow-xl backdrop-blur">
            <div className="flex items-center gap-2">
                {permission === 'granted' ? (
                    <Bell className="h-5 w-5 text-green-400" />
                ) : (
                    <BellOff className="h-5 w-5 text-amber-400" />
                )}
                <h3 className="text-lg font-semibold">Browser Notifications</h3>
            </div>

            {permission === 'denied' ? (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3">
                    <p className="text-sm text-red-200">
                        Notifications are blocked. Please enable them in your browser settings.
                    </p>
                </div>
            ) : permission === 'default' ? (
                <div className="space-y-3">
                    <p className="text-sm text-amber-200">
                        Click the button below to enable notifications
                    </p>
                    <button
                        type="button"
                        onClick={onRequestPermission}
                        className="w-full rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-blue-600 transition"
                    >
                        Enable Notifications
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3">
                        <p className="text-sm text-green-200">
                            ✓ Notifications are enabled
                        </p>
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-xs text-slate-300">Test Notification</label>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Title"
                            className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm"
                        />
                        <input
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Message"
                            className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={handleSendTest}
                        disabled={sending}
                        className="w-full rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {sending ? 'Sending...' : 'Send Test Notification'}
                    </button>
                </div>
            )}
        </div>
    );
}
