import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface UIState {
  // Theme preferences
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;

  // UI preferences
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Language preferences
  language: string;
  setLanguage: (language: string) => void;

  // Recent items
  recentProjects: string[];
  addRecentProject: (projectId: string) => void;
  clearRecentProjects: () => void;

  // User preferences
  preferences: {
    showWelcomeMessage: boolean;
    enableNotifications: boolean;
    autoSave: boolean;
  };
  updatePreferences: (preferences: Partial<UIState['preferences']>) => void;

  // Reset all preferences
  resetPreferences: () => void;
}

const defaultPreferences = {
  showWelcomeMessage: true,
  enableNotifications: true,
  autoSave: true,
};

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Initial state
      theme: 'system',
      sidebarCollapsed: false,
      language: 'en',
      recentProjects: [],
      preferences: defaultPreferences,

      // Actions
      setTheme: (theme) => set({ theme }),

      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      setLanguage: (language) => set({ language }),

      addRecentProject: (projectId) =>
        set((state) => {
          const filtered = state.recentProjects.filter((id) => id !== projectId);
          return {
            recentProjects: [projectId, ...filtered].slice(0, 10), // Keep last 10
          };
        }),

      clearRecentProjects: () => set({ recentProjects: [] }),

      updatePreferences: (newPreferences) =>
        set((state) => ({
          preferences: { ...state.preferences, ...newPreferences },
        })),

      resetPreferences: () =>
        set({
          theme: 'system',
          sidebarCollapsed: false,
          language: 'en',
          recentProjects: [],
          preferences: defaultPreferences,
        }),
    }),
    {
      name: 'ui-preferences', // localStorage key
      storage: createJSONStorage(() => localStorage),
      // Only persist these specific fields
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
        language: state.language,
        recentProjects: state.recentProjects,
        preferences: state.preferences,
      }),
    }
  )
);
