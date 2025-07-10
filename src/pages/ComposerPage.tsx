import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkoutsStore } from '../stores';
import { Composer } from '../components/Composer';
import { ROUTES } from '../lib/routes';
import type { Exercise } from '../lib/types';

export function ComposerPage() {
  const navigate = useNavigate();
  const createWorkout = useWorkoutsStore(state => state.createWorkout);

  const [workoutExercises, setWorkoutExercises] = useState<Exercise[]>([]);
  const [workoutName, setWorkoutName] = useState('');
  const [workoutDescription, setWorkoutDescription] = useState('');

  const handleSaveWorkout = async () => {
    if (!workoutName.trim() || workoutExercises.length === 0) {
      return;
    }

    try {
      const workoutData = {
        name: workoutName.trim(),
        description: workoutDescription.trim() || undefined,
        exercises: workoutExercises,
        tags: [],
        lastCompleted: undefined,
        completedCount: 0,
        estimatedDuration: undefined,
        averageDuration: undefined,
        scheduledDate: undefined,
      };

      await createWorkout(workoutData);
      navigate(ROUTES.WORKOUTS);
    } catch (error) {
      console.error('Failed to save workout:', error);
    }
  };

  const handleCancel = () => {
    navigate(ROUTES.WORKOUTS);
  };

  return (
    <Composer
      workoutExercises={workoutExercises}
      onExercisesChange={setWorkoutExercises}
      workoutName={workoutName}
      onWorkoutNameChange={setWorkoutName}
      workoutDescription={workoutDescription}
      onWorkoutDescriptionChange={setWorkoutDescription}
      onSave={handleSaveWorkout}
      onCancel={handleCancel}
    />
  );
}
