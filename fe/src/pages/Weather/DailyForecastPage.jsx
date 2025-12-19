import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../../configs/apiClient';
import { getCity, getUnits } from '../../utils/storage';
import { ChevronLeft, ChevronRight, Calendar, Cloud, Droplets, Wind, Thermometer, Sun, Moon } from 'lucide-react';
import toast from 'react-hot-toast';

export function DailyForecastPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const city = searchParams.get('city') || getCity() || 'Hồ Chí Minh';
  const units = getUnits();

  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(7);

  useEffect(() => {
    loadForecast();
  }, [city, units, page]);

  const loadForecast = async () => {
    setLoading(true);
    try {
      const response = await apiClient.post('/weather/daily', {
        city,
        units,
        page,
        limit,
      });
      if (response.data.success && response.data.data) {
        setForecast(response.data.data);
      }
    } catch (error) {
      console.error('Error loading daily forecast:', error);
      toast.error('Không thể tải dữ liệu dự báo');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dt) => {
    const date = new Date(dt * 1000);
    return date.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  const formatShortDate = (dt) => {
    const date = new Date(dt * 1000);
    return date.toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= (forecast?.pagination?.totalPages || 1)) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading && !forecast) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dự báo theo ngày - { city }</h1>
            <p className="text-slate-400">Xem chi tiết thời tiết từng ngày</p>
          </div>
          <button
            onClick={ () => navigate('/weather') }
            className="rounded-full border border-white/20 px-4 py-2 text-sm hover:bg-white/10 transition"
          >
            ← Quay lại
          </button>
        </div>

        { forecast && forecast.list && forecast.list.length > 0 && (
          <>
            <div className="grid gap-4 mb-6">
              { forecast.list.map((item, index) => (
                <div
                  key={ index }
                  className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur hover:bg-white/10 transition"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <Calendar className="h-5 w-5 text-blue-400" />
                      <div>
                        <p className="text-lg font-semibold">{ formatDate(item.dt) }</p>
                        <p className="text-sm text-slate-400">{ formatShortDate(item.dt) }</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      { item.weather && item.weather[0] && (
                        <img
                          src={ `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png` }
                          alt={ item.weather[0].description }
                          className="w-16 h-16"
                        />
                      ) }
                      <div className="text-right">
                        <p className="text-3xl font-bold">
                          { Math.round(item.main.temp_max) }°{ units === 'metric' ? 'C' : 'F' }
                        </p>
                        <p className="text-lg text-slate-400">
                          { Math.round(item.main.temp_min) }°{ units === 'metric' ? 'C' : 'F' }
                        </p>
                        <p className="text-sm text-slate-400 capitalize">
                          { item.weather?.[0]?.description || 'N/A' }
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-blue-400" />
                      <span className="text-sm">Độ ẩm: { item.main.humidity }%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wind className="h-4 w-4 text-slate-400" />
                      <span className="text-sm">Gió: { item.wind.speed.toFixed(1) } m/s</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Cloud className="h-4 w-4 text-slate-400" />
                      <span className="text-sm">Mưa: { (item.pop * 100).toFixed(0) }%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-blue-400" />
                      <span className="text-sm">Lượng mưa: { item.rain?.toFixed(1) || 0 }mm</span>
                    </div>
                  </div>
                </div>
              )) }
            </div>

            { forecast.pagination && forecast.pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <button
                  onClick={ () => handlePageChange(page - 1) }
                  disabled={ page === 1 }
                  className="flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm hover:bg-white/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Trước
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-400">
                    Trang { page } / { forecast.pagination.totalPages }
                  </span>
                </div>
                <button
                  onClick={ () => handlePageChange(page + 1) }
                  disabled={ page >= forecast.pagination.totalPages }
                  className="flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm hover:bg-white/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            ) }
          </>
        ) }
      </div>
    </div>
  );
}

