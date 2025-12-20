import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import alertsService from '../services/alertsService';

export const useAlertsStore = create(
  persist(
    (set, get) => ({
      // Alert rules
      rules: [],
      
      // Alert history
      alerts: [],
      unreadCount: 0,
      
      isLoading: false,
      error: null,

      // ========== Fetch from Backend ==========
      
      // Fetch all alert rules
      fetchAlerts: async () => {
        set({ isLoading: true, error: null });
        try {
          const data = await alertsService.getAlerts();
          set({ rules: data, isLoading: false });
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'Failed to fetch alerts',
            isLoading: false 
          });
        }
      },

      // Fetch active alerts by location
      fetchAlertsByLocation: async (locationId) => {
        set({ isLoading: true, error: null });
        try {
          const data = await alertsService.getActiveAlertsByLocation(locationId);
          return data;
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'Failed to fetch location alerts',
            isLoading: false 
          });
          return [];
        }
      },

      // ========== Alert Rules ==========
      
      // Add rule
      addRule: async (rule) => {
        set({ isLoading: true, error: null });
        try {
          const newRule = await alertsService.createAlert(rule);
          set((state) => ({
            rules: [...state.rules, newRule],
            isLoading: false
          }));
          return newRule;
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'Failed to create alert',
            isLoading: false 
          });
          return null;
        }
      },

      // Remove rule
      removeRule: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await alertsService.deleteAlert(id);
          set((state) => ({
            rules: state.rules.filter(r => r.id !== id),
            isLoading: false
          }));
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'Failed to delete alert',
            isLoading: false 
          });
        }
      },

      // Update rule
      updateRule: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          const updatedRule = await alertsService.updateAlert(id, updates);
          set((state) => ({
            rules: state.rules.map(r => r.id === id ? updatedRule : r),
            isLoading: false
          }));
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'Failed to update alert',
            isLoading: false 
          });
        }
      },

      // Toggle rule active status
      toggleRule: async (id) => {
        const rule = get().rules.find(r => r.id === id);
        if (rule) {
          await get().updateRule(id, { isActive: !rule.isActive });
        }
      },

      // ========== Alert History ==========

      // Add alert to history
      addAlert: (alert) => set((state) => ({
        alerts: [{ ...alert, id: Date.now(), isRead: false }, ...state.alerts],
        unreadCount: state.unreadCount + 1
      })),

      // Mark all as read
      markAllAsRead: () => set((state) => ({
        alerts: state.alerts.map(a => ({ ...a, isRead: true })),
        unreadCount: 0
      })),

      // Mark single alert as read
      markAsRead: (id) => set((state) => {
        const alert = state.alerts.find(a => a.id === id);
        if (alert && !alert.isRead) {
          return {
            alerts: state.alerts.map(a =>
              a.id === id ? { ...a, isRead: true } : a
            ),
            unreadCount: Math.max(0, state.unreadCount - 1)
          };
        }
        return state;
      }),

      // Delete alert from history
      deleteAlert: (id) => set((state) => {
        const alert = state.alerts.find(a => a.id === id);
        return {
          alerts: state.alerts.filter(a => a.id !== id),
          unreadCount: alert && !alert.isRead 
            ? Math.max(0, state.unreadCount - 1)
            : state.unreadCount
        };
      }),

      // Clear history
      clearHistory: () => set({ alerts: [], unreadCount: 0 }),

      // ========== General ==========

      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null })
    }),
    {
      name: 'alerts-storage',
      partialize: (state) => ({
        rules: state.rules,
        alerts: state.alerts,
        unreadCount: state.unreadCount
      })
    }
  )
);
