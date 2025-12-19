import { useState } from 'react';
import { X, Plus, MapPin, Globe, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AddCityModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    latitude: '',
    longitude: '',
    timezone: '',
    population: ''
  });
  const [errors, setErrors] = useState({});
  const [isSearching, setIsSearching] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'City name is required';
    }

    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }

    const lat = parseFloat(formData.latitude);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      newErrors.latitude = 'Latitude must be between -90 and 90';
    }

    const lon = parseFloat(formData.longitude);
    if (isNaN(lon) || lon < -180 || lon > 180) {
      newErrors.longitude = 'Longitude must be between -180 and 180';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    onSubmit({
      ...formData,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      population: formData.population ? parseInt(formData.population) : null
    });

    // Reset form
    setFormData({
      name: '',
      country: '',
      latitude: '',
      longitude: '',
      timezone: '',
      population: ''
    });
    setErrors({});
    onClose();
  };

  // Mock geocoding search
  const handleQuickSearch = (cityName) => {
    const mockCities = {
      'Nha Trang': { lat: 12.2388, lon: 109.1967, country: 'Vietnam', timezone: 'Asia/Ho_Chi_Minh' },
      'Hue': { lat: 16.4637, lon: 107.5909, country: 'Vietnam', timezone: 'Asia/Ho_Chi_Minh' },
      'Vung Tau': { lat: 10.3460, lon: 107.0843, country: 'Vietnam', timezone: 'Asia/Ho_Chi_Minh' },
      'Da Lat': { lat: 11.9465, lon: 108.4419, country: 'Vietnam', timezone: 'Asia/Ho_Chi_Minh' },
    };

    const data = mockCities[cityName];
    if (data) {
      setFormData({
        name: cityName,
        country: data.country,
        latitude: data.lat.toString(),
        longitude: data.lon.toString(),
        timezone: data.timezone,
        population: ''
      });
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl bg-slate-900 rounded-2xl shadow-2xl border border-white/10 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-slate-900 border-b border-white/10 p-6 z-10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-400" />
                Add New City
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Quick Search Buttons */}
          <div className="px-6 pt-4">
            <p className="text-xs text-slate-400 mb-2">Quick add:</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {['Nha Trang', 'Hue', 'Vung Tau', 'Da Lat'].map(city => (
                <button
                  key={city}
                  type="button"
                  onClick={() => handleQuickSearch(city)}
                  className="px-3 py-1 text-xs rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30 transition-colors"
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* City Name & Country */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  City Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g., Nha Trang"
                  className={`w-full px-4 py-3 bg-slate-800 border ${
                    errors.name ? 'border-red-500' : 'border-white/10'
                  } rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors`}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-400">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Country *
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                  placeholder="e.g., Vietnam"
                  className={`w-full px-4 py-3 bg-slate-800 border ${
                    errors.country ? 'border-red-500' : 'border-white/10'
                  } rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors`}
                />
                {errors.country && (
                  <p className="mt-1 text-sm text-red-400">{errors.country}</p>
                )}
              </div>
            </div>

            {/* Coordinates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Latitude *
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.latitude}
                  onChange={(e) => handleChange('latitude', e.target.value)}
                  placeholder="-90 to 90"
                  className={`w-full px-4 py-3 bg-slate-800 border ${
                    errors.latitude ? 'border-red-500' : 'border-white/10'
                  } rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors`}
                />
                {errors.latitude && (
                  <p className="mt-1 text-sm text-red-400">{errors.latitude}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Longitude *
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.longitude}
                  onChange={(e) => handleChange('longitude', e.target.value)}
                  placeholder="-180 to 180"
                  className={`w-full px-4 py-3 bg-slate-800 border ${
                    errors.longitude ? 'border-red-500' : 'border-white/10'
                  } rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors`}
                />
                {errors.longitude && (
                  <p className="mt-1 text-sm text-red-400">{errors.longitude}</p>
                )}
              </div>
            </div>

            {/* Timezone */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Timezone (Optional)
              </label>
              <input
                type="text"
                value={formData.timezone}
                onChange={(e) => handleChange('timezone', e.target.value)}
                placeholder="e.g., Asia/Ho_Chi_Minh"
                className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Population */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Population (Optional)
              </label>
              <input
                type="number"
                value={formData.population}
                onChange={(e) => handleChange('population', e.target.value)}
                placeholder="e.g., 500000"
                className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Preview */}
            {formData.name && formData.latitude && formData.longitude && (
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-xs text-slate-400 mb-2">Preview:</p>
                <div className="flex items-start gap-3">
                  <Navigation className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-white font-medium">{formData.name}, {formData.country}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      📍 {formData.latitude}, {formData.longitude}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </form>

          {/* Footer */}
          <div className="sticky bottom-0 bg-slate-900 border-t border-white/10 p-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add City
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
