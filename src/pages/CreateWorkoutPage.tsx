import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useWorkoutsStore } from '../stores';
import { WorkoutForm } from '../components/WorkoutForm';
import type { Workout } from '../lib/types';

export function CreateWorkoutPage() {
  const navigate = useNavigate();
  const { workoutId } = useParams<{ workoutId: string }>();

  // Subscribe to store state and actions
  const workouts = useWorkoutsStore(state => state.workouts);
  const createWorkout = useWorkoutsStore(state => state.createWorkout);
  const updateWorkout = useWorkoutsStore(state => state.updateWorkout);

  const editingWorkout = workoutId
    ? workouts.find(w => w.id === workoutId)
    : undefined;

  const handleSave = async (
    workoutData: Omit<Workout, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    try {
      if (editingWorkout) {
        await updateWorkout({
          ...workoutData,
          id: editingWorkout.id,
          createdAt: editingWorkout.createdAt,
          updatedAt: new Date(),
        });
        navigate(`/workouts/${editingWorkout.id}`);
      } else {
        await createWorkout(workoutData);
        navigate('/workouts');
      }
    } catch (error) {
      // Error handling is done in the store
      console.error('Failed to save workout:', error);
    }
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
