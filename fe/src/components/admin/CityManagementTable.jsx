import { Edit, Trash2, MapPin, Users, Power, PowerOff } from 'lucide-react';
import { motion } from 'framer-motion';

export const CityManagementTable = ({ cities, onEdit, onDelete, onToggleStatus }) => {
  if (cities.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No cities found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10 text-left">
            <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase">City</th>
            <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase">Country</th>
            <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase">Coordinates</th>
            <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase">Population</th>
            <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase">Status</th>
            <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {cities.map((city, index) => (
            <motion.tr
              key={city.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border-b border-white/5 hover:bg-white/5 transition-colors"
            >
              <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  <span className="font-medium text-white">{city.name}</span>
                </div>
              </td>
              <td className="px-4 py-4 text-slate-300">
                {city.country}
              </td>
              <td className="px-4 py-4">
                <div className="text-xs text-slate-400">
                  <div>{city.latitude.toFixed(4)}°N</div>
                  <div>{city.longitude.toFixed(4)}°E</div>
                </div>
              </td>
              <td className="px-4 py-4 text-slate-300">
                {city.population ? (
                  <div className="flex items-center gap-1 text-xs">
                    <Users className="w-3 h-3" />
                    {city.population.toLocaleString()}
                  </div>
                ) : (
                  <span className="text-slate-500 text-xs">N/A</span>
                )}
              </td>
              <td className="px-4 py-4">
                <button
                  onClick={() => onToggleStatus(city.id)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                    city.isActive
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
                      : 'bg-slate-500/20 text-slate-400 border border-slate-500/30 hover:bg-slate-500/30'
                  }`}
                >
                  {city.isActive ? (
                    <>
                      <Power className="w-3 h-3" />
                      Active
                    </>
                  ) : (
                    <>
                      <PowerOff className="w-3 h-3" />
                      Inactive
                    </>
                  )}
                </button>
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onEdit(city)}
                    className="p-2 rounded-lg hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(city.id)}
                    className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
