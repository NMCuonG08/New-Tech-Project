import { useState } from 'react'

export function NotificationSettings({
    permission,
    onSendPush,
}) {
    const [title, setTitle] = useState('Weather PWA')
    const [message, setMessage] = useState('Thông báo thử từ server push')

    return (
        <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 text-slate-100 shadow-xl backdrop-blur">
            <h3 className="text-lg font-semibold">Thông báo Push</h3>

            {permission !== 'granted' ? (
                <p className="text-sm text-amber-200">
                    Trình duyệt chưa cấp quyền thông báo hoặc đang chờ người dùng xác nhận.
                </p>
            ) : (
                <div className="flex flex-col gap-3">
                    <div className="space-y-2 text-sm">
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Tiêu đề"
                            className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2"
                        />
                        <input
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Nội dung"
                            className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={() => onSendPush({ title, message })}
                        className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-md"
                    >
                        Gửi push từ server
                    </button>
                </div>
            )}
        </div>
    )
}
