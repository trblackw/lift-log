import React, { useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../components/AppLayout';
import { WorkoutDetails } from '../components/WorkoutDetails';
import type { Workout } from '../lib/types';

export function WorkoutDetailsPage() {
  const context = useContext(AppContext);
  const navigate = useNavigate();
  const { workoutId } = useParams<{ workoutId: string }>();

  if (!context) {
    throw new Error('WorkoutDetailsPage must be used within AppLayout');
  }

  const { workouts, handleStartWorkout, handleDeleteWorkout } = context;

  const workout = workoutId
    ? workouts.find(w => w.id === workoutId)
    : undefined;

  if (!workout) {
    return (
      <div className="text-center py-8">
        <h2 className="text-lg font-semibold mb-2">Workout Not Found</h2>
        <p className="text-muted-foreground">
          The workout you're looking for doesn't exist.
        </p>
      </div>
    );
  }

  const handleEditWorkout = (workout: Workout) => {
    navigate(`/workouts/${workout.id}/edit`);
  };

  const handleBackToList = () => {
    navigate('/workouts');
  };

  return (
    <WorkoutDetails
      workout={workout}
      onStart={handleStartWorkout}
      onEdit={handleEditWorkout}
      onBack={handleBackToList}
    />
  );
}
