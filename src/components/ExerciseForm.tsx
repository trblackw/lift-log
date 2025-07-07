import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  onAddExercise: (exercise: Omit<Exercise, 'id'>) => void;
}

export function ExerciseForm({ onAddExercise }: ExerciseFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<ExerciseFormData>();

  const watchedSets = watch("sets");
  const watchedReps = watch("reps");
  const watchedDuration = watch("duration");

  const onSubmit = (data: ExerciseFormData) => {
    // Validate that either (sets + reps) OR duration is provided
    const hasStrengthData = data.sets && data.reps;
    const hasCardioData = data.duration;

    if (!hasStrengthData && !hasCardioData) {
      return; // Form validation will handle this
    }

    const exercise: Omit<Exercise, 'id'> = {
      name: data.name,
      sets: data.sets ? Number(data.sets) : undefined,
      reps: data.reps ? Number(data.reps) : undefined,
      weight: data.weight ? Number(data.weight) : undefined,
      duration: data.duration ? Number(data.duration) : undefined,
      restTime: data.restTime ? Number(data.restTime) : undefined,
      notes: data.notes || undefined,
    };

    onAddExercise(exercise);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 lg:space-y-6 p-4 lg:p-6 border rounded-lg bg-muted/50">
    
      <div className="space-y-4 lg:space-y-6">
        <div>
          <Label htmlFor="exerciseName" className="text-sm lg:text-base">Exercise Name *</Label>
          <Input
            id="exerciseName"
            {...register("name", { required: "Exercise name is required" })}
            placeholder="e.g., Bench Press, Stairmaster, Running"
            className="mt-1 h-12 lg:h-14 lg:text-base"
          />
          {errors.name && (
            <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Strength Training Fields */}
        <div className="space-y-3">
          <Label className="text-sm lg:text-base font-medium">Strength Training</Label>
          <div className="grid grid-cols-2 gap-3 lg:gap-4 mt-3">
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
                className="mt-1 h-12 lg:h-14 text-center lg:text-base"
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
                className="mt-1 h-12 lg:h-14 text-center lg:text-base"
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
            className="mt-1 h-12 lg:h-14 text-center lg:text-base"
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
              className="mt-1 h-12 lg:h-14 text-center lg:text-base"
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
              className="mt-1 h-12 lg:h-14 text-center lg:text-base"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="notes" className="text-sm lg:text-base">Notes</Label>
          <Input
            id="notes"
            {...register("notes")}
            placeholder="Additional notes"
            className="mt-1 h-12 lg:h-14 lg:text-base"
          />
        </div>
      </div>

      <Button type="submit" className="w-full h-12 lg:h-14 text-sm lg:text-base font-medium">
        Add Exercise
      </Button>
    </form>
  );
} 