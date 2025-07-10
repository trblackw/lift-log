import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  PrimaryButton,
  SecondaryButton,
  OutlineButton,
  GhostButton,
} from '@/components/ui/standardButtons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormInput } from '@/components/ui/standardInputs';
import { Label } from '@/components/ui/label';
import { ExerciseForm } from '@/components/ExerciseForm';
import { TagSelector } from '@/components/TagSelector';
import { ComposableExerciseList } from '@/components/ComposableExerciseList';
import type { Template, Exercise, Tag } from '@/lib/types';

interface TemplateFormData {
  name: string;
  description: string;
  category: string;
  estimatedDuration: number;
}

interface TemplateFormProps {
  onSave: (template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editTemplate?: Template | null;
  onCancel?: () => void;
}

export function TemplateForm({
  onSave,
  editTemplate,
  onCancel,
}: TemplateFormProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TemplateFormData>();

  // Pre-populate form when editing
  useEffect(() => {
    if (editTemplate) {
      setValue('name', editTemplate.name);
      setValue('description', editTemplate.description || '');
      setValue('category', editTemplate.category || '');
      setValue('estimatedDuration', editTemplate.estimatedDuration || 45);
      setExercises(editTemplate.exercises);
      setSelectedTags(editTemplate.tags);
    } else {
      reset();
      setValue('estimatedDuration', 45); // Set default to 45 minutes
      setExercises([]);
      setSelectedTags([]);
      setEditingExercise(null);
    }
  }, [editTemplate, setValue, reset]);

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

  const onSubmit = (data: TemplateFormData) => {
    if (exercises.length === 0) {
      alert('Please add at least one exercise to your template.');
      return;
    }

    const template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'> = {
      name: data.name,
      description: data.description || undefined,
      category: data.category || undefined,
      exercises,
      tags: selectedTags,
      estimatedDuration: data.estimatedDuration || undefined,
      usageCount: editTemplate?.usageCount ?? 0, // Preserve existing usage count
      isBuiltIn: editTemplate?.isBuiltIn ?? false, // Preserve built-in status
    };

    onSave(template);

    // Reset form
    reset();
    setExercises([]);
    setSelectedTags([]);
    setEditingExercise(null);
  };

  const isEditing = !!editTemplate;

  // Common category suggestions
  const categoryOptions = [
    'Beginner',
    'Intermediate',
    'Advanced',
    'Warm-up',
    'Cool-down',
    'Full Body',
    'Upper Body',
    'Lower Body',
    'Core',
    'Cardio',
    'Strength',
    'HIIT',
    'Stretching',
  ];

  return (
    <div className="space-y-3 lg:space-y-6">
      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="text-lg lg:text-xl flex items-center justify-between">
            <span>{isEditing ? 'Edit Template' : 'Template Details'}</span>
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
                Template Name <span className="text-destructive">*</span>
              </Label>
              <FormInput
                id="name"
                {...register('name', { required: 'Template name is required' })}
                placeholder="e.g., Beginner Full Body, Morning Warm-up"
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
                placeholder="Brief description of this template"
                className="mt-1 h-12 lg:h-14 lg:text-base"
              />
            </div>

            <div>
              <Label htmlFor="category" className="text-sm lg:text-base">
                Category
              </Label>
              <FormInput
                id="category"
                {...register('category')}
                placeholder="e.g., Beginner, Full Body, Warm-up"
                className="mt-1 h-12 lg:h-14 lg:text-base"
                list="category-options"
              />
              <datalist id="category-options">
                {categoryOptions.map(option => (
                  <option key={option} value={option} />
                ))}
              </datalist>
              <p className="text-xs text-muted-foreground mt-1">
                Categories help organize and filter templates
              </p>
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
              title={`Template Exercises (${exercises.length})`}
              emptyMessage="No exercises added yet. Add exercises to build your template."
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
              {isEditing ? 'Discard Changes' : 'Discard Template'}
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
            {isEditing ? 'Update Template' : 'Save Template'}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
