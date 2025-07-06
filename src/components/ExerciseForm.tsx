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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4 border rounded-lg bg-muted/50">
      <h4 className="font-medium text-sm">Add Exercise</h4>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="exerciseName" className="text-sm">Exercise Name *</Label>
          <Input
            id="exerciseName"
            {...register("name", { required: "Exercise name is required" })}
            placeholder="e.g., Bench Press, Squats"
            className="mt-1 h-12"
          />
          {errors.name && (
            <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="sets" className="text-sm">Sets *</Label>
            <Input
              id="sets"
              type="number"
              min="1"
              {...register("sets", { 
                required: "Sets is required",
                min: { value: 1, message: "Must be at least 1" }
              })}
              placeholder="3"
              className="mt-1 h-12 text-center"
            />
            {errors.sets && (
              <p className="text-xs text-destructive mt-1">{errors.sets.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="reps" className="text-sm">Reps *</Label>
            <Input
              id="reps"
              type="number"
              min="1"
              {...register("reps", { 
                required: "Reps is required",
                min: { value: 1, message: "Must be at least 1" }
              })}
              placeholder="10"
              className="mt-1 h-12 text-center"
            />
            {errors.reps && (
              <p className="text-xs text-destructive mt-1">{errors.reps.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="weight" className="text-sm">Weight (lbs)</Label>
            <Input
              id="weight"
              type="number"
              min="0"
              step="0.5"
              {...register("weight")}
              placeholder="135"
              className="mt-1 h-12 text-center"
            />
          </div>

          <div>
            <Label htmlFor="restTime" className="text-sm">Rest (seconds)</Label>
            <Input
              id="restTime"
              type="number"
              min="0"
              {...register("restTime")}
              placeholder="60"
              className="mt-1 h-12 text-center"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="notes" className="text-sm">Notes</Label>
          <Input
            id="notes"
            {...register("notes")}
            placeholder="Additional notes"
            className="mt-1 h-12"
          />
        </div>
      </div>

      <Button type="submit" className="w-full h-12 text-sm font-medium">
        Add Exercise
      </Button>
    </form>
  );
} 