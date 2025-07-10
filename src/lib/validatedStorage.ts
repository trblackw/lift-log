import { storage } from './storage';
import {
  validateWorkout,
  validateWorkouts,
  validateWorkoutSession,
  validateWorkoutSessions,
  validateActiveWorkoutSession,
  safeParseWorkout,
  safeParseWorkoutSession,
  safeParseActiveWorkoutSession,
  type Workout,
  type WorkoutSession,
  type ActiveWorkoutSession,
} from './schemas';

/**
 * Enhanced storage layer with Zod validation
 * Provides runtime type safety and better error handling
 */
class ValidatedStorageManager {
  // Workout operations with validation
  async saveWorkout(workout: Workout): Promise<void> {
    try {
      // Validate before saving
      const validatedWorkout = validateWorkout(workout);
      await storage.saveWorkout(validatedWorkout);
    } catch (error) {
      console.error('Failed to save workout - validation error:', error);
      throw new Error(
        `Invalid workout data: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async saveWorkouts(workouts: Workout[]): Promise<void> {
    try {
      // Validate all workouts before saving
      const validatedWorkouts = validateWorkouts(workouts);
      await storage.saveWorkouts(validatedWorkouts);
    } catch (error) {
      console.error('Failed to save workouts - validation error:', error);
      throw new Error(
        `Invalid workouts data: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async loadWorkouts(): Promise<Workout[]> {
    try {
      const rawWorkouts = await storage.loadWorkouts();

      // Validate loaded data
      const validatedWorkouts = validateWorkouts(rawWorkouts);
      return validatedWorkouts;
    } catch (error) {
      console.error('Failed to load workouts - validation error:', error);

      // Try to recover by filtering out invalid workouts
      const rawWorkouts = await storage.loadWorkouts();
      const validWorkouts: Workout[] = [];

      for (const workout of rawWorkouts) {
        const result = safeParseWorkout(workout);
        if (result.success) {
          validWorkouts.push(result.data);
        } else {
          console.warn(
            `Skipping invalid workout: ${result.error.message}`,
            workout
          );
        }
      }

      return validWorkouts;
    }
  }

  // Session operations with validation
  async saveWorkoutSession(session: WorkoutSession): Promise<void> {
    try {
      const validatedSession = validateWorkoutSession(session);
      await storage.saveSession(validatedSession);
    } catch (error) {
      console.error('Failed to save session - validation error:', error);
      throw new Error(
        `Invalid session data: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async loadWorkoutSessions(): Promise<WorkoutSession[]> {
    try {
      const rawSessions = await storage.loadSessions();
      const validatedSessions = validateWorkoutSessions(rawSessions);
      return validatedSessions;
    } catch (error) {
      console.error('Failed to load sessions - validation error:', error);

      // Try to recover by filtering out invalid sessions
      const rawSessions = await storage.loadSessions();
      const validSessions: WorkoutSession[] = [];

      for (const session of rawSessions) {
        const result = safeParseWorkoutSession(session);
        if (result.success) {
          validSessions.push(result.data);
        } else {
          console.warn(
            `Skipping invalid session: ${result.error.message}`,
            session
          );
        }
      }

      return validSessions;
    }
  }

  // Active workout session operations with validation
  async saveActiveWorkoutSession(session: ActiveWorkoutSession): Promise<void> {
    try {
      const validatedSession = validateActiveWorkoutSession(session);
      await storage.saveActiveWorkoutSession(validatedSession);
    } catch (error) {
      console.error('Failed to save active session - validation error:', error);
      throw new Error(
        `Invalid active session data: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async loadActiveWorkoutSession(): Promise<ActiveWorkoutSession | null> {
    try {
      const rawSession = await storage.loadActiveWorkoutSession();
      if (!rawSession) return null;

      const validatedSession = validateActiveWorkoutSession(rawSession);
      return validatedSession;
    } catch (error) {
      console.error('Failed to load active session - validation error:', error);

      // Clear invalid active session to prevent app crashes
      await storage.clearActiveWorkoutSession();
      return null;
    }
  }

  // Proxy remaining methods to original storage
  async deleteWorkout(id: string): Promise<void> {
    return storage.deleteWorkout(id);
  }

  async clearAll(): Promise<void> {
    return storage.clearAll();
  }

  async init(): Promise<void> {
    return storage.init();
  }

  async searchWorkouts(query: string): Promise<Workout[]> {
    const results = await storage.searchWorkouts(query);
    // Validate search results
    const validResults: Workout[] = [];
    for (const workout of results) {
      const result = safeParseWorkout(workout);
      if (result.success) {
        validResults.push(result.data);
      }
    }
    return validResults;
  }

  async getWorkoutsByTag(tagId: string): Promise<Workout[]> {
    const results = await storage.getWorkoutsByTag(tagId);
    // Validate results
    const validResults: Workout[] = [];
    for (const workout of results) {
      const result = safeParseWorkout(workout);
      if (result.success) {
        validResults.push(result.data);
      }
    }
    return validResults;
  }

  async getSessionsByWorkoutId(workoutId: string): Promise<WorkoutSession[]> {
    const results = await storage.getSessionsByWorkoutId(workoutId);
    // Validate results
    const validResults: WorkoutSession[] = [];
    for (const session of results) {
      const result = safeParseWorkoutSession(session);
      if (result.success) {
        validResults.push(result.data);
      }
    }
    return validResults;
  }

  // Additional validation utilities
  async validateDataIntegrity(): Promise<{
    validWorkouts: number;
    invalidWorkouts: number;
    validSessions: number;
    invalidSessions: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let validWorkouts = 0;
    let invalidWorkouts = 0;
    let validSessions = 0;
    let invalidSessions = 0;

    try {
      // Check workouts
      const rawWorkouts = await storage.loadWorkouts();
      for (const workout of rawWorkouts) {
        const result = safeParseWorkout(workout);
        if (result.success) {
          validWorkouts++;
        } else {
          invalidWorkouts++;
          errors.push(`Invalid workout ${workout.id}: ${result.error.message}`);
        }
      }

      // Check sessions
      const rawSessions = await storage.loadSessions();
      for (const session of rawSessions) {
        const result = safeParseWorkoutSession(session);
        if (result.success) {
          validSessions++;
        } else {
          invalidSessions++;
          errors.push(`Invalid session ${session.id}: ${result.error.message}`);
        }
      }
    } catch (error) {
      errors.push(
        `Failed to validate data: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    return {
      validWorkouts,
      invalidWorkouts,
      validSessions,
      invalidSessions,
      errors,
    };
  }
}

// Export singleton instance
export const validatedStorage = new ValidatedStorageManager();
