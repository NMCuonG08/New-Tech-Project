import { useState, useEffect } from 'react';
import { X, Plus, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllLocations } from '../../services/locationService';
import toast from 'react-hot-toast';

const ALERT_TYPES = [
  { value: 'rain', label: 'Heavy Rain', icon: '🌧️', unit: 'mm/hour', min: 0, max: 100 },
  { value: 'temperature_high', label: 'High Temperature', icon: '🔥', unit: '°C', min: 30, max: 50 },
  { value: 'temperature_low', label: 'Low Temperature', icon: '❄️', unit: '°C', min: -20, max: 20 },
  { value: 'aqi', label: 'Air Quality Index', icon: '😷', unit: 'AQI', min: 0, max: 500 },
  { value: 'wind', label: 'High Wind Speed', icon: '💨', unit: 'km/h', min: 0, max: 200 },
  { value: 'humidity', label: 'High Humidity', icon: '💧', unit: '%', min: 0, max: 100 },
];

export const CreateAlertModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    locationId: '',
    locationName: '',
    type: 'rain',
    threshold: 5,
    isActive: true
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locations, setLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const selectedType = ALERT_TYPES.find(t => t.value === formData.type);

  // Load locations when modal opens
  useEffect(() => {
    if (isOpen) {
      setLoadingLocations(true);
      getAllLocations()
        .then(data => {
          setLocations(data || []);
          setLoadingLocations(false);
        })
        .catch(error => {
          console.error('Error loading locations:', error);
          toast.error('Failed to load locations');
          setLoadingLocations(false);
        });
    }
  }, [isOpen]);

  // Filter locations based on search term
  const filteredLocations = locations.filter(loc =>
    loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (loc.province && loc.province.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    setErrors(prev => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.locationId) {
      newErrors.locationId = 'Location is required';
    }

    if (!selectedType) {
      newErrors.type = 'Alert type is required';
    }

    const threshold = Number(formData.threshold);
    if (isNaN(threshold)) {
      newErrors.threshold = 'Threshold must be a number';
    } else if (selectedType) {
      if (threshold < selectedType.min || threshold > selectedType.max) {
        newErrors.threshold = `Must be between ${selectedType.min}-${selectedType.max}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    // Transform to backend format
    const alertData = {
      locationId: Number(formData.locationId),
      type: formData.type,
      threshold: Number(formData.threshold),
      description: `${selectedType?.label} alert for ${formData.locationName}`,
      isActive: formData.isActive
    };

    console.log('Submitting alert:', alertData);
    onSubmit(alertData);

    // Reset form
    setFormData({
      locationId: '',
      locationName: '',
      type: 'rain',
      threshold: 5,
      isActive: true
    });
    setSearchTerm('');
    setErrors({});
    setIsSubmitting(false);
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
          className="relative w-full max-w-lg max-h-[90vh] bg-slate-900 rounded-2xl shadow-2xl border border-white/10 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10 flex-shrink-0">
            <h2 className="text-xl font-semibold text-white">Create Alert Rule</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Form - Scrollable */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4"
            style={{ maxHeight: 'calc(90vh - 180px)' }}
          >
            {/* Location Picker */}
            <div className="relative">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Location
              </label>
              
              {/* Selected Location or Search Input */}
              {formData.locationName && !isDropdownOpen ? (
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(true)}
                  className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-lg text-left hover:border-blue-500 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">{formData.locationName}</div>
                      <div className="text-xs text-slate-400 mt-0.5">Click to change</div>
                    </div>
                    <Search className="w-4 h-4 text-slate-400 group-hover:text-blue-400" />
                  </div>
                </button>
              ) : (
                <>
                  {/* Search Input */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onFocus={() => setIsDropdownOpen(true)}
                      placeholder="Search locations..."
                      className={`w-full pl-10 pr-4 py-3 bg-slate-800 border ${
                        errors.locationId ? 'border-red-500' : 'border-white/10'
                      } rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors`}
                    />
                  </div>

                  {/* Location Dropdown */}
                  {isDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto bg-slate-800 border border-white/10 rounded-lg shadow-xl">
                      {loadingLocations ? (
                        <div className="p-4 text-center text-slate-400 text-sm">
                          Loading locations...
                        </div>
                      ) : filteredLocations.length === 0 ? (
                        <div className="p-4 text-center text-slate-400 text-sm">
                          {searchTerm ? 'No locations found' : 'No locations available'}
                        </div>
                      ) : (
                        filteredLocations.map((location) => (
                          <button
                            key={location.id}
                            type="button"
                            onClick={() => {
                              handleChange('locationId', location.id);
                              handleChange('locationName', location.name);
                              setSearchTerm('');
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full px-4 py-3 text-left hover:bg-slate-700 transition-colors border-b border-white/5 last:border-b-0 ${
                              formData.locationId === location.id ? 'bg-blue-500/20 text-blue-400' : 'text-white'
                            }`}
                          >
                            <div className="font-medium">{location.name}</div>
                            {location.province && (
                              <div className="text-xs text-slate-400 mt-0.5">{location.province}</div>
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </>
              )}

              {errors.locationId && (
                <p className="mt-1 text-sm text-red-400">{errors.locationId}</p>
              )}
            </div>

            {/* Alert Type */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Alert Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {ALERT_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => {
                      handleChange('type', type.value);
                      // Set default threshold for this type
                      handleChange('threshold', (type.min + type.max) / 2);
                    }}
                    className={`p-2 rounded-lg border transition-all ${
                      formData.type === type.value
                        ? 'border-blue-500 bg-blue-500/20 text-white'
                        : 'border-white/10 bg-slate-800 text-slate-300 hover:border-white/30'
                    }`}
                  >
                    <div className="text-xl mb-1">{type.icon}</div>
                    <div className="text-[10px] leading-tight">{type.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Threshold */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Threshold
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={formData.threshold}
                  onChange={(e) => handleChange('threshold', e.target.value)}
                  min={selectedType?.min}
                  max={selectedType?.max}
                  step={selectedType?.value === 'rain' ? 0.1 : 1}
                  className={`flex-1 px-4 py-2 bg-slate-800 border ${
                    errors.threshold ? 'border-red-500' : 'border-white/10'
                  } rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors`}
                />
                <span className="text-slate-400 text-sm min-w-[70px]">
                  {selectedType?.unit}
                </span>
              </div>
              {errors.threshold && (
                <p className="mt-1 text-sm text-red-400">{errors.threshold}</p>
              )}
              {selectedType && (
                <p className="mt-1 text-xs text-slate-500">
                  Range: {selectedType.min} - {selectedType.max} {selectedType.unit}
                </p>
              )}
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-white">Active</p>
                <p className="text-xs text-slate-400">Enable this alert rule</p>
              </div>
              <button
                type="button"
                onClick={() => handleChange('isActive', !formData.isActive)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.isActive ? 'bg-blue-500' : 'bg-slate-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.isActive ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Notification Preview */}
            {formData.locationName && (
              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-xs text-slate-400 mb-1">Preview:</p>
                <p className="text-sm text-white">
                  {selectedType?.icon} Alert when{' '}
                  <span className="font-medium">{formData.locationName}</span>{' '}
                  {selectedType?.label.toLowerCase()} exceeds{' '}
                  <span className="font-medium">{formData.threshold} {selectedType?.unit}</span>
                </p>
              </div>
            )}
          </form>

          {/* Footer */}
          <div className="flex gap-3 p-6 border-t border-white/10 flex-shrink-0 bg-slate-900">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {isSubmitting ? 'Creating...' : 'Create Alert'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
