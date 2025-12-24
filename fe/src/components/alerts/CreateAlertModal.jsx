import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ALERT_TYPES = [
  { value: 'rain', label: 'Heavy Rain', icon: '🌧️', unit: 'mm/hour', min: 0, max: 100 },
  { value: 'temp_high', label: 'High Temperature', icon: '🔥', unit: '°C', min: 30, max: 50 },
  { value: 'temp_low', label: 'Low Temperature', icon: '❄️', unit: '°C', min: -20, max: 20 },
  { value: 'aqi', label: 'Air Quality Index', icon: '😷', unit: 'AQI', min: 0, max: 500 },
];

export const CreateAlertModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    cityName: '',
    conditionType: 'rain',
    threshold: 5,
    isActive: true
  });

  const [errors, setErrors] = useState({});

  const selectedType = ALERT_TYPES.find(t => t.value === formData.conditionType);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    setErrors(prev => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.cityName.trim()) {
      newErrors.cityName = 'City name is required';
    }

    if (!selectedType) {
      newErrors.conditionType = 'Alert type is required';
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

    onSubmit(formData);

    // Reset form
    setFormData({
      cityName: '',
      conditionType: 'rain',
      threshold: 5,
      isActive: true
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */ }
        <motion.div
          initial={ { opacity: 0 } }
          animate={ { opacity: 1 } }
          exit={ { opacity: 0 } }
          onClick={ onClose }
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */ }
        <motion.div
          initial={ { opacity: 0, scale: 0.9, y: 20 } }
          animate={ { opacity: 1, scale: 1, y: 0 } }
          exit={ { opacity: 0, scale: 0.9, y: 20 } }
          className="relative w-full max-w-md max-h-[90vh] bg-slate-900 rounded-2xl shadow-2xl border border-white/10 overflow-hidden flex flex-col"
        >
          {/* Header */ }
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="text-xl font-semibold text-white">Create Alert Rule</h2>
            <button
              onClick={ onClose }
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Form */ }
          <form onSubmit={ handleSubmit } className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* City Name */ }
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                City Name
              </label>
              <input
                type="text"
                value={ formData.cityName }
                onChange={ (e) => handleChange('cityName', e.target.value) }
                placeholder="e.g., Hanoi"
                className={ `w-full px-4 py-3 bg-slate-800 border ${errors.cityName ? 'border-red-500' : 'border-white/10'
                  } rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors` }
              />
              { errors.cityName && (
                <p className="mt-1 text-sm text-red-400">{ errors.cityName }</p>
              ) }
            </div>

            {/* Alert Type */ }
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Alert Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                { ALERT_TYPES.map((type) => (
                  <button
                    key={ type.value }
                    type="button"
                    onClick={ () => {
                      handleChange('conditionType', type.value);
                      // Set default threshold for this type
                      handleChange('threshold', (type.min + type.max) / 2);
                    } }
                    className={ `p-3 rounded-lg border transition-all ${formData.conditionType === type.value
                      ? 'border-blue-500 bg-blue-500/20 text-white'
                      : 'border-white/10 bg-slate-800 text-slate-300 hover:border-white/30'
                      }` }
                  >
                    <div className="text-2xl mb-1">{ type.icon }</div>
                    <div className="text-xs">{ type.label }</div>
                  </button>
                )) }
              </div>
            </div>

            {/* Threshold */ }
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Threshold
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={ formData.threshold }
                  onChange={ (e) => handleChange('threshold', e.target.value) }
                  min={ selectedType?.min }
                  max={ selectedType?.max }
                  step={ selectedType?.value === 'rain' ? 0.1 : 1 }
                  className={ `flex-1 px-4 py-3 bg-slate-800 border ${errors.threshold ? 'border-red-500' : 'border-white/10'
                    } rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors` }
                />
                <span className="text-slate-400 text-sm min-w-[80px]">
                  { selectedType?.unit }
                </span>
              </div>
              { errors.threshold && (
                <p className="mt-1 text-sm text-red-400">{ errors.threshold }</p>
              ) }
              { selectedType && (
                <p className="mt-1 text-xs text-slate-500">
                  Range: { selectedType.min } - { selectedType.max } { selectedType.unit }
                </p>
              ) }
            </div>

            {/* Active Toggle */ }
            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-white">Active</p>
                <p className="text-xs text-slate-400">Enable this alert rule</p>
              </div>
              <button
                type="button"
                onClick={ () => handleChange('isActive', !formData.isActive) }
                className={ `relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.isActive ? 'bg-blue-500' : 'bg-slate-600'
                  }` }
              >
                <span
                  className={ `inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isActive ? 'translate-x-6' : 'translate-x-1'
                    }` }
                />
              </button>
            </div>

            {/* Notification Preview */ }
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-xs text-slate-400 mb-2">Preview:</p>
              <p className="text-sm text-white">
                { selectedType?.icon } Alert when{ ' ' }
                <span className="font-medium">{ formData.cityName || 'City' }</span>{ ' ' }
                { selectedType?.label.toLowerCase() } exceeds{ ' ' }
                <span className="font-medium">{ formData.threshold } { selectedType?.unit }</span>
              </p>
            </div>
          </form>

          {/* Footer */ }
          <div className="flex gap-3 p-6 border-t border-white/10 flex-shrink-0">
            <button
              type="button"
              onClick={ onClose }
              className="flex-1 px-4 py-2 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={ handleSubmit }
              className="flex-1 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Alert
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
