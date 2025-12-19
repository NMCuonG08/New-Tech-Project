import { useState } from 'react';
import { X, Search, MapPin, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AddFavoriteModal = ({ isOpen, onClose, onAdd }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);

  // Mock geocoding search (replace with real API when backend is ready)
  const searchCities = async (query) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);

    // Simulate API call with mock data
    setTimeout(() => {
      const mockCities = [
        { name: 'Hanoi', country: 'Vietnam', lat: 21.0285, lon: 105.8542 },
        { name: 'Ho Chi Minh City', country: 'Vietnam', lat: 10.8231, lon: 106.6297 },
        { name: 'Da Nang', country: 'Vietnam', lat: 16.0544, lon: 108.2022 },
        { name: 'Hai Phong', country: 'Vietnam', lat: 20.8449, lon: 106.6881 },
        { name: 'Can Tho', country: 'Vietnam', lat: 10.0452, lon: 105.7469 },
        { name: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503 },
        { name: 'Seoul', country: 'South Korea', lat: 37.5665, lon: 126.9780 },
        { name: 'Bangkok', country: 'Thailand', lat: 13.7563, lon: 100.5018 },
      ];

      const filtered = mockCities.filter(city =>
        city.name.toLowerCase().includes(query.toLowerCase()) ||
        city.country.toLowerCase().includes(query.toLowerCase())
      );

      setSuggestions(filtered);
      setIsLoading(false);
    }, 500);
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    searchCities(value);
  };

  const handleSelectCity = (city) => {
    setSelectedCity(city);
    setSearchQuery(city.name);
    setSuggestions([]);
  };

  const handleAdd = () => {
    if (!selectedCity) return;

    onAdd({
      cityName: selectedCity.name,
      country: selectedCity.country,
      latitude: selectedCity.lat,
      longitude: selectedCity.lon
    });

    // Reset form
    setSearchQuery('');
    setSelectedCity(null);
    setSuggestions([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-slate-900 rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="text-xl font-semibold text-white">Add Favorite City</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search city..."
                className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-white/10 rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                autoFocus
              />
              {isLoading && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400 animate-spin" />
              )}
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="max-h-64 overflow-y-auto space-y-1 border border-white/10 rounded-lg bg-slate-800">
                {suggestions.map((city, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectCity(city)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors text-left"
                  >
                    <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{city.name}</p>
                      <p className="text-xs text-slate-400">{city.country}</p>
                    </div>
                    <div className="text-xs text-slate-500">
                      {city.lat.toFixed(2)}, {city.lon.toFixed(2)}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Selected City */}
            {selectedCity && (
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-sm text-slate-400 mb-1">Selected:</p>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  <p className="text-white font-medium">
                    {selectedCity.name}, {selectedCity.country}
                  </p>
                </div>
              </div>
            )}

            {/* Empty State */}
            {searchQuery && suggestions.length === 0 && !isLoading && (
              <div className="text-center py-8 text-slate-400">
                <p>No cities found</p>
                <p className="text-sm mt-1">Try a different search term</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 border-t border-white/10">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={!selectedCity}
              className="flex-1 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Add to Favorites
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
