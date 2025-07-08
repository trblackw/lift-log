import { useParams, useNavigate } from 'react-router-dom';
import { useWorkoutsStore, useSessionsStore } from '../stores';
import { WorkoutDetails } from '../components/WorkoutDetails';
import { buildRoute, ROUTES } from '../lib/routes';
import type { Workout } from '../lib/types';

export function WorkoutDetailsPage() {
  const navigate = useNavigate();
  const { workoutId } = useParams<{ workoutId: string }>();

  // Subscribe to store state and actions
  const workouts = useWorkoutsStore(state => state.workouts);
  const deleteWorkout = useWorkoutsStore(state => state.deleteWorkout);
  const startWorkout = useSessionsStore(state => state.startWorkout);

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
    navigate(buildRoute.workoutEdit(workout.id));
  };

  const handleBackToList = () => {
    navigate(ROUTES.WORKOUTS);
  };

  const handleStartWorkout = async (workoutId: string) => {
    try {
      await startWorkout(workoutId);
      navigate(ROUTES.ACTIVE);
    } catch (error) {
      // Error handling is done in the store
      console.error('Failed to start workout:', error);
    }
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    try {
      await deleteWorkout(workoutId);
      navigate(ROUTES.WORKOUTS);
    } catch (error) {
      // Error handling is done in the store
      console.error('Failed to delete workout:', error);
    }
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
