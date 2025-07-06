export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  restTime?: number; // in seconds
  notes?: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Workout {
  id: string;
  name: string;
  description?: string;
  exercises: Exercise[];
  tags: Tag[];
  createdAt: Date;
  updatedAt: Date;
  estimatedDuration?: number; // in minutes
}

export interface ExerciseSession {
  exerciseId: string;
  completedSets: number;
  actualReps: number[];
  actualWeight: number[];
  completed: boolean;
  startedAt?: Date;
  completedAt?: Date;
}

export interface WorkoutSession {
  id: string;
  workoutId: string;
  startedAt: Date;
  completedAt?: Date;
  exercises: ExerciseSession[];
  notes?: string;
}

export type ViewMode = 'list' | 'create' | 'active'; 