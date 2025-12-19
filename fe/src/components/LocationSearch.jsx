import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Search, X } from 'lucide-react';
import { searchLocations } from '../services/locationService';
import { saveLocation, getLocation } from '../utils/storage';

export function LocationSearch({ onLocationChange, compact = false }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('hourly');
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    // Load saved location from localStorage
    const savedLocation = getLocation();
    if (savedLocation) {
      setSelectedLocation(savedLocation);
      // Don't set query to saved location name - keep input clear for new searches
      if (onLocationChange) {
        onLocationChange(savedLocation);
      }
    } else {
      // Default to Ho Chi Minh
      const defaultLocation = { name: 'Hồ Chí Minh', province: 'Hồ Chí Minh', countryCode: 'VN' };
      setSelectedLocation(defaultLocation);
      saveLocation(defaultLocation);
      if (onLocationChange) {
        onLocationChange(defaultLocation);
      }
    }
  }, [onLocationChange]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
        // Clear query and suggestions when clicking outside
        setQuery('');
        setSuggestions([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async (searchQuery) => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoading(true);
    try {
      const results = await searchLocations(searchQuery.trim());
      setSuggestions(results);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Search error:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    // Show suggestions as user types
    if (value.length >= 2) {
      fetchSuggestions(value);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSearchSubmit = () => {
    if (query.length >= 2) {
      fetchSuggestions(query);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && query.length >= 2) {
      e.preventDefault();
      handleSearchSubmit();
    }
  };

  const handleSelectLocation = (location) => {
    setSelectedLocation(location);
    // Clear input and suggestions after selection
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    saveLocation(location);
    if (onLocationChange) {
      onLocationChange(location);
    }
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          // Reverse geocode to get city name
          try {
            const response = await fetch(
              `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&language=vi&count=1`
            );
            const data = await response.json();
            if (data.results && data.results.length > 0) {
              const result = data.results[0];
              const location = {
                name: result.name,
                province: result.admin1 || result.name,
                countryCode: result.country_code || 'VN',
              };
              handleSelectLocation(location);
            }
          } catch (error) {
            console.error('Geocoding error:', error);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (selectedLocation) {
      navigate(`/weather/${tab}?city=${encodeURIComponent(selectedLocation.name)}`);
    }
  };

  return (
    <div className="relative flex-1" ref={ searchRef }>
      {/* Search Input Row with Location Display */ }
      <div className="relative flex items-center gap-2">
        {/* Current Location Display */ }
        { selectedLocation && (
          <div className="flex items-center gap-1.5 text-sm text-slate-300 shrink-0">
            <MapPin className="h-4 w-4 text-blue-400" />
            <span className="font-medium max-w-[120px] truncate">{ selectedLocation.name }</span>
          </div>
        ) }

        {/* Search Input */ }
        <div className="relative flex-1 flex items-center">
          <Search className="absolute left-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={ query }
            onChange={ handleInputChange }
            onKeyDown={ handleKeyDown }
            onFocus={ () => query.length >= 2 && setShowSuggestions(true) }
            placeholder="Tìm tỉnh thành..."
            className={ `${compact ? 'w-full px-8 py-1.5 text-xs' : 'w-full px-10 py-2 text-sm'} rounded-full border border-white/20 bg-slate-900/60 text-slate-100 placeholder-slate-500 backdrop-blur focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20` }
          />
          { query && (
            <button
              onClick={ handleClear }
              className="absolute right-2 rounded-full p-0.5 text-slate-400 hover:text-slate-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) }
        </div>

        {/* Search Button */ }
        <button
          onClick={ handleSearchSubmit }
          disabled={ query.length < 2 }
          className="shrink-0 rounded-full bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Search className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Suggestions Dropdown - Always below input */ }
      { showSuggestions && suggestions.length > 0 && (
        <div
          ref={ suggestionsRef }
          className="absolute left-0 right-0 mt-2 z-50 max-h-64 overflow-y-auto rounded-2xl border border-white/10 bg-slate-900/95 backdrop-blur shadow-xl"
          style={ { top: '100%' } }
        >
          <div className="p-2">
            { suggestions.map((location) => (
              <button
                key={ location.id }
                onClick={ () => handleSelectLocation(location) }
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-slate-200 transition hover:bg-white/10"
              >
                <MapPin className="h-4 w-4 text-blue-400" />
                <div>
                  <div className="font-medium">{ location.name }</div>
                  { location.province && (
                    <div className="text-xs text-slate-400">
                      { location.province }
                    </div>
                  ) }
                </div>
              </button>
            )) }
          </div>
        </div>
      ) }

      {/* No Results Message - Also below input */ }
      { showSuggestions && query.length >= 2 && !loading && suggestions.length === 0 && (
        <div
          className="absolute left-0 right-0 mt-2 z-50 rounded-2xl border border-white/10 bg-slate-900/95 backdrop-blur p-4 text-center text-sm text-slate-400"
          style={ { top: '100%' } }
        >
          Không tìm thấy kết quả
        </div>
      ) }

      {/* Tab Buttons and Current Location Button */ }
      { !compact && (
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center gap-1 rounded-full border border-white/20 bg-slate-900/60 p-0.5">
            <button
              onClick={ () => handleTabClick('hourly') }
              className={ `px-3 py-1 text-xs rounded-full transition ${activeTab === 'hourly'
                  ? 'bg-blue-500 text-white'
                  : 'text-slate-300 hover:text-white'
                }` }
            >
              Hourly
            </button>
            <button
              onClick={ () => handleTabClick('daily') }
              className={ `px-3 py-1 text-xs rounded-full transition ${activeTab === 'daily'
                  ? 'bg-blue-500 text-white'
                  : 'text-slate-300 hover:text-white'
                }` }
            >
              Daily
            </button>
          </div>

          { selectedLocation && (
            <button
              onClick={ handleUseCurrentLocation }
              className="text-xs text-blue-400 hover:text-blue-300 transition"
            >
              📍 Sử dụng vị trí hiện tại
            </button>
          ) }
        </div>
      ) }

      {/* Compact mode: only show tabs */ }
      { compact && (
        <div className="flex items-center gap-1 rounded-full border border-white/20 bg-slate-900/60 p-0.5 mt-2">
          <button
            onClick={ () => handleTabClick('hourly') }
            className={ `px-3 py-1 text-xs rounded-full transition ${activeTab === 'hourly'
                ? 'bg-blue-500 text-white'
                : 'text-slate-300 hover:text-white'
              }` }
          >
            Hourly
          </button>
          <button
            onClick={ () => handleTabClick('daily') }
            className={ `px-3 py-1 text-xs rounded-full transition ${activeTab === 'daily'
                ? 'bg-blue-500 text-white'
                : 'text-slate-300 hover:text-white'
              }` }
          >
            Daily
          </button>
        </div>
      ) }
    </div>
  );
}
