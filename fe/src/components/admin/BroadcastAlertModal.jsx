import { useState } from 'react';
import { X, Send, AlertTriangle, Info, AlertCircle, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../../configs/apiClient';

const SEVERITY_OPTIONS = [
    { value: 'info', label: 'Thông tin', icon: Info, color: 'blue' },
    { value: 'warning', label: 'Cảnh báo', icon: AlertTriangle, color: 'yellow' },
    { value: 'danger', label: 'Nguy hiểm', icon: AlertCircle, color: 'orange' },
    { value: 'critical', label: 'Khẩn cấp', icon: Zap, color: 'red' },
];

export function BroadcastAlertModal({ isOpen, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        severity: 'info',
        expiresAt: '',
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.trim() || !formData.message.trim()) {
            toast.error('Vui lòng điền đầy đủ thông tin');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                title: formData.title.trim(),
                message: formData.message.trim(),
                severity: formData.severity,
            };

            if (formData.expiresAt) {
                payload.expiresAt = new Date(formData.expiresAt).toISOString();
            }

            await apiClient.post('/alerts/system/broadcast', payload);

            toast.success('🚀 Alert đã được broadcast thành công!');

            // Reset form
            setFormData({
                title: '',
                message: '',
                severity: 'info',
                expiresAt: '',
            });

            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error('Broadcast alert error:', error);
            toast.error(error.response?.data?.message || 'Không thể gửi alert');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    if (!isOpen) return null;

    const selectedSeverity = SEVERITY_OPTIONS.find(opt => opt.value === formData.severity);
    const SeverityIcon = selectedSeverity?.icon || Info;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-slate-900 rounded-2xl border border-white/10 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */ }
                <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm border-b border-white/10 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <Send className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Broadcast System Alert</h2>
                            <p className="text-xs text-slate-400">Gửi thông báo realtime đến tất cả users</p>
                        </div>
                    </div>
                    <button
                        onClick={ onClose }
                        className="p-2 hover:bg-white/10 rounded-lg transition"
                    >
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                {/* Form */ }
                <form onSubmit={ handleSubmit } className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Severity Selection */ }
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-3">
                            Mức độ nghiêm trọng
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            { SEVERITY_OPTIONS.map((option) => {
                                const Icon = option.icon;
                                const isSelected = formData.severity === option.value;
                                return (
                                    <button
                                        key={ option.value }
                                        type="button"
                                        onClick={ () => handleChange('severity', option.value) }
                                        className={ `relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${isSelected
                                            ? `border-${option.color}-500 bg-${option.color}-500/20`
                                            : 'border-white/10 bg-white/5 hover:bg-white/10'
                                            }` }
                                    >
                                        <Icon className={ `w-6 h-6 ${isSelected ? `text-${option.color}-400` : 'text-slate-400'}` } />
                                        <span className={ `text-xs font-medium ${isSelected ? 'text-white' : 'text-slate-400'}` }>
                                            { option.label }
                                        </span>
                                        { isSelected && (
                                            <div className={ `absolute -top-1 -right-1 w-3 h-3 bg-${option.color}-500 rounded-full` } />
                                        ) }
                                    </button>
                                );
                            }) }
                        </div>
                    </div>

                    {/* Title */ }
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Tiêu đề *
                        </label>
                        <input
                            type="text"
                            value={ formData.title }
                            onChange={ (e) => handleChange('title', e.target.value) }
                            placeholder="Ví dụ: Cảnh báo thời tiết khẩn cấp"
                            className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            required
                        />
                    </div>

                    {/* Message */ }
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Nội dung *
                        </label>
                        <textarea
                            value={ formData.message }
                            onChange={ (e) => handleChange('message', e.target.value) }
                            placeholder="Nhập nội dung chi tiết của thông báo..."
                            rows={ 5 }
                            className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
                            required
                        />
                        <p className="mt-2 text-xs text-slate-500">
                            { formData.message.length } ký tự
                        </p>
                    </div>

                    {/* Expiration (Optional) */ }
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Hết hạn (tùy chọn)
                        </label>
                        <input
                            type="datetime-local"
                            value={ formData.expiresAt }
                            onChange={ (e) => handleChange('expiresAt', e.target.value) }
                            className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                        <p className="mt-2 text-xs text-slate-500">
                            Để trống nếu alert không có thời hạn
                        </p>
                    </div>

                    {/* Preview */ }
                    { (formData.title || formData.message) && (
                        <div className="p-4 bg-slate-800/50 border border-white/10 rounded-xl">
                            <p className="text-xs text-slate-400 mb-2 flex items-center gap-2">
                                <SeverityIcon className={ `w-4 h-4 text-${selectedSeverity?.color}-400` } />
                                Preview
                            </p>
                            <div className="space-y-1">
                                { formData.title && (
                                    <p className="font-semibold text-white">{ formData.title }</p>
                                ) }
                                { formData.message && (
                                    <p className="text-sm text-slate-300">{ formData.message }</p>
                                ) }
                            </div>
                        </div>
                    ) }

                    {/* Actions */ }
                    <div className="flex gap-3 pt-4 border-t border-white/10">
                        <button
                            type="button"
                            onClick={ onClose }
                            className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-300 font-medium transition"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={ loading || !formData.title.trim() || !formData.message.trim() }
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-xl text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            { loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Đang gửi...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    Broadcast Alert
                                </>
                            ) }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
