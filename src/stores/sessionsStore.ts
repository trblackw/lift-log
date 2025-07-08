import { create } from 'zustand';
import { toast } from 'sonner';
import { storage } from '../lib/storage';
import { useWorkoutsStore } from './workoutsStore';
import type { WorkoutSession, ActiveWorkoutSession } from '../lib/types';

interface SessionsState {
  workoutSessions: WorkoutSession[];
  activeWorkoutSession: ActiveWorkoutSession | null;
  completedSession: WorkoutSession | null; // For showing workout summary
  isLoading: boolean;
  error: string | null;
}

interface SessionsActions {
  // Data loading
  initializeSessions: () => Promise<void>;

  // Active session management
  startWorkout: (workoutId: string) => Promise<void>;
  updateActiveSession: (session: ActiveWorkoutSession) => void;
  completeWorkout: (session: WorkoutSession) => Promise<void>;
  cancelWorkout: () => Promise<void>;

  // Session history
  addSession: (session: WorkoutSession) => void;

  // Completed session management
  clearCompletedSession: () => void;

  // State setters
  setSessions: (sessions: WorkoutSession[]) => void;
  setActiveSession: (session: ActiveWorkoutSession | null) => void;
  setCompletedSession: (session: WorkoutSession | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useSessionsStore = create<SessionsState & SessionsActions>(
  (set, get) => ({
    // Initial state
    workoutSessions: [],
    activeWorkoutSession: null,
    completedSession: null,
    isLoading: true,
    error: null,

    // Actions
    initializeSessions: async () => {
      try {
        set({ isLoading: true, error: null });
        const [loadedSessions, activeSession] = await Promise.all([
          storage.loadSessions(),
          storage.loadActiveWorkoutSession(),
        ]);
        set({
          workoutSessions: loadedSessions,
          activeWorkoutSession: activeSession,
          isLoading: false,
        });
      } catch (error) {
        console.error('Failed to load sessions:', error);
        set({
          error: 'Failed to load session data. Please refresh the page.',
          isLoading: false,
        });
      }
    },

    startWorkout: async workoutId => {
      try {
        const workout = useWorkoutsStore.getState().getWorkoutById(workoutId);
        const newActiveSession: ActiveWorkoutSession = {
          id: crypto.randomUUID(),
          workoutId,
          startedAt: new Date(),
          totalPausedTime: 0,
          completedExercises: [],
          duration: 0,
        };

        await storage.saveActiveWorkoutSession(newActiveSession);

        // Clear any existing completed session when starting a new workout
        set({
          activeWorkoutSession: newActiveSession,
          completedSession: null,
        });

        toast.success(`Started workout: ${workout?.name || 'Unknown'}`, {
          description: 'Your workout is now active. Good luck!',
        });
      } catch (error) {
        console.error('Failed to start workout:', error);
        set({ error: 'Failed to start workout. Please try again.' });

        toast.error('Failed to start workout', {
          description: 'Please try again.',
        });
        throw error;
      }
    },

    updateActiveSession: session => {
      set({ activeWorkoutSession: session });
    },

    completeWorkout: async session => {
      try {
        console.log('🏁 Starting workout completion process...');

        const workout = useWorkoutsStore
          .getState()
          .getWorkoutById(session.workoutId);
        const workoutName = workout?.name || 'Unknown';

        console.log('💾 Saving completed session to storage...');

        // Calculate completion stats
        const completedExercises = session.exercises.filter(
          ex => ex.completed
        ).length;
        const totalExercises = session.exercises.length;

        // Format duration for toast
        const durationText = session.actualDuration
          ? ` in ${Math.floor(session.actualDuration / 60)}m ${session.actualDuration % 60}s`
          : '';

        // Save session and update local state
        console.log('💾 Saving session to storage...');
        await storage.saveSession(session);
        console.log('✅ Session saved successfully');

        set(state => ({
          workoutSessions: [session, ...state.workoutSessions],
        }));
        console.log('✅ Local state updated');

        // Update workout's lastCompleted date and increment completed count
        if (workout && session.completedAt) {
          const updatedWorkout = {
            ...workout,
            lastCompleted: session.completedAt,
            updatedAt: new Date(),
          };
          // Update the workout's lastCompleted date in the workouts store
          useWorkoutsStore
            .getState()
            .setWorkouts(
              useWorkoutsStore
                .getState()
                .workouts.map(w => (w.id === workout.id ? updatedWorkout : w))
            );
          // Also save to storage
          await storage.saveWorkout(updatedWorkout);

          // Increment the completed count
          await useWorkoutsStore
            .getState()
            .incrementWorkoutCompletedCount(session.workoutId);
        }

        // Set completed session for summary display
        set({ completedSession: session });

        // Clear active session
        await storage.clearActiveWorkoutSession();
        set({ activeWorkoutSession: null });

        toast.success('Workout completed! 🎉', {
          description: `"${workoutName}" finished${durationText}! Completed ${completedExercises}/${totalExercises} exercises.`,
        });
      } catch (error) {
        console.error('Failed to complete workout:', error);
        set({ error: 'Failed to save workout session. Please try again.' });

        toast.error('Failed to save workout session', {
          description:
            'Your progress may not have been saved. Please try again.',
        });
        throw error;
      }
    },

    cancelWorkout: async () => {
      try {
        const { activeWorkoutSession } = get();
        const workout = activeWorkoutSession
          ? useWorkoutsStore
              .getState()
              .getWorkoutById(activeWorkoutSession.workoutId)
          : null;
        const workoutName = workout?.name || 'workout';

        await storage.clearActiveWorkoutSession();

        // Clear both active and completed sessions when cancelling
        set({
          activeWorkoutSession: null,
          completedSession: null,
        });

        toast.info('Workout ended', {
          description: `Your ${workoutName} session has ended.`,
        });
      } catch (error) {
        console.error('Failed to cancel workout:', error);
        set({ error: 'Failed to cancel workout. Please try again.' });

        toast.error('Failed to end workout', {
          description: 'Please try again.',
        });
        throw error;
      }
    },

    addSession: session => {
      set(state => ({
        workoutSessions: [session, ...state.workoutSessions],
      }));
    },

    clearCompletedSession: () => {
      set({ completedSession: null });
    },

    setSessions: workoutSessions => set({ workoutSessions }),
    setActiveSession: activeWorkoutSession => set({ activeWorkoutSession }),
    setCompletedSession: completedSession => set({ completedSession }),
    setLoading: isLoading => set({ isLoading }),
    setError: error => set({ error }),
  })
);
