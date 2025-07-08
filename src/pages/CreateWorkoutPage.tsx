import React, { useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppContext } from '../components/AppLayout';
import { WorkoutForm } from '../components/WorkoutForm';
import type { Workout } from '../lib/types';

export function CreateWorkoutPage() {
  const context = useContext(AppContext);
  const navigate = useNavigate();
  const { workoutId } = useParams<{ workoutId: string }>();

  if (!context) {
    throw new Error('CreateWorkoutPage must be used within AppLayout');
  }

  const { workouts, handleSaveWorkout } = context;

  const editingWorkout = workoutId
    ? workouts.find(w => w.id === workoutId)
    : undefined;

  const handleSave = (
    workoutData: Omit<Workout, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    handleSaveWorkout(workoutData, editingWorkout);
  };

  const handleCancel = () => {
    navigate('/workouts');
  };

  return (
    <WorkoutForm
      editWorkout={editingWorkout}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
}
