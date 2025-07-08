import { useEffect } from 'react';
import { useWorkoutsStore, useSessionsStore, useUIStore } from '../stores';
import { storage } from '../lib/storage';
import { initializeDebugUtils } from '../lib/debug';

export function useInitializeApp() {
  const setAppLoading = useUIStore(state => state.setAppLoading);
  const setGlobalError = useUIStore(state => state.setGlobalError);
  const initializeWorkouts = useWorkoutsStore(
    state => state.initializeWorkouts
  );
  const initializeSessions = useSessionsStore(
    state => state.initializeSessions
  );

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setAppLoading(true);
        setGlobalError(null);

        // Initialize IndexedDB
        await storage.init();

        // Initialize all stores in parallel
        await Promise.all([initializeWorkouts(), initializeSessions()]);

        // Initialize debug utilities (only in development)
        initializeDebugUtils();
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setGlobalError('Failed to load data. Please refresh the page.');
      } finally {
        setAppLoading(false);
      }
    };

    initializeApp();
  }, [setAppLoading, setGlobalError, initializeWorkouts, initializeSessions]);
}
