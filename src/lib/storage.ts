import type { Workout, WorkoutSession } from './types';
import { workoutDB } from './database';

// Legacy localStorage keys for migration
const LEGACY_STORAGE_KEYS = {
  WORKOUTS: 'lift-log-workouts',
  SESSIONS: 'lift-log-sessions',
} as const;

class StorageManager {
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;
    
    try {
      await workoutDB.init();
      await this.migrateLegacyData();
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize storage:', error);
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

        console.log(`Migrated ${legacyWorkouts.length} workouts and ${legacySessions.length} sessions`);
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
      if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
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
  saveSessions: (sessions: WorkoutSession[]) => storageManager.saveSessions(sessions),
  loadSessions: () => storageManager.loadSessions(),
  clearAll: () => storageManager.clearAll(),

  // New enhanced methods
  saveWorkout: (workout: Workout) => storageManager.saveWorkout(workout),
  saveSession: (session: WorkoutSession) => storageManager.saveSession(session),
  deleteWorkout: (id: string) => storageManager.deleteWorkout(id),
  getSessionsByWorkoutId: (workoutId: string) => storageManager.getSessionsByWorkoutId(workoutId),
  searchWorkouts: (query: string) => storageManager.searchWorkouts(query),
  getWorkoutsByTag: (tagId: string) => storageManager.getWorkoutsByTag(tagId),
  getStats: () => storageManager.getStats(),
}; 