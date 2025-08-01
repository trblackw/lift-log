import { useState, useEffect } from 'react';
import { PrimaryButton, OutlineButton } from '@/components/ui/standardButtons';
import { Card, CardContent } from '@/components/ui/card';
import { formatTimerDuration } from '@/lib/utils';
import type { Workout, ActiveWorkoutSession, ViewMode } from '@/lib/types';
import IconPauseStopwatch from './icons/icon-pause-stopwatch';

interface ActiveWorkoutBannerProps {
  activeSession: ActiveWorkoutSession;
  workout: Workout;
  onResume: () => void;
  onEnd: () => void;
  currentView: ViewMode;
}

export function ActiveWorkoutBanner({
  activeSession,
  workout,
  onResume,
  onEnd,
  currentView,
}: ActiveWorkoutBannerProps) {
  const [currentDuration, setCurrentDuration] = useState(
    activeSession.duration
  );

  // Update timer display (only when not paused)
  useEffect(() => {
    if (activeSession.pausedAt) return; // Don't update when paused

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor(
        (now - activeSession.startedAt.getTime()) / 1000
      );
      setCurrentDuration(elapsed - activeSession.totalPausedTime);
    }, 1000);

    return () => clearInterval(interval);
  }, [
    activeSession.startedAt,
    activeSession.totalPausedTime,
    activeSession.pausedAt,
  ]);

  const completedCount = activeSession.completedExercises.length;
  const startedCount = Object.keys(
    activeSession.exerciseStartTimes || {}
  ).length;
  const totalCount = workout.exercises.length;
  const progressPercentage =
    totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  function WorkoutTimer() {
    if (currentView === 'active') {
      return null;
    }

    return activeSession.pausedAt ? (
      <span className="text-amber-600 flex items-center gap-2">
        <IconPauseStopwatch /> Paused at {formatTimerDuration(currentDuration)}
      </span>
    ) : (
      formatTimerDuration(currentDuration)
    );
  }

  return (
    <Card
      className="border-primary/20 bg-primary/5 shadow-md"
      onClick={onResume}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4 relative">
          {/* Left: Workout info and progress */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span className="font-medium text-primary">Active Workout</span>
              </div>
              <div
                className="text-sm text-muted-foreground"
                style={{ position: 'absolute', top: -8, right: 5 }}
              >
                <WorkoutTimer />
              </div>
            </div>

            <div className="mb-2">
              <h3 className="font-semibold text-sm truncate">{workout.name}</h3>
              <div className="text-xs text-muted-foreground">
                {completedCount > 0 && startedCount > completedCount
                  ? `${completedCount} completed, ${startedCount - completedCount} in progress`
                  : startedCount > completedCount
                    ? `${startedCount - completedCount} in progress`
                    : `${completedCount} of ${totalCount} exercises completed`}
              </div>
            </div>

            {/* Mini progress bar */}
            <div className="w-full bg-muted/60 rounded-full h-1.5">
              <div
                className="bg-primary h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Right: Action buttons */}
          <div className="flex gap-2 shrink-0">
            <PrimaryButton
              size="sm"
              onClick={onResume}
              className="h-8 px-3 text-xs"
            >
              {activeSession.pausedAt ? 'Resume' : 'Continue'}
            </PrimaryButton>
            <OutlineButton
              size="sm"
              onClick={onEnd}
              className="h-8 px-3 text-xs border-muted-foreground/40 text-muted-foreground hover:border-destructive hover:text-destructive"
            >
              End
            </OutlineButton>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
