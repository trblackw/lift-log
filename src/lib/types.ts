export interface Exercise {
  id: string;
  name: string;
  sets?: number;
  reps?: number;
  weight?: number;
  duration?: number; // in minutes for cardio exercises
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

export interface ActiveWorkoutSession {
  id: string;
  workoutId: string;
  startedAt: Date;
  pausedAt?: Date;
  totalPausedTime: number;
  completedExercises: string[]; // Array of exercise IDs
  duration: number; // Current duration in seconds
}

export type ViewMode = 'list' | 'create' | 'active' | 'details';
