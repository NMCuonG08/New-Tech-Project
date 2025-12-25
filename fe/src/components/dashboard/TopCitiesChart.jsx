import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { getTopCities } from '../../services/dashboardService';
import { MapPin, TrendingUp, Loader2, Award } from 'lucide-react';

export function TopCitiesChart({ limit = 10 }) {
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTopCities();
    }, [limit]);

    const fetchTopCities = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getTopCities(limit);
            setCities(data);
        } catch (err) {
            console.error('Error fetching top cities:', err);
            setError(err.message || 'Failed to fetch top cities');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 size={ 48 } className="animate-spin text-blue-400" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-6 text-center text-sm text-red-400">
                <p className="font-semibold mb-1">Lỗi tải dữ liệu</p>
                <p className="text-xs text-red-300">{ error }</p>
            </div>
        );
    }

    if (cities.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="rounded-full bg-slate-800/50 p-6 mb-4">
                    <MapPin size={ 48 } className="text-slate-600" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Chưa có thành phố yêu thích nào</h3>
                <p className="text-sm text-slate-400">Người dùng chưa thêm thành phố vào danh sách yêu thích</p>
            </div>
        );
    }

    // Prepare data for chart - keep original order for vertical bars
    const chartData = cities;

    // Get max value for scaling
    const maxCount = Math.max(...cities.map(c => c.count));

    // Color gradient for bars
    const getBarColor = (index) => {
        if (index === 0) return 'url(#goldGradient)'; // #1
        if (index === 1) return 'url(#silverGradient)'; // #2
        if (index === 2) return 'url(#bronzeGradient)'; // #3
        return 'url(#blueGradient)'; // Others
    };

    // Custom tooltip
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            const rank = cities.findIndex(c => c.city === data.city) + 1;

            return (
                <div className="rounded-lg border border-white/20 bg-slate-900/95 p-3 shadow-xl backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-2">
                        { rank <= 3 && <Award size={ 16 } className="text-yellow-400" /> }
                        <p className="text-sm font-bold text-white">
                            #{ rank } { data.city }
                        </p>
                    </div>
                    { data.province && (
                        <p className="text-xs text-slate-400 mb-1">{ data.province }</p>
                    ) }
                    <p className="text-lg font-bold text-blue-400">
                        { data.count.toLocaleString() } lượt yêu thích
                    </p>
                </div>
            );
        }
        return null;
    };

    // Custom bar label (top of bar)
    const CustomBarLabel = (props) => {
        const { x, y, width, height, value, index } = props;
        const rank = index + 1;

        return (
            <g>
                {/* Rank badge on top of bar */ }
                <circle
                    cx={ x + width / 2 }
                    cy={ y - 15 }
                    r={ 14 }
                    fill={ rank <= 3 ? '#fbbf24' : '#475569' }
                    opacity={ 0.95 }
                />
                <text
                    x={ x + width / 2 }
                    y={ y - 10 }
                    fill="white"
                    fontSize={ 11 }
                    fontWeight="bold"
                    textAnchor="middle"
                >
                    { rank }
                </text>

                {/* Value label on top */ }
                <text
                    x={ x + width / 2 }
                    y={ y - 32 }
                    fill="#e2e8f0"
                    fontSize={ 13 }
                    fontWeight="700"
                    textAnchor="middle"
                >
                    { value.toLocaleString() }
                </text>
            </g>
        );
    };

    const totalFavorites = cities.reduce((sum, c) => sum + c.count, 0);
    const avgFavorites = Math.round(totalFavorites / cities.length);

    return (
        <div className="space-y-6">
            {/* Stats Summary */ }
            <div className="grid grid-cols-3 gap-4">
                <div className="rounded-xl border border-white/10 bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-4 text-center">
                    <MapPin size={ 24 } className="mx-auto mb-2 text-blue-400" />
                    <p className="text-2xl font-bold text-white">{ cities.length }</p>
                    <p className="text-xs text-slate-400">Thành phố</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-gradient-to-br from-purple-500/10 to-purple-600/5 p-4 text-center">
                    <TrendingUp size={ 24 } className="mx-auto mb-2 text-purple-400" />
                    <p className="text-2xl font-bold text-white">{ totalFavorites.toLocaleString() }</p>
                    <p className="text-xs text-slate-400">Tổng lượt</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 p-4 text-center">
                    <Award size={ 24 } className="mx-auto mb-2 text-emerald-400" />
                    <p className="text-2xl font-bold text-white">{ avgFavorites.toLocaleString() }</p>
                    <p className="text-xs text-slate-400">Trung bình</p>
                </div>
            </div>

            {/* Bar Chart */ }
            <div className="rounded-xl border border-white/10 bg-slate-800/30 p-6">
                <ResponsiveContainer width="100%" height={ 450 }>
                    <BarChart
                        data={ chartData }
                        margin={ { top: 50, right: 20, left: 20, bottom: 50 } }
                    >
                        <defs>
                            {/* Gold gradient for #1 */ }
                            <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#fbbf24" stopOpacity={ 1 } />
                                <stop offset="100%" stopColor="#f59e0b" stopOpacity={ 0.8 } />
                            </linearGradient>
                            {/* Silver gradient for #2 */ }
                            <linearGradient id="silverGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#cbd5e1" stopOpacity={ 1 } />
                                <stop offset="100%" stopColor="#94a3b8" stopOpacity={ 0.8 } />
                            </linearGradient>
                            {/* Bronze gradient for #3 */ }
                            <linearGradient id="bronzeGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#fb923c" stopOpacity={ 1 } />
                                <stop offset="100%" stopColor="#ea580c" stopOpacity={ 0.8 } />
                            </linearGradient>
                            {/* Blue gradient for others */ }
                            <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#60a5fa" stopOpacity={ 0.8 } />
                                <stop offset="100%" stopColor="#3b82f6" stopOpacity={ 0.6 } />
                            </linearGradient>
                        </defs>

                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={ 0.3 } />

                        <XAxis
                            dataKey="city"
                            stroke="#94a3b8"
                            tick={ { fill: '#e2e8f0', fontSize: 12, fontWeight: 500 } }
                            angle={ -45 }
                            textAnchor="end"
                            height={ 80 }
                        />

                        <YAxis
                            stroke="#94a3b8"
                            tick={ { fill: '#94a3b8', fontSize: 12 } }
                        />

                        <Tooltip content={ <CustomTooltip /> } cursor={ { fill: 'rgba(100, 116, 139, 0.1)' } } />

                        <Bar
                            dataKey="count"
                            radius={ [8, 8, 0, 0] }
                            label={ <CustomBarLabel /> }
                        >
                            { chartData.map((entry, index) => (
                                <Cell key={ `cell-${index}` } fill={ getBarColor(index) } />
                            )) }
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
