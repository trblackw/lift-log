import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Workout, Tag } from "@/lib/types";

interface WorkoutListProps {
  workouts: Workout[];
  onStartWorkout?: (workoutId: string) => void;
}

export function WorkoutList({ workouts, onStartWorkout }: WorkoutListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>('');

  // Get all unique tags from workouts
  const allTags = useMemo(() => {
    const tagMap = new Map<string, Tag>();
    workouts.forEach(workout => {
      workout.tags.forEach(tag => {
        tagMap.set(tag.id, tag);
      });
    });
    return Array.from(tagMap.values());
  }, [workouts]);

  // Filter workouts based on search term and selected tag
  const filteredWorkouts = useMemo(() => {
    return workouts.filter(workout => {
      const matchesSearch = workout.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (workout.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      
      const matchesTag = !selectedTagFilter || 
                        workout.tags.some(tag => tag.id === selectedTagFilter);

      return matchesSearch && matchesTag;
    });
  }, [workouts, searchTerm, selectedTagFilter]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  if (workouts.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <h2 className="text-2xl font-semibold mb-2">No Workouts Yet</h2>
            <p className="text-muted-foreground mb-4">
              Create your first workout to get started!
            </p>
            <p className="text-sm text-muted-foreground">
              Click the "Create" tab above to build your first workout routine.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Workouts ({filteredWorkouts.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Workouts</Label>
              <Input
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or description..."
                className="mt-1"
              />
            </div>
            
            <div className="sm:w-48">
              <Label htmlFor="tagFilter">Filter by Tag</Label>
              <select
                id="tagFilter"
                value={selectedTagFilter}
                onChange={(e) => setSelectedTagFilter(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
              >
                <option value="">All Tags</option>
                {allTags.map((tag) => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          {(searchTerm || selectedTagFilter) && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Filters active:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedTagFilter('');
                }}
              >
                Clear All
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Workout List */}
      {filteredWorkouts.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-4">
              <p className="text-muted-foreground">
                No workouts match your current filters.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredWorkouts.map((workout) => (
            <Card key={workout.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-semibold">{workout.name}</h3>
                    {workout.description && (
                      <p className="text-muted-foreground mt-1">{workout.description}</p>
                    )}
                  </div>
                  {onStartWorkout && (
                    <Button
                      onClick={() => onStartWorkout(workout.id)}
                      size="sm"
                    >
                      Start Workout
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Exercises:</span>
                    <span className="ml-2 font-medium">{workout.exercises.length}</span>
                  </div>
                  {workout.estimatedDuration && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="ml-2 font-medium">{workout.estimatedDuration} min</span>
                    </div>
                  )}
                  <div className="text-sm">
                    <span className="text-muted-foreground">Created:</span>
                    <span className="ml-2 font-medium">{formatDate(workout.createdAt)}</span>
                  </div>
                </div>

                {/* Exercise Preview */}
                <div className="mb-3">
                  <p className="text-sm text-muted-foreground mb-2">Exercises:</p>
                  <div className="text-sm space-y-1">
                    {workout.exercises.slice(0, 3).map((exercise) => (
                      <div key={exercise.id} className="flex justify-between">
                        <span>{exercise.name}</span>
                        <span className="text-muted-foreground">
                          {exercise.sets} × {exercise.reps}
                          {exercise.weight && ` @ ${exercise.weight}lbs`}
                        </span>
                      </div>
                    ))}
                    {workout.exercises.length > 3 && (
                      <p className="text-muted-foreground italic">
                        +{workout.exercises.length - 3} more exercises
                      </p>
                    )}
                  </div>
                </div>

                {/* Tags */}
                {workout.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {workout.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="px-2 py-1 rounded-full text-xs text-white cursor-pointer hover:opacity-80"
                        style={{ backgroundColor: tag.color }}
                        onClick={() => setSelectedTagFilter(tag.id)}
                        title={`Filter by ${tag.name}`}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 