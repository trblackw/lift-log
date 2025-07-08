import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../components/AppLayout';
import { ActiveWorkout } from '../components/ActiveWorkout';

export function ActiveWorkoutPage() {
  const context = useContext(AppContext);
  const navigate = useNavigate();

  if (!context) {
    throw new Error('ActiveWorkoutPage must be used within AppLayout');
  }

  const {
    workouts,
    activeWorkoutSession,
    setActiveWorkoutSession,
    handleCompleteWorkout,
    handleCancelWorkout,
  } = context;

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

  return (
    <ActiveWorkout
      workout={currentWorkout}
      activeSession={activeWorkoutSession}
      onSessionUpdate={setActiveWorkoutSession}
      onComplete={handleCompleteWorkout}
      onCancel={handleCancelWorkout}
    />
  );
}
