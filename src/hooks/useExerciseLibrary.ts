import { useState, useEffect, useCallback } from 'react';
import { storage } from '@/lib/storage';
import type { ExerciseLibrary, UniqueExercise } from '@/lib/types';

interface UseExerciseLibraryReturn {
  library: ExerciseLibrary | null;
  isLoading: boolean;
  error: string | null;
  refreshLibrary: () => Promise<void>;
  searchExercises: (query: string) => Promise<UniqueExercise[]>;
  getExerciseStats: (exerciseName: string) => Promise<UniqueExercise | null>;
  getExerciseNames: () => Promise<string[]>;
}

export function useExerciseLibrary(): UseExerciseLibraryReturn {
  const [library, setLibrary] = useState<ExerciseLibrary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshLibrary = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const exerciseLibrary = await storage.buildExerciseLibrary();
      setLibrary(exerciseLibrary);
    } catch (err) {
      console.error('Failed to build exercise library:', err);
      setError('Failed to load exercise library');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchExercises = useCallback(
    async (query: string): Promise<UniqueExercise[]> => {
      try {
        return await storage.searchExerciseLibrary(query);
      } catch (err) {
        console.error('Failed to search exercise library:', err);
        return [];
      }
    },
    []
  );

  const getExerciseStats = useCallback(
    async (exerciseName: string): Promise<UniqueExercise | null> => {
      try {
        return await storage.getExerciseUsageStats(exerciseName);
      } catch (err) {
        console.error('Failed to get exercise stats:', err);
        return null;
      }
    },
    []
  );

  const getExerciseNames = useCallback(async (): Promise<string[]> => {
    try {
      return await storage.getUniqueExerciseNames();
    } catch (err) {
      console.error('Failed to get exercise names:', err);
      return [];
    }
  }, []);

  // Load library on mount
  useEffect(() => {
    refreshLibrary();
  }, [refreshLibrary]);

  return {
    library,
    isLoading,
    error,
    refreshLibrary,
    searchExercises,
    getExerciseStats,
    getExerciseNames,
  };
}
