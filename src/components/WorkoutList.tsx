import { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { TagGroup } from '@/components/ui/Tag';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { storage } from '@/lib/storage';
import { formatRelativeTime } from '@/lib/utils';
import { buildRoute } from '@/lib/routes';
import type { Workout, Tag, Exercise } from '@/lib/types';
import type { ViewMode } from './ViewToggle';
import { ViewToggle } from './ViewToggle';
import IconDelete from './icons/icon-delete';
import IconActiveRun from './icons/icon-active-run';
import IconMagnifier from './icons/icon-magnifier';
import IconSort from './icons/icon-sort';
import IconCheckCircle from './icons/icon-check-circle';
import IconDumbbell from './icons/icon-dumbbell';
import IconTimer from './icons/icon-timer';
import IconArmFlex from './icons/icon-arm-flex';
import IconWeight from './icons/icon-weight';
import IconDumbbellAlt from './icons/icon-dumbbell-alt';
import IconSortAlphabetical from './icons/icon-sort-alphabetical';
import IconCalendarCreate from './icons/icon-calendar-create';
import IconCalendarComplete from './icons/icon-calendar-complete';
import IconMagnifierList from './icons/icon-magnifier-list';

interface WorkoutListProps {
  workouts: Workout[];
  onStartWorkout?: (workoutId: string) => void;
  onDeleteWorkout?: (workoutId: string) => void;
  viewMode?: ViewMode;
  onViewModeChange?: (viewMode: ViewMode) => void;
}

export function WorkoutList({
  workouts,
  onStartWorkout,
  onDeleteWorkout,
  viewMode = 'card',
  onViewModeChange,
}: WorkoutListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>('');
  const [filteredWorkouts, setFilteredWorkouts] = useState<Workout[]>(workouts);
  const [isSearching, setIsSearching] = useState(false);
  const [workoutToDelete, setWorkoutToDelete] = useState<string | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [sortBy, setSortBy] = useState<
    'created' | 'alphabetical' | 'lastCompleted'
  >('created');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sort options
  const sortOptions = [
    { value: 'created' as const, label: 'Date Created' },
    { value: 'alphabetical' as const, label: 'Alphabetically' },
    { value: 'lastCompleted' as const, label: 'Last Completed' },
  ];

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

  // Auto-focus search input when filters are opened
  useEffect(() => {
    if (isFiltersOpen && searchInputRef.current) {
      // Small delay to ensure the collapsible animation has started
      const timeoutId = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timeoutId);
    }
  }, [isFiltersOpen]);

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

  // Sort workouts based on selected sort option
  const sortedWorkouts = useMemo(() => {
    const workoutsToSort = [...filteredWorkouts];

    switch (sortBy) {
      case 'alphabetical':
        return workoutsToSort.sort((a, b) => a.name.localeCompare(b.name));
      case 'lastCompleted':
        return workoutsToSort.sort((a, b) => {
          // Put workouts with lastCompleted first, then sort by date
          if (!a.lastCompleted && !b.lastCompleted) return 0;
          if (!a.lastCompleted) return 1;
          if (!b.lastCompleted) return -1;
          return (
            new Date(b.lastCompleted).getTime() -
            new Date(a.lastCompleted).getTime()
          );
        });
      case 'created':
      default:
        return workoutsToSort.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  }, [filteredWorkouts, sortBy]);

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
          {sortedWorkouts.map(workout => (
            <div
              key={workout.id}
              className="p-4 hover:bg-muted/50 transition-colors flex items-center justify-between relative"
            >
              <Link
                to={buildRoute.workoutDetail(workout.id)}
                className="flex-1 min-w-0"
              >
                <div className="flex items-center gap-3">
                  <h3 className="font-medium text-base truncate">
                    {workout.name}
                  </h3>
                </div>
                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
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
                    <span className="text-green-600 text-xs dark:text-green-400 items-center hidden sm:flex">
                      <IconCheckCircle className="size-4 mr-1" />
                      <span className="truncate max-w-[120px]">
                        {formatRelativeTime(workout.lastCompleted)}
                      </span>
                    </span>
                  )}
                </div>
              </Link>
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
      {sortedWorkouts.map(workout => (
        <Card
          key={workout.id}
          className="hover:shadow-md transition-shadow flex flex-col"
        >
          <Link to={buildRoute.workoutDetail(workout.id)} className="flex-1">
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

                {/* Exercise Preview - Grid Layout */}
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-3 text-xs lg:text-sm">
                    {workout.exercises.slice(0, 4).map(exercise => (
                      <div
                        key={exercise.id}
                        className="flex flex-col justify-start p-2 bg-muted-foreground/10 rounded-md border"
                      >
                        <span className="truncate font-medium mb-1">
                          {exercise.name}
                        </span>
                        <div className="text-muted-foreground flex flex-col gap-0.5">
                          <ExercisePreviewStat
                            type="duration"
                            exercise={exercise}
                          />
                          <ExercisePreviewStat
                            type="set/rep"
                            exercise={exercise}
                          />
                          <ExercisePreviewStat
                            type="weight"
                            exercise={exercise}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  {workout.exercises.length > 4 && (
                    <div className="flex justify-end">
                      <div className="py-1 px-2 bg-muted/20 rounded-md border border-dashed border-muted-foreground text-muted-foreground flex items-center">
                        <span className="text-xs">
                          +{workout.exercises.length - 4} more
                        </span>
                      </div>
                    </div>
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
          </Link>

          {/* Actions Footer */}
          <CardFooter className="p-2 border-t border-border">
            <div className="flex justify-between gap-2 w-full mt-2">
              {onDeleteWorkout && (
                <GhostButton
                  onClick={() => handleDeleteClick(workout.id)}
                  size="sm"
                  className="hover:bg-destructive/10 text-destructive/90 cursor-pointer hover:text-destructive"
                >
                  <IconDelete className="size-5" /> Delete
                </GhostButton>
              )}
              {onStartWorkout && (
                <PrimaryButton
                  onClick={() => onStartWorkout(workout.id)}
                  size="sm"
                  className="cursor-pointer bg-green-800 text-white"
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

  interface ExercisePreviewStatProps {
    type: 'duration' | 'set/rep' | 'weight';
    exercise: Exercise;
  }

  function ExercisePreviewStat({ type, exercise }: ExercisePreviewStatProps) {
    switch (type) {
      case 'duration':
        if (exercise.duration === undefined) {
          return null;
        }
        return (
          <span className="flex items-center">
            <IconTimer className="size-4 mr-1" />
            {exercise.duration} <small>min</small>
          </span>
        );
      case 'set/rep': {
        if (exercise.sets === undefined || exercise.reps === undefined) {
          return null;
        }
        return (
          <span className="flex items-center">
            <IconDumbbellAlt className="size-4 mr-1" />
            {exercise.sets} <small>x</small> {exercise.reps}
          </span>
        );
      }
      case 'weight':
        if (exercise.weight === undefined) {
          return null;
        }
        return (
          <span className="flex items-center">
            <IconWeight className="size-4 mr-1" />
            {exercise.weight} <small>lbs</small>
          </span>
        );
      default:
        return null;
    }
  }

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

  if (workouts.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8 lg:py-12 flex flex-col items-center justify-center">
            <h2 className="text-xl lg:text-2xl font-semibold mb-2 flex items-center gap-2">
              <IconArmFlex className="size-10" />
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
    <div className="h-full w-full flex flex-col overflow-visible">
      {/* Search and Filter Controls - Collapsible */}
      <div className="flex-shrink-0 bg-background relative z-20">
        <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          {/* Header with Toggle */}
          <div className="flex items-center justify-between p-3 bg-background">
            <div className="flex items-center gap-3">
              <ViewToggle
                currentView={viewMode}
                onViewChange={onViewModeChange}
              />
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
            <div className="flex items-center justify-end gap-1">
              {/* Sort Popover */}
              <Popover open={isSortOpen} onOpenChange={setIsSortOpen}>
                <PopoverTrigger asChild>
                  <GhostButton
                    size="sm"
                    style={{ paddingLeft: 0, paddingRight: 0 }}
                    className="hover:bg-transparent"
                    aria-label="Sort workouts"
                  >
                    <IconSort
                      className={`size-8 p-1 rounded-md text-muted-foreground ${
                        isSortOpen ? 'text-primary' : ''
                      }`}
                    />
                  </GhostButton>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2" align="end">
                  <div className="space-y-1">
                    <div className="px-2 py-1 text-sm font-medium text-muted-foreground">
                      Sort by
                    </div>
                    {sortOptions.map(option => (
                      <button
                        key={option.value}
                        onClick={() => setSortBy(option.value)}
                        className={`w-full flex items-center gap-2 px-2 py-2 text-sm rounded-md hover:bg-muted transition-colors ${
                          sortBy === option.value
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-foreground'
                        }`}
                      >
                        {(() => {
                          switch (option.value) {
                            case 'alphabetical':
                              return (
                                <IconSortAlphabetical className="size-5" />
                              );
                            case 'lastCompleted':
                              return (
                                <IconCalendarComplete className="size-5" />
                              );
                            case 'created':
                              return <IconCalendarCreate className="size-5" />;
                            default:
                              return <IconSort className="size-5" />;
                          }
                        })()}
                        {option.label}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              <CollapsibleTrigger asChild>
                <GhostButton
                  size="sm"
                  style={{ paddingLeft: 0, paddingRight: 0 }}
                  className="hover:bg-transparent hover:text-red-500"
                  aria-label={isFiltersOpen ? 'Hide filters' : 'Show filters'}
                >
                  <IconMagnifier
                    className={`size-8 transition-transform duration-200 p-1 rounded-md text-muted-foreground ${
                      isFiltersOpen ? 'text-primary' : ''
                    }`}
                  />
                </GhostButton>
              </CollapsibleTrigger>
            </div>
          </div>

          {/* Collapsible Content */}
          <CollapsibleContent className="relative z-30">
            <Card className="border-0 rounded-none shadow-none bg-background">
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 overflow-visible">
                  <div>
                    <Label htmlFor="search" className="text-sm lg:text-base">
                      Search Workouts
                    </Label>
                    <SearchInput
                      ref={searchInputRef}
                      id="search"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      placeholder="Search..."
                      className="mt-1 h-12 lg:h-14 lg:text-base pl-3"
                      autoComplete="off"
                    />
                  </div>

                  {allTags.length > 0 && (
                    <div>
                      <Label className="text-sm lg:text-base">
                        Filter by Tag
                      </Label>
                      <div className="mt-1 relative z-40">
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

      {/* Workout List */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-visible p-2">
        {sortedWorkouts.length === 0 && !isSearching ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-6 lg:py-8">
                <p className="text-muted-foreground text-sm lg:text-base flex items-center justify-center gap-2">
                  <IconMagnifierList className="size-7" />
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
