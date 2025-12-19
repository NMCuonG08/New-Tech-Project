import { useAlertsStore } from '../store/alertsStore';

export const useAlerts = () => {
  const store = useAlertsStore();

  // Get active rules
  const getActiveRules = () => {
    return store.rules.filter(r => r.isActive);
  };

  // Get rules by city
  const getRulesByCity = (cityName) => {
    return store.rules.filter(r => 
      r.cityName.toLowerCase() === cityName.toLowerCase()
    );
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

    if (!rule.cityName) {
      errors.push('City name is required');
    }

    if (!rule.conditionType) {
      errors.push('Condition type is required');
    }

    if (rule.threshold === undefined || rule.threshold === null) {
      errors.push('Threshold is required');
    }

    // Validate threshold ranges
    switch (rule.conditionType) {
      case 'rain':
        if (rule.threshold < 0 || rule.threshold > 100) {
          errors.push('Rain threshold must be between 0-100 mm');
        }
        break;
      case 'temp_high':
        if (rule.threshold < 30 || rule.threshold > 50) {
          errors.push('High temperature threshold must be between 30-50°C');
        }
        break;
      case 'temp_low':
        if (rule.threshold < -20 || rule.threshold > 20) {
          errors.push('Low temperature threshold must be between -20-20°C');
        }
        break;
      case 'aqi':
        if (rule.threshold < 0 || rule.threshold > 500) {
          errors.push('AQI threshold must be between 0-500');
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  // Add rule with validation
  const addRuleWithValidation = (rule) => {
    const validation = validateRule(rule);
    
    if (!validation.isValid) {
      store.setError(validation.errors.join(', '));
      return false;
    }

    store.addRule(rule);
    store.clearError();
    return true;
  };

  return {
    ...store,
    getActiveRules,
    getRulesByCity,
    getRecentAlerts,
    getUnreadAlerts,
    validateRule,
    addRuleWithValidation
  };
};
