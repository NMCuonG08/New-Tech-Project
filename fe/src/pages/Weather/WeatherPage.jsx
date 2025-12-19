import { useState, useEffect, useCallback } from 'react';
import { useWeather } from '../../hooks/useWeather';
import { useOffline } from '../../hooks/useOffline';
import { useNotifications } from '../../hooks/useNotifications';
import { useInstallPrompt } from '../../hooks/useInstallPrompt';
import { WeatherCard } from '../../components/WeatherCard';
import { ForecastCard } from '../../components/ForecastCard';
import { OfflineBanner } from '../../components/OfflineBanner';
import { NotificationSettings } from '../../components/NotificationSettings';
import { UpdatePrompt } from '../../components/UpdatePrompt';
import { ChatOverlay } from '../../components/ChatOverlay';
import { registerSW } from 'virtual:pwa-register';
import { initDB } from '../../services/dbService';
import { getLocationByName } from '../../services/locationService';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import {
  CalendarDays,
  Clock,
  CloudSun,
  MapPin,
  RefreshCw,
  Wifi,
  WifiOff,
  BellRing,
  BellOff,
  Smartphone,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

const WEATHER_SYNC_TAG = 'weather-sync-refresh';

export function WeatherPage() {
  const { user, logout } = useAuth();
  const {
    weather,
    forecast,
    loading,
    error,
    city,
    units,
    changeCity,
    changeUnits,
    refresh,
  } = useWeather();

  const { isOffline, wasOffline } = useOffline();
  const {
    permission: notificationPermission,
    sendServerTestPush,
  } = useNotifications();

  const { isInstallable, isInstalled, install } = useInstallPrompt();
  const [showUpdate, setShowUpdate] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle'); // idle | queued | completed

  // Background images state
  const [backgroundImages, setBackgroundImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  const now = new Date();
  const formattedDate = now.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const formattedTime = now.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const locationName = weather?.name || city;
  const weatherSummary = weather?.weather?.[0]?.description;
  const timezoneOffset = weather?.timezone ?? 0;
  const localUpdated = weather
    ? new Date((weather.dt + timezoneOffset) * 1000)
    : null;
  const lastUpdated = localUpdated
    ? localUpdated.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    })
    : '--:--';

  const notificationStatus = (() => {
    if (notificationPermission === 'granted') return 'Đang bật';
    if (notificationPermission === 'denied') return 'Đã từ chối';
    return 'Chưa bật';
  })();

  const statusItems = [
    {
      label: 'Kết nối',
      value: isOffline ? 'Offline' : 'Online',
      icon: isOffline ? WifiOff : Wifi,
      badgeClass: isOffline
        ? 'bg-red-500/20 text-red-200'
        : 'bg-emerald-500/20 text-emerald-200',
    },
    {
      label: 'Thông báo',
      value: notificationStatus,
      icon: notificationStatus === 'Đang bật' ? BellRing : BellOff,
      badgeClass:
        notificationStatus === 'Đang bật'
          ? 'bg-emerald-500/20 text-emerald-200'
          : 'bg-amber-500/20 text-amber-200',
    },
    {
      label: 'Cài đặt',
      value: isInstalled ? 'Đã cài đặt' : isInstallable ? 'Có thể cài' : 'Chưa cài',
      icon: isInstalled ? CheckCircle2 : Smartphone,
      badgeClass: isInstalled
        ? 'bg-emerald-500/20 text-emerald-200'
        : 'bg-blue-500/20 text-blue-200',
    },
    {
      label: 'Phiên bản',
      value: showUpdate ? 'Có bản mới' : 'Mới nhất',
      icon: Sparkles,
      badgeClass: showUpdate
        ? 'bg-amber-500/20 text-amber-200'
        : 'bg-purple-500/20 text-purple-200',
    },
  ];

  // Fetch location images when city changes
  useEffect(() => {
    const fetchLocationImages = async () => {
      if (!locationName) return;

      try {
        const location = await getLocationByName(locationName);
        if (location && location.images && Array.isArray(location.images) && location.images.length > 0) {
          setBackgroundImages(location.images);
          setCurrentImageIndex(0);
          setImageLoaded(false);
        } else {
          setBackgroundImages([]);
        }
      } catch (err) {
        console.error('Error fetching location images:', err);
        setBackgroundImages([]);
      }
    };

    fetchLocationImages();
  }, [locationName]);

  // Auto-rotate background images every 10 seconds
  useEffect(() => {
    if (backgroundImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
      setImageLoaded(false);
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  // Initialize IndexedDB
  useEffect(() => {
    initDB().catch((error) => {
      console.error('Error initializing IndexedDB:', error);
    });
  }, []);

  // Setup service worker update
  useEffect(() => {
    const updateSW = registerSW({
      onNeedRefresh() {
        setShowUpdate(true);
      },
      onOfflineReady() {
        console.log('✅ App ready to work offline');
      },
    });

    if (updateSW) {
      updateSW();
    }
  }, []);

  // Handle install
  const handleInstall = async () => {
    const installed = await install();
    if (installed) {
      console.log('App installed successfully');
    }
  };

  const handleRefreshClick = useCallback(async () => {
    if (!isOffline) {
      setSyncStatus('idle');
      refresh();
      return;
    }

    refresh();

    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register(WEATHER_SYNC_TAG);
        setSyncStatus('queued');
      } catch (error) {
        console.error('Failed to register background sync:', error);
      }
    }
  }, [isOffline, refresh]);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return undefined;
    }

    const handler = (event) => {
      if (event.data?.type === 'weather-sync-refresh') {
        setSyncStatus('completed');
        refresh();
      }
    };

    navigator.serviceWorker.addEventListener('message', handler);
    return () => navigator.serviceWorker.removeEventListener('message', handler);
  }, [refresh]);

  // Handle update
  const handleUpdate = () => {
    window.location.reload();
  };

  // Handle units change
  const handleUnitsChange = (e) => {
    changeUnits(e.target.value);
  };

  const hasBackgroundImage = backgroundImages.length > 0;
  const currentBgImage = hasBackgroundImage ? backgroundImages[currentImageIndex] : null;

  return (
    <div className="relative min-h-screen overflow-hidden text-slate-100">
      {/* Background Layer */ }
      { hasBackgroundImage ? (
        <>
          {/* Fullscreen Background Image */ }
          <div
            className="fixed inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
            style={ {
              backgroundImage: `url(${currentBgImage})`,
              opacity: imageLoaded ? 1 : 0,
            } }
          />
          {/* Preload next image */ }
          <img
            src={ currentBgImage }
            alt=""
            className="hidden"
            onLoad={ () => setImageLoaded(true) }
          />
          {/* Dark overlay for better readability */ }
          <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px]" />
        </>
      ) : (
        <>
          {/* Default gradient background */ }
          <div className="fixed inset-0 bg-slate-950" />
          <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(96,165,250,0.35),transparent_55%)]" />
          <div className="fixed -top-40 -right-24 h-96 w-96 rounded-full bg-purple-500/30 blur-[120px]" />
          <div className="fixed -bottom-40 -left-24 h-80 w-80 rounded-full bg-blue-500/30 blur-[100px]" />
        </>
      ) }

      <OfflineBanner isOffline={ isOffline } wasOffline={ wasOffline } />
      { showUpdate && <UpdatePrompt onUpdate={ handleUpdate } /> }

      <main className="relative z-10 mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 lg:px-6">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4 flex-1">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-300/80">
                Weather overview
              </p>
              <h1 className="text-4xl font-semibold md:text-5xl drop-shadow-lg">
                { locationName }
              </h1>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-slate-200">
              <span className="flex items-center gap-2 rounded-full bg-black/30 px-3 py-1 backdrop-blur-md border border-white/10">
                <MapPin className="h-4 w-4" />
                <span className="capitalize">{ locationName }</span>
              </span>
              <span className="flex items-center gap-2 rounded-full bg-black/30 px-3 py-1 backdrop-blur-md border border-white/10">
                <CalendarDays className="h-4 w-4" />
                <span className="capitalize">{ formattedDate }</span>
              </span>
              <span className="flex items-center gap-2 rounded-full bg-black/30 px-3 py-1 backdrop-blur-md border border-white/10">
                <Clock className="h-4 w-4" />
                <span>{ formattedTime }</span>
              </span>
              { weatherSummary && (
                <span className="flex items-center gap-2 rounded-full bg-black/30 px-3 py-1 backdrop-blur-md border border-white/10">
                  <CloudSun className="h-4 w-4" />
                  <span className="capitalize">{ weatherSummary }</span>
                </span>
              ) }
              <span className="flex items-center gap-2 rounded-full bg-black/30 px-3 py-1 backdrop-blur-md border border-white/10">
                <RefreshCw className="h-4 w-4" />
                <span>Cập nhật: { lastUpdated }</span>
              </span>
            </div>
            <p className="text-sm text-slate-300/80">
              Theo dõi thời tiết theo thời gian thực, hoạt động cả khi offline và có
              thông báo thông minh.
            </p>
            {/* Image indicator */ }
            { hasBackgroundImage && backgroundImages.length > 1 && (
              <div className="flex items-center gap-2">
                { backgroundImages.map((_, idx) => (
                  <button
                    key={ idx }
                    onClick={ () => {
                      setCurrentImageIndex(idx);
                      setImageLoaded(false);
                    } }
                    className={ `w-2 h-2 rounded-full transition-all ${idx === currentImageIndex
                      ? 'bg-white w-4'
                      : 'bg-white/40 hover:bg-white/60'
                      }` }
                  />
                )) }
              </div>
            ) }
          </div>

          <div className="w-full max-w-xl rounded-3xl border border-white/20 bg-slate-900/70 p-5 shadow-2xl backdrop-blur-xl lg:w-[380px]">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">
              Tùy chỉnh nhanh
            </h2>
            <div className="grid grid-cols-1 gap-4">

              <div className="space-y-2">
                <label htmlFor="units" className="block text-xs uppercase tracking-wide text-slate-400">
                  Đơn vị
                </label>
                <select
                  id="units"
                  value={ units }
                  onChange={ handleUnitsChange }
                  className="w-full rounded-2xl border border-white/15 bg-slate-800/80 px-4 py-3 text-sm font-medium text-slate-100 backdrop-blur focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  style={ { colorScheme: 'dark' } }
                >
                  <option value="metric">°C (Metric)</option>
                  <option value="imperial">°F (Imperial)</option>
                  <option value="kelvin">K (Kelvin)</option>
                </select>
              </div>

              <button
                onClick={ handleRefreshClick }
                disabled={ loading }
                aria-label="Refresh weather"
                className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-2xl hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw className={ `h-4 w-4 ${loading ? 'animate-spin' : ''}` } />
                <span>{ loading ? 'Đang tải...' : 'Làm mới dữ liệu' }</span>
              </button>
              { syncStatus === 'queued' && (
                <p className="text-xs text-amber-200">
                  Đang offline: Background Sync đã được đăng ký, dữ liệu sẽ tự làm mới khi online.
                </p>
              ) }
              { syncStatus === 'completed' && (
                <p className="text-xs text-emerald-200">
                  Background Sync đã chạy · đang cập nhật dữ liệu mới nhất.
                </p>
              ) }
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <WeatherCard
            weather={ weather }
            loading={ loading }
            error={ error }
            onRefresh={ handleRefreshClick }
            units={ units }
          />

          <div className="flex flex-col gap-6">
            <div className="rounded-3xl border border-white/20 bg-slate-900/70 p-6 shadow-2xl backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-100">
                  Trạng thái hệ thống
                </h3>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-1 text-xs uppercase tracking-wide text-emerald-300 border border-emerald-500/30">
                    Live
                  </span>
                  { user && (
                    <div className="inline-flex items-center gap-2 rounded-full bg-slate-800/80 px-3 py-1 text-xs text-slate-200">
                      <span className="font-medium">Hi, { user.username }</span>
                      <button
                        type="button"
                        onClick={ logout }
                        className="rounded-full border border-white/20 px-2 py-0.5 text-[11px] text-slate-300 hover:border-white/40 hover:text-white"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  ) }
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                { statusItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={ item.label }
                      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-800/50 p-3"
                    >
                      <span className={ `flex h-11 w-11 items-center justify-center rounded-2xl ${item.badgeClass}` }>
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">
                          { item.label }
                        </p>
                        <p className="text-sm font-semibold text-slate-100">
                          { item.value }
                        </p>
                      </div>
                    </div>
                  );
                }) }
              </div>
            </div>

            <NotificationSettings
              permission={ notificationPermission }
              onSendPush={ (payload) =>
                sendServerTestPush(payload).catch((error) => {
                  console.error(error)
                  alert('Không gửi được push notification, kiểm tra server backend.')
                })
              }
            />

            <div className="rounded-3xl border border-white/20 bg-slate-900/70 p-6 shadow-2xl backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between text-sm text-slate-300">
                <p>
                  Truy cập lần cuối: { lastUpdated } — trình duyệt { navigator.userAgentData?.brands?.[0]?.brand || navigator.userAgent || '' }
                </p>
                <button
                  type="button"
                  onClick={ handleInstall }
                  className="hidden rounded-xl border border-white/20 px-3 py-1 text-xs text-white/80 hover:border-white/40 hover:text-white md:inline-flex"
                >
                  Tự cài đặt
                </button>
              </div>
            </div>
          </div>
        </section>

        <ForecastCard forecast={ forecast } loading={ loading } units={ units } />

        <footer className="border-t border-white/10 py-6 text-center text-sm text-slate-400">
          <p className="mb-2">
            { isOffline ? '📴 Đang offline' : '🌐 Đang online' }
            { isInstalled ? ' · 📱 Đã cài đặt' : '' }
          </p>
          <p>
            Dữ liệu bởi{ ' ' }
            <a
              href="https://open-meteo.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-slate-200 underline-offset-4 hover:text-white hover:underline"
            >
              Open-Meteo
            </a>
          </p>
        </footer>
      </main>

      {/* Chat Overlay */ }
      <ChatOverlay />
    </div>
  );
}
