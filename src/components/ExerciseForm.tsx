import { useForm } from 'react-hook-form';
import {
  PrimaryButton,
  OutlineButton,
  GhostButton,
} from '@/components/ui/standardButtons';
import { FormInput, FormTextarea } from '@/components/ui/standardInputs';
import { Label } from '@/components/ui/label';
import { ExerciseAutocomplete } from '@/components/ui/ExerciseAutocomplete';
import { useEffect, useState } from 'react';
import type { Exercise, UniqueExercise } from '@/lib/types';

interface ExerciseFormData {
  name: string;
  sets?: number;
  reps?: number;
  weight?: number;
  duration?: number;
  restTime?: number;
  notes?: string;
}

interface ExerciseFormProps {
  onAddExercise?: (exercise: Omit<Exercise, 'id'>) => void;
  onEditExercise?: (exercise: Exercise) => void;
  editingExercise?: Exercise | null;
  onCancelEdit?: () => void;
}

export function ExerciseForm({
  onAddExercise,
  onEditExercise,
  editingExercise,
  onCancelEdit,
}: ExerciseFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ExerciseFormData>();

  const [nameError, setNameError] = useState<string>('');

  const watchedSets = watch('sets');
  const watchedReps = watch('reps');
  const watchedDuration = watch('duration');

  // Pre-populate form when editing
  useEffect(() => {
    if (editingExercise) {
      setValue('name', editingExercise.name);
      setValue('sets', editingExercise.sets || undefined);
      setValue('reps', editingExercise.reps || undefined);
      setValue('weight', editingExercise.weight || undefined);
      setValue('duration', editingExercise.duration || undefined);
      setValue('restTime', editingExercise.restTime || undefined);
      setValue('notes', editingExercise.notes || '');
      setNameError(''); // Clear name error when editing
    } else {
      reset();
      setNameError(''); // Clear name error when resetting
    }
  }, [editingExercise, setValue, reset]);

  const onSubmit = (data: ExerciseFormData) => {
    // Get the current name value from the form
    const currentName = watch('name');

    // Validate that name is provided
    if (!currentName || currentName.trim() === '') {
      setNameError('Exercise name is required');
      return;
    }

    // Clear name error if validation passes
    setNameError('');

    // Validate that either (sets + reps) OR duration is provided
    const hasStrengthData = data.sets && data.reps;
    const hasCardioData = data.duration;

    if (!hasStrengthData && !hasCardioData) {
      return; // Form validation will handle this
    }

    const exerciseData = {
      name: currentName,
      sets: data.sets ? Number(data.sets) : undefined,
      reps: data.reps ? Number(data.reps) : undefined,
      weight: data.weight ? Number(data.weight) : undefined,
      duration: data.duration ? Number(data.duration) : undefined,
      restTime: data.restTime ? Number(data.restTime) : undefined,
      notes: data.notes || undefined,
    };

    if (editingExercise && onEditExercise) {
      // Editing existing exercise
      onEditExercise({
        ...exerciseData,
        id: editingExercise.id,
      });
    } else if (onAddExercise) {
      // Adding new exercise
      onAddExercise(exerciseData);
    }

    reset();
    setNameError(''); // Clear name error after submission
  };

  const handleCancel = () => {
    reset();
    setNameError(''); // Clear name error
    if (onCancelEdit) {
      onCancelEdit();
    }
  };

  const handleExerciseSelect = (exercise: UniqueExercise) => {
    // Clear any name error
    setNameError('');

    // Auto-fill form fields with common values from the selected exercise
    setValue('name', exercise.name);

    if (exercise.commonSets) {
      setValue('sets', exercise.commonSets);
    }

    if (exercise.commonReps) {
      setValue('reps', exercise.commonReps);
    }

    if (exercise.commonWeight) {
      setValue('weight', exercise.commonWeight);
    }

    if (exercise.commonDuration) {
      setValue('duration', exercise.commonDuration);
    }

    if (exercise.commonRestTime) {
      setValue('restTime', exercise.commonRestTime);
    }
  };

  const handleNameChange = (value: string) => {
    setValue('name', value);
    // Clear name error when user starts typing
    if (nameError && value.trim() !== '') {
      setNameError('');
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="lg:space-y-6 p-4 lg:p-6 border rounded-lg"
    >
      <div className="flex items-center justify-end">
        {editingExercise && (
          <GhostButton
            type="button"
            size="sm"
            onClick={handleCancel}
            className="text-xs lg:text-sm"
          >
            Cancel
          </GhostButton>
        )}
      </div>

      <div className="lg:space-y-4">
        <div>
          <Label htmlFor="exerciseName" className="text-sm lg:text-base">
            Name <span className="text-destructive">*</span>
          </Label>
          <ExerciseAutocomplete
            id="exerciseName"
            value={watch('name') || ''}
            onChange={handleNameChange}
            onSelect={handleExerciseSelect}
            placeholder="e.g., Bench Press, Stairmaster, Running"
            className="mt-1 h-12 lg:h-14 lg:text-base"
          />
          {nameError && (
            <p className="text-sm text-destructive mt-1">{nameError}</p>
          )}
        </div>

        {/* Strength Training Fields */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm lg:text-base font-medium">
                Strength Training
              </span>
              <GhostButton
                type="button"
                size="sm"
                onClick={() => {
                  setValue('sets', 3);
                  setValue('reps', 10);
                }}
                className="text-xs px-2 py-1 h-6 text-muted-foreground hover:text-muted-foreground/80"
              >
                3×10 Default
              </GhostButton>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:gap-4">
            <div>
              <Label htmlFor="sets" className="text-sm lg:text-base">
                Sets
              </Label>
              <FormInput
                id="sets"
                type="number"
                min="1"
                {...register('sets', {
                  validate: value => {
                    if (!value && !watchedDuration) {
                      return 'Either sets & reps OR duration is required';
                    }
                    if (value && !watchedReps) {
                      return 'Reps required when sets specified';
                    }
                    return true;
                  },
                })}
                placeholder="3"
                className="mt-1 h-12 lg:h-14 text-center lg:text-base"
              />
              {errors.sets && (
                <p className="text-xs lg:text-sm text-destructive mt-1">
                  {errors.sets.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="reps" className="text-sm lg:text-base">
                Reps
              </Label>
              <FormInput
                id="reps"
                type="number"
                min="1"
                {...register('reps', {
                  validate: value => {
                    if (!value && !watchedDuration) {
                      return 'Either sets & reps OR duration is required';
                    }
                    if (value && !watchedSets) {
                      return 'Sets required when reps specified';
                    }
                    return true;
                  },
                })}
                placeholder="10"
                className="mt-1 h-12 lg:h-14 text-center lg:text-base"
              />
              {errors.reps && (
                <p className="text-xs lg:text-sm text-destructive mt-1">
                  {errors.reps.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Cardio Field */}
        <div>
          <Label
            htmlFor="duration"
            className="text-sm lg:text-base font-medium"
          >
            Cardio Duration (minutes)
          </Label>
          <FormInput
            id="duration"
            type="number"
            min="1"
            step="0.5"
            {...register('duration', {
              validate: value => {
                if (!value && !watchedSets && !watchedReps) {
                  return 'Either duration OR sets & reps is required';
                }
                return true;
              },
            })}
            placeholder="30"
            className="mt-1 h-12 lg:h-14 text-center lg:text-base"
          />
          {errors.duration && (
            <p className="text-sm text-destructive mt-1">
              {errors.duration.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 lg:gap-4">
          <div>
            <Label htmlFor="weight" className="text-sm lg:text-base">
              Weight (lbs)
            </Label>
            <FormInput
              id="weight"
              type="number"
              min="0"
              step="0.5"
              {...register('weight')}
              placeholder="135"
              className="mt-1 h-12 lg:h-14 text-center lg:text-base"
            />
          </div>

          <div>
            <Label htmlFor="restTime" className="text-sm lg:text-base">
              Rest (seconds)
            </Label>
            <FormInput
              id="restTime"
              type="number"
              min="0"
              {...register('restTime')}
              placeholder="60"
              className="mt-1 h-12 lg:h-14 text-center lg:text-base"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="notes" className="text-sm lg:text-base">
            Notes
          </Label>
          <FormTextarea
            id="notes"
            {...register('notes')}
            placeholder="Additional notes (e.g., form cues, target muscle groups, variations)"
            className="mt-1 lg:text-base"
            rows={3}
          />
        </div>
      </div>

      <PrimaryButton
        type="submit"
        className="w-full h-12 lg:h-14 text-sm lg:text-base font-medium mt-4"
      >
        {editingExercise ? 'Update Exercise' : 'Add Exercise'}
      </PrimaryButton>
    </form>
  );
}
