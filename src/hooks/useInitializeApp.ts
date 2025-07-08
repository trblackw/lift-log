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

        console.log('🚀 Starting app initialization...');

        // Initialize IndexedDB
        console.log('📦 Initializing storage...');
        await storage.init();
        console.log('✅ Storage initialized successfully');

        // Initialize all stores in parallel
        console.log('🏪 Initializing stores...');
        await Promise.all([initializeWorkouts(), initializeSessions()]);
        console.log('✅ Stores initialized successfully');

        // Initialize debug utilities (only in development)
        initializeDebugUtils();
        console.log('🛠️ Debug utilities initialized');

        console.log('🎉 App initialization complete!');
      } catch (error) {
        console.error('❌ Failed to initialize app:', error);
        setGlobalError('Failed to load data. Please refresh the page.');
      } finally {
        setAppLoading(false);
      }
    };

    initializeApp();
  }, [setAppLoading, setGlobalError, initializeWorkouts, initializeSessions]);
}
