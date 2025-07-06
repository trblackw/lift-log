import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Navigation } from "./components/Navigation";
import { WorkoutForm } from "./components/WorkoutForm";
import { WorkoutList } from "./components/WorkoutList";
import { ActiveWorkout } from "./components/ActiveWorkout";
import { storage } from "./lib/storage";
import type { ViewMode, Workout, WorkoutSession } from "./lib/types";

export function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('list');
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [activeWorkoutId, setActiveWorkoutId] = useState<string | null>(null);
  const [workoutSessions, setWorkoutSessions] = useState<WorkoutSession[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const loadedWorkouts = storage.loadWorkouts();
    const loadedSessions = storage.loadSessions();
    
    setWorkouts(loadedWorkouts);
    setWorkoutSessions(loadedSessions);
  }, []);

  // Save workouts to localStorage whenever workouts change
  useEffect(() => {
    storage.saveWorkouts(workouts);
  }, [workouts]);

  // Save sessions to localStorage whenever sessions change
  useEffect(() => {
    storage.saveSessions(workoutSessions);
  }, [workoutSessions]);

  const handleSaveWorkout = (workoutData: Omit<Workout, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newWorkout: Workout = {
      ...workoutData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setWorkouts(prev => [...prev, newWorkout]);
    setCurrentView('list');
  };

  const handleStartWorkout = (workoutId: string) => {
    setActiveWorkoutId(workoutId);
    setCurrentView('active');
  };

  const handleCompleteWorkout = (session: WorkoutSession) => {
    setWorkoutSessions(prev => [...prev, session]);
    setActiveWorkoutId(null);
    setCurrentView('list');
    // Could show a success message here
  };

  const handleCancelWorkout = () => {
    setActiveWorkoutId(null);
    setCurrentView('list');
  };

  const activeWorkout = activeWorkoutId ? workouts.find(w => w.id === activeWorkoutId) : null;

  const renderView = () => {
    switch (currentView) {
      case 'list':
        return (
          <WorkoutList 
            workouts={workouts} 
            onStartWorkout={handleStartWorkout}
          />
        );
      case 'create':
        return <WorkoutForm onSave={handleSaveWorkout} />;
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
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-4">Active Workout</h2>
                <p className="text-muted-foreground">No active workout. Start a workout from your workout list!</p>
              </CardContent>
            </Card>
          );
        }
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-4 py-6 pb-20">
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-bold mb-2">Lift Log</h1>
          <p className="text-sm text-muted-foreground">Track your workouts and progress</p>
        </header>

        <Navigation currentView={currentView} onViewChange={setCurrentView} />

        <div className="mt-6">
          {renderView()}
        </div>
      </div>
    </div>
  );
}

export default App;
