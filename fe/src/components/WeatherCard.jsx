// WeatherCard component - Hiển thị thời tiết

import {
    Droplets,
    Gauge,
    Eye,
    Wind as WindIcon,
    Sunrise,
    Sunset,
} from 'lucide-react';

const unitSymbolMap = {
    metric: '°C',
    imperial: '°F',
    kelvin: 'K',
};

export function WeatherCard({ weather, loading, error, onRefresh, units = 'metric' }) {
    if (loading && !weather) {
        return (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
                <div className="mb-4 h-6 w-40 animate-pulse rounded-full bg-white/10" />
                <div className="mb-4 h-24 animate-pulse rounded-3xl bg-white/10" />
                <div className="h-6 w-56 animate-pulse rounded-full bg-white/10" />
            </div>
        );
    }

    if (error && !weather) {
        return (
            <div className="rounded-3xl border border-red-500/40 bg-red-500/10 p-8 text-center text-red-50 backdrop-blur">
                <p className="mb-4 text-lg font-semibold">❌ {error}</p>
                <button
                    onClick={onRefresh}
                    className="rounded-2xl bg-red-500/80 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-red-500 hover:shadow-xl"
                >
                    Thử lại
                </button>
            </div>
        );
    }

    if (!weather) {
        return (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-slate-200 backdrop-blur">
                <p>Không có dữ liệu thời tiết. Vui lòng thử làm mới.</p>
            </div>
        );
    }

    const {
        name,
        main,
        weather: weatherInfo,
        wind = {},
        visibility,
        sys = {},
        dt,
        timezone,
    } = weather;

    const temp = Math.round(main.temp);
    const feelsLike = Math.round(main.feels_like);
    const description = weatherInfo[0]?.description || 'N/A';
    const icon = weatherInfo[0]?.icon || '01d';
    const humidity = main.humidity;
    const pressure = main.pressure;
    const windSpeed = typeof wind.speed === 'number' ? wind.speed : 0;
    const windDeg = wind.deg;
    const gustSpeed = wind.gust;
    const windUnit = units === 'imperial' ? 'mph' : 'm/s';

    const unitSymbol = unitSymbolMap[units] ?? '°';

    const formatLocalTime = (timestamp) => {
        if (!timestamp) return '--:--';
        return new Date((timestamp + (timezone ?? 0)) * 1000).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const visibilityKm = typeof visibility === 'number'
        ? `${(visibility / 1000).toFixed(1)} km`
        : '—';

    const sunrise = formatLocalTime(sys.sunrise);
    const sunset = formatLocalTime(sys.sunset);
    const localTime = formatLocalTime(dt);

    const iconUrl = `https://openweathermap.org/img/wn/${icon}@4x.png`;

    const highlightCards = [
        {
            label: 'Độ ẩm',
            value: `${humidity}%`,
            Icon: Droplets,
        },
        {
            label: 'Áp suất',
            value: `${pressure} hPa`,
            Icon: Gauge,
        },
        {
            label: 'Tầm nhìn',
            value: visibilityKm,
            Icon: Eye,
        },
        {
            label: 'Gió',
            value: `${windSpeed.toFixed(1)} ${windUnit}`,
            Icon: WindIcon,
            extra:
                typeof windDeg === 'number'
                    ? `${((windDeg + 360) % 360).toFixed(0)}°${gustSpeed ? ` · giật ${gustSpeed.toFixed(1)} ${windUnit}` : ''}`
                    : gustSpeed
                        ? `Giật ${gustSpeed.toFixed(1)} ${windUnit}`
                        : null,
        },
    ];

    const sunTimeline = [
        {
            label: 'Bình minh',
            value: sunrise,
            Icon: Sunrise,
        },
        {
            label: 'Hoàng hôn',
            value: sunset,
            Icon: Sunset,
        },
    ];

    return (
        <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
            <div className="pointer-events-none absolute -top-20 -right-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="relative z-10 space-y-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-300">
                            Thời gian địa phương · {localTime}
                        </p>
                        <h2 className="mt-2 text-4xl font-semibold text-white md:text-5xl">
                            {name}
                        </h2>
                        <p className="mt-2 text-lg capitalize text-slate-200">
                            {description}
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-[minmax(0,220px)_1fr] md:items-center">
                    <div className="flex flex-col items-center gap-3">
                        <img
                            src={iconUrl}
                            alt={description}
                            className="w-36 drop-shadow-[0_25px_45px_rgba(0,0,0,0.35)]"
                        />
                        <div className="text-center">
                            <div className="text-6xl font-light text-white md:text-7xl">
                                {temp}
                                <span className="ml-1 text-3xl text-slate-200">{unitSymbol}</span>
                            </div>
                            <p className="mt-2 text-sm text-slate-200">
                                Cảm giác như <span className="font-semibold text-white">{feelsLike}{unitSymbol}</span>
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="grid gap-4 sm:grid-cols-2">
                            {highlightCards.map(({ label, value, Icon, extra }) => (
                                <div
                                    key={label}
                                    className="rounded-3xl border border-white/10 bg-white/5 p-4 text-slate-100 shadow-lg"
                                >
                                    <div className="flex items-center gap-3 text-sm text-slate-300">
                                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                                            <Icon className="h-5 w-5" />
                                        </span>
                                        <span className="uppercase tracking-wide">{label}</span>
                                    </div>
                                    <p className="mt-3 text-2xl font-semibold text-white">
                                        {value}
                                    </p>
                                    {extra && (
                                        <p className="mt-1 text-sm text-slate-300">{extra}</p>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
                                    Chu kỳ mặt trời
                                </h3>
                                <span className="text-xs text-slate-400">Theo giờ địa phương</span>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                {sunTimeline.map(({ label, value, Icon }) => (
                                    <div
                                        key={label}
                                        className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                                                <Icon className="h-5 w-5" />
                                            </span>
                                            <div>
                                                <p className="text-xs uppercase tracking-wide text-slate-300">
                                                    {label}
                                                </p>
                                                <p className="text-lg font-semibold text-white">
                                                    {value}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
