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
      <h4 className="font-medium">Add Exercise</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="exerciseName">Exercise Name *</Label>
          <Input
            id="exerciseName"
            {...register("name", { required: "Exercise name is required" })}
            placeholder="e.g., Bench Press, Squats"
          />
          {errors.name && (
            <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="sets">Sets *</Label>
          <Input
            id="sets"
            type="number"
            min="1"
            {...register("sets", { 
              required: "Sets is required",
              min: { value: 1, message: "Must be at least 1" }
            })}
            placeholder="3"
          />
          {errors.sets && (
            <p className="text-sm text-destructive mt-1">{errors.sets.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="reps">Reps *</Label>
          <Input
            id="reps"
            type="number"
            min="1"
            {...register("reps", { 
              required: "Reps is required",
              min: { value: 1, message: "Must be at least 1" }
            })}
            placeholder="10"
          />
          {errors.reps && (
            <p className="text-sm text-destructive mt-1">{errors.reps.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="weight">Weight (lbs)</Label>
          <Input
            id="weight"
            type="number"
            min="0"
            step="0.5"
            {...register("weight")}
            placeholder="135"
          />
        </div>

        <div>
          <Label htmlFor="restTime">Rest Time (seconds)</Label>
          <Input
            id="restTime"
            type="number"
            min="0"
            {...register("restTime")}
            placeholder="60"
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Input
            id="notes"
            {...register("notes")}
            placeholder="Any additional notes about this exercise"
          />
        </div>
      </div>

      <Button type="submit" className="w-full">
        Add Exercise
      </Button>
    </form>
  );
} 