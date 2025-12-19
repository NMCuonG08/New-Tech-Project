import { Edit, Trash2, MapPin, Globe, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export const LocationTable = ({ locations, loading, onEdit, onDelete }) => {
    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
                <p className="text-slate-400">Đang tải dữ liệu...</p>
            </div>
        );
    }

    if (!locations || locations.length === 0) {
        return (
            <div className="text-center py-12 text-slate-400">
                <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Không tìm thấy location nào</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-white/10 text-left">
                        <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase">ID</th>
                        <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase">Tên</th>
                        <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase">Tỉnh/Thành</th>
                        <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase">Quốc gia</th>
                        <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase">Timezone</th>
                        <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase">Mô tả</th>
                        <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase text-right">Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    { locations.map((location, index) => (
                        <motion.tr
                            key={ location.id }
                            initial={ { opacity: 0, y: 10 } }
                            animate={ { opacity: 1, y: 0 } }
                            transition={ { delay: index * 0.03 } }
                            className="border-b border-white/5 hover:bg-white/5 transition-colors"
                        >
                            <td className="px-4 py-4 text-slate-500 text-sm">
                                #{ location.id }
                            </td>
                            <td className="px-4 py-4">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-blue-400" />
                                    <span className="font-medium text-white">{ location.name }</span>
                                </div>
                            </td>
                            <td className="px-4 py-4 text-slate-300">
                                { location.province || <span className="text-slate-500">—</span> }
                            </td>
                            <td className="px-4 py-4">
                                <div className="flex items-center gap-1.5">
                                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="text-slate-300">{ location.countryCode || 'VN' }</span>
                                </div>
                            </td>
                            <td className="px-4 py-4">
                                { location.timezone ? (
                                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                        <Clock className="w-3.5 h-3.5" />
                                        { location.timezone }
                                    </div>
                                ) : (
                                    <span className="text-slate-500 text-xs">—</span>
                                ) }
                            </td>
                            <td className="px-4 py-4">
                                <p className="text-sm text-slate-400 max-w-[200px] truncate">
                                    { location.description || <span className="text-slate-500">—</span> }
                                </p>
                            </td>
                            <td className="px-4 py-4">
                                <div className="flex items-center justify-end gap-2">
                                    <button
                                        onClick={ () => onEdit(location) }
                                        className="p-2 rounded-lg hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 transition-colors"
                                        title="Sửa"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={ () => onDelete(location.id) }
                                        className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                                        title="Xóa"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </motion.tr>
                    )) }
                </tbody>
            </table>
        </div>
    );
};
