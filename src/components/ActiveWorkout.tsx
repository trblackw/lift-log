import { useState, useEffect, useRef } from 'react';
import {
  PrimaryButton,
  SecondaryButton,
  OutlineButton,
} from '@/components/ui/standardButtons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { storage } from '@/lib/storage';
import { formatTimerDuration } from '@/lib/utils';
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
  const [exerciseTimerTick, setExerciseTimerTick] = useState(0); // Force re-render for exercise timings
  const activeSessionRef = useRef(activeSession);

  // Keep ref updated with latest session
  useEffect(() => {
    activeSessionRef.current = activeSession;
  }, [activeSession]);

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
    const interval = setInterval(() => {
      const currentSession = activeSessionRef.current;

      // Don't update timer when paused
      if (currentSession.pausedAt) return;

      const now = Date.now();
      const elapsed = Math.floor(
        (now - currentSession.startedAt.getTime()) / 1000
      );
      const currentDuration = elapsed - currentSession.totalPausedTime;
      setDuration(currentDuration);

      // Update exercise timer display
      setExerciseTimerTick(prev => prev + 1);

      // Update session duration periodically (but don't save to storage every second)
      // Use the ref to get the latest session state and avoid stale closure issues
      if (currentDuration % 10 === 0) {
        const updatedSession = { ...currentSession, duration: currentDuration };
        storage.saveActiveWorkoutSession(updatedSession).catch(error => {
          console.error('Failed to update duration:', error);
        });
        onSessionUpdate(updatedSession);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [onSessionUpdate]); // Minimal dependencies to avoid unnecessary timer resets

  const toggleExercise = (exerciseId: string) => {
    const currentCompleted = activeSession.completedExercises;
    const isCompleted = currentCompleted.includes(exerciseId);
    const hasStarted =
      activeSession.exerciseStartTimes[exerciseId] !== undefined;
    const currentExerciseId = activeSession.currentExerciseId;
    const now = new Date();

    if (!hasStarted) {
      // First click: Start the exercise (record start time)
      const newStartTimes = { ...activeSession.exerciseStartTimes };
      const newEndTimes = { ...activeSession.exerciseEndTimes };
      const newCompleted = [...currentCompleted];

      // Auto-complete the previous exercise if there's one in progress
      if (currentExerciseId && currentExerciseId !== exerciseId) {
        if (!currentCompleted.includes(currentExerciseId)) {
          newCompleted.push(currentExerciseId);
          newEndTimes[currentExerciseId] = now;
        }
      }

      // Start the new exercise
      newStartTimes[exerciseId] = now;

      updateSession({
        exerciseStartTimes: newStartTimes,
        exerciseEndTimes: newEndTimes,
        completedExercises: newCompleted,
        currentExerciseId: exerciseId,
      });
    } else if (!isCompleted) {
      // Second click: Complete the exercise (record end time and mark as completed)
      const newCompleted = [...currentCompleted, exerciseId];
      const newEndTimes = { ...activeSession.exerciseEndTimes };
      newEndTimes[exerciseId] = now;

      updateSession({
        completedExercises: newCompleted,
        exerciseEndTimes: newEndTimes,
        currentExerciseId: undefined,
      });
    } else {
      // Third click: Uncomplete the exercise (remove from completed, keep timing)
      const newCompleted = currentCompleted.filter(id => id !== exerciseId);
      const newEndTimes = { ...activeSession.exerciseEndTimes };
      delete newEndTimes[exerciseId];

      updateSession({
        completedExercises: newCompleted,
        exerciseEndTimes: newEndTimes,
        currentExerciseId: exerciseId, // Set as current again
      });
    }
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
    // Calculate final actual duration (current duration accounts for paused time)
    const completionTime = new Date();
    const totalElapsed = Math.floor(
      (completionTime.getTime() - activeSession.startedAt.getTime()) / 1000
    );
    const actualDuration = totalElapsed - activeSession.totalPausedTime;

    // Calculate individual exercise durations
    const calculateExerciseDuration = (exerciseId: string): number => {
      const startTime = activeSession.exerciseStartTimes[exerciseId];
      const endTime = activeSession.exerciseEndTimes[exerciseId];

      if (!startTime || !endTime) return 0;

      return Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
    };

    const completedSession: WorkoutSession = {
      id: crypto.randomUUID(),
      workoutId: workout.id,
      startedAt: activeSession.startedAt,
      completedAt: completionTime,
      actualDuration: actualDuration,
      exercises: workout.exercises.map(exercise => ({
        exerciseId: exercise.id,
        completedSets: activeSession.completedExercises.includes(exercise.id)
          ? exercise.sets || 1
          : 0,
        actualReps: [],
        actualWeight: [],
        completed: activeSession.completedExercises.includes(exercise.id),
        startedAt: activeSession.exerciseStartTimes[exercise.id],
        completedAt: activeSession.exerciseEndTimes[exercise.id],
        actualDuration: calculateExerciseDuration(exercise.id),
      })),
    };

    onComplete(completedSession);
  };

  const completedCount = activeSession.completedExercises.length;
  const startedCount = Object.keys(activeSession.exerciseStartTimes).length;
  const totalCount = workout.exercises.length;
  const progressPercentage =
    totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Helper function to get exercise duration
  const getExerciseDuration = (exerciseId: string): number => {
    const startTime = activeSession.exerciseStartTimes[exerciseId];
    const endTime = activeSession.exerciseEndTimes[exerciseId];

    if (!startTime) return 0;

    const currentTime = endTime || new Date();
    return Math.floor((currentTime.getTime() - startTime.getTime()) / 1000);
  };

  // Helper function to format exercise duration
  const formatExerciseDuration = (seconds: number): string => {
    if (seconds <= 0) return '';

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

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
                    <IconPauseStopwatch /> Paused at{' '}
                    {formatTimerDuration(duration)}
                  </span>
                ) : (
                  <span>{formatTimerDuration(duration)}</span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {completedCount > 0 && startedCount > completedCount
                  ? `${completedCount} completed, ${startedCount - completedCount} in progress of ${totalCount} exercises`
                  : startedCount > completedCount
                    ? `${startedCount - completedCount} in progress of ${totalCount} exercises`
                    : `${completedCount} of ${totalCount} exercises completed`}
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
            const hasStarted =
              activeSession.exerciseStartTimes[exercise.id] !== undefined;
            const isCurrentExercise =
              activeSession.currentExerciseId === exercise.id;
            const exerciseDuration = getExerciseDuration(exercise.id);
            const formattedDuration = formatExerciseDuration(exerciseDuration);

            const exerciseText = exercise.duration
              ? `${exercise.name} - ${exercise.duration} minutes${exercise.weight ? ` @ ${exercise.weight}lbs` : ''}`
              : `${exercise.name} - ${exercise.sets} × ${exercise.reps}${exercise.weight ? ` @ ${exercise.weight}lbs` : ''}`;

            return (
              <div
                key={exercise.id}
                className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer"
                onClick={() => toggleExercise(exercise.id)}
              >
                {/* Status indicator */}
                <div
                  className={`
                  w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                  ${
                    isCompleted
                      ? 'bg-primary border-primary'
                      : hasStarted
                        ? 'bg-yellow-500 border-yellow-500'
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
                  {hasStarted && !isCompleted && (
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  )}
                </div>

                {/* Exercise info */}
                <div className="flex-1 min-w-0">
                  <span
                    className={`
                    block text-sm lg:text-base transition-all
                    ${
                      isCompleted
                        ? 'line-through text-muted-foreground'
                        : 'text-foreground'
                    }
                  `}
                  >
                    {exerciseText}
                  </span>

                  {/* Exercise timing info */}
                  {hasStarted && (
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      {!isCompleted && (
                        <span className="text-yellow-600 font-medium">
                          In progress • {formattedDuration}
                        </span>
                      )}
                      {isCompleted && (
                        <span className="text-green-600 font-medium">
                          Completed • {formattedDuration}
                        </span>
                      )}
                    </div>
                  )}
                </div>
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
