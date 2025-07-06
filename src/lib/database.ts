import type { Workout, WorkoutSession } from './types';

const DB_NAME = 'LiftLogDB';
const DB_VERSION = 1;

// Store names
const STORES = {
  WORKOUTS: 'workouts',
  SESSIONS: 'workoutSessions',
} as const;

class WorkoutDatabase {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create workouts store
        if (!db.objectStoreNames.contains(STORES.WORKOUTS)) {
          const workoutStore = db.createObjectStore(STORES.WORKOUTS, { keyPath: 'id' });
          workoutStore.createIndex('name', 'name', { unique: false });
          workoutStore.createIndex('createdAt', 'createdAt', { unique: false });
          workoutStore.createIndex('tags', 'tags.id', { unique: false, multiEntry: true });
        }

        // Create workout sessions store
        if (!db.objectStoreNames.contains(STORES.SESSIONS)) {
          const sessionStore = db.createObjectStore(STORES.SESSIONS, { keyPath: 'id' });
          sessionStore.createIndex('workoutId', 'workoutId', { unique: false });
          sessionStore.createIndex('startedAt', 'startedAt', { unique: false });
          sessionStore.createIndex('completedAt', 'completedAt', { unique: false });
        }
      };
    });
  }

  private ensureDB(): IDBDatabase {
    if (!this.db) {
      throw new Error('Database not initialized. Call init() first.');
    }
    return this.db;
  }

  private async performTransaction<T>(
    storeNames: string | string[],
    mode: IDBTransactionMode,
    operation: (transaction: IDBTransaction) => Promise<T>
  ): Promise<T> {
    const db = this.ensureDB();
    const transaction = db.transaction(storeNames, mode);
    
    return new Promise((resolve, reject) => {
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(new Error('Transaction aborted'));
      
      operation(transaction)
        .then(resolve)
        .catch(reject);
    });
  }

  // Workout operations
  async saveWorkout(workout: Workout): Promise<void> {
    await this.performTransaction(STORES.WORKOUTS, 'readwrite', async (transaction) => {
      const store = transaction.objectStore(STORES.WORKOUTS);
      return new Promise<void>((resolve, reject) => {
        const request = store.put(workout);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });
  }

  async getWorkouts(): Promise<Workout[]> {
    return this.performTransaction(STORES.WORKOUTS, 'readonly', async (transaction) => {
      const store = transaction.objectStore(STORES.WORKOUTS);
      const index = store.index('createdAt');
      
      return new Promise<Workout[]>((resolve, reject) => {
        const request = index.getAll();
        request.onsuccess = () => {
          // Sort by creation date, newest first
          const workouts = request.result.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          resolve(workouts);
        };
        request.onerror = () => reject(request.error);
      });
    });
  }

  async getWorkoutById(id: string): Promise<Workout | null> {
    return this.performTransaction(STORES.WORKOUTS, 'readonly', async (transaction) => {
      const store = transaction.objectStore(STORES.WORKOUTS);
      
      return new Promise<Workout | null>((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    });
  }

  async deleteWorkout(id: string): Promise<void> {
    await this.performTransaction(STORES.WORKOUTS, 'readwrite', async (transaction) => {
      const store = transaction.objectStore(STORES.WORKOUTS);
      
      return new Promise<void>((resolve, reject) => {
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });
  }

  // Session operations
  async saveSession(session: WorkoutSession): Promise<void> {
    await this.performTransaction(STORES.SESSIONS, 'readwrite', async (transaction) => {
      const store = transaction.objectStore(STORES.SESSIONS);
      
      return new Promise<void>((resolve, reject) => {
        const request = store.put(session);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });
  }

  async getSessions(): Promise<WorkoutSession[]> {
    return this.performTransaction(STORES.SESSIONS, 'readonly', async (transaction) => {
      const store = transaction.objectStore(STORES.SESSIONS);
      const index = store.index('startedAt');
      
      return new Promise<WorkoutSession[]>((resolve, reject) => {
        const request = index.getAll();
        request.onsuccess = () => {
          // Sort by start date, newest first
          const sessions = request.result.sort((a, b) => 
            new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
          );
          resolve(sessions);
        };
        request.onerror = () => reject(request.error);
      });
    });
  }

  async getSessionsByWorkoutId(workoutId: string): Promise<WorkoutSession[]> {
    return this.performTransaction(STORES.SESSIONS, 'readonly', async (transaction) => {
      const store = transaction.objectStore(STORES.SESSIONS);
      const index = store.index('workoutId');
      
      return new Promise<WorkoutSession[]>((resolve, reject) => {
        const request = index.getAll(workoutId);
        request.onsuccess = () => {
          const sessions = request.result.sort((a, b) => 
            new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
          );
          resolve(sessions);
        };
        request.onerror = () => reject(request.error);
      });
    });
  }

  // Search and filter operations
  async searchWorkouts(query: string): Promise<Workout[]> {
    const allWorkouts = await this.getWorkouts();
    const lowercaseQuery = query.toLowerCase();
    
    return allWorkouts.filter(workout => 
      workout.name.toLowerCase().includes(lowercaseQuery) ||
      (workout.description?.toLowerCase().includes(lowercaseQuery) ?? false) ||
      workout.exercises.some(exercise => 
        exercise.name.toLowerCase().includes(lowercaseQuery)
      )
    );
  }

  async getWorkoutsByTag(tagId: string): Promise<Workout[]> {
    const allWorkouts = await this.getWorkouts();
    return allWorkouts.filter(workout => 
      workout.tags.some(tag => tag.id === tagId)
    );
  }

  // Utility operations
  async clearAllData(): Promise<void> {
    await this.performTransaction([STORES.WORKOUTS, STORES.SESSIONS], 'readwrite', async (transaction) => {
      const workoutStore = transaction.objectStore(STORES.WORKOUTS);
      const sessionStore = transaction.objectStore(STORES.SESSIONS);
      
      return Promise.all([
        new Promise<void>((resolve, reject) => {
          const request = workoutStore.clear();
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        }),
        new Promise<void>((resolve, reject) => {
          const request = sessionStore.clear();
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        })
      ]).then(() => {});
    });
  }

  async getStats(): Promise<{
    totalWorkouts: number;
    totalSessions: number;
    totalCompletedSessions: number;
  }> {
    const workouts = await this.getWorkouts();
    const sessions = await this.getSessions();
    const completedSessions = sessions.filter(s => s.completedAt);

    return {
      totalWorkouts: workouts.length,
      totalSessions: sessions.length,
      totalCompletedSessions: completedSessions.length,
    };
  }
}

// Singleton instance
export const workoutDB = new WorkoutDatabase(); 