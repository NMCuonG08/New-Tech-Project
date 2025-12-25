import { useState } from 'react';
import { MapPin, Thermometer, Droplets, Wind, Heart, Trash2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const FavoriteCard = ({ favorite, weather, onRemove, onClick }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = async (e) => {
    e.stopPropagation();
    setIsRemoving(true);
    
    // Add small delay for animation
    setTimeout(() => {
      onRemove(favorite.id);
    }, 300);
  };

  const getWeatherIcon = (condition) => {
    const icons = {
      clear: '☀️',
      clouds: '☁️',
      rain: '🌧️',
      drizzle: '🌦️',
      thunderstorm: '⛈️',
      snow: '❄️',
      mist: '🌫️',
      fog: '🌫️'
    };
    return icons[condition?.toLowerCase()] || '🌤️';
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ 
        opacity: isRemoving ? 0 : 1, 
        scale: isRemoving ? 0.8 : 1 
      }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className="group relative rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-4 shadow-lg border border-white/10 hover:border-blue-500/50 transition-all cursor-pointer hover:shadow-xl hover:scale-105"
    >
      {/* Location Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-400" />
          <h3 className="font-semibold text-white truncate">
            {favorite.location?.name || 'Unknown'}
          </h3>
        </div>
        
        {/* Remove Button */}
        <button
          onClick={handleRemove}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 hover:text-red-300"
          title="Remove from favorites"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Weather Info */}
      {weather ? (
        <div className="space-y-3">
          {/* Main Weather */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{getWeatherIcon(weather.condition)}</span>
              <div>
                <p className="text-3xl font-bold text-white">
                  {Math.round(weather.temperature)}°C
                </p>
                <p className="text-sm text-slate-400 capitalize">
                  {weather.condition}
                </p>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10">
            <div className="flex items-center gap-1 text-xs">
              <Thermometer className="w-3 h-3 text-orange-400" />
              <span className="text-slate-300">
                {Math.round(weather.feelsLike)}°
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <Droplets className="w-3 h-3 text-blue-400" />
              <span className="text-slate-300">
                {weather.humidity}%
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <Wind className="w-3 h-3 text-slate-400" />
              <span className="text-slate-300">
                {Math.round(weather.windSpeed)} m/s
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Loading State */
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
        </div>
      )}

      {/* Favorite Indicator */}
      <div className="absolute top-2 right-2">
        <Heart className="w-4 h-4 text-red-400 fill-red-400" />
      </div>
    </motion.div>
  );
};
