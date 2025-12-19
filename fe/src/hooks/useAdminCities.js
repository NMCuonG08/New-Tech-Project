import { useAdminCitiesStore } from '../store/adminCitiesStore';

export const useAdminCities = () => {
  const store = useAdminCitiesStore();

  // Validate city data
  const validateCity = (city) => {
    const errors = [];

    if (!city.name || city.name.trim().length < 2) {
      errors.push('City name must be at least 2 characters');
    }

    if (!city.country || city.country.trim().length < 2) {
      errors.push('Country name is required');
    }

    if (city.latitude === undefined || city.latitude === null) {
      errors.push('Latitude is required');
    } else if (city.latitude < -90 || city.latitude > 90) {
      errors.push('Latitude must be between -90 and 90');
    }

    if (city.longitude === undefined || city.longitude === null) {
      errors.push('Longitude is required');
    } else if (city.longitude < -180 || city.longitude > 180) {
      errors.push('Longitude must be between -180 and 180');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  // Add city with validation
  const addCityWithValidation = (city) => {
    const validation = validateCity(city);
    
    if (!validation.isValid) {
      store.setError(validation.errors.join(', '));
      return false;
    }

    const success = store.addCity(city);
    if (!success) {
      return false;
    }

    store.clearError();
    return true;
  };

  // Update city with validation
  const updateCityWithValidation = (id, updates) => {
    const city = store.cities.find(c => c.id === id);
    if (!city) {
      store.setError('City not found');
      return false;
    }

    const updatedCity = { ...city, ...updates };
    const validation = validateCity(updatedCity);
    
    if (!validation.isValid) {
      store.setError(validation.errors.join(', '));
      return false;
    }

    store.updateCity(id, updates);
    store.clearError();
    return true;
  };

  return {
    ...store,
    validateCity,
    addCityWithValidation,
    updateCityWithValidation
  };
};
