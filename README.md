# 🏋️ Lift Log

A modern, comprehensive workout tracking and management application built with React, TypeScript, and Bun. Lift Log provides a complete solution for fitness enthusiasts to create, organize, and track their workout routines with an intuitive drag-and-drop interface and powerful exercise library system.

## 🚀 Live Demo

**[View Live App](https://lift-log-production.up.railway.app/)**

## ✨ Features

### 🏗️ Workout Management

- **Workout Composer**: Visual drag-and-drop workout builder with exercise library integration
- **Smart Exercise Library**: Automatically populated from your workout history with usage statistics
- **Flexible Exercise Types**: Support for strength training (sets/reps/weight) and cardio (duration-based)
- **Workout Templates**: Create reusable workout routines with customizable parameters
- **Advanced Tagging**: Color-coded tags for workout categorization and filtering

### 📱 Live Workout Tracking

- **Real-time Session Tracking**: Start, pause, and resume workout sessions
- **Exercise Timer**: Individual exercise timing with automatic progression
- **Progress Indicators**: Visual progress bars and completion tracking
- **Session Analytics**: Duration tracking, exercise completion rates, and performance metrics

### 📊 Analytics & History

- **Comprehensive History**: View all past workout sessions with detailed statistics
- **Progress Tracking**: Track improvements over time with session comparisons
- **Calendar Integration**: Visual calendar view of workout schedule and completed sessions
- **Performance Metrics**: Average duration, completion rates, and workout frequency analysis

### 🎨 User Experience

- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Dark/Light Themes**: Automatic theme switching with custom color palette
- **Intuitive Navigation**: Sidebar navigation with contextual active workout banners
- **Offline-First**: Full functionality without internet connection using IndexedDB
- **Drag & Drop**: Reorderable exercises with smooth animations and touch support

### 🔧 Technical Features

- **Type Safety**: Full TypeScript implementation with Zod runtime validation
- **State Management**: Zustand for predictable state management
- **Data Persistence**: IndexedDB with automatic data migration and backup
- **Performance Optimized**: Code splitting, lazy loading, and efficient re-renders
- **Accessibility**: WCAG-compliant with keyboard navigation and screen reader support

## 🛠️ Technology Stack

### Frontend Framework

- **[React 18](https://reactjs.org/)** - Component-based UI framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[React Router](https://reactrouter.com/)** - Client-side routing

### Build Tools & Runtime

- **[Bun](https://bun.sh/)** - Ultra-fast JavaScript runtime and package manager
- **[Vite](https://vitejs.dev/)** - Lightning-fast build tool and dev server

### Styling & UI

- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - High-quality React components
- **[Radix UI](https://www.radix-ui.com/)** - Accessible component primitives
- **[Lucide React](https://lucide.dev/)** - Customizable icon library
- **[class-variance-authority](https://cva.style/)** - Component variant management

### State Management & Data

- **[Zustand](https://zustand-demo.pmnd.rs/)** - Lightweight state management
- **[Zod](https://zod.dev/)** - TypeScript-first schema validation
- **[IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)** - Client-side database for offline storage
- **[date-fns](https://date-fns.org/)** - Date manipulation and formatting

### UI Interactions

- **[@dnd-kit](https://dndkit.com/)** - Drag and drop functionality
- **[Sonner](https://sonner.emilkowal.ski/)** - Toast notifications
- **[React Hook Form](https://react-hook-form.com/)** - Form state management

### Development Tools

- **[ESLint](https://eslint.org/)** - Code linting and quality
- **[Prettier](https://prettier.io/)** - Code formatting
- **[TypeScript Compiler](https://www.typescriptlang.org/)** - Type checking

### Deployment & Hosting

- **[Railway](https://railway.app/)** - Cloud deployment platform
- **Static Hosting** - Optimized for CDN delivery

## 📁 Project Structure

```
lift-log/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── ui/              # Base UI components (buttons, inputs, etc.)
│   │   ├── icons/           # Custom SVG icon components
│   │   ├── ActiveWorkout.tsx # Live workout tracking interface
│   │   ├── Composer.tsx     # Drag-and-drop workout builder
│   │   ├── ExerciseLibrary.tsx # Exercise library with search
│   │   ├── WorkoutList.tsx  # Workout management interface
│   │   └── ...
│   ├── pages/               # Route-level page components
│   │   ├── ActiveWorkoutPage.tsx
│   │   ├── ComposerPage.tsx
│   │   ├── WorkoutListPage.tsx
│   │   └── ...
│   ├── hooks/               # Custom React hooks
│   │   ├── useExerciseLibrary.ts
│   │   ├── useInitializeApp.ts
│   │   └── ...
│   ├── lib/                 # Core utilities and configurations
│   │   ├── database.ts      # IndexedDB wrapper and operations
│   │   ├── storage.ts       # Data persistence layer
│   │   ├── schemas.ts       # Zod validation schemas
│   │   ├── types.ts         # TypeScript type definitions
│   │   ├── colors.ts        # Custom color palette system
│   │   ├── routes.ts        # Route definitions and utilities
│   │   └── utils.ts         # Helper functions
│   ├── stores/              # Zustand state stores
│   │   ├── workoutsStore.ts # Workout management state
│   │   ├── sessionsStore.ts # Session tracking state
│   │   └── uiStore.ts       # UI state and preferences
│   ├── styles/              # Global styles and CSS
│   └── router.tsx           # Application routing configuration
├── public/                  # Static assets
├── scripts/                 # Build and development scripts
├── build.ts                 # Bun build configuration
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── components.json         # shadcn/ui configuration
```

## 🎯 Application Architecture

### State Management

The application uses **Zustand** for state management with three main stores:

- **workoutsStore**: Manages workout CRUD operations, exercise library
- **sessionsStore**: Handles active workout sessions and workout history
- **uiStore**: Controls UI state, theme preferences, and global app state

### Data Layer

- **IndexedDB**: Primary storage for offline-first functionality
- **Zod Schemas**: Runtime validation ensuring data integrity
- **Migration System**: Automatic data structure upgrades
- **Backup/Restore**: Data export and import capabilities

### Component Architecture

- **Atomic Design**: Reusable UI components with consistent styling
- **Compound Components**: Complex components like `ComposableExerciseList`
- **Custom Hooks**: Logic separation and reusability
- **Type Safety**: Full TypeScript coverage with strict mode

### Routing & Navigation

- **File-based Routing**: Clear route structure with type-safe navigation
- **Dynamic Routes**: Parameterized routes for workouts and sessions
- **Navigation Guards**: Route protection and redirects
- **Deep Linking**: Direct access to specific workouts and sessions

## 🚀 Getting Started

### Prerequisites

- **[Bun](https://bun.sh)** (v1.0.0 or later)
- **Node.js** (v18+ for compatibility)
- **Modern Browser** (Chrome 90+, Firefox 88+, Safari 14+)

### Installation

```bash
# Clone the repository
git clone https://github.com/trblackw/lift-log.git
cd lift-log

# Install dependencies with Bun
bun install

# Verify installation
bun --version
```

### Development

```bash
# Start development server with hot reload
bun dev

# The app will be available at http://localhost:5173
```

### Building for Production

```bash
# Build optimized production bundle
bun run build

# Preview production build locally
bun start

# Type checking
bun run type-check

# Linting
bun run lint
```

## 📊 Seeding Data

Lift Log includes comprehensive data seeding tools to help you explore all features with realistic workout data.

### Quick Start with Sample Data

```bash
# Generate 20 realistic workouts with session history
bun run seed

# Generate custom amount (e.g., 50 workouts)
bun run seed 50
```

### Browser Console Commands

For advanced users, access debug utilities in browser DevTools:

```javascript
// Generate sample workouts
await debugUtils.seedData();

// View database statistics
await debugUtils.showStats();

// View exercise library
await debugUtils.showExerciseLibrary();

// Reset with fresh data
await debugUtils.resetWithSeedData();

// Clear all data
await debugUtils.clearData();
```

### What Gets Generated

The seeding system creates realistic data including:

- **💪 Strength Workouts**: Compound movements, isolation exercises, progressive overload
- **🏃 Cardio Sessions**: Running, cycling, HIIT, circuit training
- **🧘 Flexibility**: Yoga flows, stretching routines, mobility work
- **⚡ High-Intensity**: CrossFit, bootcamp, functional fitness
- **🎯 Sport-Specific**: Training for specific sports and activities

**Data Features:**

- Realistic exercise parameters (sets, reps, weights, durations)
- Historical workout sessions spanning 60+ days
- Progressive difficulty and weight increases
- Varied workout frequencies and patterns
- Complete tag categorization system

## 🎮 Usage Guide

### Creating Workouts

#### Traditional Workout Builder

1. Navigate to **"Create"** in the sidebar
2. Add workout name and optional description
3. Build exercises one by one with sets, reps, and weights
4. Add color-coded tags for organization
5. Save your workout template

#### Composer View (Advanced)

1. Go to **"Composer"** for the visual builder
2. Enter workout details in the header
3. **Search and browse** your exercise library
4. **Drag exercises** into your workout
5. **Reorder by dragging** to perfect your routine
6. Save your professionally crafted workout

### Live Workout Tracking

1. **Start a Session**: Click "Start" on any workout
2. **Track Progress**: Tap exercises to mark as complete
3. **Monitor Time**: View elapsed time and estimated duration
4. **Pause/Resume**: Take breaks without losing progress
5. **Complete**: Finish and view your session summary

### Workout Management

- **Filter & Search**: Find workouts by name, exercise, or tags
- **Sort Options**: Order by creation date, alphabetical, or last completed
- **Bulk Actions**: Delete multiple workouts or export data
- **History View**: Analyze past performance and trends

### Exercise Library

The exercise library automatically grows as you create workouts:

- **Usage Statistics**: See most frequently used exercises
- **Smart Defaults**: Auto-populate common sets, reps, and weights
- **Search & Filter**: Find exercises quickly
- **Add to Workouts**: One-click integration into new routines

## 🎨 Theming & Customization

Lift Log features a sophisticated theming system with:

- **Custom Color Palette**: Navy, Teal, Mint, and Cream color scheme
- **Dark/Light Modes**: Automatic switching based on system preferences
- **Consistent Styling**: Unified design language across all components
- **Accessible Colors**: WCAG AA compliant color contrast ratios

### Color System

- **Primary**: Navy (#205781) - Main actions and branding
- **Secondary**: Teal (#4F959D) - Secondary actions and accents
- **Accent**: Mint (#98D2C0) - Highlights and success states
- **Background**: Cream (#F6F8D5) - Light mode backgrounds
- **Semantic Colors**: Context-aware colors for status and feedback

## 🧪 Development Workflow

### Available Scripts

```bash
# Development
bun dev              # Start dev server
bun build            # Production build
bun start            # Preview production build
bun type-check       # TypeScript checking

# Data Management
bun run seed         # Generate sample data
bun run seed 25      # Generate 25 workouts

# Code Quality
bun run lint         # ESLint checking
bun run format       # Prettier formatting

# Database
bun run db:migrate   # Run database migrations
bun run db:reset     # Reset database schema
```

### Code Quality Standards

- **TypeScript Strict Mode**: Full type safety
- **ESLint Configuration**: Comprehensive linting rules
- **Prettier Integration**: Automatic code formatting
- **Zod Validation**: Runtime type checking
- **Component Testing**: Unit tests for critical components

### Performance Optimizations

- **Code Splitting**: Route-based chunk splitting
- **Lazy Loading**: Components loaded on demand
- **Bundle Analysis**: Webpack bundle analyzer integration
- **Image Optimization**: Optimized assets and lazy loading
- **Caching Strategies**: Service worker and IndexedDB caching

## 📱 Browser Support

- **Chrome**: 90+ (recommended)
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+

### Required Browser Features

- IndexedDB support
- ES2020+ features
- CSS Grid and Flexbox
- Web APIs (localStorage, fetch)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Install dependencies: `bun install`
4. Start development: `bun dev`
5. Make your changes
6. Run tests: `bun test`
7. Submit a pull request

### Code Style

- Follow TypeScript best practices
- Use Prettier for formatting
- Follow conventional commit messages
- Add tests for new features
- Update documentation as needed

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **shadcn/ui** for the excellent component library
- **Radix UI** for accessible component primitives
- **Tailwind CSS** for the utility-first CSS framework
- **Bun** for the incredibly fast development experience
- **The React Community** for continuous innovation and support

---

**Built with ❤️ using React, TypeScript, and Bun**
