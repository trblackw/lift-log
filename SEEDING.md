# 🌱 Lift Log Seeding Guide

This guide explains how to populate your Lift Log app with sample workout data for testing and development.

## 🚀 Quick Start

### Option 1: Browser Console (Easiest)

1. Open your Lift Log app in the browser
2. Open browser console (F12 → Console)
3. Run: `debug.resetWithSeedData()`
4. Refresh the page to see 20 new workouts!

### Option 2: JSON Import (More Control)

1. Generate workout data: `bun run seed`
2. Open the generated `seed-workouts.json` file
3. Copy the entire JSON array
4. In browser console, run: `debug.importFromJSON(yourDataHere)`

## 📝 Available Commands

### Terminal Commands

```bash
# Generate 20 workouts (default)
bun run seed

# Generate 50 workouts
bun run seed:large

# Generate custom amount
bun run scripts/seed.ts --count 100

# Custom output file
bun run scripts/seed.ts --output my-workouts.json
```

### Browser Console Commands

```javascript
// Get help
debug.help();

// Quick setup (clears existing + adds 20 workouts)
debug.resetWithSeedData();

// Add 20 workouts to existing data
debug.seedData();

// Clear all data (⚠️ destructive)
debug.clearData();

// Import from JSON file
debug.importFromJSON(jsonData);

// Show statistics
debug.showStats();

// Show exercise library
debug.showExerciseLibrary();
```

## 🎯 What You Get

### Sample Workouts

- **"Push Day Power"** - 5 exercises (Bench Press, Shoulder Press, etc.)
- **"Leg Day Crusher"** - 6 exercises (Back Squat, Lunges, Calf Raises, etc.)
- **"HIIT Circuit"** - Mixed cardio/strength (Burpees, Jump Rope, etc.)
- **"Morning Energizer"** - Quick 4-exercise routine

### Realistic Data

- ✅ **20 varied workouts** with realistic exercise combinations
- ✅ **Random completion dates** (~60% completed in last 30 days)
- ✅ **Colorful tags** (Strength, Cardio, Upper Body, Lower Body, etc.)
- ✅ **Realistic parameters** (sets, reps, weights, durations)
- ✅ **Calculated durations** based on actual exercises

### Exercise Variety

- **Strength exercises**: Bench Press, Squats, Deadlifts, Pull-ups, etc.
- **Cardio exercises**: Treadmill, Elliptical, Rowing, HIIT, etc.
- **Mixed workouts**: Combination of strength and cardio

## 🔧 Troubleshooting

### "debug is not defined"

- Make sure you're in the browser (not terminal)
- Refresh the page to load debug utilities
- Check console for "Debug utilities loaded!" message

### Import not working

- Ensure you copied the complete JSON array (starts with `[` ends with `]`)
- Check browser console for error details
- Try `debug.clearData()` first if you have conflicts

### Terminal script fails

- Make sure you're in the project directory
- Run `bun install` to ensure dependencies are installed
- Check that the script has execution permissions

## 💡 Tips

- Use `debug.resetWithSeedData()` for first-time setup
- Use `debug.seedData()` to add more workouts to existing data
- The seeded data includes exercise library entries for autocomplete testing
- Refresh the page after importing to see UI updates
- Generated JSON files can be shared between team members

---

Happy testing! 🏋️‍♂️
