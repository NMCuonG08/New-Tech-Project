import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    MapPin,
    Plus,
    Search,
    Globe,
    RefreshCw,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    BarChart3
} from 'lucide-react';
import { useLocations } from '../../hooks/useLocations';
import { LocationTable } from '../../components/admin/LocationTable';
import { AddLocationModal } from '../../components/admin/AddLocationModal';
import toast from 'react-hot-toast';

export function CityManagementPage() {
    const {
        locations,
        loading,
        error,
        pagination,
        fetchLocations,
        goToPage,
        setLimit,
        createLocation,
        updateLocation,
        deleteLocation,
        searchLocations,
        getStats,
    } = useLocations(10); // 10 items per page

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingLocation, setEditingLocation] = useState(null);

    // Debounce search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchQuery) { // Only search if there is a query, else let the hook handle reset or initial load
                searchLocations(searchQuery);
            } else {
                // When query is cleared, ensure we go back to normal view
                // But useLocations's searchLocations('') already calls fetchLocations, 
                // so just calling searchLocations('') is fine.
                searchLocations('');
            }
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchQuery, searchLocations]);

    const stats = getStats();

    const handleAdd = async (locationData) => {
        try {
            await createLocation(locationData);
            toast.success(`${locationData.name} đã được thêm!`);
            setIsAddModalOpen(false);
        } catch (err) {
            toast.error(err.message || 'Không thể thêm location');
        }
    };

    const handleEdit = async (id, locationData) => {
        try {
            await updateLocation(id, locationData);
            toast.success('Cập nhật thành công!');
            setEditingLocation(null);
        } catch (err) {
            toast.error(err.message || 'Không thể cập nhật');
        }
    };

    const handleDelete = async (id) => {
        const location = locations.find(l => l.id === id);
        if (confirm(`Bạn có chắc muốn xóa ${location?.name}?`)) {
            try {
                await deleteLocation(id);
                toast.success('Đã xóa thành công!');
            } catch (err) {
                toast.error(err.message || 'Không thể xóa');
            }
        }
    };

    const handleRefresh = () => {
        fetchLocations(pagination.page, pagination.limit);
        toast.success('Đã làm mới dữ liệu!');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8 px-4">
            <div className="mx-auto max-w-7xl">
                {/* Header */ }
                {/* Header with Tabs */ }
                <div className="mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-2">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white flex items-center gap-2 sm:gap-3">
                            <MapPin size={ 28 } className="text-blue-400 sm:w-9 sm:h-9" />
                            <span className="hidden sm:inline">City Management</span>
                            <span className="sm:hidden">Cities</span>
                        </h1>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-400 mb-4 sm:mb-6">
                        Quản lý danh sách thành phố trong hệ thống
                    </p>

                    {/* Navigation */ }
                    <div className="flex gap-2 border-b border-white/10">
                        <Link
                            to="/admin"
                            className="px-4 py-2 text-sm font-medium transition-colors text-slate-400 hover:text-white"
                        >
                            <div className="flex items-center gap-2">
                                <BarChart3 className="w-4 h-4" />
                                Overview
                            </div>
                        </Link>
                        <div className="px-4 py-2 text-sm font-medium text-blue-400 border-b-2 border-blue-400">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                City Management
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */ }
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
                    <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4 backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <Globe className="w-5 h-5 text-blue-400" />
                            <p className="text-sm text-slate-400">Tổng số Locations</p>
                        </div>
                        <p className="text-2xl font-bold text-white">{ stats.total }</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4 backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <MapPin className="w-5 h-5 text-purple-400" />
                            <p className="text-sm text-slate-400">Số quốc gia</p>
                        </div>
                        <p className="text-2xl font-bold text-purple-400">{ stats.countries }</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-slate-900/50 p-4 backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <RefreshCw className={ `w-5 h-5 text-green-400 ${loading ? 'animate-spin' : ''}` } />
                            <p className="text-sm text-slate-400">Trạng thái</p>
                        </div>
                        <p className="text-2xl font-bold text-green-400">
                            { loading ? 'Đang tải...' : 'Sẵn sàng' }
                        </p>
                    </div>
                </div>

                {/* Error Alert */ }
                { error && (
                    <div className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400" />
                        <p className="text-red-300">{ error }</p>
                        <button
                            onClick={ handleRefresh }
                            className="ml-auto px-3 py-1 text-sm bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-300 transition"
                        >
                            Thử lại
                        </button>
                    </div>
                ) }

                {/* Main Content */ }
                <div className="rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-sm">
                    {/* Toolbar */ }
                    <div className="p-6 border-b border-white/10">
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                    <MapPin className="w-5 h-5" />
                                    Danh sách Locations
                                </h2>
                                <p className="text-sm text-slate-400 mt-1">
                                    Trang { pagination.page } / { pagination.totalPages } ({ pagination.total } items)
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={ handleRefresh }
                                    disabled={ loading }
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 transition-colors disabled:opacity-50"
                                >
                                    <RefreshCw className={ `w-4 h-4 ${loading ? 'animate-spin' : ''}` } />
                                    Refresh
                                </button>
                                <button
                                    onClick={ () => setIsAddModalOpen(true) }
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Thêm mới
                                </button>
                            </div>
                        </div>

                        {/* Search Bar */ }
                        <div className="mt-4 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                value={ searchQuery }
                                onChange={ (e) => setSearchQuery(e.target.value) }
                                placeholder="Tìm kiếm theo tên, tỉnh, quốc gia..."
                                className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-white/10 rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>
                    </div>

                    {/* Table */ }
                    <div className="p-6">
                        <LocationTable
                            locations={ locations }
                            loading={ loading }
                            onEdit={ (location) => setEditingLocation(location) }
                            onDelete={ handleDelete }
                        />
                    </div>

                    {/* Pagination */ }
                    { pagination.totalPages > 1 && (
                        <div className="p-4 border-t border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-slate-400">Hiển thị:</span>
                                <select
                                    value={ pagination.limit }
                                    onChange={ (e) => setLimit(Number(e.target.value)) }
                                    className="bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
                                >
                                    <option value={ 5 }>5</option>
                                    <option value={ 10 }>10</option>
                                    <option value={ 20 }>20</option>
                                    <option value={ 50 }>50</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={ () => goToPage(pagination.page - 1) }
                                    disabled={ pagination.page <= 1 || loading }
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Trước
                                </button>

                                <div className="flex items-center gap-1">
                                    { [...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                                        let pageNum;
                                        if (pagination.totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (pagination.page <= 3) {
                                            pageNum = i + 1;
                                        } else if (pagination.page >= pagination.totalPages - 2) {
                                            pageNum = pagination.totalPages - 4 + i;
                                        } else {
                                            pageNum = pagination.page - 2 + i;
                                        }

                                        return (
                                            <button
                                                key={ pageNum }
                                                onClick={ () => goToPage(pageNum) }
                                                disabled={ loading }
                                                className={ `w-8 h-8 rounded-lg text-sm font-medium transition ${pagination.page === pageNum
                                                    ? 'bg-blue-500 text-white'
                                                    : 'text-slate-300 hover:bg-white/10'
                                                    }` }
                                            >
                                                { pageNum }
                                            </button>
                                        );
                                    }) }
                                </div>

                                <button
                                    onClick={ () => goToPage(pagination.page + 1) }
                                    disabled={ pagination.page >= pagination.totalPages || loading }
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Sau
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ) }
                </div>
            </div>

            {/* Add Modal */ }
            <AddLocationModal
                isOpen={ isAddModalOpen }
                onClose={ () => setIsAddModalOpen(false) }
                onSubmit={ handleAdd }
            />

            {/* Edit Modal */ }
            { editingLocation && (
                <AddLocationModal
                    isOpen={ true }
                    onClose={ () => setEditingLocation(null) }
                    onSubmit={ (data) => handleEdit(editingLocation.id, data) }
                    initialData={ editingLocation }
                    isEdit={ true }
                />
            ) }
        </div>
    );
}
