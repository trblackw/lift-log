import * as React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { FormInput } from './standardInputs';
import { Popover, PopoverContent, PopoverAnchor } from './popover';
import { storage } from '@/lib/storage';
import type { UniqueExercise } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ExerciseAutocompleteProps
  extends Omit<React.ComponentProps<'input'>, 'onChange' | 'onSelect'> {
  value?: string;
  onChange?: (value: string) => void;
  onSelect?: (exercise: UniqueExercise) => void;
  placeholder?: string;
  className?: string;
}

export function ExerciseAutocomplete({
  value = '',
  onChange,
  onSelect,
  placeholder = 'e.g., Bench Press, Stairmaster, Running',
  className,
  ...props
}: ExerciseAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<UniqueExercise[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Search function
  const searchExercises = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const results = await storage.searchExerciseLibrary(query);
      const limitedResults = results.slice(0, 8);
      const shouldOpen = results.length > 0;

      setSuggestions(limitedResults);
      setIsOpen(shouldOpen);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Failed to search exercises:', error);
      setSuggestions([]);
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
      searchExercises(newValue);
    }, 200);
  };

  const handleSelectExercise = (exercise: UniqueExercise) => {
    if (inputRef.current) {
      inputRef.current.value = exercise.name;
    }
    setIsOpen(false);
    setSuggestions([]);
    setSelectedIndex(-1);
    onChange?.(exercise.name);
    onSelect?.(exercise);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;

      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSelectExercise(suggestions[selectedIndex]);
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

  const formatExerciseDetails = (exercise: UniqueExercise): string => {
    const parts = [];

    if (exercise.commonSets && exercise.commonReps) {
      parts.push(`${exercise.commonSets}×${exercise.commonReps}`);
    }

    if (exercise.commonWeight) {
      parts.push(`${exercise.commonWeight}lbs`);
    }

    if (exercise.commonDuration) {
      parts.push(`${exercise.commonDuration}min`);
    }

    if (exercise.usageCount > 1) {
      parts.push(`Used ${exercise.usageCount}x`);
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

              if (suggestions.length > 0 && currentValue.length >= 2) {
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
          {suggestions.map((exercise, index) => {
            const details = formatExerciseDetails(exercise);

            return (
              <button
                key={`${exercise.name}-${index}`}
                className={cn(
                  'w-full px-3 py-2 text-left hover:bg-muted/50 focus:bg-muted/50 focus:outline-none transition-colors',
                  'flex flex-col gap-1 text-sm',
                  selectedIndex === index && 'bg-muted/50'
                )}
                onClick={() => handleSelectExercise(exercise)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="font-medium text-foreground">
                  {exercise.name}
                </div>
                {details && (
                  <div className="text-xs text-muted-foreground">{details}</div>
                )}
              </button>
            );
          })}

          {suggestions.length === 0 &&
            inputRef.current?.value &&
            inputRef.current.value.length >= 2 &&
            !isLoading && (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No exercises found
              </div>
            )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
