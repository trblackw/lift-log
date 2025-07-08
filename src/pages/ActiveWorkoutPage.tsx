import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkoutsStore, useSessionsStore } from '../stores';
import { ActiveWorkout } from '../components/ActiveWorkout';

export function ActiveWorkoutPage() {
  const navigate = useNavigate();

  // Subscribe to store state and actions
  const workouts = useWorkoutsStore(state => state.workouts);
  const activeWorkoutSession = useSessionsStore(
    state => state.activeWorkoutSession
  );
  const updateActiveSession = useSessionsStore(
    state => state.updateActiveSession
  );
  const completeWorkout = useSessionsStore(state => state.completeWorkout);
  const cancelWorkout = useSessionsStore(state => state.cancelWorkout);

  const currentWorkout = activeWorkoutSession
    ? workouts.find(w => w.id === activeWorkoutSession.workoutId)
    : null;

  if (!activeWorkoutSession || !currentWorkout) {
    return (
      <div className="text-center py-8 bg-accent border border-primary rounded-md p-4">
        <h2 className="text-lg font-semibold mb-2">No Active Workout</h2>
        <p className="text-muted-foreground">
          You don't have an active workout session.
        </p>
      </div>
    );
  }

  const handleCompleteWorkout = async (session: any) => {
    try {
      await completeWorkout(session);
      navigate('/workouts');
    } catch (error) {
      // Error handling is done in the store
      console.error('Failed to complete workout:', error);
    }
  };

  const handleCancelWorkout = async () => {
    try {
      await cancelWorkout();
      navigate('/workouts');
    } catch (error) {
      // Error handling is done in the store
      console.error('Failed to cancel workout:', error);
    }
  };

  return (
    <ActiveWorkout
      workout={currentWorkout}
      activeSession={activeWorkoutSession}
      onSessionUpdate={updateActiveSession}
      onComplete={handleCompleteWorkout}
      onCancel={handleCancelWorkout}
    />
  );
}
