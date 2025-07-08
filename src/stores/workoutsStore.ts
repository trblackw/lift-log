import { create } from 'zustand';
import { toast } from 'sonner';
import { storage } from '../lib/storage';
import type { Workout } from '../lib/types';

interface WorkoutsState {
  workouts: Workout[];
  isLoading: boolean;
  error: string | null;
}

interface WorkoutsActions {
  // Data loading
  initializeWorkouts: () => Promise<void>;

  // CRUD operations
  createWorkout: (
    workoutData: Omit<Workout, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>;
  updateWorkout: (workout: Workout) => Promise<void>;
  deleteWorkout: (workoutId: string) => Promise<void>;

  // Computed helpers
  getWorkoutById: (workoutId: string) => Workout | undefined;
  incrementWorkoutCompletedCount: (workoutId: string) => Promise<void>;

  // State setters
  setWorkouts: (workouts: Workout[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useWorkoutsStore = create<WorkoutsState & WorkoutsActions>(
  (set, get) => ({
    // Initial state
    workouts: [],
    isLoading: true,
    error: null,

    // Actions
    initializeWorkouts: async () => {
      try {
        set({ isLoading: true, error: null });
        const loadedWorkouts = await storage.loadWorkouts();
        set({ workouts: loadedWorkouts, isLoading: false });
      } catch (error) {
        console.error('Failed to load workouts:', error);
        set({
          error: 'Failed to load workouts. Please refresh the page.',
          isLoading: false,
        });
      }
    },

    createWorkout: async workoutData => {
      try {
        const newWorkout: Workout = {
          ...workoutData,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
          completedCount: 0,
        };

        await storage.saveWorkout(newWorkout);

        set(state => ({
          workouts: [newWorkout, ...state.workouts],
        }));

        toast.success('Workout created successfully!', {
          description: `"${newWorkout.name}" is ready to use.`,
        });
      } catch (error) {
        console.error('Failed to create workout:', error);
        set({ error: 'Failed to create workout. Please try again.' });

        toast.error('Failed to create workout', {
          description: 'Please check your data and try again.',
        });
        throw error;
      }
    },

    updateWorkout: async workout => {
      try {
        const updatedWorkout: Workout = {
          ...workout,
          updatedAt: new Date(),
        };

        await storage.saveWorkout(updatedWorkout);

        set(state => ({
          workouts: state.workouts.map(w =>
            w.id === updatedWorkout.id ? updatedWorkout : w
          ),
        }));

        toast.success('Workout updated successfully!', {
          description: `"${updatedWorkout.name}" has been saved with your changes.`,
        });
      } catch (error) {
        console.error('Failed to update workout:', error);
        set({ error: 'Failed to update workout. Please try again.' });

        toast.error('Failed to update workout', {
          description: 'Please check your data and try again.',
        });
        throw error;
      }
    },

    deleteWorkout: async workoutId => {
      try {
        const { workouts } = get();
        const workout = workouts.find(w => w.id === workoutId);
        const workoutName = workout?.name || 'Unknown';

        await storage.deleteWorkout(workoutId);

        set(state => ({
          workouts: state.workouts.filter(w => w.id !== workoutId),
        }));

        toast.success('Workout deleted successfully!', {
          description: `"${workoutName}" has been removed from your workouts.`,
        });
      } catch (error) {
        console.error('Failed to delete workout:', error);
        set({ error: 'Failed to delete workout. Please try again.' });

        toast.error('Failed to delete workout', {
          description: 'Please try again.',
        });
        throw error;
      }
    },

    getWorkoutById: workoutId => {
      const { workouts } = get();
      return workouts.find(w => w.id === workoutId);
    },

    incrementWorkoutCompletedCount: async workoutId => {
      try {
        const { workouts } = get();
        const workout = workouts.find(w => w.id === workoutId);

        if (!workout) {
          console.error(
            'Workout not found for completedCount increment:',
            workoutId
          );
          return;
        }

        const updatedWorkout: Workout = {
          ...workout,
          completedCount: workout.completedCount + 1,
          updatedAt: new Date(),
        };

        await storage.saveWorkout(updatedWorkout);

        set(state => ({
          workouts: state.workouts.map(w =>
            w.id === workoutId ? updatedWorkout : w
          ),
        }));
      } catch (error) {
        console.error('Failed to increment workout completed count:', error);
      }
    },

    setWorkouts: workouts => set({ workouts }),
    setLoading: isLoading => set({ isLoading }),
    setError: error => set({ error }),
  })
);
