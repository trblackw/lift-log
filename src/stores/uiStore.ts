import { create } from 'zustand';

interface UIState {
  selectedDate: Date;
  isAppLoading: boolean;
  globalError: string | null;
}

interface UIActions {
  // Date management
  setSelectedDate: (date: Date) => void;

  // Global app state
  setAppLoading: (loading: boolean) => void;
  setGlobalError: (error: string | null) => void;
  clearError: () => void;
}

export const useUIStore = create<UIState & UIActions>(set => ({
  // Initial state
  selectedDate: new Date(),
  isAppLoading: true,
  globalError: null,

  // Actions
  setSelectedDate: selectedDate => set({ selectedDate }),
  setAppLoading: isAppLoading => set({ isAppLoading }),
  setGlobalError: globalError => set({ globalError }),
  clearError: () => set({ globalError: null }),
}));
