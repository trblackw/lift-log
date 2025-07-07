import * as React from 'react';
import { cn } from '@/lib/utils';
import { ColorPalette } from '@/lib/colors';
import type { Tag as TagType } from '@/lib/types';

// Color randomizer that uses our color palette
const tagColorOptions = [
  {
    name: 'navy',
    color: ColorPalette.navy.hex,
    hsl: ColorPalette.navy.hsl,
    rgb: ColorPalette.navy.rgb,
  },
  {
    name: 'teal',
    color: ColorPalette.teal.hex,
    hsl: ColorPalette.teal.hsl,
    rgb: ColorPalette.teal.rgb,
  },
  {
    name: 'mint',
    color: ColorPalette.mint.hex,
    hsl: ColorPalette.mint.hsl,
    rgb: ColorPalette.mint.rgb,
  },
  {
    name: 'red',
    color: ColorPalette.red.hex,
    hsl: ColorPalette.red.hsl,
    rgb: ColorPalette.red.rgb,
  },
];

/**
 * Generate a consistent color for a tag based on its name
 * This ensures the same tag always gets the same color
 */
export function generateTagColor(tagName: string): string {
  // Create a simple hash from the tag name
  let hash = 0;
  for (let i = 0; i < tagName.length; i++) {
    const char = tagName.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  // Use absolute value and modulo to get a consistent index
  const index = Math.abs(hash) % tagColorOptions.length;
  return tagColorOptions[index].color;
}

/**
 * Get a random color from our palette for new tags
 */
export function getRandomTagColor(): string {
  const randomIndex = Math.floor(Math.random() * tagColorOptions.length);
  return tagColorOptions[randomIndex].color;
}

interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  tag: TagType;
  variant?: 'default' | 'removable' | 'clickable';
  size?: 'sm' | 'md' | 'lg';
  onRemove?: () => void;
  onTagClick?: () => void;
}

export function Tag({
  tag,
  variant = 'default',
  size = 'sm',
  className,
  onRemove,
  onTagClick,
  onClick,
  ...props
}: TagProps) {
  // Use the tag's color or generate one based on the name
  const tagColor = tag.color || generateTagColor(tag.name);

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-3 py-1.5 text-sm lg:text-base',
  };

  const handleClick = (e: React.MouseEvent<HTMLSpanElement>) => {
    if (onTagClick) {
      e.preventDefault();
      onTagClick();
    }
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <span
      className={cn(
        // Base styles
        'inline-flex items-center gap-1 rounded-md h-8 font-medium transition-all duration-200',
        // Transparent background with colored text and border
        'bg-transparent border border-current',
        // Size variants
        sizeClasses[size],
        // Interactive states
        variant === 'clickable' &&
          'cursor-pointer hover:bg-current hover:bg-opacity-10',
        variant === 'removable' && 'pr-1',
        className
      )}
      style={{
        color: tagColor,
        borderColor: tagColor,
      }}
      onClick={handleClick}
      {...props}
    >
      <span className="truncate">{tag.name}</span>

      {variant === 'removable' && onRemove && (
        <button
          type="button"
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 hover:text-current/80 rounded-md h-8 p-0.5 transition-colors cursor-pointer"
          aria-label={`Remove ${tag.name} tag`}
        >
          <span className="text-xs leading-none">×</span>
        </button>
      )}
    </span>
  );
}

/**
 * Tag group component for displaying multiple tags
 */
interface TagGroupProps {
  tags: TagType[];
  variant?: 'default' | 'removable' | 'clickable';
  size?: 'sm' | 'md' | 'lg';
  maxVisible?: number;
  onTagRemove?: (tagId: string) => void;
  onTagClick?: (tag: TagType) => void;
  className?: string;
}

export function TagGroup({
  tags,
  variant = 'default',
  size = 'md',
  maxVisible,
  onTagRemove,
  onTagClick,
  className,
}: TagGroupProps) {
  const visibleTags = maxVisible ? tags.slice(0, maxVisible) : tags;
  const hiddenCount = maxVisible ? Math.max(0, tags.length - maxVisible) : 0;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-3 py-1.5 text-sm lg:text-base',
  };

  return (
    <div className={cn('flex flex-wrap gap-1 lg:gap-2', className)}>
      {visibleTags.map(tag => (
        <Tag
          key={tag.id}
          tag={tag}
          variant={variant}
          size={size}
          onRemove={onTagRemove ? () => onTagRemove(tag.id) : undefined}
          onTagClick={onTagClick ? () => onTagClick(tag) : undefined}
        />
      ))}

      {hiddenCount > 0 && (
        <span
          className={cn(
            'inline-flex items-center rounded-md h-8 bg-muted text-muted-foreground font-medium',
            sizeClasses[size]
          )}
        >
          +{hiddenCount}
        </span>
      )}
    </div>
  );
}

// Export utilities for other components to use
export const tagUtils = {
  generateTagColor,
  getRandomTagColor,
  colorOptions: tagColorOptions,
};
