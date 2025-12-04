// OfflineBanner component - Hiển thị trạng thái offline

import { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export function OfflineBanner({ isOffline, wasOffline }) {
    const [showOnline, setShowOnline] = useState(false);

    useEffect(() => {
        if (wasOffline && !isOffline) {
            setShowOnline(true);
            const timer = setTimeout(() => {
                setShowOnline(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [wasOffline, isOffline]);

    if (!isOffline && !showOnline) {
        return null;
    }

    return (
        <div className="sticky top-0 z-50 w-full px-4">
            <div
                className={`mx-auto flex max-w-6xl items-center justify-center gap-2 rounded-2xl border ${isOffline
                    ? 'border-amber-500/40 bg-amber-500/20 text-amber-100'
                    : 'border-emerald-500/40 bg-emerald-500/20 text-emerald-100'
                    } px-4 py-3 text-sm font-semibold shadow-lg backdrop-blur animate-slideDown ${showOnline && !isOffline ? 'animate-fadeOut' : ''
                    }`}
            >
                {isOffline ? (
                    <>
                        <WifiOff className="h-4 w-4" />
                        <span>Đang offline · sử dụng dữ liệu đã cache</span>
                    </>
                ) : (
                    <>
                        <Wifi className="h-4 w-4" />
                        <span>Đã kết nối lại · đang đồng bộ dữ liệu mới</span>
                    </>
                )}
            </div>
        </div>
    );
}
