# Standardized Button System

## Overview

The Lift Log application uses a centralized button system that ensures consistent styling and behavior across all components. All buttons use our custom color palette and automatically adapt to light/dark themes.

## Available Button Components

### 1. PrimaryButton

- **Purpose**: Main actions, primary calls-to-action
- **Color**: Navy (#205781) in light mode, Teal (#4F959D) in dark mode
- **Use cases**: "Save", "Submit", "Create", "Start Workout"

```tsx
import { PrimaryButton } from '@/components/ui/standardButtons';

<PrimaryButton onClick={handleSave}>Save Workout</PrimaryButton>;
```

### 2. SecondaryButton

- **Purpose**: Secondary actions, alternative options
- **Color**: Teal (#4F959D) in light mode, Dark Navy variant in dark mode
- **Use cases**: "Cancel", "Back", "Edit", "Settings"

```tsx
import { SecondaryButton } from '@/components/ui/standardButtons';

<SecondaryButton onClick={handleCancel}>Cancel</SecondaryButton>;
```

### 3. DestructiveButton

- **Purpose**: Dangerous or irreversible actions
- **Color**: Red (#DC2525) in both light and dark modes
- **Use cases**: "Delete", "Remove", "Clear All", "Reset"

```tsx
import { DestructiveButton } from '@/components/ui/standardButtons';

<DestructiveButton onClick={handleDelete}>Delete Exercise</DestructiveButton>;
```

### 4. OutlineButton

- **Purpose**: Tertiary actions, subtle emphasis
- **Color**: Border uses accent colors, background transparent
- **Use cases**: "Edit Settings", "View Details", "Toggle Theme"

```tsx
import { OutlineButton } from '@/components/ui/standardButtons';

<OutlineButton onClick={handleEdit}>Edit Settings</OutlineButton>;
```

### 5. GhostButton

- **Purpose**: Minimal actions that shouldn't draw attention
- **Color**: Transparent background, hover shows accent
- **Use cases**: "View Details", "More Options", "Close"

```tsx
import { GhostButton } from '@/components/ui/standardButtons';

<GhostButton onClick={handleViewDetails}>View Details</GhostButton>;
```

## Color Mapping

### Light Theme

- **Primary**: Navy (#205781) with Cream (#F6F8D5) text
- **Secondary**: Teal (#4F959D) with Cream (#F6F8D5) text
- **Destructive**: Red (#DC2525) with White text
- **Accent**: Mint (#98D2C0)

### Dark Theme

- **Primary**: Teal (#4F959D) with Navy (#205781) text
- **Secondary**: Dark Navy variant with Mint (#98D2C0) text
- **Destructive**: Slightly lighter Red with White text
- **Accent**: Dark Navy variant

## Usage Guidelines

### When to Use Each Button Type

1. **Primary Button**
   - One per screen/modal (primary action)
   - Most important user action
   - Examples: Save, Submit, Start

2. **Secondary Button**
   - Support primary actions
   - Alternative choices
   - Examples: Cancel, Back, Edit

3. **Destructive Button**
   - Only for dangerous actions
   - Always confirm destructive actions
   - Examples: Delete, Remove, Clear

4. **Outline Button**
   - Tertiary actions
   - Less emphasis than secondary
   - Examples: Settings, View, Toggle

5. **Ghost Button**
   - Minimal visual impact
   - Supplementary actions
   - Examples: More options, Close, Help

### Button Groups

Common button group patterns:

```tsx
// Form actions
<div className="flex gap-2">
  <PrimaryButton>Save</PrimaryButton>
  <SecondaryButton>Cancel</SecondaryButton>
</div>

// Workout management
<div className="flex gap-2">
  <PrimaryButton size="sm">Start</PrimaryButton>
  <OutlineButton size="sm">Edit</OutlineButton>
  <GhostButton size="sm">Duplicate</GhostButton>
  <DestructiveButton size="sm">Delete</DestructiveButton>
</div>

// Confirmation dialog
<div className="flex gap-2">
  <DestructiveButton>Delete</DestructiveButton>
  <GhostButton>Cancel</GhostButton>
</div>
```

## Props and API

All standardized buttons accept the same props as the base Button component:

```tsx
interface ButtonProps {
  className?: string;
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  children: React.ReactNode;
}
```

### Size Variants

- `sm`: Height 32px, smaller padding
- `default`: Height 36px, standard padding
- `lg`: Height 40px, larger padding
- `icon`: Square 36x36px for icon-only buttons

### Examples with Different Sizes

```tsx
<PrimaryButton size="sm">Small</PrimaryButton>
<PrimaryButton>Default</PrimaryButton>
<PrimaryButton size="lg">Large</PrimaryButton>
```

## Accessibility

All buttons include:

- Proper focus states with ring indicators
- Keyboard navigation support
- Screen reader compatibility
- Sufficient color contrast ratios
- Clear hover and active states

## Migration from Generic Buttons

### Before (avoid this pattern):

```tsx
<Button
  className="bg-blue-500 text-white hover:bg-blue-600"
  onClick={handleSave}
>
  Save
</Button>
```

### After (recommended):

```tsx
<PrimaryButton onClick={handleSave}>Save</PrimaryButton>
```

## Advanced Usage

### Custom Styling

If you need to add custom styles, use the `className` prop:

```tsx
<PrimaryButton className="w-full mt-4">Full Width Button</PrimaryButton>
```

### Conditional Button Types

```tsx
const ActionButton = ({ isDestructive, children, ...props }) => {
  return isDestructive ? (
    <DestructiveButton {...props}>{children}</DestructiveButton>
  ) : (
    <PrimaryButton {...props}>{children}</PrimaryButton>
  );
};
```

### Loading States

```tsx
<PrimaryButton disabled={isLoading}>
  {isLoading ? 'Saving...' : 'Save Workout'}
</PrimaryButton>
```

## Best Practices

1. **Consistency**: Always use standardized buttons instead of custom styled ones
2. **Hierarchy**: Use button types to create clear visual hierarchy
3. **Accessibility**: Ensure buttons have descriptive labels
4. **Loading States**: Show feedback during async operations
5. **Confirmation**: Always confirm destructive actions
6. **Spacing**: Use consistent spacing between button groups

## Examples in Context

### Workout Form

```tsx
function WorkoutForm() {
  return (
    <form className="space-y-4">
      {/* Form fields */}
      <div className="flex gap-2 justify-end">
        <SecondaryButton type="button" onClick={handleCancel}>
          Cancel
        </SecondaryButton>
        <PrimaryButton type="submit">Save Workout</PrimaryButton>
      </div>
    </form>
  );
}
```

### Workout List Item

```tsx
function WorkoutItem({ workout }) {
  return (
    <div className="flex items-center justify-between p-4">
      <div>{workout.name}</div>
      <div className="flex gap-2">
        <PrimaryButton size="sm" onClick={() => startWorkout(workout.id)}>
          Start
        </PrimaryButton>
        <OutlineButton size="sm" onClick={() => editWorkout(workout.id)}>
          Edit
        </OutlineButton>
        <DestructiveButton size="sm" onClick={() => deleteWorkout(workout.id)}>
          Delete
        </DestructiveButton>
      </div>
    </div>
  );
}
```

## Testing

When testing components with standardized buttons, use the button text or test IDs:

```tsx
// Good
await user.click(screen.getByRole('button', { name: 'Save Workout' }));

// Also good with test IDs
<PrimaryButton data-testid="save-button">Save Workout</PrimaryButton>;
await user.click(screen.getByTestId('save-button'));
```
