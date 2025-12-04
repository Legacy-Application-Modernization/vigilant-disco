import React, { createContext, useContext, useState, useEffect } from 'react';

export interface PhaseNotification {
  id: string;
  phase_number: number;
  phase_name: string;
  repository: string;
  timestamp: string;
}

interface PhaseNotificationContextType {
  notifications: PhaseNotification[];
  addNotification: (notification: Omit<PhaseNotification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

const PhaseNotificationContext = createContext<PhaseNotificationContextType | undefined>(undefined);

const STORAGE_KEY = 'phase_notifications';

export const PhaseNotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<PhaseNotification[]>(() => {
    // Load from localStorage on initialization
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse stored notifications:', e);
        return [];
      }
    }
    return [];
  });

  // Persist to localStorage whenever notifications change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = (notification: Omit<PhaseNotification, 'id' | 'timestamp'>) => {
    const newNotification: PhaseNotification = {
      ...notification,
      id: `${notification.repository}-phase-${notification.phase_number}-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };

    setNotifications((prev) => [newNotification, ...prev]); // Add to the beginning
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <PhaseNotificationContext.Provider
      value={{ notifications, addNotification, removeNotification, clearAllNotifications }}
    >
      {children}
    </PhaseNotificationContext.Provider>
  );
};

export const usePhaseNotifications = () => {
  const context = useContext(PhaseNotificationContext);
  if (!context) {
    throw new Error('usePhaseNotifications must be used within a PhaseNotificationProvider');
  }
  return context;
};
