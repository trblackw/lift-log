# Lift Log

Personal app for tracking & managing workouts

## 🚀 Live Demo

**[View Live App](https://lift-log-production.up.railway.app/)**

## Features

- ✅ Create and manage workout routines
- ✅ Track exercises with sets, reps, and weights
- ✅ Tag workouts for better organization
- ✅ Live workout tracking with pause/resume
- ✅ Progress tracking and history
- ✅ Dark/light theme support
- ✅ Mobile-responsive design
- ✅ Offline storage with IndexedDB

## Tech Stack

- **Frontend**: React + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Build Tool**: Bun
- **Storage**: IndexedDB for offline functionality
- **Deployment**: Railway

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) (latest version)

### Installation

```bash
# Clone the repository
git clone https://github.com/trblackw/lift-log.git
cd lift-log

# Install dependencies
bun install
```

### Development

```bash
# Start development server
bun dev
```

### Production

```bash
# Build for production
bun run build

# Preview production build
bun start
```

## Seeding Data

To help you explore the app's features, Lift Log includes sample data generation tools.

### Option 1: Seed Script (Recommended)

Generate sample workouts and workout sessions with realistic data:

```bash
# Generate 10 workouts with corresponding workout sessions
bun run seed

# Generate custom amount (e.g., 25 workouts)
bun run seed 25
```

This creates:

- ✅ **Workouts**: Complete routines with exercises, sets, reps, and weights
- ✅ **Tags**: Categorized by workout type (Strength, Cardio, Flexibility, etc.)
- ✅ **Workout Sessions**: Historical completion data for charts and analytics
- ✅ **Realistic Timeline**: Sessions distributed over the past 60 days

### Option 2: Browser Console

For more control, use the debug utilities in your browser's developer console:

```javascript
// Import sample workouts only
await importWorkouts();

// Import both workouts and workout sessions
await importCompleteData();

// Clear all data (if needed)
await clearAllData();
```

**To access debug utilities:**

1. Open browser developer tools (F12)
2. Go to the Console tab
3. Run any of the above commands

### What Gets Generated

The seed data includes:

- **🏋️ Strength Training**: Compound movements, isolation exercises
- **🏃 Cardio**: Running, cycling, circuit training
- **🧘 Flexibility**: Yoga, stretching routines
- **⚡ HIIT**: High-intensity interval workouts
- **🎯 Functional**: CrossFit-style and functional movements

All data is stored locally in your browser's IndexedDB and persists between sessions.

## Usage

1. **Create Workouts**: Add exercises with sets, reps, and weights
2. **Tag Organization**: Use colored tags to categorize workouts
3. **Start Training**: Begin a workout session with live tracking
4. **Track Progress**: Mark exercises as complete during workouts
5. **Review History**: View past workout sessions and progress

## License

MIT License - see [LICENSE](LICENSE) file for details.
