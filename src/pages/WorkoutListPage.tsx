import React, { useState } from 'react';
import { useWorkoutsStore, useSessionsStore } from '../stores';
import { WorkoutList } from '../components/WorkoutList';
import type { ViewMode as WorkoutViewMode } from '../components/ViewToggle';

export function WorkoutListPage() {
  const [workoutListViewMode, setWorkoutListViewMode] =
    useState<WorkoutViewMode>('card');

  // Subscribe to store state and actions
  const workouts = useWorkoutsStore(state => state.workouts);
  const deleteWorkout = useWorkoutsStore(state => state.deleteWorkout);
  const startWorkout = useSessionsStore(state => state.startWorkout);

  return (
    <WorkoutList
      workouts={workouts}
      onStartWorkout={startWorkout}
      onDeleteWorkout={deleteWorkout}
      viewMode={workoutListViewMode}
      onViewModeChange={setWorkoutListViewMode}
    />
  );
}
