import React from 'react';
import { Input } from './input';
import { cn } from '@/lib/utils';

// Define InputProps type based on the Input component
type InputProps = React.ComponentProps<'input'>;

// Define TextareaProps type based on the Textarea component
type TextareaProps = React.ComponentProps<'textarea'>;

/**
 * Standard Input - Enhanced contrast with proper background colors
 * This is the main input component for forms with better visibility
 */
export function StandardInput({ className, ...props }: InputProps) {
  return (
    <Input
      className={cn(
        // Enhanced styling with better contrast
        'bg-card text-card-foreground',
        'border-border/60 hover:border-border',
        'focus-visible:border-primary/60 focus-visible:ring-primary/20',
        'placeholder:text-muted-foreground/70',
        'shadow-sm transition-all duration-200',
        // Dark mode enhancements
        'dark:bg-card dark:text-card-foreground',
        'dark:border-border/40 dark:hover:border-border/60',
        'dark:focus-visible:border-primary/50 dark:focus-visible:ring-primary/30',
        className
      )}
      {...props}
    />
  );
}

/**
 * Search Input - Optimized for search functionality with enhanced visibility
 */
export function SearchInput({ className, ...props }: InputProps) {
  return (
    <Input
      type="search"
      className={cn(
        // Enhanced search input styling
        'bg-background/30 text-foreground',
        'border-border/60 hover:border-border',
        'focus-visible:bg-card focus-visible:border-primary/60 focus-visible:ring-primary/20',
        'placeholder:text-muted-foreground/60',
        'shadow-sm transition-all duration-200',
        // Search-specific styling
        'pl-10', // Space for search icon if added later
        // Dark mode enhancements
        'dark:bg-background dark:text-foreground',
        'dark:border-border dark:hover:border-border/60',
        'dark:focus-visible:bg-card dark:focus-visible:border-primary/50',
        className
      )}
      {...props}
    />
  );
}

/**
 * Form Input - Designed for forms with optimal contrast in containers
 */
export function FormInput({ className, ...props }: InputProps) {
  return (
    <Input
      className={cn(
        // Form-optimized styling with maximum contrast
        'bg-background border-2 text-foreground',
        'border-border hover:border-border/80',
        'focus-visible:border-primary focus-visible:ring-primary/25',
        'placeholder:text-muted-foreground/80',
        'shadow-sm transition-all duration-200',
        // Enhanced focus states
        'focus-visible:ring-4 focus-visible:outline-none',
        // Dark mode enhancements
        'dark:bg-background dark:text-foreground',
        'dark:border-border/60 dark:hover:border-border',
        'dark:focus-visible:border-primary/70 dark:focus-visible:ring-primary/30',
        className
      )}
      {...props}
    />
  );
}

/**
 * Form Textarea - Designed for multi-line forms with optimal contrast in containers
 */
export function FormTextarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        // Form-optimized styling with maximum contrast (matching FormInput)
        'flex min-h-[100px] w-full rounded-md',
        'bg-background border-2 text-foreground',
        'border-border hover:border-border/80',
        'focus-visible:border-primary focus-visible:ring-primary/25',
        'placeholder:text-muted-foreground/80',
        'shadow-sm transition-all duration-200',
        'px-3 py-2 text-sm',
        // Enhanced focus states
        'focus-visible:ring-4 focus-visible:outline-none',
        // Dark mode enhancements
        'dark:bg-background dark:text-foreground',
        'dark:border-border/60 dark:hover:border-border',
        'dark:focus-visible:border-primary/70 dark:focus-visible:ring-primary/30',
        // Textarea-specific styling
        'resize-none sm:resize-y',
        className
      )}
      {...props}
    />
  );
}

// Type exports for convenience
export type { InputProps, TextareaProps };

// Re-export the base Input for cases where custom variants are needed
export { Input as BaseInput } from './input';
