import { useAlertsStore } from '../store/alertsStore';
import { useEffect } from 'react';
import { AlertType } from '../services/alertsService';

export const useAlerts = () => {
  const store = useAlertsStore();

  // Fetch alerts on mount
  useEffect(() => {
    store.fetchAlerts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Get active rules
  const getActiveRules = () => {
    return store.rules.filter(r => r.isActive);
  };

  // Get rules by location
  const getRulesByLocation = (locationId) => {
    return store.rules.filter(r => r.locationId === locationId);
  };

  // Get recent alerts
  const getRecentAlerts = (limit = 10) => {
    return store.alerts.slice(0, limit);
  };

  // Get unread alerts
  const getUnreadAlerts = () => {
    return store.alerts.filter(a => !a.isRead);
  };

  // Validate alert rule
  const validateRule = (rule) => {
    const errors = [];

    if (!rule.locationId) {
      errors.push('Location is required');
    }

    if (!rule.type) {
      errors.push('Alert type is required');
    }

    if (rule.threshold === undefined || rule.threshold === null) {
      errors.push('Threshold is required');
    }

    // Validate threshold ranges
    switch (rule.type) {
      case AlertType.RAIN:
        if (rule.threshold < 0 || rule.threshold > 100) {
          errors.push('Rain threshold must be between 0-100 mm');
        }
        break;
      case AlertType.TEMPERATURE_HIGH:
        if (rule.threshold < 30 || rule.threshold > 50) {
          errors.push('High temperature threshold must be between 30-50°C');
        }
        break;
      case AlertType.TEMPERATURE_LOW:
        if (rule.threshold < -20 || rule.threshold > 20) {
          errors.push('Low temperature threshold must be between -20-20°C');
        }
        break;
      case AlertType.AQI:
        if (rule.threshold < 0 || rule.threshold > 500) {
          errors.push('AQI threshold must be between 0-500');
        }
        break;
      case AlertType.WIND:
        if (rule.threshold < 0 || rule.threshold > 200) {
          errors.push('Wind threshold must be between 0-200 km/h');
        }
        break;
      case AlertType.HUMIDITY:
        if (rule.threshold < 0 || rule.threshold > 100) {
          errors.push('Humidity threshold must be between 0-100%');
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  // Add rule with validation
  const addRuleWithValidation = async (rule) => {
    const validation = validateRule(rule);
    
    if (!validation.isValid) {
      store.setError(validation.errors.join(', '));
      return false;
    }

    const result = await store.addRule(rule);
    if (result) {
      store.clearError();
      return true;
    }
    return false;
  };

  return {
    ...store,
    getActiveRules,
    getRulesByLocation,
    getRecentAlerts,
    getUnreadAlerts,
    validateRule,
    addRuleWithValidation,
    AlertType
  };
};
