import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  PrimaryButton,
  SecondaryButton,
  DestructiveButton,
  OutlineButton,
  GhostButton,
} from '@/components/ui/standardButtons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ExerciseForm } from '@/components/ExerciseForm';
import { TagSelector } from '@/components/TagSelector';
import { ComposableExerciseList } from '@/components/ComposableExerciseList';
import type { Workout, Exercise, Tag } from '@/lib/types';

interface WorkoutFormData {
  name: string;
  description: string;
  estimatedDuration: number;
}

interface WorkoutFormProps {
  onSave: (workout: Omit<Workout, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editWorkout?: Workout | null;
  onCancel?: () => void;
}

export function WorkoutForm({
  onSave,
  editWorkout,
  onCancel,
}: WorkoutFormProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<WorkoutFormData>();

  // Pre-populate form when editing
  useEffect(() => {
    if (editWorkout) {
      setValue('name', editWorkout.name);
      setValue('description', editWorkout.description || '');
      setValue('estimatedDuration', editWorkout.estimatedDuration || 0);
      setExercises(editWorkout.exercises);
      setSelectedTags(editWorkout.tags);
    } else {
      reset();
      setExercises([]);
      setSelectedTags([]);
      setEditingExercise(null);
    }
  }, [editWorkout, setValue, reset]);

  const addExercise = (exercise: Omit<Exercise, 'id'>) => {
    const newExercise: Exercise = {
      ...exercise,
      id: crypto.randomUUID(),
    };
    setExercises(prev => [...prev, newExercise]);
  };

  const editExercise = (updatedExercise: Exercise) => {
    setExercises(prev =>
      prev.map(ex => (ex.id === updatedExercise.id ? updatedExercise : ex))
    );
    setEditingExercise(null);
  };

  const removeExercise = (exerciseId: string) => {
    setExercises(prev => prev.filter(ex => ex.id !== exerciseId));
    // Cancel edit if the exercise being edited is removed
    if (editingExercise?.id === exerciseId) {
      setEditingExercise(null);
    }
  };

  const reorderExercises = (reorderedExercises: Exercise[]) => {
    setExercises(reorderedExercises);
  };

  const startEditingExercise = (exercise: Exercise) => {
    setEditingExercise(exercise);
  };

  const cancelEdit = () => {
    setEditingExercise(null);
  };

  const onSubmit = (data: WorkoutFormData) => {
    if (exercises.length === 0) {
      alert('Please add at least one exercise to your workout.');
      return;
    }

    const workout: Omit<Workout, 'id' | 'createdAt' | 'updatedAt'> = {
      name: data.name,
      description: data.description || undefined,
      exercises,
      tags: selectedTags,
      estimatedDuration: data.estimatedDuration || undefined,
    };

    onSave(workout);

    // Reset form
    reset();
    setExercises([]);
    setSelectedTags([]);
    setEditingExercise(null);
  };

  const isEditing = !!editWorkout;

  return (
    <div className="space-y-3 lg:space-y-6">
      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="text-lg lg:text-xl flex items-center justify-between">
            <span>{isEditing ? 'Edit Workout' : 'Workout Details'}</span>
            {isEditing && onCancel && (
              <OutlineButton size="sm" onClick={onCancel} className="shrink-0">
                Cancel
              </OutlineButton>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <div className="lg:col-span-2">
              <Label htmlFor="name" className="text-sm lg:text-base">
                Workout Name *
              </Label>
              <Input
                id="name"
                {...register('name', { required: 'Workout name is required' })}
                placeholder="e.g., Push Day, Leg Day"
                className="mt-1 h-12 lg:h-14 lg:text-base"
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="lg:col-span-2">
              <Label htmlFor="description" className="text-sm lg:text-base">
                Description
              </Label>
              <Input
                id="description"
                {...register('description')}
                placeholder="Brief description"
                className="mt-1 h-12 lg:h-14 lg:text-base"
              />
            </div>

            <div>
              <Label
                htmlFor="estimatedDuration"
                className="text-sm lg:text-base"
              >
                Estimated Duration (minutes)
              </Label>
              <Input
                id="estimatedDuration"
                type="number"
                {...register('estimatedDuration', {
                  validate: value => {
                    // Allow empty values (optional field)
                    if (!value || String(value).trim() === '') return true;
                    // If value provided, must be at least 1
                    const numValue = Number(value);
                    return (
                      numValue >= 1 || 'Duration must be at least 1 minute'
                    );
                  },
                })}
                placeholder="60"
                className="mt-1 h-12 lg:h-14 lg:text-base"
              />
              {errors.estimatedDuration && (
                <p className="text-sm text-destructive mt-1">
                  {errors.estimatedDuration.message}
                </p>
              )}
            </div>
          </div>

          <TagSelector
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg lg:text-xl">
            Exercises ({exercises.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <ExerciseForm
            onAddExercise={addExercise}
            onEditExercise={editExercise}
            editingExercise={editingExercise}
            onCancelEdit={cancelEdit}
          />

          <div className="mt-6">
            <ComposableExerciseList
              exercises={exercises}
              onReorder={reorderExercises}
              onEdit={startEditingExercise}
              onRemove={removeExercise}
              editingExercise={editingExercise}
              title={`Added Exercises (${exercises.length})`}
              emptyMessage="No exercises added yet. Add your first exercise above to get started!"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {/* Discard Button */}
        {onCancel && (
          <div className="flex justify-center">
            <GhostButton
              onClick={onCancel}
              className="text-muted-foreground hover:text-destructive text-sm"
            >
              {isEditing ? 'Discard Changes' : 'Discard Workout'}
            </GhostButton>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <PrimaryButton
            onClick={handleSubmit(onSubmit)}
            className="w-full h-12 lg:h-14 text-base lg:text-lg font-medium bg-green-500 hover:bg-green-600 text-white"
            disabled={exercises.length === 0}
          >
            {isEditing ? 'Update Workout' : 'Save Workout'}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
