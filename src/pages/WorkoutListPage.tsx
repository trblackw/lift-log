import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkoutsStore, useSessionsStore } from '../stores';
import { WorkoutList } from '../components/WorkoutList';
import { ROUTES } from '../lib/routes';
import type { ViewMode as WorkoutViewMode } from '../components/ViewToggle';

export function WorkoutListPage() {
  const navigate = useNavigate();
  const [workoutListViewMode, setWorkoutListViewMode] =
    useState<WorkoutViewMode>('card');

  // Subscribe to store state and actions
  const workouts = useWorkoutsStore(state => state.workouts);
  const deleteWorkout = useWorkoutsStore(state => state.deleteWorkout);
  const startWorkout = useSessionsStore(state => state.startWorkout);

  const handleStartWorkout = async (workoutId: string) => {
    try {
      await startWorkout(workoutId);
      navigate(ROUTES.ACTIVE);
    } catch (error) {
      console.error('Failed to start workout:', error);
    }
  };

  return (
    <WorkoutList
      workouts={workouts}
      onStartWorkout={handleStartWorkout}
      onDeleteWorkout={deleteWorkout}
      viewMode={workoutListViewMode}
      onViewModeChange={setWorkoutListViewMode}
    />
  );
}
