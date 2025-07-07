import React from 'react';
import { Button, buttonVariants } from './button';
import { type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Define ButtonProps type based on the Button component
type ButtonProps = React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

/**
 * Primary Button - Uses Navy/Teal from our color palette
 * This is the main action button for important actions like "Save", "Submit", "Create"
 */
export function PrimaryButton({ className, children, ...props }: ButtonProps) {
  return (
    <Button
      variant="default"
      className={cn(
        // Enhanced styling with our color palette
        'bg-primary text-primary-foreground cursor-pointer',
        'hover:bg-primary/90 active:bg-primary/95',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'shadow-sm transition-all duration-200',
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
}

/**
 * Secondary Button - Uses Teal/Mint from our color palette
 * For secondary actions like "Cancel", "Back", or alternative options
 */
export function SecondaryButton({
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <Button
      variant="secondary"
      className={cn(
        // Enhanced styling with our color palette
        'bg-secondary text-secondary-foreground cursor-pointer',
        'hover:bg-secondary/80 active:bg-secondary/90',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'shadow-sm transition-all duration-200',
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
}

/**
 * Destructive Button - Uses our new Red color (#DC2525)
 * For dangerous actions like "Delete", "Remove", "Clear All"
 */
export function DestructiveButton({
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <Button
      variant="destructive"
      className={cn(
        // Enhanced styling with our red color palette
        'bg-destructive text-destructive-foreground',
        'hover:bg-destructive/90 active:bg-destructive/95',
        'focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2',
        'shadow-sm transition-all duration-200',
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
}

/**
 * Outline Button - Uses our border/accent colors
 * For tertiary actions or when you need a subtle button
 */
export function OutlineButton({ className, children, ...props }: ButtonProps) {
  return (
    <Button
      variant="outline"
      className={cn(
        // Enhanced styling with our color palette
        'border-border bg-background text-foreground cursor-pointer',
        'hover:bg-accent hover:text-accent-foreground',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'shadow-sm transition-all duration-200',
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
}

/**
 * Ghost Button - Minimal styling with our color palette
 * For subtle actions that shouldn't draw too much attention
 */
export function GhostButton({ className, children, ...props }: ButtonProps) {
  return (
    <Button
      variant="ghost"
      className={cn(
        // Enhanced styling with our color palette
        'text-foreground',
        'hover:bg-accent hover:text-accent-foreground',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'transition-all duration-200',
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
}

// Type exports for convenience
export type { ButtonProps };

// Re-export the base Button for cases where custom variants are needed
export { Button as BaseButton } from './button';
