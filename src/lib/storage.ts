import type { Workout, WorkoutSession } from './types';

const STORAGE_KEYS = {
  WORKOUTS: 'lift-log-workouts',
  SESSIONS: 'lift-log-sessions',
} as const;

// Utility to safely parse JSON with fallback
const safeJsonParse = <T>(json: string | null, fallback: T): T => {
  if (!json) return fallback;
  try {
    const parsed = JSON.parse(json);
    // Convert date strings back to Date objects
    return reviveDates(parsed);
  } catch (error) {
    console.warn('Failed to parse JSON from localStorage:', error);
    return fallback;
  }
};

// Utility to convert date strings back to Date objects
const reviveDates = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(reviveDates);
  }
  
  const result: any = {};
  for (const key in obj) {
    const value = obj[key];
    // Convert ISO date strings back to Date objects
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
      result[key] = new Date(value);
    } else if (typeof value === 'object') {
      result[key] = reviveDates(value);
    } else {
      result[key] = value;
    }
  }
  
  return result;
};

export const storage = {
  // Workout operations
  saveWorkouts: (workouts: Workout[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(workouts));
    } catch (error) {
      console.error('Failed to save workouts to localStorage:', error);
    }
  },

  loadWorkouts: (): Workout[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.WORKOUTS);
    return safeJsonParse(stored, []);
  },

  // Session operations
  saveSessions: (sessions: WorkoutSession[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    } catch (error) {
      console.error('Failed to save sessions to localStorage:', error);
    }
  },

  loadSessions: (): WorkoutSession[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    return safeJsonParse(stored, []);
  },

  // Clear all data
  clearAll: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEYS.WORKOUTS);
      localStorage.removeItem(STORAGE_KEYS.SESSIONS);
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  },
}; 