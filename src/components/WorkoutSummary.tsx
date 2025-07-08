import React from 'react';
import { PrimaryButton, SecondaryButton } from './ui/standardButtons';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import type { Workout, WorkoutSession } from '@/lib/types';
import { formatTimerDuration } from '@/lib/utils';
import IconArmFlex from './icons/icon-arm-flex';
import { PartyPopper, FlagIcon, MedalIcon } from 'lucide-react';
interface WorkoutSummaryProps {
  workout: Workout;
  session: WorkoutSession;
  onContinue: () => void;
  onViewWorkout: () => void;
}

export function WorkoutSummary({
  workout,
  session,
  onContinue,
  onViewWorkout,
}: WorkoutSummaryProps) {
  // Calculate completion percentage
  const completedExercises = session.exercises.filter(
    ex => ex.completed
  ).length;
  const totalExercises = session.exercises.length;
  const completionPercentage =
    totalExercises > 0
      ? Math.round((completedExercises / totalExercises) * 100)
      : 0;

  // Ensure completion percentage is valid
  const safeCompletionPercentage =
    isFinite(completionPercentage) && !isNaN(completionPercentage)
      ? completionPercentage
      : 0;

  // Format durations
  const actualDuration = session.actualDuration || 0;
  const estimatedDuration = workout.estimatedDuration
    ? workout.estimatedDuration * 60
    : null; // Convert minutes to seconds

  // Calculate duration comparison
  const getDurationComparison = () => {
    if (!estimatedDuration || estimatedDuration <= 0) return null;

    const difference = actualDuration - estimatedDuration;
    const percentageDiff = Math.round(
      (Math.abs(difference) / estimatedDuration) * 100
    );

    // Validate that percentageDiff is a valid number
    if (!isFinite(percentageDiff) || isNaN(percentageDiff)) {
      return null;
    }

    if (Math.abs(difference) < 30) {
      // Within 30 seconds is "on time"
      return { type: 'on-time', text: 'Right on time!' };
    } else if (difference < 0) {
      return {
        type: 'faster',
        text: `${percentageDiff}% faster than estimated`,
      };
    } else {
      return {
        type: 'slower',
        text: `${percentageDiff}% longer than estimated`,
      };
    }
  };

  const durationComparison = getDurationComparison();

  // Get motivational message based on completion
  const getMotivationalMessage = (): React.ReactNode => {
    if (safeCompletionPercentage === 100) {
      return (
        <div className="flex flex-col items-center gap-2">
          Outstanding! You crushed every exercise!{' '}
        </div>
      );
    } else if (safeCompletionPercentage >= 80) {
      return (
        <div className="flex flex-col items-center gap-2">
          Great work! You completed most of your workout!{' '}
        </div>
      );
    } else if (safeCompletionPercentage >= 50) {
      return (
        <div className="flex flex-col items-center gap-2">
          Good effort! Every step counts towards your goals!{' '}
        </div>
      );
    } else {
      return (
        <div className="flex flex-col items-center gap-2">
          You showed up and that's what matters! Keep going!{' '}
        </div>
      );
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Celebration Header */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="pt-6 text-center">
          <div className="text-4xl mb-2 flex items-center justify-center">
            <MedalIcon className="size-10 text-yellow-400/80" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Workout Completed!</h1>
          <p className="text-muted-foreground">{getMotivationalMessage()}</p>
        </CardContent>
      </Card>

      {/* Workout Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{workout.name}</span>
            <div className="text-sm font-normal text-muted-foreground">
              #{workout.completedCount} completion
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Completion Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Exercise Completion */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Exercises Completed</span>
                <span className="text-lg font-bold text-primary">
                  {completedExercises}/{totalExercises}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div
                  className="bg-primary h-3 rounded-full transition-all duration-500"
                  style={{ width: `${safeCompletionPercentage}%` }}
                />
              </div>
              <div className="text-sm text-muted-foreground text-center">
                {safeCompletionPercentage}% complete
              </div>
            </div>

            {/* Duration Comparison */}
            <div className="space-y-2">
              <span className="font-medium">Duration</span>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Actual:</span>
                  <span className="font-mono">
                    {formatTimerDuration(actualDuration)}
                  </span>
                </div>
                {estimatedDuration && (
                  <>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Estimated:</span>
                      <span className="font-mono">
                        {formatTimerDuration(estimatedDuration)}
                      </span>
                    </div>
                    {durationComparison && (
                      <div
                        className={`text-sm text-center p-2 rounded ${
                          durationComparison.type === 'faster'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                            : durationComparison.type === 'slower'
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        }`}
                      >
                        {durationComparison.text}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Workout Milestones */}
          {workout.completedCount > 1 && (
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {workout.completedCount}
                </div>
                <div className="text-sm text-muted-foreground">
                  times you've completed "{workout.name}"
                </div>
                {workout.completedCount >= 10 && (
                  <div className="text-xs text-primary mt-1">
                    🏆 Consistency Champion!
                  </div>
                )}
                {workout.completedCount >= 5 && workout.completedCount < 10 && (
                  <div className="text-xs text-primary mt-1">
                    ⭐ Building the habit!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-4">
            <SecondaryButton onClick={onViewWorkout} variant="outline">
              View Workout
            </SecondaryButton>
            <PrimaryButton onClick={onContinue} className="flex-1">
              Continue
            </PrimaryButton>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
