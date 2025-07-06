import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Exercise } from "@/lib/types";

interface ExerciseFormData {
  name: string;
  sets: number;
  reps: number;
  weight?: number;
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
    formState: { errors }
  } = useForm<ExerciseFormData>();

  const onSubmit = (data: ExerciseFormData) => {
    const exercise: Omit<Exercise, 'id'> = {
      name: data.name,
      sets: Number(data.sets),
      reps: Number(data.reps),
      weight: data.weight ? Number(data.weight) : undefined,
      restTime: data.restTime ? Number(data.restTime) : undefined,
      notes: data.notes || undefined,
    };

    onAddExercise(exercise);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 lg:space-y-6 p-4 lg:p-6 border rounded-lg bg-muted/50">
      <h4 className="font-medium text-sm lg:text-base">Add Exercise</h4>
      
      <div className="space-y-4 lg:space-y-6">
        <div>
          <Label htmlFor="exerciseName" className="text-sm lg:text-base">Exercise Name *</Label>
          <Input
            id="exerciseName"
            {...register("name", { required: "Exercise name is required" })}
            placeholder="e.g., Bench Press, Squats"
            className="mt-1 h-12 lg:h-14 lg:text-base"
          />
          {errors.name && (
            <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 lg:gap-4">
          <div>
            <Label htmlFor="sets" className="text-sm lg:text-base">Sets *</Label>
            <Input
              id="sets"
              type="number"
              min="1"
              {...register("sets", { 
                required: "Sets is required",
                min: { value: 1, message: "Must be at least 1" }
              })}
              placeholder="3"
              className="mt-1 h-12 lg:h-14 text-center lg:text-base"
            />
            {errors.sets && (
              <p className="text-xs lg:text-sm text-destructive mt-1">{errors.sets.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="reps" className="text-sm lg:text-base">Reps *</Label>
            <Input
              id="reps"
              type="number"
              min="1"
              {...register("reps", { 
                required: "Reps is required",
                min: { value: 1, message: "Must be at least 1" }
              })}
              placeholder="10"
              className="mt-1 h-12 lg:h-14 text-center lg:text-base"
            />
            {errors.reps && (
              <p className="text-xs lg:text-sm text-destructive mt-1">{errors.reps.message}</p>
            )}
          </div>
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