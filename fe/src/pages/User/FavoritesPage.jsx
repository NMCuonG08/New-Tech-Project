import { useState, useEffect } from 'react';
import { Plus, Heart, Loader2, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useFavorites } from '../../hooks/useFavorites';
import { FavoriteCard } from '../../components/favorites/FavoriteCard';
import { AddFavoriteModal } from '../../components/favorites/AddFavoriteModal';
import toast from 'react-hot-toast';

export const FavoritesPage = () => {
  const { favorites, addFavorite, removeFavorite, isLoading } = useFavorites();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [weatherData, setWeatherData] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock fetch weather for favorites
  const fetchWeatherForCity = async (cityName, lat, lon) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          temperature: Math.floor(Math.random() * 15) + 20,
          feelsLike: Math.floor(Math.random() * 15) + 20,
          humidity: Math.floor(Math.random() * 40) + 40,
          windSpeed: Math.floor(Math.random() * 10) + 2,
          condition: ['Clear', 'Clouds', 'Rain'][Math.floor(Math.random() * 3)]
        });
      }, 500);
    });
  };

  // Load weather data for all favorites
  const loadWeatherData = async () => {
    setIsRefreshing(true);
    const newWeatherData = {};

    for (const fav of favorites) {
      try {
        const weather = await fetchWeatherForCity(
          fav.location?.name,
          fav.location?.lat,
          fav.location?.lon
        );
        newWeatherData[fav.id] = weather;
      } catch (error) {
        console.error(`Failed to fetch weather for ${fav.location?.name}:`, error);
      }
    }

    setWeatherData(newWeatherData);
    setIsRefreshing(false);
  };

  useEffect(() => {
    if (favorites.length > 0) {
      loadWeatherData();
    }
  }, [favorites.length]);

  const handleAddFavorite = async (locationId) => {
    const newFavorite = await addFavorite(locationId);
    if (newFavorite) {
      const cityName = newFavorite.location?.name || 'City';
      toast.success(`${cityName} added to favorites!`);
    } else {
      toast.error('Failed to add city to favorites');
    }
  };

  const handleRemoveFavorite = (id) => {
    const favorite = favorites.find(f => f.id === id);
    removeFavorite(id);
    toast.success(`${favorite?.location?.name || 'City'} removed from favorites`);
  };

  const handleCardClick = (favorite) => {
    // Navigate to weather detail page (implement based on your routing)
    console.log('Navigate to:', favorite.location?.name);
    toast('Weather detail page coming soon!', { icon: '🚧' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Heart className="w-8 h-8 text-red-400 fill-red-400" />
              My Favorite Cities
            </h1>
            <p className="text-slate-400 mt-2">
              {favorites.length === 0 
                ? 'Add your favorite cities to track their weather'
                : `Tracking weather for ${favorites.length} ${favorites.length === 1 ? 'city' : 'cities'}`
              }
            </p>
          </div>

          <div className="flex gap-3">
            {favorites.length > 0 && (
              <button
                onClick={loadWeatherData}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 border border-white/10 text-white hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            )}
            
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add City
            </button>
          </div>
        </div>

        {/* Favorites Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          </div>
        ) : favorites.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-800 mb-6">
              <Heart className="w-10 h-10 text-slate-600" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">
              No favorite cities yet
            </h2>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              Start by adding your favorite cities to quickly access their weather information
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Your First City
            </button>
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {favorites.map((favorite) => (
              <FavoriteCard
                key={favorite.id}
                favorite={favorite}
                weather={weatherData[favorite.id]}
                onRemove={handleRemoveFavorite}
                onClick={() => handleCardClick(favorite)}
              />
            ))}
          </motion.div>
        )}

        {/* Info Section */}
        {favorites.length > 0 && (
          <div className="mt-8 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
            <p className="text-sm text-blue-300">
              💡 <strong>Tip:</strong> Click on any city card to view detailed weather information. 
              Weather data refreshes automatically every 10 minutes.
            </p>
          </div>
        )}
      </div>

      {/* Add Favorite Modal */}
      <AddFavoriteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddFavorite}
      />
    </div>
  );
};
