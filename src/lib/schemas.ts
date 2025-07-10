import { z } from 'zod';

// Base schemas for common types
export const DateSchema = z.coerce.date();
export const OptionalDateSchema = z.coerce.date().optional();

// Exercise schema
export const ExerciseSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Exercise name is required'),
  sets: z.number().int().positive().optional(),
  reps: z.number().int().positive().optional(),
  weight: z.number().positive().optional(),
  duration: z.number().positive().optional(), // in minutes for cardio exercises
  restTime: z.number().int().positive().optional(), // in seconds
  notes: z.string().optional(),
});

// Tag schema
export const TagSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Tag name is required'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color'),
});

// Workout schema
export const WorkoutSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Workout name is required'),
  description: z.string().optional(),
  exercises: z.array(ExerciseSchema),
  tags: z.array(TagSchema),
  createdAt: DateSchema,
  updatedAt: DateSchema,
  lastCompleted: OptionalDateSchema,
  completedCount: z.number().int().min(0).default(0),
  estimatedDuration: z.number().positive().optional(), // in minutes
  averageDuration: z.number().positive().optional(), // in minutes - calculated from completed sessions
  scheduledDate: OptionalDateSchema,
});

// Exercise session schema
export const ExerciseSessionSchema = z.object({
  exerciseId: z.string().uuid(),
  completedSets: z.number().int().min(0),
  actualReps: z.array(z.number().int().min(0)),
  actualWeight: z.array(z.number().min(0)),
  completed: z.boolean(),
  startedAt: OptionalDateSchema,
  completedAt: OptionalDateSchema,
  actualDuration: z.number().int().min(0).optional(), // Individual exercise duration in seconds
});

// Workout session schema
export const WorkoutSessionSchema = z.object({
  id: z.string().uuid(),
  workoutId: z.string().uuid(),
  startedAt: DateSchema,
  completedAt: OptionalDateSchema,
  actualDuration: z.number().int().min(0).optional(), // Total duration in seconds (excludes paused time)
  exercises: z.array(ExerciseSessionSchema),
  notes: z.string().optional(),
});

// Active workout session schema
export const ActiveWorkoutSessionSchema = z.object({
  id: z.string().uuid(),
  workoutId: z.string().uuid(),
  startedAt: DateSchema,
  pausedAt: OptionalDateSchema,
  totalPausedTime: z.number().int().min(0),
  completedExercises: z.array(z.string().uuid()),
  duration: z.number().int().min(0), // Current duration in seconds
  exerciseStartTimes: z.record(z.string().uuid(), DateSchema),
  exerciseEndTimes: z.record(z.string().uuid(), DateSchema),
  currentExerciseId: z.string().uuid().optional(),
});

// Unique exercise schema (for exercise library)
export const UniqueExerciseSchema = z.object({
  name: z.string().min(1),
  commonSets: z.number().int().positive().optional(),
  commonReps: z.number().int().positive().optional(),
  commonWeight: z.number().positive().optional(),
  commonDuration: z.number().positive().optional(),
  commonRestTime: z.number().int().positive().optional(),
  usageCount: z.number().int().min(0),
  workoutIds: z.array(z.string().uuid()),
  lastUsed: DateSchema,
});

// Exercise library schema
export const ExerciseLibrarySchema = z.object({
  exercises: z.array(UniqueExerciseSchema),
  lastUpdated: DateSchema,
  totalUniqueExercises: z.number().int().min(0),
});

// Scheduled workout schema
export const ScheduledWorkoutSchema = z.object({
  id: z.string().uuid(),
  workoutId: z.string().uuid(),
  scheduledDate: DateSchema,
  completed: z.boolean(),
  completedAt: OptionalDateSchema,
  notes: z.string().optional(),
  createdAt: DateSchema,
});

// Template schema
export const TemplateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Template name is required'),
  description: z.string().optional(),
  category: z.string().optional(), // e.g., "Beginner", "Advanced", "Warm-up", "Cool-down"
  exercises: z.array(ExerciseSchema),
  tags: z.array(TagSchema),
  estimatedDuration: z.number().positive().optional(), // in minutes
  createdAt: DateSchema,
  updatedAt: DateSchema,
  usageCount: z.number().int().min(0).default(0), // How many times this template has been used
  isBuiltIn: z.boolean().default(false), // Whether this is a built-in template or user-created
});

// View mode schema
export const ViewModeSchema = z.enum([
  'list',
  'create',
  'composer',
  'templates',
  'active',
  'details',
  'calendar',
  'day',
  'history',
  'settings',
]);

// Infer TypeScript types from schemas
export type Exercise = z.infer<typeof ExerciseSchema>;
export type Tag = z.infer<typeof TagSchema>;
export type Workout = z.infer<typeof WorkoutSchema>;
export type ExerciseSession = z.infer<typeof ExerciseSessionSchema>;
export type WorkoutSession = z.infer<typeof WorkoutSessionSchema>;
export type ActiveWorkoutSession = z.infer<typeof ActiveWorkoutSessionSchema>;
export type UniqueExercise = z.infer<typeof UniqueExerciseSchema>;
export type ExerciseLibrary = z.infer<typeof ExerciseLibrarySchema>;
export type ScheduledWorkout = z.infer<typeof ScheduledWorkoutSchema>;
export type Template = z.infer<typeof TemplateSchema>;
export type ViewMode = z.infer<typeof ViewModeSchema>;

// Validation helpers
export const validateExercise = (data: unknown) => ExerciseSchema.parse(data);
export const validateWorkout = (data: unknown) => WorkoutSchema.parse(data);
export const validateWorkoutSession = (data: unknown) =>
  WorkoutSessionSchema.parse(data);
export const validateActiveWorkoutSession = (data: unknown) =>
  ActiveWorkoutSessionSchema.parse(data);
export const validateTemplate = (data: unknown) => TemplateSchema.parse(data);

// Safe parsing helpers (returns result object instead of throwing)
export const safeParseExercise = (data: unknown) =>
  ExerciseSchema.safeParse(data);
export const safeParseWorkout = (data: unknown) =>
  WorkoutSchema.safeParse(data);
export const safeParseWorkoutSession = (data: unknown) =>
  WorkoutSessionSchema.safeParse(data);
export const safeParseActiveWorkoutSession = (data: unknown) =>
  ActiveWorkoutSessionSchema.safeParse(data);
export const safeParseTemplate = (data: unknown) =>
  TemplateSchema.safeParse(data);

// Array validation helpers
export const validateWorkouts = (data: unknown) =>
  z.array(WorkoutSchema).parse(data);
export const validateWorkoutSessions = (data: unknown) =>
  z.array(WorkoutSessionSchema).parse(data);
export const validateTemplates = (data: unknown) =>
  z.array(TemplateSchema).parse(data);

// Partial schemas for updates
export const PartialWorkoutSchema = WorkoutSchema.partial();
export const PartialExerciseSchema = ExerciseSchema.partial();
export const PartialTemplateSchema = TemplateSchema.partial();

export type PartialWorkout = z.infer<typeof PartialWorkoutSchema>;
export type PartialExercise = z.infer<typeof PartialExerciseSchema>;
export type PartialTemplate = z.infer<typeof PartialTemplateSchema>;
