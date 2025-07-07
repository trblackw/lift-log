import { storage } from './storage';
import type { Workout, Tag, Exercise } from './types';

// Predefined exercise data for realistic workouts
const EXERCISE_TEMPLATES = {
  strength: [
    { name: 'Barbell Bench Press', sets: 4, reps: 8, weight: 185 },
    { name: 'Incline Dumbbell Press', sets: 3, reps: 10, weight: 60 },
    { name: 'Back Squat', sets: 4, reps: 6, weight: 225 },
    { name: 'Romanian Deadlift', sets: 3, reps: 8, weight: 185 },
    { name: 'Pull-ups', sets: 3, reps: 8 },
    { name: 'Barbell Rows', sets: 4, reps: 8, weight: 135 },
    { name: 'Overhead Press', sets: 3, reps: 6, weight: 95 },
    { name: 'Dumbbell Shoulder Press', sets: 3, reps: 10, weight: 40 },
    { name: 'Lateral Raises', sets: 3, reps: 12, weight: 20 },
    { name: 'Barbell Curls', sets: 3, reps: 10, weight: 65 },
    { name: 'Close-Grip Bench Press', sets: 3, reps: 8, weight: 135 },
    { name: 'Tricep Dips', sets: 3, reps: 10 },
    { name: 'Bulgarian Split Squats', sets: 3, reps: 10, weight: 25 },
    { name: 'Walking Lunges', sets: 3, reps: 12, weight: 30 },
    { name: 'Leg Press', sets: 4, reps: 12, weight: 270 },
    { name: 'Leg Curls', sets: 3, reps: 12, weight: 80 },
    { name: 'Calf Raises', sets: 4, reps: 15, weight: 135 },
    { name: 'Face Pulls', sets: 3, reps: 15, weight: 40 },
    { name: 'Hammer Curls', sets: 3, reps: 12, weight: 30 },
    { name: 'Russian Twists', sets: 3, reps: 20, weight: 25 },
  ],
  cardio: [
    { name: 'Treadmill Running', duration: 30 },
    { name: 'Elliptical', duration: 25 },
    { name: 'Rowing Machine', duration: 20 },
    { name: 'Stairmaster', duration: 15 },
    { name: 'Cycling', duration: 45 },
    { name: 'Jump Rope', duration: 10 },
    { name: 'Burpees', duration: 8 },
    { name: 'Mountain Climbers', duration: 5 },
  ],
};

const WORKOUT_NAMES = [
  'Push Day Power',
  'Pull Day Strength',
  'Leg Day Crusher',
  'Upper Body Blast',
  'Full Body Flow',
  'HIIT Circuit',
  'Strength Foundation',
  'Cardio Burn',
  'Power Hour',
  'Morning Energizer',
  'Evening Wind Down',
  'Weekend Warrior',
  'Quick Session',
  'Beast Mode',
  'Iron Paradise',
  'Sweat Session',
  'Pump Protocol',
  'Shred Circuit',
  'Muscle Builder',
  'Endurance Test',
];

const TAG_TEMPLATES: Omit<Tag, 'id'>[] = [
  { name: 'Strength', color: '#ef4444' },
  { name: 'Cardio', color: '#f97316' },
  { name: 'Upper Body', color: '#eab308' },
  { name: 'Lower Body', color: '#22c55e' },
  { name: 'Push', color: '#06b6d4' },
  { name: 'Pull', color: '#3b82f6' },
  { name: 'HIIT', color: '#8b5cf6' },
  { name: 'Full Body', color: '#ec4899' },
  { name: 'Quick', color: '#84cc16' },
  { name: 'Beginner', color: '#10b981' },
  { name: 'Advanced', color: '#f59e0b' },
  { name: 'Morning', color: '#fbbf24' },
  { name: 'Evening', color: '#6366f1' },
  { name: 'Home', color: '#14b8a6' },
  { name: 'Gym', color: '#dc2626' },
];

const WORKOUT_DESCRIPTIONS = [
  'A comprehensive workout targeting major muscle groups',
  'High-intensity training for maximum results',
  'Perfect for building strength and endurance',
  'Great for busy schedules - maximum impact in minimum time',
  'Focused training for serious gains',
  'Balanced routine for overall fitness',
  'Challenging workout to push your limits',
  'Effective circuit training for fat loss',
  'Classic movements with proven results',
  'Dynamic workout to keep things interesting',
];

