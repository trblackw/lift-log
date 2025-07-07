import { useState, useEffect } from 'react';
import {
  PrimaryButton,
  SecondaryButton,
  OutlineButton,
} from '@/components/ui/standardButtons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { storage } from '@/lib/storage';
import type {
  Workout,
  WorkoutSession,
  ActiveWorkoutSession,
} from '@/lib/types';
import IconPauseStopwatch from './icons/icon-pause-stopwatch';
import IconPlayStopwatch from './icons/icon-play-stopwatch';
import IconStop from './icons/icon-stop';

interface ActiveWorkoutProps {
  workout: Workout;
  activeSession: ActiveWorkoutSession;
  onSessionUpdate: (session: ActiveWorkoutSession) => void;
  onComplete: (session: WorkoutSession) => void;
  onCancel: () => void;
}

export function ActiveWorkout({
  workout,
  activeSession,
  onSessionUpdate,
  onComplete,
  onCancel,
}: ActiveWorkoutProps) {
  const [duration, setDuration] = useState(activeSession.duration);

  // Helper function to update session and persist it
  const updateSession = async (updates: Partial<ActiveWorkoutSession>) => {
    const updatedSession = { ...activeSession, ...updates };
    try {
      await storage.saveActiveWorkoutSession(updatedSession);
      onSessionUpdate(updatedSession);
    } catch (error) {
      console.error('Failed to update active session:', error);
    }
  };

  // Calculate session duration
  useEffect(() => {
    if (activeSession.pausedAt) return; // Don't update timer when paused

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor(
        (now - activeSession.startedAt.getTime()) / 1000
      );
      const currentDuration = elapsed - activeSession.totalPausedTime;
      setDuration(currentDuration);

      // Update session duration periodically (but don't save to storage every second)
      if (currentDuration % 10 === 0) {
        // Update every 10 seconds
        updateSession({ duration: currentDuration });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [
    activeSession.startedAt,
    activeSession.totalPausedTime,
    activeSession.pausedAt,
  ]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleExercise = (exerciseId: string) => {
    const currentCompleted = activeSession.completedExercises;
    const newCompleted = currentCompleted.includes(exerciseId)
      ? currentCompleted.filter(id => id !== exerciseId)
      : [...currentCompleted, exerciseId];

    updateSession({ completedExercises: newCompleted });
  };

  const pauseWorkout = () => {
    if (activeSession.pausedAt) {
      // Resume
      const pauseDuration = Math.floor(
        (Date.now() - activeSession.pausedAt.getTime()) / 1000
      );
      const newTotalPausedTime = activeSession.totalPausedTime + pauseDuration;
      updateSession({
        totalPausedTime: newTotalPausedTime,
        pausedAt: undefined,
      });
    } else {
      // Pause
      updateSession({ pausedAt: new Date() });
    }
  };

  const completeWorkout = () => {
    const completedSession: WorkoutSession = {
      id: crypto.randomUUID(),
      workoutId: workout.id,
      startedAt: activeSession.startedAt,
      completedAt: new Date(),
      exercises: workout.exercises.map(exercise => ({
        exerciseId: exercise.id,
        completedSets: activeSession.completedExercises.includes(exercise.id)
          ? exercise.sets
          : 0,
        actualReps: [],
        actualWeight: [],
        completed: activeSession.completedExercises.includes(exercise.id),
      })),
    };

    onComplete(completedSession);
  };

  const completedCount = activeSession.completedExercises.length;
  const totalCount = workout.exercises.length;
  const progressPercentage =
    totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="space-y-3 lg:space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="pt-3 lg:pt-6 px-3 lg:px-6">
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-lg lg:text-xl font-semibold">
                {workout.name}
              </h2>
              <div className="text-sm lg:text-base text-muted-foreground mt-1 mb-2 flex items-center justify-center gap-2 mx-auto">
                {activeSession.pausedAt ? (
                  <span className="text-amber-500 flex items-center gap-2">
                    <IconPauseStopwatch /> Paused at {formatDuration(duration)}
                  </span>
                ) : (
                  <span>{formatDuration(duration)}</span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {completedCount} of {totalCount} exercises completed
              </div>
              {/* Progress bar */}
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 lg:gap-3">
              <OutlineButton onClick={pauseWorkout} className="h-10 lg:h-12">
                {activeSession.pausedAt ? (
                  <>
                    <IconPlayStopwatch className="size-5" /> Resume
                  </>
                ) : (
                  <>
                    <IconPauseStopwatch className="size-5" /> Pause
                  </>
                )}
              </OutlineButton>
              <SecondaryButton onClick={onCancel} className="h-10 lg:h-12">
                End Workout
              </SecondaryButton>
              <PrimaryButton
                onClick={completeWorkout}
                disabled={completedCount === 0}
                className="h-10 lg:h-12"
              >
                Complete
              </PrimaryButton>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exercise Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg lg:text-xl">Exercises</CardTitle>
        </CardHeader>
        <CardContent className="pt-3 lg:pt-6 px-3 lg:px-6 space-y-3">
          {workout.exercises.map(exercise => {
            const isCompleted = activeSession.completedExercises.includes(
              exercise.id
            );
            const exerciseText = exercise.duration
              ? `${exercise.name} - ${exercise.duration} minutes${exercise.weight ? ` @ ${exercise.weight}lbs` : ''}`
              : `${exercise.name} - ${exercise.sets} × ${exercise.reps}${exercise.weight ? ` @ ${exercise.weight}lbs` : ''}`;

            return (
              <div
                key={exercise.id}
                className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer"
                onClick={() => toggleExercise(exercise.id)}
              >
                {/* Rounded checkbox */}
                <div
                  className={`
                  w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                  ${
                    isCompleted
                      ? 'bg-primary border-primary'
                      : 'border-muted-foreground hover:border-foreground/60'
                  }
                `}
                >
                  {isCompleted && (
                    <svg
                      className="w-3 h-3 text-primary-foreground"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>

                {/* Exercise text */}
                <span
                  className={`
                  flex-1 text-sm lg:text-base transition-all
                  ${
                    isCompleted
                      ? 'line-through text-muted-foreground'
                      : 'text-foreground'
                  }
                `}
                >
                  {exerciseText}
                </span>
              </div>
            );
          })}

          {workout.exercises.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No exercises in this workout.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
