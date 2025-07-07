import { storage } from './storage';
import type { ExerciseLibrary, UniqueExercise } from './types';

/**
 * Utility functions for working with the exercise library
 */

/**
 * Logs the current exercise library to console for debugging
 */
export async function logExerciseLibrary(): Promise<void> {
  try {
    const library = await storage.buildExerciseLibrary();
    console.log('=== Exercise Library ===');
    console.log(`Total unique exercises: ${library.totalUniqueExercises}`);
    console.log(`Last updated: ${library.lastUpdated.toLocaleString()}`);
    console.log('\nTop 10 most used exercises:');

    library.exercises.slice(0, 10).forEach((exercise, index) => {
      console.log(`${index + 1}. ${exercise.name}`);
      console.log(`   Usage: ${exercise.usageCount} times`);
      console.log(`   In workouts: ${exercise.workoutIds.length}`);
      console.log(`   Last used: ${exercise.lastUsed.toLocaleDateString()}`);
      if (exercise.commonSets || exercise.commonReps) {
        console.log(
          `   Common format: ${exercise.commonSets}x${exercise.commonReps}${exercise.commonWeight ? ` @${exercise.commonWeight}lbs` : ''}`
        );
      }
      if (exercise.commonDuration) {
        console.log(`   Common duration: ${exercise.commonDuration} minutes`);
      }
      console.log('');
    });
  } catch (error) {
    console.error('Failed to log exercise library:', error);
  }
}

/**
 * Gets exercise suggestions based on a partial name
 */
export async function getExerciseSuggestions(
  partialName: string
): Promise<UniqueExercise[]> {
  if (!partialName || partialName.length < 2) {
    return [];
  }

  try {
    return await storage.searchExerciseLibrary(partialName);
  } catch (error) {
    console.error('Failed to get exercise suggestions:', error);
    return [];
  }
}

/**
 * Gets the most popular exercises (by usage count)
 */
export async function getMostPopularExercises(
  limit: number = 10
): Promise<UniqueExercise[]> {
  try {
    const library = await storage.buildExerciseLibrary();
    return library.exercises.slice(0, limit);
  } catch (error) {
    console.error('Failed to get popular exercises:', error);
    return [];
  }
}

/**
 * Gets recently used exercises (by last used date)
 */
export async function getRecentlyUsedExercises(
  limit: number = 10
): Promise<UniqueExercise[]> {
  try {
    const library = await storage.buildExerciseLibrary();
    return library.exercises
      .sort((a, b) => b.lastUsed.getTime() - a.lastUsed.getTime())
      .slice(0, limit);
  } catch (error) {
    console.error('Failed to get recent exercises:', error);
    return [];
  }
}

/**
 * Checks if an exercise name already exists in the library
 */
export async function exerciseExists(name: string): Promise<boolean> {
  try {
    const stats = await storage.getExerciseUsageStats(name);
    return stats !== null;
  } catch (error) {
    console.error('Failed to check if exercise exists:', error);
    return false;
  }
}
