import type {
  Workout,
  WorkoutSession,
  ActiveWorkoutSession,
  ExerciseLibrary,
  UniqueExercise,
} from './types';
import { workoutDB } from './database';

// Legacy localStorage keys for migration
const LEGACY_STORAGE_KEYS = {
  WORKOUTS: 'lift-log-workouts',
  SESSIONS: 'lift-log-sessions',
} as const;

class StorageManager {
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) {
      console.log('📦 Storage already initialized, skipping...');
      return;
    }

    console.log('📦 Initializing storage system...');
    try {
      console.log('🗄️ Initializing workoutDB...');
      await workoutDB.init();
      console.log('✅ WorkoutDB initialized');

      console.log('🔄 Migrating legacy data...');
      await this.migrateLegacyData();
      console.log('✅ Legacy data migration complete');

      this.initialized = true;
      console.log('✅ Storage system fully initialized');
    } catch (error) {
      console.error('❌ Failed to initialize storage:', error);
      throw error;
    }
  }

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('Storage not initialized. Call init() first.');
    }
  }

  // Migration from localStorage to IndexedDB
  private async migrateLegacyData(): Promise<void> {
    try {
      // Check if we have existing workouts in IndexedDB
      const existingWorkouts = await workoutDB.getWorkouts();
      if (existingWorkouts.length > 0) {
        // Already have data, skip migration
        return;
      }

      // Try to migrate from localStorage
      const legacyWorkouts = this.getLegacyWorkouts();
      const legacySessions = this.getLegacySessions();

      if (legacyWorkouts.length > 0 || legacySessions.length > 0) {
        console.log('Migrating data from localStorage to IndexedDB...');

        // Migrate workouts
        for (const workout of legacyWorkouts) {
          await workoutDB.saveWorkout(workout);
        }

        // Migrate sessions
        for (const session of legacySessions) {
          await workoutDB.saveSession(session);
        }

        // Clear legacy localStorage data after successful migration
        localStorage.removeItem(LEGACY_STORAGE_KEYS.WORKOUTS);
        localStorage.removeItem(LEGACY_STORAGE_KEYS.SESSIONS);

        console.log(
          `Migrated ${legacyWorkouts.length} workouts and ${legacySessions.length} sessions`
        );
      }
    } catch (error) {
      console.warn('Failed to migrate legacy data:', error);
      // Don't throw - continue with fresh database
    }
  }

  private getLegacyWorkouts(): Workout[] {
    try {
      const stored = localStorage.getItem(LEGACY_STORAGE_KEYS.WORKOUTS);
      if (!stored) return [];

      const parsed = JSON.parse(stored);
      return this.reviveDates(parsed) || [];
    } catch {
      return [];
    }
  }

  private getLegacySessions(): WorkoutSession[] {
    try {
      const stored = localStorage.getItem(LEGACY_STORAGE_KEYS.SESSIONS);
      if (!stored) return [];

      const parsed = JSON.parse(stored);
      return this.reviveDates(parsed) || [];
    } catch {
      return [];
    }
  }

  // Utility to convert date strings back to Date objects
  private reviveDates(obj: any): any {
    if (obj === null || typeof obj !== 'object') return obj;

    if (Array.isArray(obj)) {
      return obj.map(item => this.reviveDates(item));
    }

    const result: any = {};
    for (const key in obj) {
      const value = obj[key];
      // Convert ISO date strings back to Date objects
      if (
        typeof value === 'string' &&
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)
      ) {
        result[key] = new Date(value);
      } else if (typeof value === 'object') {
        result[key] = this.reviveDates(value);
      } else {
        result[key] = value;
      }
    }

    return result;
  }

  // Workout operations
  async saveWorkouts(workouts: Workout[]): Promise<void> {
    this.ensureInitialized();

    try {
      // Save each workout individually
      for (const workout of workouts) {
        await workoutDB.saveWorkout(workout);
      }
    } catch (error) {
      console.error('Failed to save workouts:', error);
      throw error;
    }
  }

  async saveWorkout(workout: Workout): Promise<void> {
    this.ensureInitialized();

    try {
      await workoutDB.saveWorkout(workout);
    } catch (error) {
      console.error('Failed to save workout:', error);
      throw error;
    }
  }

  async loadWorkouts(): Promise<Workout[]> {
    this.ensureInitialized();

    try {
      return await workoutDB.getWorkouts();
    } catch (error) {
      console.error('Failed to load workouts:', error);
      return [];
    }
  }

  async deleteWorkout(id: string): Promise<void> {
    this.ensureInitialized();

    try {
      await workoutDB.deleteWorkout(id);
    } catch (error) {
      console.error('Failed to delete workout:', error);
      throw error;
    }
  }

  // Session operations
  async saveSessions(sessions: WorkoutSession[]): Promise<void> {
    this.ensureInitialized();

    try {
      // Save each session individually
      for (const session of sessions) {
        await workoutDB.saveSession(session);
      }
    } catch (error) {
      console.error('Failed to save sessions:', error);
      throw error;
    }
  }

  async saveSession(session: WorkoutSession): Promise<void> {
    this.ensureInitialized();

    try {
      await workoutDB.saveSession(session);
    } catch (error) {
      console.error('Failed to save session:', error);
      throw error;
    }
  }

  async loadSessions(): Promise<WorkoutSession[]> {
    this.ensureInitialized();

    try {
      return await workoutDB.getSessions();
    } catch (error) {
      console.error('Failed to load sessions:', error);
      return [];
    }
  }

  async getSessionsByWorkoutId(workoutId: string): Promise<WorkoutSession[]> {
    this.ensureInitialized();

    try {
      return await workoutDB.getSessionsByWorkoutId(workoutId);
    } catch (error) {
      console.error('Failed to load sessions for workout:', error);
      return [];
    }
  }

  // Date-based query operations
  async getSessionsByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<WorkoutSession[]> {
    this.ensureInitialized();

    try {
      const sessions = await workoutDB.getSessions();
      return sessions.filter(session => {
        if (!session.completedAt) return false;
        const sessionDate = new Date(session.completedAt);
        sessionDate.setHours(0, 0, 0, 0);
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        return sessionDate >= start && sessionDate <= end;
      });
    } catch (error) {
      console.error('Failed to get sessions by date range:', error);
      return [];
    }
  }

  async getSessionsByDate(date: Date): Promise<WorkoutSession[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    return this.getSessionsByDateRange(startOfDay, endOfDay);
  }

  async getSessionsByMonth(
    year: number,
    month: number
  ): Promise<WorkoutSession[]> {
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);
    return this.getSessionsByDateRange(startOfMonth, endOfMonth);
  }

  async getSessionsByYear(year: number): Promise<WorkoutSession[]> {
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);
    return this.getSessionsByDateRange(startOfYear, endOfYear);
  }

  // Search and filter operations
  async searchWorkouts(query: string): Promise<Workout[]> {
    this.ensureInitialized();

    try {
      if (!query.trim()) {
        return await this.loadWorkouts();
      }
      return await workoutDB.searchWorkouts(query);
    } catch (error) {
      console.error('Failed to search workouts:', error);
      return [];
    }
  }

  async getWorkoutsByTag(tagId: string): Promise<Workout[]> {
    this.ensureInitialized();

    try {
      return await workoutDB.getWorkoutsByTag(tagId);
    } catch (error) {
      console.error('Failed to get workouts by tag:', error);
      return [];
    }
  }

  // Utility operations
  async clearAll(): Promise<void> {
    this.ensureInitialized();

    try {
      await workoutDB.clearAllData();
    } catch (error) {
      console.error('Failed to clear all data:', error);
      throw error;
    }
  }

  async getStats(): Promise<{
    totalWorkouts: number;
    totalSessions: number;
    totalCompletedSessions: number;
  }> {
    this.ensureInitialized();

    try {
      return await workoutDB.getStats();
    } catch (error) {
      console.error('Failed to get stats:', error);
      return {
        totalWorkouts: 0,
        totalSessions: 0,
        totalCompletedSessions: 0,
      };
    }
  }

  // Active workout session operations
  async saveActiveWorkoutSession(session: ActiveWorkoutSession): Promise<void> {
    try {
      localStorage.setItem('lift-log-active-workout', JSON.stringify(session));
    } catch (error) {
      console.error('Failed to save active workout session:', error);
      throw error;
    }
  }

  async loadActiveWorkoutSession(): Promise<ActiveWorkoutSession | null> {
    try {
      const sessionData = localStorage.getItem('lift-log-active-workout');
      if (!sessionData) return null;

      const session = JSON.parse(sessionData);
      // Convert date strings back to Date objects
      session.startedAt = new Date(session.startedAt);
      if (session.pausedAt) {
        session.pausedAt = new Date(session.pausedAt);
      }

      return session;
    } catch (error) {
      console.error('Failed to load active workout session:', error);
      return null;
    }
  }

  async clearActiveWorkoutSession(): Promise<void> {
    try {
      localStorage.removeItem('lift-log-active-workout');
    } catch (error) {
      console.error('Failed to clear active workout session:', error);
      throw error;
    }
  }

  // Exercise Library operations
  async buildExerciseLibrary(): Promise<ExerciseLibrary> {
    this.ensureInitialized();

    try {
      return await workoutDB.buildExerciseLibrary();
    } catch (error) {
      console.error('Failed to build exercise library:', error);
      throw error;
    }
  }

  async getUniqueExerciseNames(): Promise<string[]> {
    this.ensureInitialized();

    try {
      return await workoutDB.getUniqueExerciseNames();
    } catch (error) {
      console.error('Failed to get unique exercise names:', error);
      return [];
    }
  }

  async searchExerciseLibrary(query: string): Promise<UniqueExercise[]> {
    this.ensureInitialized();

    try {
      return await workoutDB.searchExerciseLibrary(query);
    } catch (error) {
      console.error('Failed to search exercise library:', error);
      return [];
    }
  }

  async getExerciseUsageStats(
    exerciseName: string
  ): Promise<UniqueExercise | null> {
    this.ensureInitialized();

    try {
      return await workoutDB.getExerciseUsageStats(exerciseName);
    } catch (error) {
      console.error('Failed to get exercise usage stats:', error);
      return null;
    }
  }
}

