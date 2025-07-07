import { useState, useMemo, useEffect } from 'react';
import {
  PrimaryButton,
  SecondaryButton,
  DestructiveButton,
  OutlineButton,
  GhostButton,
} from '@/components/ui/standardButtons';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { SearchInput } from '@/components/ui/standardInputs';
import { Label } from '@/components/ui/label';
import { Select, SelectItem } from '@/components/ui/select';
import { TagGroup } from '@/components/ui/Tag';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { storage } from '@/lib/storage';
import { formatRelativeTime } from '@/lib/utils';
import type { Workout, Tag } from '@/lib/types';
import type { ViewMode } from './ViewToggle';
import IconDelete from './icons/icon-delete';
import IconActiveRun from './icons/icon-active-run';
import { ChevronDown } from 'lucide-react';
import IconMagnifier from './icons/icon-magnifier';
import IconCheckCircle from './icons/icon-check-circle';
import IconDumbbell from './icons/icon-dumbbell';
import IconTimer from './icons/icon-timer';

interface WorkoutListProps {
  workouts: Workout[];
  onStartWorkout?: (workoutId: string) => void;
  onDeleteWorkout?: (workoutId: string) => void;
  onViewWorkout?: (workout: Workout) => void;
  viewMode?: ViewMode;
}

