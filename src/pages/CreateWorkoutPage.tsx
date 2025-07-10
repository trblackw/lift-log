import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useWorkoutsStore } from '../stores';
import { WorkoutForm } from '../components/WorkoutForm';
import { buildRoute, ROUTES } from '../lib/routes';
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
        navigate(buildRoute.workoutDetail(editingWorkout.id));
      } else {
        await createWorkout(workoutData);
        navigate(ROUTES.WORKOUTS);
      }
    } catch (error) {
      // Error handling is done in the store
      console.error('Failed to save workout:', error);
    }
  };

  const handleCancel = () => {
    const isEditing = !!editingWorkout;
    const workoutName = editingWorkout?.name || 'workout';

    toast.info(isEditing ? 'Changes discarded' : 'Workout discarded', {
      description: isEditing
        ? `Changes to "${workoutName}" were not saved.`
        : 'Your workout draft was not saved.',
    });

    navigate(ROUTES.WORKOUTS);
  };

  return (
    <WorkoutForm
      editWorkout={editingWorkout}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
}
