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
import { useTemplatesStore } from '@/stores';
import type { Workout, Exercise, Tag, Template } from '@/lib/types';
import IconBench from './icons/icon-bench';
import IconDumbbell from './icons/icon-dumbbell';

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
  const [showTemplates, setShowTemplates] = useState(false);

  // Templates store
  const templates = useTemplatesStore(state => state.templates);
  const useTemplate = useTemplatesStore(state => state.useTemplate);

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

  const applyTemplate = async (templateId: string) => {
    const template = await useTemplate(templateId);
    if (!template) return;

    // Apply template data to form
    setValue('name', template.name);
    setValue('description', template.description || '');
    setValue('estimatedDuration', template.estimatedDuration || 45);

    // Apply template exercises (create new IDs to avoid conflicts)
    const templateExercises = template.exercises.map(exercise => ({
      ...exercise,
      id: crypto.randomUUID(), // Generate new IDs for the workout
    }));
    setExercises(templateExercises);

    // Apply template tags
    setSelectedTags(template.tags);

    // Hide template selector
    setShowTemplates(false);
  };

  const clearForm = () => {
    reset();
    setValue('estimatedDuration', 45);
    setExercises([]);
    setSelectedTags([]);
    setEditingExercise(null);
    setScheduledDate(new Date());
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
      completedCount: editWorkout?.completedCount ?? 0, // System-managed: preserve existing or 0 for new
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

      {/* Template Selector - Only show when creating new workout */}
      {!isEditing && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg lg:text-xl flex items-center justify-between">
              <span>Start from Template</span>
              <OutlineButton
                size="sm"
                onClick={() => setShowTemplates(!showTemplates)}
                className="shrink-0"
              >
                {showTemplates ? 'Hide Templates' : 'Browse Templates'}
              </OutlineButton>
            </CardTitle>
          </CardHeader>
          {showTemplates && (
            <CardContent className="p-6">
              {templates.length === 0 ? (
                <div className="text-center py-8">
                  <IconBench className="size-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">
                    No Templates Available
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Create templates from the Templates page to use them here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Choose a template to pre-fill your workout with exercises
                    and settings:
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {templates.slice(0, 6).map(template => (
                      <div
                        key={template.id}
                        className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => applyTemplate(template.id)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-sm lg:text-base truncate">
                            {template.name}
                          </h4>
                          {template.isBuiltIn && (
                            <span className="text-xs text-primary font-medium ml-2">
                              Built-in
                            </span>
                          )}
                        </div>

                        {template.description && (
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                            {template.description}
                          </p>
                        )}

                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <IconDumbbell className="size-3" />
                            <span>{template.exercises.length} exercises</span>
                          </div>
                          {template.estimatedDuration && (
                            <div className="flex items-center gap-1">
                              <span>{template.estimatedDuration} min</span>
                            </div>
                          )}
                          {template.category && (
                            <div className="text-primary">
                              {template.category}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {templates.length > 6 && (
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        Showing 6 of {templates.length} templates. Visit
                        Templates page to see all.
                      </p>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t">
                    <OutlineButton size="sm" onClick={clearForm}>
                      Clear Form
                    </OutlineButton>
                    <p className="text-xs text-muted-foreground">
                      Using a template will replace current form data
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      )}

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
