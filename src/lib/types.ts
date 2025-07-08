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
  lastCompleted?: Date; // When this workout was last completed
  completedCount: number; // How many times this workout has been completed
  estimatedDuration?: number; // in minutes
  scheduledDate?: Date; // When this workout is scheduled to be performed
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
  actualDuration?: number; // Total duration in seconds (excludes paused time)
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

// Exercise Library Types
export interface UniqueExercise {
  name: string;
  // Aggregated info from all instances
  commonSets?: number;
  commonReps?: number;
  commonWeight?: number;
  commonDuration?: number;
  commonRestTime?: number;
  usageCount: number; // How many times this exercise appears across workouts
  workoutIds: string[]; // Which workouts contain this exercise
  lastUsed: Date; // When this exercise was last used in a workout
}

export interface ExerciseLibrary {
  exercises: UniqueExercise[];
  lastUpdated: Date;
  totalUniqueExercises: number;
}

export interface ScheduledWorkout {
  id: string;
  workoutId: string;
  scheduledDate: Date;
  completed: boolean;
  completedAt?: Date;
  notes?: string;
  createdAt: Date;
}

export type ViewMode =
  | 'list'
  | 'create'
  | 'active'
  | 'details'
  | 'calendar'
  | 'day'
  | 'history'
  | 'settings';
