import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Workout, WorkoutSession } from "@/lib/types";

interface ActiveWorkoutProps {
  workout: Workout;
  onComplete: (session: WorkoutSession) => void;
  onCancel: () => void;
}

export function ActiveWorkout({ workout, onComplete, onCancel }: ActiveWorkoutProps) {
  const [startedAt] = useState(new Date());
  const [pausedAt, setPausedAt] = useState<Date | null>(null);
  const [totalPausedTime, setTotalPausedTime] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [duration, setDuration] = useState(0);

  // Calculate session duration
  useEffect(() => {
    if (pausedAt) return; // Don't update timer when paused

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startedAt.getTime()) / 1000);
      setDuration(elapsed - totalPausedTime);
    }, 1000);

    return () => clearInterval(interval);
  }, [startedAt, totalPausedTime, pausedAt]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleExercise = (exerciseId: string) => {
    setCompletedExercises(prev => {
      const newSet = new Set(prev);
      if (newSet.has(exerciseId)) {
        newSet.delete(exerciseId);
      } else {
        newSet.add(exerciseId);
      }
      return newSet;
    });
  };

  const pauseWorkout = () => {
    if (pausedAt) {
      // Resume
      const pauseDuration = Math.floor((Date.now() - pausedAt.getTime()) / 1000);
      setTotalPausedTime(prev => prev + pauseDuration);
      setPausedAt(null);
    } else {
      // Pause
      setPausedAt(new Date());
    }
  };

  const completeWorkout = () => {
    const completedSession: WorkoutSession = {
      id: crypto.randomUUID(),
      workoutId: workout.id,
      startedAt,
      completedAt: new Date(),
      exercises: workout.exercises.map(exercise => ({
        exerciseId: exercise.id,
        completedSets: completedExercises.has(exercise.id) ? exercise.sets : 0,
        actualReps: [],
        actualWeight: [],
        completed: completedExercises.has(exercise.id),
      })),
    };

    onComplete(completedSession);
  };

  const completedCount = completedExercises.size;
  const totalCount = workout.exercises.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="space-y-3 lg:space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="pt-3 lg:pt-6 px-3 lg:px-6">
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-lg lg:text-xl font-semibold">{workout.name}</h2>
              <div className="text-sm lg:text-base text-muted-foreground mt-1">
                                  {pausedAt ? (
                    <span className="text-amber-500">⏸️ Paused at {formatDuration(duration)}</span>
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

            <div className="flex gap-2 lg:gap-3">
              <Button 
                variant="outline" 
                onClick={pauseWorkout}
                className="flex-1 h-10 lg:h-12"
              >
                {pausedAt ? '▶️ Resume' : '⏸️ Pause'}
              </Button>
              <Button 
                variant="outline" 
                onClick={onCancel}
                className="flex-1 h-10 lg:h-12"
              >
                End Workout
              </Button>
              <Button 
                onClick={completeWorkout}
                disabled={completedCount === 0}
                className="flex-1 h-10 lg:h-12"
              >
                Complete
              </Button>
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
          {workout.exercises.map((exercise) => {
            const isCompleted = completedExercises.has(exercise.id);
            const exerciseText = `${exercise.name} - ${exercise.sets} × ${exercise.reps}${exercise.weight ? ` @ ${exercise.weight}lbs` : ''}`;
            
            return (
              <div 
                key={exercise.id}
                className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer"
                onClick={() => toggleExercise(exercise.id)}
              >
                {/* Rounded checkbox */}
                <div className={`
                  w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                  ${isCompleted 
                    ? 'bg-primary border-primary' 
                    : 'border-muted-foreground hover:border-foreground/60'
                  }
                `}>
                  {isCompleted && (
                    <svg className="w-3 h-3 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                
                {/* Exercise text */}
                <span className={`
                  flex-1 text-sm lg:text-base transition-all
                  ${isCompleted 
                    ? 'line-through text-muted-foreground' 
                    : 'text-foreground'
                  }
                `}>
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