export function WorkoutList({
  workouts,
  onStartWorkout,
  onDeleteWorkout,
  onViewWorkout,
  viewMode = 'card',
}: WorkoutListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>('');
  const [filteredWorkouts, setFilteredWorkouts] = useState<Workout[]>(workouts);
  const [isSearching, setIsSearching] = useState(false);
  const [workoutToDelete, setWorkoutToDelete] = useState<string | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

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

  // Auto-expand filters when there are active filters
  useEffect(() => {
    if (searchTerm || selectedTagFilter) {
      setIsFiltersOpen(true);
    }
  }, [searchTerm, selectedTagFilter]);

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
          results = tagResults.filter(
            workout =>
              workout.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (workout.description
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ??
                false) ||
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
          const matchesSearch =
            !searchTerm ||
            workout.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (workout.description
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ??
              false);

          const matchesTag =
            !selectedTagFilter ||
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
      day: 'numeric',
    }).format(date);
  };

  const renderListView = () => (
    <Card>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {filteredWorkouts.map(workout => (
            <div
              key={workout.id}
              className="p-4 hover:bg-muted/50 transition-colors cursor-pointer flex items-center justify-between relative"
              onClick={e => handleWorkoutClick(workout, e)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <h3 className="font-medium text-base truncate">
                    {workout.name}
                  </h3>
                </div>
                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                  <span className="flex items-center">
                    <IconDumbbell className="size-4 mr-1" />
                    {workout.exercises.length}
                  </span>
                  {workout.estimatedDuration && (
                    <span className="flex items-center">
                      <IconTimer className="size-4 mr-1" />
                      {workout.estimatedDuration} min
                    </span>
                  )}
                  {workout.lastCompleted && (
                    <span
                      style={{ paddingBottom: '2.5px' }}
                      className="text-green-600 text-xs whitespace-nowrap mt-auto dark:text-green-400 flex items-center"
                    >
                      <IconCheckCircle className="size-4 mr-1" />
                      {formatRelativeTime(workout.lastCompleted)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {onStartWorkout && (
                  <SecondaryButton
                    onClick={() => onStartWorkout(workout.id)}
                    size="sm"
                    className="bg-green-800 text-white"
                  >
                    <IconActiveRun className="size-5 m-0" />
                    Start
                  </SecondaryButton>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderCardView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-4">
      {filteredWorkouts.map(workout => (
        <Card
          key={workout.id}
          className="hover:shadow-md transition-shadow cursor-pointer flex flex-col"
          onClick={e => handleWorkoutClick(workout, e)}
        >
          <CardContent className="p-6 flex-1">
            <div className="space-y-3 lg:space-y-4">
              {/* Header */}
              <div>
                <h3 className="font-semibold text-lg lg:text-xl leading-tight truncate">
                  {workout.name}
                </h3>
                {workout.description && (
                  <p className="text-muted-foreground text-sm lg:text-base mt-1 line-clamp-2">
                    {workout.description}
                  </p>
                )}
              </div>

              {/* Stats */}
              <div className="flex justify-between text-sm lg:text-base">
                <span className="text-muted-foreground">
                  {workout.exercises.length} exercise
                  {workout.exercises.length !== 1 ? 's' : ''}
                </span>
                <span className="text-muted-foreground">
                  {workout.estimatedDuration
                    ? `${workout.estimatedDuration} min`
                    : formatDate(workout.createdAt)}
                </span>
              </div>

              {/* Exercise Preview */}
              <div className="text-sm lg:text-base space-y-1">
                {workout.exercises.slice(0, 2).map(exercise => (
                  <div
                    key={exercise.id}
                    className="flex justify-between text-xs lg:text-sm"
                  >
                    <span className="truncate">{exercise.name}</span>
                    <span className="text-muted-foreground ml-2 shrink-0">
                      {exercise.duration
                        ? `${exercise.duration}min`
                        : `${exercise.sets}×${exercise.reps}`}
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

              {/* Last Completed */}
              {workout.lastCompleted && (
                <div className="flex items-center gap-1 mt-2 text-xs text-green-600 dark:text-green-400">
                  <IconCheckCircle className="size-4" />
                  Last completed {formatRelativeTime(workout.lastCompleted)}
                </div>
              )}

              {/* Tags */}
              {workout.tags.length > 0 && (
                <TagGroup
                  tags={workout.tags}
                  variant="clickable"
                  size="sm"
                  maxVisible={3}
                  onTagClick={tag => setSelectedTagFilter(tag.id)}
                />
              )}
            </div>
          </CardContent>

          {/* Actions Footer */}
          <CardFooter className="p-4 pt-0 border-t border-border">
            <div className="flex justify-between gap-2 w-full mt-2">
              {onDeleteWorkout && (
                <GhostButton
                  onClick={() => handleDeleteClick(workout.id)}
                  size="sm"
                  className="hover:bg-destructive/10 cursor-pointer text-destructive hover:text-destructive"
                >
                  <IconDelete className="size-5" /> Delete
                </GhostButton>
              )}
              {onStartWorkout && (
                <PrimaryButton
                  onClick={() => onStartWorkout(workout.id)}
                  size="sm"
                  className="cursor-pointer"
                >
                  <IconActiveRun className="size-5" /> Start
                </PrimaryButton>
              )}
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTagFilter('');
  };

  const handleDeleteClick = (workoutId: string) => {
    setWorkoutToDelete(workoutId);
  };

  const confirmDelete = () => {
    if (workoutToDelete && onDeleteWorkout) {
      onDeleteWorkout(workoutToDelete);
      setWorkoutToDelete(null);
    }
  };

  const cancelDelete = () => {
    setWorkoutToDelete(null);
  };

  const handleWorkoutClick = (workout: Workout, event: React.MouseEvent) => {
    // Don't trigger if clicking on action buttons
    if ((event.target as HTMLElement).closest('button')) {
      return;
    }

    if (onViewWorkout) {
      onViewWorkout(workout);
    }
  };

  if (workouts.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8 lg:py-12">
            <div className="text-6xl lg:text-8xl mb-4">💪</div>
            <h2 className="text-xl lg:text-2xl font-semibold mb-2">
              No Workouts Yet
            </h2>
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
    <div className="h-full w-full flex flex-col">
      {/* Search and Filter Controls - Collapsible */}
      <div className="flex-shrink-0 bg-background">
        <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          {/* Header with Toggle */}
          <div className="flex items-center justify-between p-4 bg-background">
            <div className="flex items-center gap-3">
              <span className="text-sm lg:text-base text-muted-foreground">
                {isSearching
                  ? 'Searching...'
                  : `${filteredWorkouts.length} workout${filteredWorkouts.length !== 1 ? 's' : ''}`}
              </span>
              {(searchTerm || selectedTagFilter) && (
                <div className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                  Filtered
                </div>
              )}
            </div>
            <CollapsibleTrigger asChild>
              <GhostButton
                size="sm"
                className="p-2 hover:bg-muted"
                aria-label={isFiltersOpen ? 'Hide filters' : 'Show filters'}
              >
                <IconMagnifier
                  className={`size-8 transition-transform duration-200 p-1 rounded-md text-muted-foreground ${
                    isFiltersOpen ? 'bg-primary rotate-90' : ''
                  }`}
                />
              </GhostButton>
            </CollapsibleTrigger>
          </div>

          {/* Collapsible Content */}
          <CollapsibleContent>
            <Card className="border-0 rounded-none shadow-none">
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                  <div>
                    <Label htmlFor="search" className="text-sm lg:text-base">
                      Search Workouts
                    </Label>
                    <SearchInput
                      id="search"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      placeholder="Search..."
                      className="mt-1 h-12 lg:h-14 lg:text-base pl-3"
                    />
                  </div>

                  {allTags.length > 0 && (
                    <div>
                      <Label className="text-sm lg:text-base">
                        Filter by Tag
                      </Label>
                      <div className="mt-1">
                        <Select
                          value={selectedTagFilter}
                          onValueChange={setSelectedTagFilter}
                          placeholder="All Tags"
                        >
                          <SelectItem value="">All Tags</SelectItem>
                          {allTags.map(tag => (
                            <SelectItem key={tag.id} value={tag.id}>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full border"
                                  style={{
                                    borderColor: tag.color,
                                    backgroundColor: 'transparent',
                                  }}
                                />
                                {tag.name}
                              </div>
                            </SelectItem>
                          ))}
                        </Select>
                      </div>
                    </div>
                  )}
                </div>

                {(searchTerm || selectedTagFilter) && (
                  <OutlineButton
                    size="sm"
                    onClick={clearFilters}
                    className="w-full lg:w-auto h-10 lg:h-11"
                  >
                    Clear Filters
                  </OutlineButton>
                )}
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Workout List - Scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto p-2">
        {filteredWorkouts.length === 0 && !isSearching ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-6 lg:py-8">
                <div className="text-4xl lg:text-6xl mb-2">🔍</div>
                <p className="text-muted-foreground text-sm lg:text-base">
                  No workouts match your filters.
                </p>
                <OutlineButton
                  size="sm"
                  onClick={clearFilters}
                  className="mt-3 lg:mt-4"
                >
                  Clear Filters
                </OutlineButton>
              </div>
            </CardContent>
          </Card>
        ) : viewMode === 'list' ? (
          renderListView()
        ) : (
          renderCardView()
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {workoutToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="max-w-sm mx-4">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Delete Workout</h3>
              <p className="text-muted-foreground mb-4">
                Are you sure you want to delete this workout? This action cannot
                be undone.
              </p>
              <div className="flex gap-2 justify-end">
                <SecondaryButton onClick={cancelDelete} size="sm">
                  Cancel
                </SecondaryButton>
                <DestructiveButton onClick={confirmDelete} size="sm">
                  Delete
                </DestructiveButton>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
