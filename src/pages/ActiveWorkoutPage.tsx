import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkoutsStore, useSessionsStore } from '../stores';
import { ActiveWorkout } from '../components/ActiveWorkout';
import { WorkoutSelect } from '../components/ui/WorkoutSelect';
import {
  PrimaryButton,
  SecondaryButton,
} from '../components/ui/standardButtons';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { ROUTES, buildRoute } from '../lib/routes';
import type { Workout } from '../lib/types';

export function ActiveWorkoutPage() {
  const navigate = useNavigate();
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  // Subscribe to store state and actions
  const workouts = useWorkoutsStore(state => state.workouts);
  const activeWorkoutSession = useSessionsStore(
    state => state.activeWorkoutSession
  );
  const updateActiveSession = useSessionsStore(
    state => state.updateActiveSession
  );
  const completeWorkout = useSessionsStore(state => state.completeWorkout);
  const cancelWorkout = useSessionsStore(state => state.cancelWorkout);
  const startWorkout = useSessionsStore(state => state.startWorkout);

  const currentWorkout = activeWorkoutSession
    ? workouts.find(w => w.id === activeWorkoutSession.workoutId)
    : null;

  const handleStartWorkout = async () => {
    if (!selectedWorkout) return;

    setIsStarting(true);
    try {
      await startWorkout(selectedWorkout.id);
      // The store will handle navigation after successful start
    } catch (error) {
      console.error('Failed to start workout:', error);
    } finally {
      setIsStarting(false);
    }
  };

  const handleViewWorkout = () => {
    if (!selectedWorkout) return;
    navigate(buildRoute.workoutDetail(selectedWorkout.id));
  };

  if (!activeWorkoutSession || !currentWorkout) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-center">
              Start a Workout
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              You don't have an active workout session.
            </p>
            <div className="space-y-2">
              <WorkoutSelect
                onSelect={setSelectedWorkout}
                placeholder="Search for a workout to start..."
                className="w-full"
              />
            </div>

            {selectedWorkout && (
              <Card className="bg-muted/30">
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-medium">{selectedWorkout.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedWorkout.exercises.length} exercise
                        {selectedWorkout.exercises.length !== 1 ? 's' : ''}
                        {selectedWorkout.lastCompleted && (
                          <span>
                            {' '}
                            • Last completed{' '}
                            {new Date(
                              selectedWorkout.lastCompleted
                            ).toLocaleDateString()}
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <PrimaryButton
                        onClick={handleStartWorkout}
                        disabled={isStarting}
                        className="flex-1"
                      >
                        {isStarting ? 'Starting...' : 'Start Workout'}
                      </PrimaryButton>
                      <SecondaryButton
                        onClick={handleViewWorkout}
                        variant="outline"
                      >
                        View Details
                      </SecondaryButton>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {workouts.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p className="mb-2">No workouts found.</p>
                <SecondaryButton
                  onClick={() => navigate(ROUTES.WORKOUTS_CREATE)}
                  variant="outline"
                >
                  Create Your First Workout
                </SecondaryButton>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleCompleteWorkout = async (session: any) => {
    try {
      await completeWorkout(session);
      navigate(ROUTES.WORKOUTS);
    } catch (error) {
      // Error handling is done in the store
      console.error('Failed to complete workout:', error);
    }
  };

  const handleCancelWorkout = async () => {
    try {
      await cancelWorkout();
      navigate(ROUTES.WORKOUTS);
    } catch (error) {
      // Error handling is done in the store
      console.error('Failed to cancel workout:', error);
    }
  };

  return (
    <ActiveWorkout
      workout={currentWorkout}
      activeSession={activeWorkoutSession}
      onSessionUpdate={updateActiveSession}
      onComplete={handleCompleteWorkout}
      onCancel={handleCancelWorkout}
    />
  );
}
