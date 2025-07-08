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
import { FormInput } from '@/components/ui/standardInputs';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { ExerciseForm } from '@/components/ExerciseForm';
import { TagSelector } from '@/components/TagSelector';
import { ComposableExerciseList } from '@/components/ComposableExerciseList';
import type { Workout, Exercise, Tag } from '@/lib/types';

interface WorkoutFormData {
  name: string;
  description: string;
  estimatedDuration: number;
  scheduledDate?: Date;
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
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(
    new Date()
  );
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

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
      setValue('estimatedDuration', editWorkout.estimatedDuration || 45);
      setExercises(editWorkout.exercises);
      setSelectedTags(editWorkout.tags);
      setScheduledDate(editWorkout.scheduledDate || new Date());
    } else {
      reset();
      setValue('estimatedDuration', 45); // Set default to 45 minutes
      setExercises([]);
      setSelectedTags([]);
      setEditingExercise(null);
      setScheduledDate(new Date());
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
      scheduledDate: scheduledDate || undefined,
    };

    onSave(workout);

    // Reset form
    reset();
    setExercises([]);
    setSelectedTags([]);
    setEditingExercise(null);
    setScheduledDate(undefined);
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
                Workout Name <span className="text-destructive">*</span>
              </Label>
              <FormInput
                id="name"
                {...register('name', { required: 'Workout name is required' })}
                placeholder="e.g., Push Day, Leg Day"
                className="mt-1 h-12 lg:h-14 lg:text-base"
                autoComplete="off"
                autoCorrect="off"
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
              <FormInput
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
                Estimated Duration (minutes){' '}
                <span className="text-destructive">*</span>
              </Label>
              <FormInput
                id="estimatedDuration"
                type="number"
                {...register('estimatedDuration', {
                  required: 'Duration is required',
                  validate: value => {
                    const numValue = Number(value);
                    return (
                      numValue >= 1 || 'Duration must be at least 1 minute'
                    );
                  },
                })}
                placeholder="45"
                className="mt-1 h-12 lg:h-14 lg:text-base"
              />
              {errors.estimatedDuration && (
                <p className="text-sm text-destructive mt-1">
                  {errors.estimatedDuration.message}
                </p>
              )}
            </div>

            <div>
              <Label className="text-sm lg:text-base">Scheduled Date</Label>
              <div className="flex gap-2 mt-1">
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <OutlineButton
                      type="button"
                      className={`flex-1 h-12 lg:h-14 justify-start text-left font-normal bg-muted/80 ${
                        !scheduledDate && 'text-muted-foreground'
                      }`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {scheduledDate ? (
                        format(scheduledDate, 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </OutlineButton>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={scheduledDate}
                      onSelect={date => {
                        setScheduledDate(date);
                        setIsCalendarOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
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
            Exercises <small>({exercises.length})</small>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4">
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
              emptyMessage="No exercises added yet."
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
