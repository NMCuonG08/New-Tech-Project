import { useState, useEffect, useRef } from 'react';
import { searchLocations } from '../services/locationService';
import { MapPin, Search, X } from 'lucide-react';

export function CitySearch({ currentCity, onCitySelect }) {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const searchRef = useRef(null);
    const debounceRef = useRef(null);

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
        setQuery('');
        setSuggestions([]);
        setIsOpen(false);
        onCitySelect(location);
    };

    const handleClear = () => {
        setQuery('');
        setSuggestions([]);
        setIsOpen(false);
    };

    return (
        <div ref={ searchRef } className="relative w-full max-w-md">
            <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Search className="h-5 w-5 text-slate-400" />
                </div>
                <input
                    type="text"
                    value={ query }
                    onChange={ (e) => setQuery(e.target.value) }
                    placeholder="Tìm kiếm thành phố..."
                    className="w-full rounded-2xl border border-white/15 bg-slate-900/60 py-3 pl-12 pr-12 text-sm font-medium text-slate-100 placeholder-slate-400 backdrop-blur transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    style={ { colorScheme: 'dark' } }
                />
                { query && (
                    <button
                        onClick={ handleClear }
                        className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-200"
                        aria-label="Clear search"
                    >
                        <X className="h-5 w-5" />
                    </button>
                ) }
                { loading && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
                    </div>
                ) }
            </div>

            { isOpen && suggestions.length > 0 && (
                <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-white/15 bg-slate-900/95 shadow-2xl backdrop-blur-xl">
                    <div className="max-h-80 overflow-y-auto">
                        { suggestions.map((location) => (
                            <button
                                key={ location.id }
                                onClick={ () => handleSelect(location) }
                                className="flex w-full items-center gap-3 border-b border-white/5 px-4 py-3 text-left transition-colors hover:bg-white/10 last:border-b-0"
                            >
                                <MapPin className="h-5 w-5 flex-shrink-0 text-blue-400" />
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
    );
}
