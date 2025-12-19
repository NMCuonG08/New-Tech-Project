import { Edit, Trash2, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const ALERT_TYPE_CONFIG = {
  rain: { icon: '🌧️', label: 'Heavy Rain', color: 'blue' },
  temp_high: { icon: '🔥', label: 'High Temp', color: 'red' },
  temp_low: { icon: '❄️', label: 'Low Temp', color: 'cyan' },
  aqi: { icon: '😷', label: 'Air Quality', color: 'yellow' }
};

export const AlertRuleCard = ({ rule, onToggle, onEdit, onDelete }) => {
  const config = ALERT_TYPE_CONFIG[rule.conditionType] || {};

  const colorClasses = {
    blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
    red: 'from-red-500/20 to-red-600/10 border-red-500/30',
    cyan: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30',
    yellow: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30'
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`rounded-xl bg-gradient-to-br ${colorClasses[config.color]} border p-4 shadow-lg`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left Side */}
        <div className="flex items-start gap-3 flex-1">
          <div className="text-3xl">{config.icon}</div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-white">{config.label}</h3>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                rule.isActive 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
              }`}>
                {rule.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <div className="flex items-center gap-1.5 text-sm text-slate-300 mb-2">
              <MapPin className="w-3.5 h-3.5" />
              <span>{rule.cityName}</span>
            </div>
            
            <p className="text-sm text-slate-400">
              Alert when exceeds <span className="font-medium text-white">{rule.threshold}</span>
              {rule.conditionType === 'rain' && ' mm/hour'}
              {(rule.conditionType === 'temp_high' || rule.conditionType === 'temp_low') && ' °C'}
              {rule.conditionType === 'aqi' && ' AQI'}
            </p>
          </div>
        </div>

        {/* Right Side - Actions */}
        <div className="flex flex-col gap-2">
          {/* Toggle */}
          <button
            onClick={() => onToggle(rule.id)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              rule.isActive ? 'bg-green-500' : 'bg-slate-600'
            }`}
            title={rule.isActive ? 'Disable' : 'Enable'}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                rule.isActive ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>

          {/* Edit & Delete */}
          <div className="flex gap-1">
            <button
              onClick={() => onEdit(rule)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-blue-400 hover:text-blue-300 transition-colors"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(rule.id)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-red-400 hover:text-red-300 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
