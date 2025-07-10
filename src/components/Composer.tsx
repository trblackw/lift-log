import { useState } from 'react';
import {
  PrimaryButton,
  SecondaryButton,
  OutlineButton,
} from '@/components/ui/standardButtons';
import { StandardInput, FormTextarea } from '@/components/ui/standardInputs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ComposableExerciseList } from './ComposableExerciseList';
import { ExerciseLibrary } from './ExerciseLibrary';
import type { Exercise } from '@/lib/types';
import IconPlusBordered from './icons/icon-plus-bordered';
import IconBench from './icons/icon-bench';

interface ComposerProps {
  workoutExercises: Exercise[];
  onExercisesChange: (exercises: Exercise[]) => void;
  workoutName: string;
  onWorkoutNameChange: (name: string) => void;
  workoutDescription: string;
  onWorkoutDescriptionChange: (description: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function Composer({
  workoutExercises,
  onExercisesChange,
  workoutName,
  onWorkoutNameChange,
  workoutDescription,
  onWorkoutDescriptionChange,
  onSave,
  onCancel,
}: ComposerProps) {
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);

  const handleAddExercise = (exercise: Exercise) => {
    // Create a new exercise with a unique ID
    const newExercise: Exercise = {
      ...exercise,
      id: crypto.randomUUID(),
    };

    onExercisesChange([...workoutExercises, newExercise]);
  };

  const handleEditExercise = (exercise: Exercise) => {
    setEditingExercise(exercise);
  };

  const handleUpdateExercise = (updatedExercise: Exercise) => {
    onExercisesChange(
      workoutExercises.map(ex =>
        ex.id === updatedExercise.id ? updatedExercise : ex
      )
    );
    setEditingExercise(null);
  };

  const handleRemoveExercise = (exerciseId: string) => {
    onExercisesChange(workoutExercises.filter(ex => ex.id !== exerciseId));
  };

  const handleReorderExercises = (reorderedExercises: Exercise[]) => {
    onExercisesChange(reorderedExercises);
  };

  const canSave = workoutName.trim().length > 0 && workoutExercises.length > 0;

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconBench className="size-6" />
            Workout Composer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Workout Name *
              </label>
              <StandardInput
                value={workoutName}
                onChange={e => onWorkoutNameChange(e.target.value)}
                placeholder="Enter workout name..."
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <FormTextarea
                value={workoutDescription}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  onWorkoutDescriptionChange(e.target.value)
                }
                placeholder="Optional description..."
                className="w-full"
                rows={1}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {workoutExercises.length} exercise
              {workoutExercises.length !== 1 ? 's' : ''}
            </div>
            <div className="flex gap-2">
              <SecondaryButton onClick={onCancel}>Cancel</SecondaryButton>
              <PrimaryButton
                onClick={onSave}
                disabled={!canSave}
                className="flex items-center gap-2"
              >
                <IconPlusBordered className="size-4" />
                Save Workout
              </PrimaryButton>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workout Builder */}
      <Card className="flex-1 min-h-0">
        <CardHeader>
          <CardTitle>Your Workout</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 overflow-y-auto scroll-container">
          <ComposableExerciseList
            exercises={workoutExercises}
            onReorder={handleReorderExercises}
            onEdit={handleEditExercise}
            onRemove={handleRemoveExercise}
            editingExercise={editingExercise}
            emptyMessage="Add exercises from the library below to build your workout"
          />
        </CardContent>
      </Card>

      {/* Exercise Library */}
      <Card>
        <CardHeader>
          <CardTitle>Exercise Library</CardTitle>
        </CardHeader>
        <CardContent>
          <ExerciseLibrary
            onAddExercise={handleAddExercise}
            onEditExercise={handleUpdateExercise}
            editingExercise={editingExercise}
            onCancelEdit={() => setEditingExercise(null)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
