# Color Palette System Documentation

## Overview

The Lift Log application now features a comprehensive color palette system that provides consistent theming across light and dark modes. The system is built around your custom color palette and integrates seamlessly with Tailwind CSS and shadcn/ui components.

## Color Palette

Your application uses four primary colors:

- **Navy** (`#205781`) - Deep navy blue, primary brand color
- **Teal** (`#4F959D`) - Medium teal, secondary brand color
- **Mint** (`#98D2C0`) - Light mint green, accent color
- **Cream** (`#F6F8D5`) - Light cream, background accent

## Architecture

### Files Structure

```
src/lib/
├── colors.ts          # Color palette constants and semantic mappings
├── theme.tsx          # Enhanced theme provider with color integration
├── useColors.ts       # React hook for easy color access
└── README-colors.md   # This documentation
```

### Key Components

1. **ColorPalette** - Raw color definitions with hex, rgb, and hsl values
2. **SemanticColors** - Theme-aware semantic color mappings
3. **ChartColors** - Color arrays for data visualization
4. **colorUtils** - Utility functions for color manipulation

## Usage

### 1. Using the useColors Hook

The recommended way to access colors in React components:

```tsx
import { useColors } from '@/lib/useColors';

function MyComponent() {
  const colors = useColors();

  return (
    <div style={{ backgroundColor: colors.css.primary }}>
      {/* Raw palette access */}
      <div style={{ color: colors.getNavyColor('hex') }}>Navy text</div>

      {/* Theme-aware semantic colors */}
      <div style={{ backgroundColor: colors.semantic.accent }}>
        Accent background
      </div>
    </div>
  );
}
```

### 2. Using CSS Variables

All colors are available as CSS custom properties:

```tsx
function MyComponent() {
  return (
    <div className="bg-primary text-primary-foreground">
      {/* Or with inline styles */}
      <div
        style={{
          backgroundColor: 'hsl(var(--primary))',
          color: 'hsl(var(--primary-foreground))',
        }}
      >
        Content
      </div>
    </div>
  );
}
```

### 3. Accessing Theme Context

```tsx
import { useTheme } from '@/lib/theme';

function MyComponent() {
  const { resolvedTheme, getColor, getSemanticColors } = useTheme();

  const currentColors = getSemanticColors(resolvedTheme);
  const navyColor = getColor('navy', 'hsl');

  return <div>Theme: {resolvedTheme}</div>;
}
```

## API Reference

### useColors Hook

```tsx
const colors = useColors();

// Raw palette access
colors.palette.navy.hex; // "#205781"
colors.getNavyColor('hsl'); // "hsl(203 60% 32%)"

// Theme-aware colors
colors.semantic.primary; // Current theme's primary color
colors.charts; // Array of chart colors for current theme

// CSS helpers
colors.css.primary; // "hsl(var(--primary))"
colors.cssVar('background'); // "var(--background)"
```

### ColorPalette Object

```tsx
import { ColorPalette } from '@/lib/colors';

ColorPalette.navy.hex; // "#205781"
ColorPalette.navy.rgb; // "rgb(32, 87, 129)"
ColorPalette.navy.hsl; // "hsl(203 60% 32%)"
ColorPalette.navy.description; // "Deep navy blue - primary brand color"
```

### colorUtils Functions

```tsx
import { colorUtils } from '@/lib/colors';

// Get specific color
colorUtils.getColor('navy', 'hex'); // "#205781"

// Get theme colors
colorUtils.getSemanticColors('light'); // Light theme color object
colorUtils.getChartColors('dark'); // Dark theme chart colors

// Generate CSS properties
colorUtils.generateCSSProperties('light'); // CSS custom properties object
```

## Theming

### Light Theme Mapping

- **Primary**: Navy (`#205781`)
- **Secondary**: Teal (`#4F959D`)
- **Accent**: Mint (`#98D2C0`)
- **Background**: Cream (`#F6F8D5`)

### Dark Theme Mapping

- **Primary**: Teal (`#4F959D`)
- **Secondary**: Dark Navy variant
- **Accent**: Dark Navy variant
- **Background**: Very Dark Navy
- **Foreground**: Mint (`#98D2C0`)

## Best Practices

### 1. Use Semantic Colors

Always prefer semantic color names over raw palette colors:

```tsx
// ✅ Good - semantic and theme-aware
<Button className="bg-primary text-primary-foreground">

// ❌ Avoid - hardcoded color
<Button style={{ backgroundColor: '#205781' }}>
```

### 2. Leverage the useColors Hook

```tsx
// ✅ Good - uses hook for theme awareness
const colors = useColors();
<div style={{ backgroundColor: colors.css.accent }}>

// ❌ Avoid - bypasses theme system
<div style={{ backgroundColor: '#98D2C0' }}>
```

### 3. Use CSS Classes When Possible

```tsx
// ✅ Good - uses Tailwind classes
<div className="bg-primary text-primary-foreground">

// ✅ Also good - inline styles with CSS variables
<div style={{ backgroundColor: 'hsl(var(--primary))' }}>

// ❌ Less optimal - bypasses CSS system
<div style={{ backgroundColor: colors.semantic.primary }}>
```

## Demo Component

To see the color system in action, import and use the demo component:

```tsx
import { ColorPaletteDemo } from '@/components/ColorPaletteDemo';

function App() {
  return (
    <div>
      <ColorPaletteDemo />
    </div>
  );
}
```

## Extending the System

### Adding New Colors

1. Add to `ColorPalette` in `colors.ts`:

```tsx
export const ColorPalette = {
  // ... existing colors
  newColor: {
    hex: '#FF5733',
    rgb: 'rgb(255, 87, 51)',
    hsl: 'hsl(12 100% 60%)',
    description: 'My new color',
  },
} as const;
```

2. Add semantic mappings in `SemanticColors`:

```tsx
export const SemanticColors = {
  light: {
    // ... existing mappings
    myNewSemantic: ColorPalette.newColor.hsl,
  },
  dark: {
    // ... existing mappings
    myNewSemantic: 'hsl(12 80% 55%)', // Adjusted for dark theme
  },
} as const;
```

3. Update CSS generation in `generateCSSProperties()`:

```tsx
return {
  // ... existing properties
  '--my-new-semantic': colors.myNewSemantic,
};
```

### Adding New Semantic Colors

Follow the same pattern as existing semantic colors, ensuring both light and dark theme variants are defined.

## Migration Guide

If you're migrating from hardcoded colors:

1. Replace hex/rgb values with `useColors()` hook calls
2. Use semantic color names instead of specific color values
3. Update CSS classes to use the new CSS custom properties
4. Test in both light and dark themes

## Troubleshooting

### Colors Not Updating

- Ensure `ThemeProvider` wraps your app
- Check that CSS custom properties are being applied
- Verify theme switching logic

### Type Errors

- Import types from `@/lib/colors`
- Ensure proper TypeScript configuration
- Use the provided type exports

### Performance Concerns

- Colors are cached and computed efficiently
- CSS custom properties provide optimal performance
- Theme switching is optimized with CSS transitions