/**
 * Generates a random integer between min and max (inclusive)
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Randomly selects items from an array
 */
function randomSelect<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/**
 * Generates a random date within the last N days
 */
function randomPastDate(maxDaysAgo: number): Date {
  const daysAgo = randomInt(1, maxDaysAgo);
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(randomInt(6, 22), randomInt(0, 59), 0, 0);
  return date;
}

/**
 * Creates random exercises for a workout
 */
function generateExercises(
  workoutType: 'strength' | 'cardio' | 'mixed'
): Exercise[] {
  const exercises: Exercise[] = [];
  let exerciseCount: number;

  switch (workoutType) {
    case 'strength':
      exerciseCount = randomInt(4, 8);
      const strengthExercises = randomSelect(
        EXERCISE_TEMPLATES.strength,
        exerciseCount
      );
      exercises.push(
        ...strengthExercises.map(ex => ({
          id: crypto.randomUUID(),
          name: ex.name,
          sets: ex.sets + randomInt(-1, 1), // Add some variation
          reps: ex.reps + randomInt(-2, 2),
          weight: ex.weight ? ex.weight + randomInt(-20, 20) : undefined,
          restTime: randomInt(60, 120),
        }))
      );
      break;

    case 'cardio':
      exerciseCount = randomInt(2, 5);
      const cardioExercises = randomSelect(
        EXERCISE_TEMPLATES.cardio,
        exerciseCount
      );
      exercises.push(
        ...cardioExercises.map(ex => ({
          id: crypto.randomUUID(),
          name: ex.name,
          duration: ex.duration + randomInt(-5, 10),
        }))
      );
      break;

    case 'mixed':
      const strengthCount = randomInt(2, 4);
      const cardioCount = randomInt(1, 3);

      const mixedStrength = randomSelect(
        EXERCISE_TEMPLATES.strength,
        strengthCount
      );
      const mixedCardio = randomSelect(EXERCISE_TEMPLATES.cardio, cardioCount);

      exercises.push(
        ...mixedStrength.map(ex => ({
          id: crypto.randomUUID(),
          name: ex.name,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight,
          restTime: randomInt(60, 90),
        }))
      );

      exercises.push(
        ...mixedCardio.map(ex => ({
          id: crypto.randomUUID(),
          name: ex.name,
          duration: ex.duration,
        }))
      );
      break;
  }

  return exercises;
}

/**
 * Generates random tags for a workout
 */
function generateTags(): Tag[] {
  const tagCount = randomInt(1, 4);
  const selectedTags = randomSelect(TAG_TEMPLATES, tagCount);

  return selectedTags.map(tag => ({
    ...tag,
    id: crypto.randomUUID(),
  }));
}

/**
 * Calculates estimated duration based on exercises
 */
function calculateEstimatedDuration(exercises: Exercise[]): number {
  let totalMinutes = 0;

  exercises.forEach(exercise => {
    if (exercise.duration) {
      totalMinutes += exercise.duration;
    } else if (exercise.sets && exercise.reps) {
      // Estimate: 30s per set + rest time
      const exerciseTime = exercise.sets * 0.5; // 30s per set
      const restTime = exercise.sets * ((exercise.restTime || 60) / 60); // Rest in minutes
      totalMinutes += exerciseTime + restTime;
    }
  });

  return Math.round(totalMinutes);
}

/**
 * Creates a single random workout
 */
function createRandomWorkout(): Omit<Workout, 'id'> {
  const workoutTypes: ('strength' | 'cardio' | 'mixed')[] = [
    'strength',
    'strength',
    'cardio',
    'mixed',
  ]; // Weight towards strength
  const workoutType = workoutTypes[randomInt(0, workoutTypes.length - 1)];

  const exercises = generateExercises(workoutType);
  const tags = generateTags();
  const estimatedDuration = calculateEstimatedDuration(exercises);

  const name = WORKOUT_NAMES[randomInt(0, WORKOUT_NAMES.length - 1)];
  const description =
    Math.random() > 0.3
      ? WORKOUT_DESCRIPTIONS[randomInt(0, WORKOUT_DESCRIPTIONS.length - 1)]
      : undefined;

  const createdAt = randomPastDate(60); // Created within last 60 days
  const lastCompleted = Math.random() > 0.4 ? randomPastDate(30) : undefined; // 60% chance of being completed

  return {
    name,
    description,
    exercises,
    tags,
    createdAt,
    updatedAt: lastCompleted || createdAt,
    lastCompleted,
    estimatedDuration,
  };
}

