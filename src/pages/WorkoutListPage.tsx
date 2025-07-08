import React, { useContext, useState } from 'react';
import { AppContext } from '../components/AppLayout';
import { WorkoutList } from '../components/WorkoutList';
import type { ViewMode as WorkoutViewMode } from '../components/ViewToggle';
import type { Workout } from '../lib/types';

export function WorkoutListPage() {
  const context = useContext(AppContext);
  const [workoutListViewMode, setWorkoutListViewMode] =
    useState<WorkoutViewMode>('card');

  if (!context) {
    throw new Error('WorkoutListPage must be used within AppLayout');
  }

  const { workouts, handleStartWorkout, handleDeleteWorkout } = context;

  return (
    <WorkoutList
      workouts={workouts}
      onStartWorkout={handleStartWorkout}
      onDeleteWorkout={handleDeleteWorkout}
      viewMode={workoutListViewMode}
      onViewModeChange={setWorkoutListViewMode}
    />
  );
}
