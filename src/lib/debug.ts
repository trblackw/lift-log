import {
  seedDebugData,
  clearAllData,
  logDatabaseStats,
  importWorkoutData,
  importCompleteData,
} from './seedData';
import { logExerciseLibrary } from './exerciseLibraryUtils';
import type { Workout } from './types';

/**
 * Debug utilities for development and testing
 * These functions are exposed globally when in development mode
 */
export const debugUtils = {
  /**
   * Seeds the database with 20 random workouts
   */
  seedData: seedDebugData,

  /**
   * Clears all workout data (use with caution!)
   */
  clearData: clearAllData,

  /**
   * Shows database statistics
   */
  showStats: logDatabaseStats,

  /**
   * Shows the exercise library contents
   */
  showExerciseLibrary: logExerciseLibrary,

  /**
   * Quick setup: clears existing data and seeds new data
   */
  async resetWithSeedData(): Promise<void> {
    console.log('🔄 Resetting database with fresh seed data...');
    await clearAllData();
    await seedDebugData();
    await logDatabaseStats();
    console.log(
      '🎉 Database reset complete! Refresh the page to see the new data.'
    );
  },

  /**
   * Imports workout data from JSON (from the seed script)
   */
  async importFromJSON(jsonData: any[]): Promise<void> {
    console.log('📥 Importing workout data from JSON...');

    try {
      // Convert the JSON data back to proper Workout objects
      const workouts: Workout[] = jsonData.map(item => ({
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
        lastCompleted: item.lastCompleted
          ? new Date(item.lastCompleted)
          : undefined,
      }));

      await importWorkoutData(workouts);
      console.log(
        '🎉 Import complete! Refresh the page to see your new workouts.'
      );
    } catch (error) {
      console.error('❌ Failed to import JSON data:', error);
      console.log(
        '💡 Make sure you copied the full JSON array from the seed file.'
      );
    }
  },

  /**
   * Imports complete data (workouts + sessions) from JSON (from the seed script)
   */
  async importCompleteData(data: {
    workouts: any[];
    sessions: any[];
  }): Promise<void> {
    console.log('📥 Importing complete workout and session data...');

    try {
      await importCompleteData(data);
      console.log(
        '🎉 Import complete! Refresh the page to see your workouts and history data.'
      );
    } catch (error) {
      console.error('❌ Failed to import complete data:', error);
      console.log(
        '💡 Make sure you copied the full data object from the seed file.'
      );
    }
  },

  /**
   * Shows help for debug functions
   */
  help(): void {
    console.log('🛠️ Lift Log Debug Utilities');
    console.log('Available commands:');
    console.log('');
    console.log('📊 Data Management:');
    console.log(
      '  debug.seedData()               - Add 20 random workouts + sessions'
    );
    console.log(
      '  debug.clearData()              - Clear all data (⚠️ destructive)'
    );
    console.log('  debug.resetWithSeedData()      - Clear + seed fresh data');
    console.log(
      '  debug.importFromJSON(data)     - Import workout data from JSON'
    );
    console.log(
      '  debug.importCompleteData(data) - Import workouts + sessions from JSON'
    );
    console.log('');
    console.log('📈 Inspection:');
    console.log('  debug.showStats()          - Show database statistics');
    console.log('  debug.showExerciseLibrary() - Show exercise library');
    console.log('');
    console.log('ℹ️ Tips:');
    console.log('  • Run debug.help() to see this help again');
    console.log(
      '  • Use debug.resetWithSeedData() for a quick setup with history data'
    );
    console.log('  • Use debug.importCompleteData() for full seed script data');
    console.log('  • Refresh the page after seeding to see changes');
  },
};

/**
 * Exposes debug utilities globally in development
 */
export function initializeDebugUtils(): void {
  if (typeof window !== 'undefined') {
    // @ts-ignore - Intentionally adding to global scope for debugging
    window.debug = debugUtils;

    console.log(
      '🛠️ Debug utilities loaded! Type "debug.help()" for available commands.'
    );
  }
}
