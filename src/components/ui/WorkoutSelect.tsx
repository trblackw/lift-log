import * as React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { FormInput } from './standardInputs';
import { Popover, PopoverContent, PopoverAnchor } from './popover';
import { useWorkoutsStore } from '../../stores';
import type { Workout } from '@/lib/types';
import { cn } from '@/lib/utils';

interface WorkoutSelectProps
  extends Omit<React.ComponentProps<'input'>, 'onChange' | 'onSelect'> {
  value?: string;
  onChange?: (value: string) => void;
  onSelect?: (workout: Workout) => void;
  placeholder?: string;
  className?: string;
}

export function WorkoutSelect({
  value = '',
  onChange,
  onSelect,
  placeholder = 'Search for a workout to start...',
  className,
  ...props
}: WorkoutSelectProps) {
  const [filteredWorkouts, setFilteredWorkouts] = useState<Workout[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get workouts from store
  const workouts = useWorkoutsStore(state => state.workouts);
  const isLoading = useWorkoutsStore(state => state.isLoading);

  // Search function - simplified like ExerciseAutocomplete
  const searchWorkouts = useCallback(
    (query: string) => {
      if (!query || query.length < 1) {
        setFilteredWorkouts([]);
        setIsOpen(false);
        return;
      }

      const filtered = workouts.filter(
        workout =>
          workout.name.toLowerCase().includes(query.toLowerCase()) ||
          workout.exercises.some(exercise =>
            exercise.name.toLowerCase().includes(query.toLowerCase())
          )
      );

      const limitedResults = filtered.slice(0, 10);
      const shouldOpen = filtered.length > 0;

      setFilteredWorkouts(limitedResults);
      setIsOpen(shouldOpen);
      setSelectedIndex(-1);
    },
    [workouts]
  );

  // Set initial value once
  useEffect(() => {
    if (inputRef.current && value && !inputRef.current.value) {
      inputRef.current.value = value;
    }
  }, [value]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    onChange?.(newValue);

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search
    searchTimeoutRef.current = setTimeout(() => {
      searchWorkouts(newValue);
    }, 150);
  };

  const handleSelectWorkout = (workout: Workout) => {
    if (inputRef.current) {
      inputRef.current.value = workout.name;
    }
    setIsOpen(false);
    setFilteredWorkouts([]);
    setSelectedIndex(-1);
    onChange?.(workout.name);
    onSelect?.(workout);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || filteredWorkouts.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < filteredWorkouts.length - 1 ? prev + 1 : 0
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev > 0 ? prev - 1 : filteredWorkouts.length - 1
        );
        break;

      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && filteredWorkouts[selectedIndex]) {
          handleSelectWorkout(filteredWorkouts[selectedIndex]);
        }
        break;

      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Don't close if focus is moving to the popover content
    const relatedTarget = e.relatedTarget as Element;
    if (relatedTarget?.closest('[data-radix-popover-content]')) {
      return;
    }

    setTimeout(() => {
      setIsOpen(false);
      setSelectedIndex(-1);
    }, 150);
  };

  const formatWorkoutDetails = (workout: Workout): string => {
    const parts = [];

    if (workout.exercises.length > 0) {
      parts.push(
        `${workout.exercises.length} exercise${workout.exercises.length !== 1 ? 's' : ''}`
      );
    }

    if (workout.lastCompleted) {
      const lastCompletedDate = new Date(workout.lastCompleted);
      const now = new Date();
      const diffDays = Math.floor(
        (now.getTime() - lastCompletedDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 0) {
        parts.push('Last completed today');
      } else if (diffDays === 1) {
        parts.push('Last completed yesterday');
      } else if (diffDays < 7) {
        parts.push(`Last completed ${diffDays} days ago`);
      } else {
        parts.push(`Last completed ${lastCompletedDate.toLocaleDateString()}`);
      }
    }

    return parts.length > 0 ? parts.join(' • ') : '';
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen} modal={false}>
      <PopoverAnchor asChild>
        <div className="relative">
          <FormInput
            ref={inputRef}
            type="text"
            defaultValue={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            onFocus={() => {
              const currentValue = inputRef.current?.value || '';

              if (filteredWorkouts.length > 0 && currentValue.length >= 1) {
                setIsOpen(true);
              }
            }}
            placeholder={placeholder}
            className={cn('pr-8', className)}
            autoComplete="off"
            {...props}
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="animate-spin h-4 w-4 border-2 border-muted-foreground border-t-transparent rounded-full" />
            </div>
          )}
        </div>
      </PopoverAnchor>

      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0 max-h-64 overflow-hidden"
        align="start"
        side="bottom"
        sideOffset={4}
        onOpenAutoFocus={e => {
          e.preventDefault();
        }}
        onCloseAutoFocus={e => {
          e.preventDefault();
        }}
      >
        <div className="max-h-64 overflow-auto">
          {filteredWorkouts.map((workout, index) => {
            const details = formatWorkoutDetails(workout);

            return (
              <button
                key={`${workout.id}-${index}`}
                className={cn(
                  'w-full px-3 py-2 text-left hover:bg-muted/50 focus:bg-muted/50 focus:outline-none transition-colors',
                  'flex flex-col gap-1 text-sm',
                  selectedIndex === index && 'bg-muted/50'
                )}
                onClick={() => handleSelectWorkout(workout)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="font-medium text-foreground">
                  {workout.name}
                </div>
                {details && (
                  <div className="text-xs text-muted-foreground">{details}</div>
                )}
              </button>
            );
          })}

          {filteredWorkouts.length === 0 &&
            inputRef.current?.value &&
            inputRef.current.value.length > 0 &&
            !isLoading && (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No workouts found
              </div>
            )}

          {filteredWorkouts.length === 0 &&
            (!inputRef.current?.value || inputRef.current.value.length === 0) &&
            workouts.length === 0 &&
            !isLoading && (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No workouts available. Create your first workout to get started!
              </div>
            )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
