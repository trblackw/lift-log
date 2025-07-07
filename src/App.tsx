import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectItem } from "@/components/ui/select";
import { Navigation } from "./components/Navigation";
import { WorkoutForm } from "./components/WorkoutForm";
import { WorkoutList } from "./components/WorkoutList";
import { WorkoutDetails } from "./components/WorkoutDetails";
import { ActiveWorkout } from "./components/ActiveWorkout";
import { Settings } from "./components/Settings";
import { ThemeProvider } from "./lib/theme";
import { storage } from "./lib/storage";
import type { ViewMode, Workout, WorkoutSession } from "./lib/types";

function AppContent() {
  const [currentView, setCurrentView] = useState<ViewMode>('list');
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [activeWorkoutId, setActiveWorkoutId] = useState<string | null>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [workoutSessions, setWorkoutSessions] = useState<WorkoutSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize storage and load data
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Initialize IndexedDB
        await storage.init();
        
        // Load existing data
        const [loadedWorkouts, loadedSessions] = await Promise.all([
          storage.loadWorkouts(),
          storage.loadSessions()
        ]);
        
        setWorkouts(loadedWorkouts);
        setWorkoutSessions(loadedSessions);
      } catch (err) {
        console.error('Failed to initialize app:', err);
        setError('Failed to load data. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  const handleSaveWorkout = async (workoutData: Omit<Workout, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (selectedWorkout) {
        // Updating existing workout
        const updatedWorkout: Workout = {
          ...workoutData,
          id: selectedWorkout.id,
          createdAt: selectedWorkout.createdAt,
          updatedAt: new Date(),
        };

        // Save to IndexedDB and update local state
        await storage.saveWorkout(updatedWorkout);
        setWorkouts(prev => prev.map(w => w.id === updatedWorkout.id ? updatedWorkout : w));
        setSelectedWorkout(null);
        setCurrentView('list');
      } else {
        // Creating new workout
        const newWorkout: Workout = {
          ...workoutData,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Save to IndexedDB and update local state
        await storage.saveWorkout(newWorkout);
        setWorkouts(prev => [newWorkout, ...prev]);
        setCurrentView('list');
      }
    } catch (err) {
      console.error('Failed to save workout:', err);
      setError('Failed to save workout. Please try again.');
    }
  };

  const handleViewWorkout = (workout: Workout) => {
    setSelectedWorkout(workout);
    setCurrentView('details');
  };

  const handleEditWorkout = (workout: Workout) => {
    setSelectedWorkout(workout);
    setCurrentView('create');
  };

  const handleStartWorkout = (workoutId: string) => {
    setActiveWorkoutId(workoutId);
    setCurrentView('active');
  };

  const handleCompleteWorkout = async (session: WorkoutSession) => {
    try {
      // Save session to IndexedDB and update local state
      await storage.saveSession(session);
      setWorkoutSessions(prev => [session, ...prev]);
      setActiveWorkoutId(null);
      setCurrentView('list');
    } catch (err) {
      console.error('Failed to save workout session:', err);
      setError('Failed to save workout session. Please try again.');
    }
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    try {
      // Delete from IndexedDB and update local state
      await storage.deleteWorkout(workoutId);
      setWorkouts(prev => prev.filter(w => w.id !== workoutId));
      
      // If the deleted workout was active, cancel it
      if (activeWorkoutId === workoutId) {
        setActiveWorkoutId(null);
        setCurrentView('list');
      }
      
      // If the deleted workout was being viewed, go back to list
      if (selectedWorkout?.id === workoutId) {
        setSelectedWorkout(null);
        setCurrentView('list');
      }
    } catch (err) {
      console.error('Failed to delete workout:', err);
      setError('Failed to delete workout. Please try again.');
    }
  };

  const handleCancelWorkout = () => {
    setActiveWorkoutId(null);
    setCurrentView('list');
  };

  const handleBackToList = () => {
    setSelectedWorkout(null);
    setCurrentView('list');
  };

  const handleViewChange = (view: ViewMode) => {
    if (view === 'create') {
      setSelectedWorkout(null); // Clear any selected workout for fresh create form
    }
    setCurrentView(view);
  };

  const activeWorkout = activeWorkoutId ? workouts.find(w => w.id === activeWorkoutId) : null;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-4xl mb-4">💪</div>
              <p className="text-muted-foreground">Loading Lift Log...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <div className="text-4xl mb-4">⚠️</div>
                <h2 className="text-lg font-semibold mb-2">Error</h2>
                <p className="text-muted-foreground text-sm mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
                >
                  Reload App
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'list':
        return (
          <WorkoutList 
            workouts={workouts} 
            onStartWorkout={handleStartWorkout}
            onDeleteWorkout={handleDeleteWorkout}
            onViewWorkout={handleViewWorkout}
          />
        );
      case 'create':
        return <WorkoutForm onSave={handleSaveWorkout} editWorkout={selectedWorkout} />;
      case 'details':
        return selectedWorkout ? (
          <WorkoutDetails
            workout={selectedWorkout}
            onEdit={handleEditWorkout}
            onStart={handleStartWorkout}
            onBack={handleBackToList}
          />
        ) : null;
      case 'active':
        if (activeWorkout) {
          return (
            <ActiveWorkout
              workout={activeWorkout}
              onComplete={handleCompleteWorkout}
              onCancel={handleCancelWorkout}
            />
          );
        } else {
          return (
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Start a Workout</h2>
                  <p className="text-muted-foreground mb-4">
                    Choose a workout to get started:
                  </p>
                  
                  {workouts.length > 0 ? (
                    <Select 
                      placeholder="Search and select a workout..."
                      onValueChange={handleStartWorkout}
                    >
                      {workouts.map((workout) => (
                        <SelectItem key={workout.id} value={workout.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{workout.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {workout.exercises.length} exercise{workout.exercises.length !== 1 ? 's' : ''}
                              {workout.estimatedDuration && ` • ${workout.estimatedDuration} min`}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </Select>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      No workouts available. Create a workout first!
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          );
        }
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-200" style={{ width: "100vw" }}>
      <div className="max-w-2xl mx-auto px-4 py-4 lg:py-8 pb-20">
        <header className="mb-6 lg:mb-8">
          <div className="relative">
            <div className="text-center">
              <h1 className="text-3xl lg:text-4xl font-bold mb-2">Lift Log</h1>
              <p className="text-sm lg:text-base text-muted-foreground">Track your workouts and progress</p>
            </div>
            <div className="absolute top-0 right-0">
              <Settings />
            </div>
          </div>
        </header>

        {currentView !== 'details' && (
          <Navigation currentView={currentView} onViewChange={handleViewChange} />
        )}

        <div className="mt-6 lg:mt-8">
          {renderView()}
        </div>
      </div>
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
