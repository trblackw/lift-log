// Re-export Zod-inferred types for backward compatibility
export type {
  Exercise,
  Tag,
  Workout,
  ExerciseSession,
  WorkoutSession,
  ActiveWorkoutSession,
  UniqueExercise,
  ExerciseLibrary,
  ScheduledWorkout,
  ViewMode,
  PartialWorkout,
  PartialExercise,
} from './schemas';

// Re-export validation functions for convenience
export {
  validateExercise,
  validateWorkout,
  validateWorkoutSession,
  validateActiveWorkoutSession,
  safeParseExercise,
  safeParseWorkout,
  safeParseWorkoutSession,
  safeParseActiveWorkoutSession,
} from './schemas';

// Migration note: This file now uses Zod-inferred types instead of standalone interfaces.
// All types are now validated at runtime, providing better data integrity and error handling.
// The API remains the same, so existing code should continue to work without changes.
