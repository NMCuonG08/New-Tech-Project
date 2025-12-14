import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { User, Mail, Calendar, Shield, Key, Save, Camera, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

export function ProfilePage() {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        username: user?.username || '',
        email: user?.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdateProfile = (e) => {
        e.preventDefault();
        // TODO: Implement API call to update profile
        toast.success('Cập nhật thông tin thành công!');
        setIsEditing(false);
    };

    const handleChangePassword = (e) => {
        e.preventDefault();
        
        if (formData.newPassword !== formData.confirmPassword) {
            toast.error('Mật khẩu xác nhận không khớp!');
            return;
        }

        if (formData.newPassword.length < 6) {
            toast.error('Mật khẩu mới phải có ít nhất 6 ký tự!');
            return;
        }

        // TODO: Implement API call to change password
        toast.success('Đổi mật khẩu thành công!');
        setFormData({
            ...formData,
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8 px-4">
            <div className="mx-auto max-w-5xl">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        Thông Tin Cá Nhân
                    </h1>
                    <p className="text-slate-400">
                        Quản lý thông tin tài khoản của bạn
                    </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-sm">
                            <div className="flex flex-col items-center text-center">
                                {/* Avatar */}
                                <div className="relative mb-4">
                                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-4xl font-bold text-white">
                                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <button className="absolute bottom-0 right-0 rounded-full bg-blue-500 p-2 text-white shadow-lg hover:bg-blue-600 transition">
                                        <Camera size={16} />
                                    </button>
                                </div>

                                <h2 className="text-2xl font-bold text-white mb-1">
                                    {user?.username || 'User'}
                                </h2>
                                <p className="text-sm text-slate-400 mb-4">
                                    {user?.email || 'user@example.com'}
                                </p>

                                {/* Stats */}
                                <div className="w-full space-y-3 border-t border-white/10 pt-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-400 flex items-center gap-2">
                                            <Shield size={16} />
                                            Vai trò
                                        </span>
                                        <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-medium text-blue-300">
                                            {user?.role || 'User'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-400 flex items-center gap-2">
                                            <Calendar size={16} />
                                            Tham gia
                                        </span>
                                        <span className="text-slate-300 text-xs">
                                            {user?.createdAt 
                                                ? new Date(user.createdAt).toLocaleDateString('vi-VN')
                                                : 'N/A'
                                            }
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-400 flex items-center gap-2">
                                            <Activity size={16} />
                                            Trạng thái
                                        </span>
                                        <span className="text-emerald-400 text-xs font-medium">
                                            🟢 Hoạt động
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Info & Settings */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Personal Information */}
                        <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-sm">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                                    <User size={20} />
                                    Thông Tin Cá Nhân
                                </h3>
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className="text-sm text-blue-400 hover:text-blue-300 transition"
                                >
                                    {isEditing ? 'Hủy' : 'Chỉnh sửa'}
                                </button>
                            </div>

                            <form onSubmit={handleUpdateProfile} className="space-y-4">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-300">
                                        Tên người dùng
                                    </label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className="w-full rounded-lg border border-white/10 bg-slate-800/50 px-4 py-2.5 text-white placeholder-slate-500 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-300">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className="w-full rounded-lg border border-white/10 bg-slate-800/50 px-4 py-2.5 text-white placeholder-slate-500 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                </div>

                                {isEditing && (
                                    <button
                                        type="submit"
                                        className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2.5 font-medium text-white shadow-lg shadow-blue-500/30 transition hover:shadow-xl hover:shadow-blue-500/40 flex items-center justify-center gap-2"
                                    >
                                        <Save size={18} />
                                        Lưu thay đổi
                                    </button>
                                )}
                            </form>
                        </div>

                        {/* Change Password */}
                        <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-sm">
                            <h3 className="mb-4 text-xl font-semibold text-white flex items-center gap-2">
                                <Key size={20} />
                                Đổi Mật Khẩu
                            </h3>

                            <form onSubmit={handleChangePassword} className="space-y-4">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-300">
                                        Mật khẩu hiện tại
                                    </label>
                                    <input
                                        type="password"
                                        name="currentPassword"
                                        value={formData.currentPassword}
                                        onChange={handleInputChange}
                                        placeholder="Nhập mật khẩu hiện tại"
                                        className="w-full rounded-lg border border-white/10 bg-slate-800/50 px-4 py-2.5 text-white placeholder-slate-500 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-300">
                                        Mật khẩu mới
                                    </label>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        value={formData.newPassword}
                                        onChange={handleInputChange}
                                        placeholder="Nhập mật khẩu mới"
                                        className="w-full rounded-lg border border-white/10 bg-slate-800/50 px-4 py-2.5 text-white placeholder-slate-500 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-300">
                                        Xác nhận mật khẩu mới
                                    </label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        placeholder="Nhập lại mật khẩu mới"
                                        className="w-full rounded-lg border border-white/10 bg-slate-800/50 px-4 py-2.5 text-white placeholder-slate-500 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 px-4 py-2.5 font-medium text-white shadow-lg shadow-purple-500/30 transition hover:shadow-xl hover:shadow-purple-500/40 flex items-center justify-center gap-2"
                                >
                                    <Key size={18} />
                                    Đổi mật khẩu
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
