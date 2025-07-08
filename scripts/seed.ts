#!/usr/bin/env bun

/**
 * Standalone script to generate Lift Log workout data as JSON
 *
 * Usage:
 *   bun run scripts/seed.ts           # Generate 20 random workouts to JSON
 *   bun run scripts/seed.ts --count 50 # Generate 50 workouts
 *   bun run scripts/seed.ts --output ./my-workouts.json # Custom output file
 */

import { writeFileSync } from 'fs';
import { join } from 'path';
import { generateCompleteWorkoutData } from '../src/lib/seedData';

async function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  let count = 20;
  let outputPath = join(process.cwd(), 'seed-workouts.json');

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--count' && args[i + 1]) {
      count = parseInt(args[i + 1], 10);
      if (isNaN(count) || count <= 0) {
        console.error('❌ Invalid count value. Must be a positive number.');
        process.exit(1);
      }
    }
    if (args[i] === '--output' && args[i + 1]) {
      outputPath = args[i + 1];
    }
  }

  console.log('🏋️ Lift Log Workout Data Generator\n');

  try {
    console.log(`🌱 Generating ${count} random workouts with sessions...`);
    const { workouts, sessions } = generateCompleteWorkoutData(count);

    // Convert dates to strings for JSON serialization
    const serializedWorkouts = workouts.map(workout => ({
      ...workout,
      createdAt: workout.createdAt.toISOString(),
      updatedAt: workout.updatedAt.toISOString(),
      lastCompleted: workout.lastCompleted?.toISOString(),
      scheduledDate: workout.scheduledDate?.toISOString(),
    }));

    const serializedSessions = sessions.map(session => ({
      ...session,
      startedAt: session.startedAt.toISOString(),
      completedAt: session.completedAt?.toISOString(),
      exercises: session.exercises.map(ex => ({
        ...ex,
        startedAt: ex.startedAt?.toISOString(),
        completedAt: ex.completedAt?.toISOString(),
      })),
    }));

    const data = {
      workouts: serializedWorkouts,
      sessions: serializedSessions,
    };

    console.log('💾 Writing workout and session data to file...');
    writeFileSync(outputPath, JSON.stringify(data, null, 2));

    console.log(
      `✅ Successfully generated ${workouts.length} workouts and ${sessions.length} sessions!`
    );
    console.log(`📁 File saved to: ${outputPath}`);
    console.log('📊 Summary:');
    console.log(`   • Total workouts: ${workouts.length}`);
    console.log(`   • Total sessions: ${sessions.length}`);
    console.log(
      `   • Completed workouts: ${workouts.filter(w => w.lastCompleted).length}`
    );
    console.log(
      `   • Average exercises per workout: ${Math.round(workouts.reduce((sum, w) => sum + w.exercises.length, 0) / workouts.length)}`
    );
    console.log(
      `   • Average session duration: ${Math.round(sessions.reduce((sum, s) => sum + (s.actualDuration || 0), 0) / sessions.length / 60)} minutes`
    );
    console.log(
      `   • Unique tags created: ${new Set(workouts.flatMap(w => w.tags.map(t => t.name))).size}`
    );

    console.log('\n🌐 To import this data into your browser:');
    console.log('1. Open your Lift Log app in the browser');
    console.log('2. Open the browser console (F12 → Console)');
    console.log('3. Copy the data from the generated file');
    console.log(
      '4. Run: debug.importCompleteData(data) // imports both workouts and sessions'
    );
    console.log('5. Refresh the page to see your workouts and history charts!');
  } catch (error) {
    console.error('\n❌ Generation failed:', error);
    process.exit(1);
  }
}

// Run the script
main().catch(console.error);
