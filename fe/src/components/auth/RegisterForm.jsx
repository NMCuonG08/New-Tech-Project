import { useState } from 'react';

export function RegisterForm({ onRegister, loading, error, onSwitchToLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username || !password) return;
        await onRegister({ username, password });
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-2xl backdrop-blur">
                <h1 className="mb-2 text-2xl font-semibold">Đăng ký</h1>
                <p className="mb-6 text-sm text-slate-400">
                    Tạo tài khoản để sử dụng ứng dụng thời tiết.
                </p>

                {error && (
                    <div className="mb-4 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-200">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">
                            Tên đăng nhập
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full rounded-2xl border border-white/15 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none ring-blue-500/0 transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/60"
                            placeholder="Nhập username"
                            autoComplete="username"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">
                            Mật khẩu
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-2xl border border-white/15 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none ring-blue-500/0 transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/60"
                            placeholder="••••••••"
                            autoComplete="new-password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-2 flex w-full items-center justify-center rounded-2xl bg-linear-to-r from-emerald-500 to-teal-500 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                    </button>
                </form>

                {onSwitchToLogin && (
                    <p className="mt-4 text-center text-xs text-slate-400">
                        Đã có tài khoản?{' '}
                        <button
                            type="button"
                            onClick={onSwitchToLogin}
                            className="font-semibold text-blue-400 hover:text-blue-300"
                        >
                            Đăng nhập
                        </button>
                    </p>
                )}
            </div>
        </div>
    );
}


