import { useState, useEffect, useRef } from 'react';
import { searchLocations } from '../services/locationService';
import { MapPin, Search, X } from 'lucide-react';
import { getCity } from '../utils/storage';

export function NavbarCitySearch({ onCitySelect }) {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [currentCity, setCurrentCity] = useState(getCity());
    const searchRef = useRef(null);
    const debounceRef = useRef(null);

    // Update current city when localStorage changes
    useEffect(() => {
        const handleStorageChange = () => {
            setCurrentCity(getCity());
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Debounced search
    useEffect(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        if (query.trim().length < 2) {
            setSuggestions([]);
            setIsOpen(false);
            return;
        }

        setLoading(true);
        debounceRef.current = setTimeout(async () => {
            try {
                const results = await searchLocations(query);
                setSuggestions(results);
                setIsOpen(results.length > 0);
            } catch (error) {
                console.error('Search error:', error);
                setSuggestions([]);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [query]);

    const handleSelect = (location) => {
        // Save to localStorage
        localStorage.setItem('weather-city', location.name);

        // Clear input
        setQuery('');
        setSuggestions([]);
        setIsOpen(false);

        // Update current city display
        setCurrentCity(location.name);

        // Call parent handler
        if (onCitySelect) {
            onCitySelect(location);
        }
    };

    const handleClear = () => {
        setQuery('');
        setSuggestions([]);
        setIsOpen(false);
    };

    return (
        <div className="flex items-center gap-3">
            {/* Current Location Display */ }
            <div className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-xs">
                <MapPin className="h-3.5 w-3.5 text-blue-400" />
                <span className="font-medium text-slate-200">{ currentCity }</span>
            </div>

            {/* Search Input */ }
            <div ref={ searchRef } className="relative">
                <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search className="h-3.5 w-3.5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        value={ query }
                        onChange={ (e) => setQuery(e.target.value) }
                        placeholder="Tìm thành phố..."
                        className="w-48 rounded-full border border-white/10 bg-slate-900/60 py-1.5 pl-9 pr-8 text-xs font-medium text-slate-100 placeholder-slate-500 backdrop-blur transition-all focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:w-64"
                        style={ { colorScheme: 'dark' } }
                    />
                    { query && (
                        <button
                            onClick={ handleClear }
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-200"
                            aria-label="Clear search"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    ) }
                    { loading && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            <div className="h-3 w-3 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
                        </div>
                    ) }
                </div>

                { isOpen && suggestions.length > 0 && (
                    <div className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-white/15 bg-slate-900/95 shadow-2xl backdrop-blur-xl">
                        <div className="max-h-80 overflow-y-auto">
                            { suggestions.map((location) => (
                                <button
                                    key={ location.id }
                                    onClick={ () => handleSelect(location) }
                                    className="flex w-full items-center gap-3 border-b border-white/5 px-4 py-2.5 text-left transition-colors hover:bg-white/10 last:border-b-0"
                                >
                                    <MapPin className="h-4 w-4 flex-shrink-0 text-blue-400" />
                                    <div className="flex-1 overflow-hidden">
                                        <p className="truncate text-sm font-medium text-slate-100">
                                            { location.name }
                                        </p>
                                        { location.province && (
                                            <p className="truncate text-xs text-slate-400">
                                                { location.province }
                                            </p>
                                        ) }
                                    </div>
                                </button>
                            )) }
                        </div>
                    </div>
                ) }
            </div>
        </div>
    );
}
