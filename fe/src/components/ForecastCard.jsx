// ForecastCard component - Hiển thị dự báo thời tiết

import { Umbrella, ArrowUp, ArrowDown, Thermometer } from 'lucide-react';
import { useState } from 'react';

const unitSymbolMap = {
    metric: '°C',
    imperial: '°F',
    kelvin: 'K',
};

export function ForecastCard({ forecast, loading, units = 'metric', backgroundImage = null }) {
    const [imageLoaded, setImageLoaded] = useState(false);

    if (loading && !forecast) {
        return (
            <div className="rounded-2xl sm:rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6 md:p-8 shadow-2xl backdrop-blur">
                <div className="mb-4 sm:mb-6 h-6 sm:h-7 w-36 sm:w-48 animate-pulse rounded-full bg-white/10" />
                <div className="flex gap-3 sm:gap-4 overflow-hidden">
                    { Array.from({ length: 4 }).map((_, index) => (
                        <div
                            key={ `forecast-skeleton-${index}` }
                            className="h-40 w-32 sm:h-48 sm:w-40 animate-pulse rounded-2xl sm:rounded-3xl bg-white/10"
                        />
                    )) }
                </div>
            </div>
        );
    }

    if (!forecast || !forecast.list) {
        return null;
    }

    const middayForecast = forecast.list.filter((item) =>
        item.dt_txt?.includes('12:00:00'),
    );
    const selection = (middayForecast.length ? middayForecast : forecast.list).slice(0, 7);
    const unitSymbol = unitSymbolMap[units] ?? '°';

    return (
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/20 shadow-2xl backdrop-blur-xl">
            {/* Background Image Layer */ }
            { backgroundImage && (
                <>
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
                        style={ {
                            backgroundImage: `url(${backgroundImage})`,
                            opacity: imageLoaded ? 0.3 : 0,
                        } }
                    />
                    <img
                        src={ backgroundImage }
                        alt=""
                        className="hidden"
                        onLoad={ () => setImageLoaded(true) }
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/70 to-slate-900/80" />
                </>
            ) }

            {/* Default Background */ }
            { !backgroundImage && (
                <div className="absolute inset-0 bg-slate-900/70" />
            ) }

            {/* Content Layer */ }
            <div className="relative z-10 p-4 sm:p-6 md:p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                    <div>
                        <h3 className="inline-flex items-center gap-2 sm:gap-3 text-base sm:text-lg md:text-xl font-semibold text-white">
                            <span className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 shadow-lg text-sm sm:text-base">
                                📅
                            </span>
                            <span className="hidden sm:inline">Dự báo 7 phiên tới</span>
                            <span className="sm:hidden">Dự báo 7 phiên</span>
                        </h3>
                        <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-slate-300">
                            Cập nhật mỗi 3 giờ · theo giờ địa phương
                        </p>
                    </div>
                    <span className="rounded-full bg-gradient-to-r from-purple-500/30 to-indigo-500/30 px-3 sm:px-4 py-1 sm:py-1.5 text-[10px] sm:text-xs uppercase tracking-wide text-purple-200 border border-purple-400/30">
                        24 giờ tới
                    </span>
                </div>

                <div className="mt-4 sm:mt-6 flex gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20">
                    { selection.map((item) => {
                        const temp = Math.round(item.main.temp);
                        const tempMax = Math.round(item.main.temp_max);
                        const tempMin = Math.round(item.main.temp_min);
                        const description = item.weather[0]?.description || 'N/A';
                        const icon = item.weather[0]?.icon || '01d';
                        const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;
                        const date = new Date(item.dt * 1000);
                        const dayName = date.toLocaleDateString('vi-VN', {
                            weekday: 'short',
                        });
                        const time = date.toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                        });
                        const rainChance = Math.round((item.pop || 0) * 100);

                        return (
                            <div
                                key={ `${item.dt}-${icon}` }
                                className="flex w-36 sm:w-40 md:w-44 flex-none flex-col gap-2 sm:gap-3 rounded-2xl sm:rounded-3xl border border-white/20 bg-gradient-to-br from-slate-800/90 to-slate-900/90 p-3 sm:p-4 text-slate-100 shadow-xl backdrop-blur-md hover:border-purple-400/40 hover:shadow-purple-500/10 transition-all duration-300"
                            >
                                <div className="flex items-center justify-between text-[10px] sm:text-xs uppercase tracking-wide text-slate-300">
                                    <span className="font-semibold">{ dayName }</span>
                                    <span>{ time }</span>
                                </div>
                                <img
                                    src={ iconUrl }
                                    alt={ description }
                                    className="mx-auto h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 drop-shadow-[0_18px_30px_rgba(0,0,0,0.25)]"
                                />
                                <div className="text-center">
                                    <p className="flex items-center justify-center gap-1.5 sm:gap-2 text-2xl sm:text-3xl font-semibold text-white">
                                        <Thermometer className="h-4 w-4 sm:h-5 sm:w-5" />
                                        { temp }
                                        <span className="text-base sm:text-lg text-slate-300">{ unitSymbol }</span>
                                    </p>
                                    <p className="mt-1 text-[10px] sm:text-xs capitalize text-slate-200 line-clamp-2">{ description }</p>
                                </div>
                                <div className="flex items-center justify-between text-[10px] sm:text-xs text-slate-300">
                                    <span className="flex items-center gap-1">
                                        <ArrowUp className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> { tempMax }{ unitSymbol }
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <ArrowDown className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> { tempMin }{ unitSymbol }
                                    </span>
                                </div>
                                <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-slate-200">
                                    <Umbrella className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                    <span>{ rainChance }%</span>
                                </div>
                            </div>
                        );
                    }) }
                </div>
            </div>
        </div>
    );
}
