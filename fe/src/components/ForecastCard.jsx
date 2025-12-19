// ForecastCard component - Hiển thị dự báo thời tiết

import { Umbrella, ArrowUp, ArrowDown, Thermometer } from 'lucide-react';

const unitSymbolMap = {
    metric: '°C',
    imperial: '°F',
    kelvin: 'K',
};

export function ForecastCard({ forecast, loading, units = 'metric' }) {
    if (loading && !forecast) {
        return (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
                <div className="mb-6 h-7 w-48 animate-pulse rounded-full bg-white/10" />
                <div className="flex gap-4 overflow-hidden">
                    { Array.from({ length: 4 }).map((_, index) => (
                        <div
                            key={ `forecast-skeleton-${index}` }
                            className="h-48 w-40 animate-pulse rounded-3xl bg-white/10"
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
        <div className="rounded-3xl border border-white/20 bg-slate-900/70 p-8 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="inline-flex items-center gap-3 text-xl font-semibold text-white">
                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 shadow-lg">
                            📅
                        </span>
                        Dự báo 7 phiên tới
                    </h3>
                    <p className="mt-2 text-sm text-slate-300">
                        Cập nhật mỗi 3 giờ · theo giờ địa phương
                    </p>
                </div>
                <span className="rounded-full bg-gradient-to-r from-purple-500/30 to-indigo-500/30 px-4 py-1.5 text-xs uppercase tracking-wide text-purple-200 border border-purple-400/30">
                    24 giờ tới
                </span>
            </div>

            <div className="mt-6 flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20">
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
                            className="flex w-44 flex-none flex-col gap-3 rounded-3xl border border-white/20 bg-gradient-to-br from-slate-800/90 to-slate-900/90 p-4 text-slate-100 shadow-xl backdrop-blur-md hover:border-purple-400/40 hover:shadow-purple-500/10 transition-all duration-300"
                        >
                            <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-300">
                                <span className="font-semibold">{ dayName }</span>
                                <span>{ time }</span>
                            </div>
                            <img
                                src={ iconUrl }
                                alt={ description }
                                className="mx-auto h-16 w-16 drop-shadow-[0_18px_30px_rgba(0,0,0,0.25)]"
                            />
                            <div className="text-center">
                                <p className="flex items-center justify-center gap-2 text-3xl font-semibold text-white">
                                    <Thermometer className="h-5 w-5" />
                                    { temp }
                                    <span className="text-lg text-slate-300">{ unitSymbol }</span>
                                </p>
                                <p className="mt-1 text-xs capitalize text-slate-200">{ description }</p>
                            </div>
                            <div className="flex items-center justify-between text-xs text-slate-300">
                                <span className="flex items-center gap-1">
                                    <ArrowUp className="h-3.5 w-3.5" /> { tempMax }{ unitSymbol }
                                </span>
                                <span className="flex items-center gap-1">
                                    <ArrowDown className="h-3.5 w-3.5" /> { tempMin }{ unitSymbol }
                                </span>
                            </div>
                            <div className="flex items-center justify-center gap-2 text-xs text-slate-200">
                                <Umbrella className="h-3.5 w-3.5" />
                                <span>{ rainChance }%</span>
                            </div>
                        </div>
                    );
                }) }
            </div>
        </div>
    );
}
