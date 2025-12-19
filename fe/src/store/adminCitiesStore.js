import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAdminCitiesStore = create(
  persist(
    (set, get) => ({
      cities: [
        // Pre-populated cities for demo
        {
          id: 1,
          name: 'Hanoi',
          country: 'Vietnam',
          latitude: 21.0285,
          longitude: 105.8542,
          timezone: 'Asia/Ho_Chi_Minh',
          population: 8053663,
          isActive: true,
          createdAt: '2025-12-01T00:00:00Z'
        },
        {
          id: 2,
          name: 'Ho Chi Minh City',
          country: 'Vietnam',
          latitude: 10.8231,
          longitude: 106.6297,
          timezone: 'Asia/Ho_Chi_Minh',
          population: 9077158,
          isActive: true,
          createdAt: '2025-12-01T00:00:00Z'
        },
        {
          id: 3,
          name: 'Da Nang',
          country: 'Vietnam',
          latitude: 16.0544,
          longitude: 108.2022,
          timezone: 'Asia/Ho_Chi_Minh',
          population: 1134000,
          isActive: true,
          createdAt: '2025-12-01T00:00:00Z'
        },
        {
          id: 4,
          name: 'Hai Phong',
          country: 'Vietnam',
          latitude: 20.8449,
          longitude: 106.6881,
          timezone: 'Asia/Ho_Chi_Minh',
          population: 2028514,
          isActive: true,
          createdAt: '2025-12-01T00:00:00Z'
        },
        {
          id: 5,
          name: 'Can Tho',
          country: 'Vietnam',
          latitude: 10.0452,
          longitude: 105.7469,
          timezone: 'Asia/Ho_Chi_Minh',
          population: 1282000,
          isActive: true,
          createdAt: '2025-12-01T00:00:00Z'
        }
      ],
      isLoading: false,
      error: null,

      // Add city
      addCity: (city) => {
        const { cities } = get();
        
        // Check duplicate
        const exists = cities.find(
          c => c.name.toLowerCase() === city.name.toLowerCase() && 
               c.country.toLowerCase() === city.country.toLowerCase()
        );
        
        if (exists) {
          set({ error: 'City already exists' });
          return false;
        }

        set({
          cities: [
            ...cities,
            {
              ...city,
              id: Date.now(),
              isActive: true,
              createdAt: new Date().toISOString()
            }
          ],
          error: null
        });
        return true;
      },

      // Update city
      updateCity: (id, updates) => set((state) => ({
        cities: state.cities.map(c =>
          c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
        )
      })),

      // Delete city
      deleteCity: (id) => set((state) => ({
        cities: state.cities.filter(c => c.id !== id)
      })),

      // Toggle active status
      toggleCityStatus: (id) => set((state) => ({
        cities: state.cities.map(c =>
          c.id === id ? { ...c, isActive: !c.isActive } : c
        )
      })),

      // Get active cities only
      getActiveCities: () => {
        return get().cities.filter(c => c.isActive);
      },

      // Search cities
      searchCities: (query) => {
        const { cities } = get();
        const lowerQuery = query.toLowerCase();
        return cities.filter(c =>
          c.name.toLowerCase().includes(lowerQuery) ||
          c.country.toLowerCase().includes(lowerQuery)
        );
      },

      // Get stats
      getStats: () => {
        const { cities } = get();
        return {
          total: cities.length,
          active: cities.filter(c => c.isActive).length,
          inactive: cities.filter(c => !c.isActive).length,
          countries: new Set(cities.map(c => c.country)).size
        };
      },

      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null })
    }),
    {
      name: 'admin-cities-storage',
      partialize: (state) => ({ cities: state.cities })
    }
  )
);
