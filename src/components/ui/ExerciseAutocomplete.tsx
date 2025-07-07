import * as React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from './input';
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
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<UniqueExercise[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Debounced search function
  const searchExercises = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const results = await storage.searchExerciseLibrary(query);
      setSuggestions(results.slice(0, 8)); // Limit to 8 suggestions
      setIsOpen(results.length > 0);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Failed to search exercises:', error);
      setSuggestions([]);
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounce the search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchExercises(inputValue);
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [inputValue, searchExercises]);

  // Update input value when value prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange?.(newValue);
  };

  const handleSelectExercise = (exercise: UniqueExercise) => {
    setInputValue(exercise.name);
    setIsOpen(false);
    setSuggestions([]);
    setSelectedIndex(-1);
    onChange?.(exercise.name);
    onSelect?.(exercise);
    inputRef.current?.blur();
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
        inputRef.current?.blur();
        break;
    }
  };

  const handleBlur = () => {
    // Delay closing to allow for click on suggestions
    setTimeout(() => {
      setIsOpen(false);
      setSelectedIndex(-1);
    }, 200);
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
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverAnchor asChild>
        <div className="relative">
          <Input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            onFocus={() => {
              if (suggestions.length > 0) {
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
      >
        <div ref={listRef} className="max-h-64 overflow-auto">
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

          {suggestions.length === 0 && inputValue.length >= 2 && !isLoading && (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              No exercises found
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
