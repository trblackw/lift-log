import { useState, useEffect } from 'react';
import { useExerciseLibrary } from '@/hooks/useExerciseLibrary';
import { SearchInput } from '@/components/ui/standardInputs';
import { PrimaryButton, OutlineButton } from '@/components/ui/standardButtons';
import { Card, CardContent } from '@/components/ui/card';
// Badge component not available - using custom styling
import { Skeleton } from '@/components/ui/skeleton';
import type { Exercise, UniqueExercise } from '@/lib/types';
import IconMagnifier from './icons/icon-magnifier';
import IconDumbbell from './icons/icon-dumbbell';
import IconTimer from './icons/icon-timer';
import IconWeight from './icons/icon-weight';
import IconPlusBordered from './icons/icon-plus-bordered';

interface ExerciseLibraryProps {
  onAddExercise: (exercise: Exercise) => void;
  onEditExercise?: (exercise: Exercise) => void;
  editingExercise?: Exercise | null;
  onCancelEdit?: () => void;
}

export function ExerciseLibrary({
  onAddExercise,
  onEditExercise,
  editingExercise,
  onCancelEdit,
}: ExerciseLibraryProps) {
  const { library, isLoading, error, searchExercises } = useExerciseLibrary();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredExercises, setFilteredExercises] = useState<UniqueExercise[]>(
    []
  );
  const [isSearching, setIsSearching] = useState(false);

  // Filter exercises based on search term
  useEffect(() => {
    const performSearch = async () => {
      if (!searchTerm.trim()) {
        setFilteredExercises(library?.exercises || []);
        return;
      }

      setIsSearching(true);
      try {
        const results = await searchExercises(searchTerm);
        setFilteredExercises(results);
      } catch (error) {
        console.error('Failed to search exercises:', error);
        setFilteredExercises([]);
      } finally {
        setIsSearching(false);
      }
    };

    // Debounce search
    const timeoutId = setTimeout(performSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, library?.exercises, searchExercises]);

  // Initialize filtered exercises when library loads
  useEffect(() => {
    if (library && !searchTerm) {
      setFilteredExercises(library.exercises);
    }
  }, [library, searchTerm]);

  const handleAddExercise = (uniqueExercise: UniqueExercise) => {
    const exercise: Exercise = {
      id: crypto.randomUUID(),
      name: uniqueExercise.name,
      sets: uniqueExercise.commonSets,
      reps: uniqueExercise.commonReps,
      weight: uniqueExercise.commonWeight,
      duration: uniqueExercise.commonDuration,
      restTime: uniqueExercise.commonRestTime,
    };

    onAddExercise(exercise);
  };

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        <p>Failed to load exercise library</p>
        <p className="text-sm text-muted-foreground mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <SearchInput
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search exercises..."
          className="w-full pl-10"
        />
        <IconMagnifier className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
        {isSearching && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-muted-foreground border-t-transparent rounded-full" />
          </div>
        )}
      </div>

      {/* Exercise List */}
      <div className="max-h-80 overflow-y-auto space-y-2">
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Skeleton className="h-4 w-48 mb-2" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-8 w-16" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredExercises.length === 0 ? (
          // No exercises found
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-4 text-muted-foreground">
                <IconDumbbell className="size-8 mx-auto mb-2 opacity-50" />
                <p>
                  {searchTerm
                    ? `No exercises found for "${searchTerm}"`
                    : 'No exercises in library'}
                </p>
                <p className="text-sm mt-1">
                  {searchTerm
                    ? 'Try a different search term'
                    : 'Create some workouts to populate your exercise library'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          // Exercise list
          filteredExercises.map(exercise => (
            <Card
              key={exercise.name}
              className="hover:shadow-sm transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium truncate">{exercise.name}</h4>
                      <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded-full">
                        {exercise.usageCount}x used
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {exercise.commonSets && exercise.commonReps && (
                        <div className="flex items-center gap-1">
                          <IconDumbbell className="size-4" />
                          <span>
                            {exercise.commonSets} × {exercise.commonReps}
                          </span>
                        </div>
                      )}

                      {exercise.commonWeight && (
                        <div className="flex items-center gap-1">
                          <IconWeight className="size-4" />
                          <span>{exercise.commonWeight}lbs</span>
                        </div>
                      )}

                      {exercise.commonDuration && (
                        <div className="flex items-center gap-1">
                          <IconTimer className="size-4" />
                          <span>{exercise.commonDuration}min</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <PrimaryButton
                      size="sm"
                      onClick={() => handleAddExercise(exercise)}
                      className="flex items-center gap-1"
                    >
                      <IconPlusBordered className="size-4" />
                      Add
                    </PrimaryButton>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary */}
      {!isLoading && (
        <div className="text-center text-sm text-muted-foreground">
          {isSearching
            ? 'Searching...'
            : `${filteredExercises.length} exercise${filteredExercises.length !== 1 ? 's' : ''} ${
                searchTerm ? 'found' : 'available'
              }`}
        </div>
      )}
    </div>
  );
}