// Create singleton instance
const storageManager = new StorageManager();

// Export the legacy API interface for backward compatibility
export const storage = {
  // Initialize the storage system
  init: () => storageManager.init(),

  // Legacy methods (maintained for backward compatibility)
  saveWorkouts: (workouts: Workout[]) => storageManager.saveWorkouts(workouts),
  loadWorkouts: () => storageManager.loadWorkouts(),
  saveSessions: (sessions: WorkoutSession[]) =>
    storageManager.saveSessions(sessions),
  loadSessions: () => storageManager.loadSessions(),
  clearAll: () => storageManager.clearAll(),

  // New enhanced methods
  saveWorkout: (workout: Workout) => storageManager.saveWorkout(workout),
  saveSession: (session: WorkoutSession) => storageManager.saveSession(session),
  deleteWorkout: (id: string) => storageManager.deleteWorkout(id),
  getSessionsByWorkoutId: (workoutId: string) =>
    storageManager.getSessionsByWorkoutId(workoutId),
  searchWorkouts: (query: string) => storageManager.searchWorkouts(query),
  getWorkoutsByTag: (tagId: string) => storageManager.getWorkoutsByTag(tagId),
  getStats: () => storageManager.getStats(),

  // Date-based query methods
  getSessionsByDateRange: (startDate: Date, endDate: Date) =>
    storageManager.getSessionsByDateRange(startDate, endDate),
  getSessionsByDate: (date: Date) => storageManager.getSessionsByDate(date),
  getSessionsByMonth: (year: number, month: number) =>
    storageManager.getSessionsByMonth(year, month),
  getSessionsByYear: (year: number) => storageManager.getSessionsByYear(year),

  // Active workout session methods
  saveActiveWorkoutSession: (session: ActiveWorkoutSession) =>
    storageManager.saveActiveWorkoutSession(session),
  loadActiveWorkoutSession: () => storageManager.loadActiveWorkoutSession(),
  clearActiveWorkoutSession: () => storageManager.clearActiveWorkoutSession(),

  // Exercise Library methods
  buildExerciseLibrary: () => storageManager.buildExerciseLibrary(),
  getUniqueExerciseNames: () => storageManager.getUniqueExerciseNames(),
  searchExerciseLibrary: (query: string) =>
    storageManager.searchExerciseLibrary(query),
  getExerciseUsageStats: (exerciseName: string) =>
    storageManager.getExerciseUsageStats(exerciseName),
};
