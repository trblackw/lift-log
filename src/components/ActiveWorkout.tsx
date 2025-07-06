import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { Workout, WorkoutSession, ExerciseSession } from "@/lib/types";

interface ActiveWorkoutProps {
  workout: Workout;
  onComplete: (session: WorkoutSession) => void;
  onCancel: () => void;
}

export function ActiveWorkout({ workout, onComplete, onCancel }: ActiveWorkoutProps) {
  const [session, setSession] = useState<WorkoutSession>(() => ({
    id: crypto.randomUUID(),
    workoutId: workout.id,
    startedAt: new Date(),
    exercises: workout.exercises.map(exercise => ({
      exerciseId: exercise.id,
      completedSets: 0,
      actualReps: [],
      actualWeight: [],
      completed: false,
    })),
  }));

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [sessionNotes, setSessionNotes] = useState('');

  // Calculate session duration
  const [duration, setDuration] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setDuration(Math.floor((Date.now() - session.startedAt.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [session.startedAt]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentExercise = workout.exercises[currentExerciseIndex];
  const currentExerciseSession = session.exercises[currentExerciseIndex];

  const updateExerciseSession = (updates: Partial<ExerciseSession>) => {
    setSession(prev => ({
      ...prev,
      exercises: prev.exercises.map((ex, index) => 
        index === currentExerciseIndex ? { ...ex, ...updates } : ex
      ),
    }));
  };

  const handleSetComplete = (setIndex: number, reps: number, weight?: number) => {
    const newReps = [...currentExerciseSession.actualReps];
    const newWeight = [...currentExerciseSession.actualWeight];
    
    newReps[setIndex] = reps;
    if (weight !== undefined) {
      newWeight[setIndex] = weight;
    }

    const completedSets = Math.max(currentExerciseSession.completedSets, setIndex + 1);
    
    updateExerciseSession({
      actualReps: newReps,
      actualWeight: newWeight,
      completedSets,
      completed: completedSets >= currentExercise.sets,
    });
  };

  const nextExercise = () => {
    if (currentExerciseIndex < workout.exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
    }
  };

  const previousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(prev => prev - 1);
    }
  };

  const completeWorkout = () => {
    const completedSession: WorkoutSession = {
      ...session,
      completedAt: new Date(),
      notes: sessionNotes || undefined,
    };
    onComplete(completedSession);
  };

  const completedExercises = session.exercises.filter(ex => ex.completed).length;
  const totalExercises = workout.exercises.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{workout.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Duration: {formatDuration(duration)} • {completedExercises}/{totalExercises} exercises completed
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onCancel}>
                End Workout
              </Button>
              <Button 
                onClick={completeWorkout}
                disabled={completedExercises === 0}
              >
                Complete Workout
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Exercise Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Exercise {currentExerciseIndex + 1} of {totalExercises}</span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={previousExercise}
                disabled={currentExerciseIndex === 0}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={nextExercise}
                disabled={currentExerciseIndex === workout.exercises.length - 1}
              >
                Next
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold">{currentExercise.name}</h3>
              <p className="text-muted-foreground">
                Target: {currentExercise.sets} sets × {currentExercise.reps} reps
                {currentExercise.weight && ` @ ${currentExercise.weight}lbs`}
              </p>
              {currentExercise.notes && (
                <p className="text-sm text-muted-foreground mt-1">
                  Notes: {currentExercise.notes}
                </p>
              )}
            </div>

            {/* Sets */}
            <div className="space-y-3">
              <h4 className="font-medium">Sets:</h4>
              {Array.from({ length: currentExercise.sets }, (_, setIndex) => (
                <div 
                  key={setIndex} 
                  className={`p-3 border rounded-lg ${
                    setIndex < currentExerciseSession.completedSets 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-background'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Label className="font-medium">Set {setIndex + 1}</Label>
                    <Checkbox 
                      checked={setIndex < currentExerciseSession.completedSets}
                      readOnly
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor={`reps-${setIndex}`} className="text-sm">
                        Reps (target: {currentExercise.reps})
                      </Label>
                      <Input
                        id={`reps-${setIndex}`}
                        type="number"
                        min="0"
                        value={currentExerciseSession.actualReps[setIndex] || ''}
                        onChange={(e) => {
                          const reps = parseInt(e.target.value) || 0;
                          const weight = currentExerciseSession.actualWeight[setIndex] || currentExercise.weight;
                          handleSetComplete(setIndex, reps, weight);
                        }}
                        placeholder={currentExercise.reps.toString()}
                      />
                    </div>
                    
                    {currentExercise.weight && (
                      <div>
                        <Label htmlFor={`weight-${setIndex}`} className="text-sm">
                          Weight (target: {currentExercise.weight}lbs)
                        </Label>
                        <Input
                          id={`weight-${setIndex}`}
                          type="number"
                          min="0"
                          step="0.5"
                          value={currentExerciseSession.actualWeight[setIndex] || ''}
                          onChange={(e) => {
                            const weight = parseFloat(e.target.value) || 0;
                            const reps = currentExerciseSession.actualReps[setIndex] || currentExercise.reps;
                            handleSetComplete(setIndex, reps, weight);
                          }}
                          placeholder={currentExercise.weight.toString()}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Rest Timer */}
            {currentExercise.restTime && (
              <div className="text-center text-sm text-muted-foreground">
                💡 Recommended rest: {Math.floor(currentExercise.restTime / 60)}:{(currentExercise.restTime % 60).toString().padStart(2, '0')}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Session Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Session Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
            placeholder="How did this workout feel? Any observations or modifications..."
            className="w-full min-h-[100px] p-3 border rounded-lg resize-none"
          />
        </CardContent>
      </Card>
    </div>
  );
} 