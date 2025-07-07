import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { storage } from "@/lib/storage";
import type { Workout, Tag } from "@/lib/types";

interface WorkoutListProps {
  workouts: Workout[];
  onStartWorkout?: (workoutId: string) => void;
}

export function WorkoutList({ workouts, onStartWorkout }: WorkoutListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>('');
  const [filteredWorkouts, setFilteredWorkouts] = useState<Workout[]>(workouts);
  const [isSearching, setIsSearching] = useState(false);

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

  // Handle search and filtering with IndexedDB
  useEffect(() => {
    const performSearch = async () => {
      if (!searchTerm && !selectedTagFilter) {
        setFilteredWorkouts(workouts);
        return;
      }

      setIsSearching(true);
      try {
        let results: Workout[];

        if (selectedTagFilter && searchTerm) {
          // Both tag and search term - use client-side filtering
          const tagResults = await storage.getWorkoutsByTag(selectedTagFilter);
          results = tagResults.filter(workout => 
            workout.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (workout.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
            workout.exercises.some(exercise => 
              exercise.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
          );
        } else if (selectedTagFilter) {
          // Tag filter only
          results = await storage.getWorkoutsByTag(selectedTagFilter);
        } else if (searchTerm) {
          // Search term only
          results = await storage.searchWorkouts(searchTerm);
        } else {
          results = workouts;
        }

        setFilteredWorkouts(results);
      } catch (error) {
        console.error('Search failed:', error);
        // Fallback to client-side filtering
        const filtered = workouts.filter(workout => {
          const matchesSearch = !searchTerm || 
            workout.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (workout.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
          
          const matchesTag = !selectedTagFilter || 
            workout.tags.some(tag => tag.id === selectedTagFilter);

          return matchesSearch && matchesTag;
        });
        setFilteredWorkouts(filtered);
      } finally {
        setIsSearching(false);
      }
    };

    // Debounce search to avoid too many IndexedDB queries
    const timeoutId = setTimeout(performSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [workouts, searchTerm, selectedTagFilter]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTagFilter('');
  };

  if (workouts.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 lg:py-12">
            <div className="text-6xl lg:text-8xl mb-4">💪</div>
            <h2 className="text-xl lg:text-2xl font-semibold mb-2">No Workouts Yet</h2>
            <p className="text-muted-foreground mb-4 text-sm lg:text-base">
              Create your first workout to get started!
            </p>
            <p className="text-xs lg:text-sm text-muted-foreground">
              Tap "Create" below to build your first workout routine.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      {/* Search and Filter Controls */}
      <Card>
        <CardContent className="pt-3 lg:pt-6 px-3 lg:px-6 space-y-3 lg:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <div>
              <Label htmlFor="search" className="text-sm lg:text-base">Search Workouts</Label>
              <Input
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, description, or exercise..."
                className="mt-1 h-12 lg:h-14 lg:text-base"
              />
            </div>
            
            {allTags.length > 0 && (
              <div>
                <Label htmlFor="tagFilter" className="text-sm lg:text-base">Filter by Tag</Label>
                <select
                  id="tagFilter"
                  value={selectedTagFilter}
                  onChange={(e) => setSelectedTagFilter(e.target.value)}
                  className="mt-1 w-full h-12 lg:h-14 px-3 border border-input rounded-md bg-background text-sm lg:text-base"
                >
                  <option value="">All Tags</option>
                  {allTags.map((tag) => (
                    <option key={tag.id} value={tag.id}>
                      {tag.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {(searchTerm || selectedTagFilter) && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="w-full lg:w-auto h-10 lg:h-11 lg:px-6"
            >
              Clear Filters
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Results Header */}
      <div className="flex items-center justify-between px-1">
        <span className="text-sm lg:text-base text-muted-foreground">
          {isSearching ? 'Searching...' : `${filteredWorkouts.length} workout${filteredWorkouts.length !== 1 ? 's' : ''}`}
        </span>
      </div>

      {/* Workout List */}
      {filteredWorkouts.length === 0 && !isSearching ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-6 lg:py-8">
              <div className="text-4xl lg:text-6xl mb-2">🔍</div>
              <p className="text-muted-foreground text-sm lg:text-base">
                No workouts match your filters.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="mt-3 lg:mt-4"
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-4">
          {filteredWorkouts.map((workout) => (
            <Card key={workout.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-3 lg:pt-6 px-3 lg:px-6">
                <div className="space-y-3 lg:space-y-4">
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg lg:text-xl leading-tight truncate">{workout.name}</h3>
                      {workout.description && (
                        <p className="text-muted-foreground text-sm lg:text-base mt-1 line-clamp-2">{workout.description}</p>
                      )}
                    </div>
                    {onStartWorkout && (
                      <Button
                        onClick={() => onStartWorkout(workout.id)}
                        size="sm"
                        className="ml-3 h-9 lg:h-10 px-3 lg:px-4 text-xs lg:text-sm shrink-0 cursor-pointer"
                      >
                        Start
                      </Button>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex justify-between text-sm lg:text-base">
                    <span className="text-muted-foreground">
                      {workout.exercises.length} exercise{workout.exercises.length !== 1 ? 's' : ''}
                    </span>
                    <span className="text-muted-foreground">
                      {workout.estimatedDuration ? `${workout.estimatedDuration} min` : formatDate(workout.createdAt)}
                    </span>
                  </div>

                  {/* Exercise Preview */}
                  <div className="text-sm lg:text-base space-y-1">
                    {workout.exercises.slice(0, 2).map((exercise) => (
                      <div key={exercise.id} className="flex justify-between text-xs lg:text-sm">
                        <span className="truncate">{exercise.name}</span>
                        <span className="text-muted-foreground ml-2 shrink-0">
                          {exercise.duration 
                            ? `${exercise.duration}min` 
                            : `${exercise.sets}×${exercise.reps}`
                          }
                          {exercise.weight && ` @${exercise.weight}lbs`}
                        </span>
                      </div>
                    ))}
                    {workout.exercises.length > 2 && (
                      <p className="text-muted-foreground text-xs lg:text-sm">
                        +{workout.exercises.length - 2} more
                      </p>
                    )}
                  </div>

                  {/* Tags */}
                  {workout.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 lg:gap-2">
                      {workout.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag.id}
                          className="px-2 py-1 lg:px-3 lg:py-1.5 rounded-full text-xs lg:text-sm text-white cursor-pointer hover:opacity-80"
                          style={{ backgroundColor: tag.color }}
                          onClick={() => setSelectedTagFilter(tag.id)}
                        >
                          {tag.name}
                        </span>
                      ))}
                      {workout.tags.length > 3 && (
                        <span className="px-2 py-1 lg:px-3 lg:py-1.5 rounded-full text-xs lg:text-sm bg-muted text-muted-foreground">
                          +{workout.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 