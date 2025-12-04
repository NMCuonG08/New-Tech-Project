// InstallPrompt component - PWA install button

import { MonitorSmartphone } from 'lucide-react';

export function InstallPrompt({ isInstallable, isInstalled, onInstall }) {
    if (isInstalled || !isInstallable) {
        return null;
    }

    return (
        <div className="rounded-3xl border border-white/10 bg-linear-to-r from-blue-500/40 via-purple-500/30 to-pink-500/30 p-6 text-white shadow-xl backdrop-blur">
            <div className="flex flex-col items-center gap-4 text-center md:flex-row md:items-center md:justify-between md:text-left">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
                    <MonitorSmartphone className="h-7 w-7" />
                </div>
                <div className="flex-1 space-y-1">
                    <h4 className="text-lg font-semibold md:text-xl">Cài đặt Weather PWA</h4>
                    <p className="text-sm text-white/80">
                        Thêm ứng dụng vào màn hình chính để truy cập nhanh và trải nghiệm như app native.
                    </p>
                </div>
                <button
                    onClick={onInstall}
                    className="w-full rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-blue-600 shadow-lg transition-all duration-200 hover:shadow-2xl hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-white/60 md:w-auto"
                >
                    Cài đặt ngay
                </button>
            </div>
        </div>
    );
}
