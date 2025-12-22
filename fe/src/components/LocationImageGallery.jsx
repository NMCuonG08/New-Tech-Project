import { useLocationImages } from '../../hooks/useLocationImages';
import { useState } from 'react';
import { RefreshCw, Trash2 } from 'lucide-react';

/**
 * Example component demonstrating how to use useLocationImages hook
 * in other components besides WeatherPage
 */
export function LocationImageGallery({ locationName }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const {
        images,
        loading,
        error,
        refetch,
        clearCache,
        clearOldCaches,
    } = useLocationImages(locationName);

    const handlePrevious = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const handleClearCache = () => {
        clearCache();
        refetch(); // Fetch fresh data after clearing cache
    };

    const handleClearOldCaches = () => {
        const cleared = clearOldCaches();
        console.log(`Cleared ${cleared} expired caches`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="flex items-center gap-2 text-slate-400">
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    <span>Loading images from { images.length > 0 ? 'cache' : 'API' }...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-200">
                <p className="font-semibold">Error loading images:</p>
                <p className="text-sm">{ error }</p>
                <button
                    onClick={ refetch }
                    className="mt-2 rounded-lg bg-red-500/20 px-3 py-1 text-sm hover:bg-red-500/30"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (!images || images.length === 0) {
        return (
            <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-8 text-center">
                <p className="text-slate-400">No images found for { locationName }</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */ }
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-100">
                    { locationName } Gallery
                </h3>
                <div className="flex gap-2">
                    <button
                        onClick={ refetch }
                        className="flex items-center gap-1 rounded-lg bg-blue-500/20 px-3 py-1 text-sm text-blue-200 hover:bg-blue-500/30"
                        title="Force refresh (bypass cache)"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </button>
                    <button
                        onClick={ handleClearCache }
                        className="flex items-center gap-1 rounded-lg bg-red-500/20 px-3 py-1 text-sm text-red-200 hover:bg-red-500/30"
                        title="Clear cache for this location"
                    >
                        <Trash2 className="h-4 w-4" />
                        Clear Cache
                    </button>
                    <button
                        onClick={ handleClearOldCaches }
                        className="rounded-lg bg-amber-500/20 px-3 py-1 text-sm text-amber-200 hover:bg-amber-500/30"
                        title="Clear all expired caches"
                    >
                        Clean Old
                    </button>
                </div>
            </div>

            {/* Image Display */ }
            <div className="relative aspect-video overflow-hidden rounded-lg bg-slate-900">
                <img
                    src={ images[currentIndex] }
                    alt={ `${locationName} ${currentIndex + 1}` }
                    className="h-full w-full object-cover"
                />

                {/* Navigation Buttons */ }
                { images.length > 1 && (
                    <>
                        <button
                            onClick={ handlePrevious }
                            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                        >
                            ←
                        </button>
                        <button
                            onClick={ handleNext }
                            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                        >
                            →
                        </button>
                    </>
                ) }

                {/* Image Counter */ }
                <div className="absolute bottom-4 right-4 rounded-full bg-black/50 px-3 py-1 text-sm text-white">
                    { currentIndex + 1 } / { images.length }
                </div>
            </div>

            {/* Thumbnails */ }
            { images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                    { images.map((img, idx) => (
                        <button
                            key={ idx }
                            onClick={ () => setCurrentIndex(idx) }
                            className={ `flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${idx === currentIndex
                                    ? 'border-blue-500 scale-105'
                                    : 'border-transparent opacity-60 hover:opacity-100'
                                }` }
                        >
                            <img
                                src={ img }
                                alt={ `Thumbnail ${idx + 1}` }
                                className="h-16 w-24 object-cover"
                            />
                        </button>
                    )) }
                </div>
            ) }

            {/* Info */ }
            <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-3 text-xs text-slate-400">
                <p>
                    📸 { images.length } image{ images.length > 1 ? 's' : '' } loaded
                    from { loading ? 'API' : 'cache' }
                </p>
                <p className="mt-1">
                    💡 Images are cached for 24 hours. Click "Refresh" to force reload.
                </p>
            </div>
        </div>
    );
}
