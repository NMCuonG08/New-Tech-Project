import { useState, useEffect, useRef } from 'react';
import { X, MapPin, Globe, Clock, FileText, Image, Upload, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AddLocationModal = ({ isOpen, onClose, onSubmit, initialData = null, isEdit = false }) => {
    const [formData, setFormData] = useState({
        name: '',
        province: '',
        countryCode: 'VN',
        timezone: 'Asia/Ho_Chi_Minh',
        description: '',
    });
    const [images, setImages] = useState([]); // Array of { preview: string, base64: string }
    const [existingImages, setExistingImages] = useState([]); // Existing image URLs
    const [errors, setErrors] = useState({});
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                province: initialData.province || '',
                countryCode: initialData.countryCode || 'VN',
                timezone: initialData.timezone || 'Asia/Ho_Chi_Minh',
                description: initialData.description || '',
            });
            setExistingImages(initialData.images || []);
            setImages([]);
        } else {
            setFormData({
                name: '',
                province: '',
                countryCode: 'VN',
                timezone: 'Asia/Ho_Chi_Minh',
                description: '',
            });
            setExistingImages([]);
            setImages([]);
        }
        setErrors({});
    }, [initialData, isOpen]);

    const validate = () => {
        const newErrors = {};
        if (!formData.name || formData.name.trim().length < 2) {
            newErrors.name = 'Tên phải có ít nhất 2 ký tự';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validate()) {
            setUploading(true);
            try {
                // Prepare data with new images as base64
                const submitData = {
                    ...formData,
                };

                // Only send new images if there are any
                if (images.length > 0) {
                    submitData.images = images.map(img => img.base64);
                }

                await onSubmit(submitData);
            } finally {
                setUploading(false);
            }
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files || []);

        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const base64 = event.target?.result;
                    if (base64) {
                        setImages(prev => [...prev, {
                            preview: URL.createObjectURL(file),
                            base64: base64,
                            name: file.name,
                        }]);
                    }
                };
                reader.readAsDataURL(file);
            }
        });

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = (index) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */ }
                <motion.div
                    initial={ { opacity: 0 } }
                    animate={ { opacity: 1 } }
                    exit={ { opacity: 0 } }
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={ onClose }
                />

                {/* Modal */ }
                <motion.div
                    initial={ { opacity: 0, scale: 0.95, y: 20 } }
                    animate={ { opacity: 1, scale: 1, y: 0 } }
                    exit={ { opacity: 0, scale: 0.95, y: 20 } }
                    className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl"
                >
                    {/* Header */ }
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-blue-400" />
                            { isEdit ? 'Sửa Location' : 'Thêm Location mới' }
                        </h2>
                        <button
                            onClick={ onClose }
                            className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Form */ }
                    <form onSubmit={ handleSubmit } className="space-y-4">
                        {/* Name */ }
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">
                                Tên thành phố *
                            </label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    value={ formData.name }
                                    onChange={ (e) => handleChange('name', e.target.value) }
                                    placeholder="VD: Hồ Chí Minh"
                                    className={ `w-full pl-10 pr-4 py-2.5 bg-slate-800 border ${errors.name ? 'border-red-500' : 'border-white/10'} rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition` }
                                />
                            </div>
                            { errors.name && <p className="mt-1 text-xs text-red-400">{ errors.name }</p> }
                        </div>

                        {/* Province */ }
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">
                                Tỉnh/Thành phố
                            </label>
                            <input
                                type="text"
                                value={ formData.province }
                                onChange={ (e) => handleChange('province', e.target.value) }
                                placeholder="VD: Thành phố Hồ Chí Minh"
                                className="w-full px-4 py-2.5 bg-slate-800 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition"
                            />
                        </div>

                        {/* Country Code & Timezone */ }
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">
                                    Mã quốc gia
                                </label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        value={ formData.countryCode }
                                        onChange={ (e) => handleChange('countryCode', e.target.value.toUpperCase()) }
                                        placeholder="VN"
                                        maxLength={ 5 }
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">
                                    Timezone
                                </label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        value={ formData.timezone }
                                        onChange={ (e) => handleChange('timezone', e.target.value) }
                                        placeholder="Asia/Ho_Chi_Minh"
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Description */ }
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">
                                Mô tả
                            </label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                <textarea
                                    value={ formData.description }
                                    onChange={ (e) => handleChange('description', e.target.value) }
                                    placeholder="Mô tả ngắn về thành phố..."
                                    rows={ 3 }
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition resize-none"
                                />
                            </div>
                        </div>

                        {/* Images */ }
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                <div className="flex items-center gap-2">
                                    <Image className="w-4 h-4" />
                                    Hình ảnh
                                </div>
                            </label>

                            {/* Existing Images */ }
                            { existingImages.length > 0 && (
                                <div className="mb-3">
                                    <p className="text-xs text-slate-400 mb-2">Ảnh hiện tại:</p>
                                    <div className="flex flex-wrap gap-2">
                                        { existingImages.map((url, index) => (
                                            <div key={ index } className="relative group">
                                                <img
                                                    src={ url }
                                                    alt={ `Existing ${index + 1}` }
                                                    className="w-20 h-20 object-cover rounded-lg border border-white/10"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={ () => removeExistingImage(index) }
                                                    className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        )) }
                                    </div>
                                </div>
                            ) }

                            {/* New Images Preview */ }
                            { images.length > 0 && (
                                <div className="mb-3">
                                    <p className="text-xs text-slate-400 mb-2">Ảnh mới:</p>
                                    <div className="flex flex-wrap gap-2">
                                        { images.map((img, index) => (
                                            <div key={ index } className="relative group">
                                                <img
                                                    src={ img.preview }
                                                    alt={ img.name }
                                                    className="w-20 h-20 object-cover rounded-lg border border-blue-500/50"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={ () => removeImage(index) }
                                                    className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        )) }
                                    </div>
                                </div>
                            ) }

                            {/* Upload Button */ }
                            <input
                                ref={ fileInputRef }
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={ handleFileSelect }
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={ () => fileInputRef.current?.click() }
                                className="flex items-center gap-2 px-4 py-2 border border-dashed border-white/20 rounded-lg text-slate-400 hover:text-white hover:border-blue-500 transition"
                            >
                                <Upload className="w-4 h-4" />
                                Chọn ảnh để upload
                            </button>
                            <p className="mt-1 text-xs text-slate-500">
                                Ảnh sẽ được upload lên Cloudinary khi lưu
                            </p>
                        </div>

                        {/* Actions */ }
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={ onClose }
                                className="flex-1 px-4 py-2.5 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 transition"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={ uploading }
                                className="flex-1 px-4 py-2.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                { uploading ? 'Đang lưu...' : (isEdit ? 'Cập nhật' : 'Thêm mới') }
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
