import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ExerciseForm } from "./ExerciseForm";
import { TagSelector } from "./TagSelector";
import type { Workout, Exercise, Tag } from "@/lib/types";

interface WorkoutFormData {
  name: string;
  description: string;
  estimatedDuration: number;
}

interface WorkoutFormProps {
  onSave: (workout: Omit<Workout, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export function WorkoutForm({ onSave }: WorkoutFormProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<WorkoutFormData>();

  const addExercise = (exercise: Omit<Exercise, 'id'>) => {
    const newExercise: Exercise = {
      ...exercise,
      id: crypto.randomUUID(),
    };
    setExercises(prev => [...prev, newExercise]);
  };

  const removeExercise = (exerciseId: string) => {
    setExercises(prev => prev.filter(ex => ex.id !== exerciseId));
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
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Workout Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-sm">Workout Name *</Label>
            <Input
              id="name"
              {...register("name", { required: "Workout name is required" })}
              placeholder="e.g., Push Day, Leg Day"
              className="mt-1 h-12"
            />
            {errors.name && (
              <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description" className="text-sm">Description</Label>
            <Input
              id="description"
              {...register("description")}
              placeholder="Brief description"
              className="mt-1 h-12"
            />
          </div>

          <div>
            <Label htmlFor="estimatedDuration" className="text-sm">Estimated Duration (minutes)</Label>
            <Input
              id="estimatedDuration"
              type="number"
              {...register("estimatedDuration", { min: 1 })}
              placeholder="60"
              className="mt-1 h-12"
            />
          </div>

          <TagSelector
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Exercises ({exercises.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ExerciseForm onAddExercise={addExercise} />
          
          {exercises.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Added Exercises:</h4>
              {exercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className="p-3 border rounded-lg bg-muted/30"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{exercise.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {exercise.sets} sets × {exercise.reps} reps
                        {exercise.weight && ` @ ${exercise.weight}lbs`}
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeExercise(exercise.id)}
                      className="ml-2 h-8 px-2 text-xs"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Button 
        onClick={handleSubmit(onSubmit)} 
        className="w-full h-12 text-base font-medium"
        disabled={exercises.length === 0}
      >
        Save Workout
      </Button>
    </div>
  );
} 