/**
 * Generates workout data (works in both browser and Node.js)
 */
export function generateWorkoutData(count: number = 20): Workout[] {
  const workouts: Workout[] = [];

  for (let i = 0; i < count; i++) {
    const workoutData = createRandomWorkout();
    const workout: Workout = {
      id: crypto.randomUUID(),
      ...workoutData,
    };
    workouts.push(workout);
  }

  return workouts;
}

/**
 * Seeds the database with debug workout data (browser only)
 */
export async function seedDebugData(): Promise<void> {
  if (typeof window === 'undefined') {
    throw new Error(
      'seedDebugData can only be run in a browser environment. Use generateWorkoutData() for Node.js environments.'
    );
  }

  console.log('🌱 Starting debug data seeding...');

  try {
    // Initialize storage if needed
    await storage.init();

    // Generate workouts
    const workouts = generateWorkoutData(20);

    // Save all workouts
    for (const workout of workouts) {
      await storage.saveWorkout(workout);
    }

    console.log(`✅ Successfully seeded ${workouts.length} workouts!`);
    console.log('📊 Summary:');
    console.log(`   • Total workouts: ${workouts.length}`);
    console.log(
      `   • Completed workouts: ${workouts.filter(w => w.lastCompleted).length}`
    );
    console.log(
      `   • Average exercises per workout: ${Math.round(workouts.reduce((sum, w) => sum + w.exercises.length, 0) / workouts.length)}`
    );
    console.log(
      `   • Unique tags created: ${new Set(workouts.flatMap(w => w.tags.map(t => t.name))).size}`
    );
  } catch (error) {
    console.error('❌ Failed to seed debug data:', error);
    throw error;
  }
}

/**
 * Imports workout data into the browser database
 */
export async function importWorkoutData(workouts: Workout[]): Promise<void> {
  if (typeof window === 'undefined') {
    throw new Error(
      'importWorkoutData can only be run in a browser environment.'
    );
  }

  console.log(`🔄 Importing ${workouts.length} workouts...`);

  try {
    // Initialize storage if needed
    await storage.init();

    // Save all workouts
    for (const workout of workouts) {
      await storage.saveWorkout(workout);
    }

    console.log(`✅ Successfully imported ${workouts.length} workouts!`);
    console.log('📊 Summary:');
    console.log(`   • Total workouts: ${workouts.length}`);
    console.log(
      `   • Completed workouts: ${workouts.filter(w => w.lastCompleted).length}`
    );
    console.log(
      `   • Average exercises per workout: ${Math.round(workouts.reduce((sum, w) => sum + w.exercises.length, 0) / workouts.length)}`
    );
    console.log(
      `   • Unique tags created: ${new Set(workouts.flatMap(w => w.tags.map(t => t.name))).size}`
    );
  } catch (error) {
    console.error('❌ Failed to import workout data:', error);
    throw error;
  }
}

/**
 * Clears all existing workout data (browser only)
 */
export async function clearAllData(): Promise<void> {
  if (typeof window === 'undefined') {
    throw new Error('clearAllData can only be run in a browser environment.');
  }

  console.log('🗑️  Clearing all workout data...');

  try {
    await storage.clearAll();
    console.log('✅ All data cleared successfully!');
  } catch (error) {
    console.error('❌ Failed to clear data:', error);
    throw error;
  }
}

/**
 * Logs current database stats (browser only)
 */
export async function logDatabaseStats(): Promise<void> {
  if (typeof window === 'undefined') {
    throw new Error(
      'logDatabaseStats can only be run in a browser environment.'
    );
  }

  try {
    const workouts = await storage.loadWorkouts();
    const sessions = await storage.loadSessions();

    console.log('📊 Database Statistics:');
    console.log(`   • Total workouts: ${workouts.length}`);
    console.log(
      `   • Completed workouts: ${workouts.filter(w => w.lastCompleted).length}`
    );
    console.log(`   • Total sessions: ${sessions.length}`);
    console.log(
      `   • Total exercises: ${workouts.reduce((sum, w) => sum + w.exercises.length, 0)}`
    );
    console.log(
      `   • Unique tags: ${new Set(workouts.flatMap(w => w.tags.map(t => t.name))).size}`
    );
  } catch (error) {
    console.error('❌ Failed to get database stats:', error);
  }
}
