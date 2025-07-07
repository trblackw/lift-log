import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect } from "react";
import type { Exercise } from "@/lib/types";

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

export function ExerciseForm({ onAddExercise, onEditExercise, editingExercise, onCancelEdit }: ExerciseFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm<ExerciseFormData>();

  const watchedSets = watch("sets");
  const watchedReps = watch("reps");
  const watchedDuration = watch("duration");

  // Pre-populate form when editing
  useEffect(() => {
    if (editingExercise) {
      setValue("name", editingExercise.name);
      setValue("sets", editingExercise.sets || undefined);
      setValue("reps", editingExercise.reps || undefined);
      setValue("weight", editingExercise.weight || undefined);
      setValue("duration", editingExercise.duration || undefined);
      setValue("restTime", editingExercise.restTime || undefined);
      setValue("notes", editingExercise.notes || "");
    } else {
      reset();
    }
  }, [editingExercise, setValue, reset]);

  const onSubmit = (data: ExerciseFormData) => {
    // Validate that either (sets + reps) OR duration is provided
    const hasStrengthData = data.sets && data.reps;
    const hasCardioData = data.duration;

    if (!hasStrengthData && !hasCardioData) {
      return; // Form validation will handle this
    }

    const exerciseData = {
      name: data.name,
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
  };

  const handleCancel = () => {
    reset();
    if (onCancelEdit) {
      onCancelEdit();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="lg:space-y-6 p-4 lg:p-6 border rounded-lg">
      <div className="flex items-center justify-between">
        {editingExercise && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCancel}
            className="text-xs lg:text-sm"
          >
            Cancel
          </Button>
        )}
      </div>
      
      <div className="lg:space-y-6">
        <div>
          <Label htmlFor="exerciseName" className="text-sm lg:text-base">Name *</Label>
          <Input
            id="exerciseName"
            {...register("name", { required: "Exercise name is required" })}
            placeholder="e.g., Bench Press, Stairmaster, Running"
            className="mt-1 h-12 lg:h-14 lg:text-base bg-muted/80"
          />
          {errors.name && (
            <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Strength Training Fields */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 lg:gap-4" >
            <div>
              <Label htmlFor="sets" className="text-sm lg:text-base">Sets</Label>
              <Input
                id="sets"
                type="number"
                min="1"
                {...register("sets", {
                  validate: (value) => {
                    if (!value && !watchedDuration) {
                      return "Either sets & reps OR duration is required";
                    }
                    if (value && !watchedReps) {
                      return "Reps required when sets specified";
                    }
                    return true;
                  }
                })}
                placeholder="3"
                className="mt-1 h-12 lg:h-14 text-center lg:text-base bg-muted/80"
              />
              {errors.sets && (
                <p className="text-xs lg:text-sm text-destructive mt-1">{errors.sets.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="reps" className="text-sm lg:text-base">Reps</Label>
              <Input
                id="reps"
                type="number"
                min="1"
                {...register("reps", {
                  validate: (value) => {
                    if (!value && !watchedDuration) {
                      return "Either sets & reps OR duration is required";
                    }
                    if (value && !watchedSets) {
                      return "Sets required when reps specified";
                    }
                    return true;
                  }
                })}
                placeholder="10"
                className="mt-1 h-12 lg:h-14 text-center lg:text-base bg-muted/80"
              />
              {errors.reps && (
                <p className="text-xs lg:text-sm text-destructive mt-1">{errors.reps.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Cardio Field */}
        <div>
          <Label htmlFor="duration" className="text-sm lg:text-base font-medium">Cardio Duration (minutes)</Label>
          <Input
            id="duration"
            type="number"
            min="1"
            step="0.5"
            {...register("duration", {
              validate: (value) => {
                if (!value && !watchedSets && !watchedReps) {
                  return "Either duration OR sets & reps is required";
                }
                return true;
              }
            })}
            placeholder="30"
            className="mt-1 h-12 lg:h-14 text-center lg:text-base bg-muted/80"
          />
          {errors.duration && (
            <p className="text-sm text-destructive mt-1">{errors.duration.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 lg:gap-4">
          <div>
            <Label htmlFor="weight" className="text-sm lg:text-base">Weight (lbs)</Label>
            <Input
              id="weight"
              type="number"
              min="0"
              step="0.5"
              {...register("weight")}
              placeholder="135"
              className="mt-1 h-12 lg:h-14 text-center lg:text-base bg-muted/80"
            />
          </div>

          <div>
            <Label htmlFor="restTime" className="text-sm lg:text-base">Rest (seconds)</Label>
            <Input
              id="restTime"
              type="number"
              min="0"
              {...register("restTime")}
              placeholder="60"
              className="mt-1 h-12 lg:h-14 text-center lg:text-base bg-muted/80"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="notes" className="text-sm lg:text-base">Notes</Label>
          <Input
            id="notes"
            {...register("notes")}
            placeholder="Additional notes"
            className="mt-1 h-12 lg:h-14 lg:text-base bg-muted/80"
          />
        </div>
      </div>

      <Button type="submit" className="w-full h-12 lg:h-14 text-sm lg:text-base font-medium">
        {editingExercise ? 'Update Exercise' : 'Add Exercise'}
      </Button>
    </form>
  );
} 